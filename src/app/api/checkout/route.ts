import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createPromoCodesTable, validatePromoCode, getSetting, getProductById } from '@/lib/db';
import { getShippingRates } from '@/lib/shippo';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Fixed per-order fee, charged on every order regardless of shipping cost
// or the free-shipping threshold, and never part of the promo discount base.
const PACKAGING_HANDLING_FEE = 3.25;

export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit(`checkout:${getClientIp(req)}`, 10, 600);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a few minutes.' }, { status: 429 });
  }

  try {
    const { items, shippingRate, customerAddress, promoCode } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Create Stripe instance inside handler so it only runs at request time
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2026-06-24.dahlia' as any,
    });

    // Determine site URL from request origin as fallback
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get('origin') ||
      'https://915-shjm.vercel.app';

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          ...(item.img ? { images: [item.img.startsWith('http') ? item.img : `${siteUrl}${item.img}`] } : {}),
          description: item.desc ? String(item.desc).substring(0, 200) : undefined,
        },
        unit_amount: Math.round((item.startPrice || item.start_price || 0) * 100),
      },
      quantity: item.qty || 1,
    }));

    // Product subtotal only — shipping is priced separately below. Whether a
    // promo discount also reaches shipping depends on that code's own
    // applies_to_shipping flag, applied below.
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + (item.startPrice || item.start_price || 0) * (item.qty || 1),
      0
    );

    // ── Server-side shipping cost verification ──────────────────────
    // Never trust a client-supplied shipping amount. Independently
    // re-fetch real Shippo rates for this address and re-derive the price
    // from DB-verified data, so a tampered request can't claim an
    // arbitrary discount or an unearned free-shipping perk.
    let shippingAmount = 0;
    let shippingLabel = '';
    let verifiedShippoRateId: string | null = null;

    if (shippingRate && customerAddress?.street1) {
      const weightOzForRates = items.reduce(
        (sum: number, item: any) => sum + ((item.weight_oz || 8) * (item.qty || 1)),
        0
      );

      const freshRates = await getShippingRates(
        {
          name: customerAddress.name || 'Customer',
          street1: customerAddress.street1,
          street2: customerAddress.street2 || '',
          city: customerAddress.city,
          state: customerAddress.state,
          zip: customerAddress.zip,
          country: customerAddress.country || 'US',
        },
        weightOzForRates
      );

      if (freshRates.length === 0) {
        return NextResponse.json(
          { error: 'Could not verify shipping rates for this address. Please go back and try again.' },
          { status: 400 }
        );
      }

      const cheapestFreshAmount = Math.min(...freshRates.map(r => r.amount));

      // The client always submits a real carrier/service pair now — match it
      // against the fresh quote rather than trusting the claimed amount.
      const matched = freshRates.find(
        r => r.carrier === shippingRate.carrier && r.service === shippingRate.service
      );
      if (!matched) {
        return NextResponse.json(
          { error: 'Selected shipping method is no longer available. Please go back and re-select shipping.' },
          { status: 400 }
        );
      }
      shippingLabel = `${matched.carrier} ${matched.service}`;
      verifiedShippoRateId = matched.id;

      // Independently verify the "all items on sale" free-shipping perk
      // against the database — never trust the client's claim that a cart
      // qualifies.
      let allItemsOnSale = items.length > 0;
      for (const item of items) {
        const dbProduct = await getProductById(Number(item.id));
        const saleActive = !!dbProduct?.sale &&
          (!dbProduct.sale_ends_at || new Date(dbProduct.sale_ends_at) > new Date());
        if (!saleActive) { allItemsOnSale = false; break; }
      }

      // Free-shipping-threshold or all-items-on-sale — either qualifies.
      // Only the cheapest available rate is covered either way; a pricier
      // choice still costs the difference.
      const thresholdSetting = await getSetting('free_shipping_threshold');
      const threshold = parseFloat(thresholdSetting || '50');
      const qualifiesForFreeShipping = (threshold > 0 && subtotal >= threshold) || allItemsOnSale;

      shippingAmount = qualifiesForFreeShipping
        ? Math.max(0, matched.amount - cheapestFreshAmount)
        : matched.amount;
    }

    // Add shipping as line item if applicable
    if (shippingAmount > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Shipping — ${shippingLabel}`,
          },
          unit_amount: Math.round(shippingAmount * 100),
        },
        quantity: 1,
      });
    }

    // Fixed handling fee on every order — added after shipping, unaffected
    // by free shipping, and excluded from the promo discount base below.
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Packaging & Handling',
        },
        unit_amount: Math.round(PACKAGING_HANDLING_FEE * 100),
      },
      quantity: 1,
    });

    // Re-validate the promo code server-side — never trust a discount amount
    // supplied by the client. Applied as a one-time Stripe coupon so the
    // discount is baked into the actual amount Stripe charges.
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    let appliedPromoCode: string | null = null;
    let appliedPromoDiscount: number | null = null;

    if (promoCode) {
      await createPromoCodesTable();
      const result = await validatePromoCode(String(promoCode), subtotal);
      if (!result.valid || !result.promo) {
        return NextResponse.json(
          { error: result.error || 'This promo code is no longer valid.' },
          { status: 400 }
        );
      }

      const promo = result.promo;
      // Discount base: product subtotal only, or product + shipping if this
      // code is flagged to reach shipping too.
      const discountBase = promo.applies_to_shipping ? subtotal + shippingAmount : subtotal;
      const discountAmount = promo.type === 'percent'
        ? discountBase * (Number(promo.value) / 100)
        : Math.min(Number(promo.value), discountBase);

      // Always create a fixed amount_off coupon (never percent_off) — Stripe's
      // percent_off applies against the *entire* session total regardless of
      // scoping intent, so computing the exact dollar amount ourselves is the
      // only way to correctly honor applies_to_shipping for percent codes too.
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100),
        currency: 'usd',
        duration: 'once',
        name: `Promo: ${promo.code}`,
      });

      discounts = [{ coupon: coupon.id }];
      appliedPromoCode = promo.code;
      appliedPromoDiscount = discountAmount;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${siteUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      billing_address_collection: 'auto',
      ...(discounts ? { discounts } : {}),
      metadata: {
        source: 'sacred-hearts-website',
        shippo_rate_id: verifiedShippoRateId || 'free',
        ship_name: customerAddress?.name || '',
        ship_street1: customerAddress?.street1 || '',
        ship_street2: customerAddress?.street2 || '',
        ship_city: customerAddress?.city || '',
        ship_state: customerAddress?.state || '',
        ship_zip: customerAddress?.zip || '',
        ship_country: customerAddress?.country || 'US',
        weight_oz: String(
          items.reduce((sum: number, item: any) => sum + ((item.weight_oz || 8) * (item.qty || 1)), 0)
        ),
        ...(appliedPromoCode ? { promo_code: appliedPromoCode, promo_discount: String(appliedPromoDiscount) } : {}),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error: any) {
    console.error('Stripe checkout error:', error?.message || error);
    return NextResponse.json({
      error: error?.message || 'Failed to create checkout session'
    }, { status: 500 });
  }
}

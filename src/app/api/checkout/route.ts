import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createPromoCodesTable, validatePromoCode } from '@/lib/db';

export async function POST(req: NextRequest) {
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

    // Product subtotal only (matches what the promo discount is applied against
    // on the client) — shipping is priced separately below and never discounted.
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + (item.startPrice || item.start_price || 0) * (item.qty || 1),
      0
    );

    // Add shipping as line item if applicable
    if (shippingRate && shippingRate.amount > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Shipping — ${shippingRate.carrier} ${shippingRate.service}`,
          },
          unit_amount: Math.round(shippingRate.amount * 100),
        },
        quantity: 1,
      });
    }

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
      const discountAmount = promo.type === 'percent'
        ? subtotal * (Number(promo.value) / 100)
        : Math.min(Number(promo.value), subtotal);

      const coupon = await stripe.coupons.create(
        promo.type === 'percent'
          ? { percent_off: Number(promo.value), duration: 'once', name: `Promo: ${promo.code}` }
          : { amount_off: Math.round(discountAmount * 100), currency: 'usd', duration: 'once', name: `Promo: ${promo.code}` }
      );

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
        shippo_rate_id: shippingRate?.id || 'free',
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

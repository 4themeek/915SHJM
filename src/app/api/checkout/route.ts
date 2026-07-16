import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const { items, shippingRate, customerAddress } = await req.json();

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
          ...(item.img ? { images: [item.img] } : {}),
          description: item.desc ? String(item.desc).substring(0, 200) : undefined,
        },
        unit_amount: Math.round((item.startPrice || item.start_price || 0) * 100),
      },
      quantity: item.qty || 1,
    }));

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${siteUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      billing_address_collection: 'auto',
      metadata: {
        source: 'sacred-hearts-website',
        shippo_rate_id: shippingRate?.id || 'free',
        ship_to: customerAddress
          ? `${customerAddress.street1}, ${customerAddress.city}, ${customerAddress.state} ${customerAddress.zip}`
          : '',
      },
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Stripe checkout error:', error?.message || error);
    return NextResponse.json({
      error: error?.message || 'Failed to create checkout session'
    }, { status: 500 });
  }
}

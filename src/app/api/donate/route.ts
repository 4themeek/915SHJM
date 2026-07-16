import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2026-06-24.dahlia' as any,
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get('origin') ||
      'https://915-shjm.vercel.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Donation — The Sacred Hearts Ministry',
            description: 'Tax-deductible donation to The Sacred Hearts 501(c)3 nonprofit, Cincinnati OH.',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${siteUrl}/order-success?session_id={CHECKOUT_SESSION_ID}&type=donation`,
      cancel_url: `${siteUrl}/donate`,
      billing_address_collection: 'auto',
      metadata: {
        type: 'donation',
        amount: String(amount),
        source: 'sacred-hearts-website',
      },
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Donation error:', error?.message || error);
    return NextResponse.json({
      error: error?.message || 'Failed to create donation session'
    }, { status: 500 });
  }
}

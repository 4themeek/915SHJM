import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createOrdersTable, orderExistsBySessionId, createOrder } from '@/lib/db';

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    console.error('Stripe keys not configured for webhook');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' as any });

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await createOrdersTable();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Idempotency: Stripe can retry webhook delivery
    const exists = await orderExistsBySessionId(session.id);
    if (exists) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
    const meta = session.metadata || {};

    await createOrder({
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
      customer_email: session.customer_details?.email || null,
      customer_name: session.customer_details?.name || null,
      amount_total: (session.amount_total || 0) / 100,
      currency: session.currency || 'usd',
      shipping_name: meta.ship_name || session.customer_details?.name || null,
      shipping_street1: meta.ship_street1 || null,
      shipping_street2: meta.ship_street2 || null,
      shipping_city: meta.ship_city || null,
      shipping_state: meta.ship_state || null,
      shipping_zip: meta.ship_zip || null,
      shipping_country: meta.ship_country || 'US',
      weight_oz: meta.weight_oz ? parseInt(meta.weight_oz, 10) : 8,
      shippo_rate_id: meta.shippo_rate_id && meta.shippo_rate_id !== 'free' ? meta.shippo_rate_id : null,
      line_items: lineItems.data.map(li => ({
        description: li.description,
        quantity: li.quantity,
        amount_total: (li.amount_total || 0) / 100,
      })),
    });
  }

  return NextResponse.json({ received: true });
}

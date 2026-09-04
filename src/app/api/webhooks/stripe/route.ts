import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  createOrdersTable, orderExistsBySessionId, createOrder, incrementPromoUses,
  createDonationsTable, donationExistsBySessionId, createDonation,
} from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';

const DONATION_TYPES = new Set(['donation', 'table_donation']);

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
  await createDonationsTable();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};

    if (DONATION_TYPES.has(meta.type || '')) {
      const exists = await donationExistsBySessionId(session.id);
      if (exists) {
        return NextResponse.json({ received: true, duplicate: true });
      }
      await createDonation({
        stripe_session_id: session.id,
        source: meta.type,
        donor_name: session.customer_details?.name || null,
        donor_email: session.customer_details?.email || null,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || 'usd',
      });
      return NextResponse.json({ received: true });
    }

    // Idempotency: Stripe can retry webhook delivery
    const exists = await orderExistsBySessionId(session.id);
    if (exists) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

    const order = await createOrder({
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
      promo_code: meta.promo_code || null,
      promo_discount: meta.promo_discount ? Number(meta.promo_discount) : null,
    });

    if (meta.promo_code) {
      await incrementPromoUses(meta.promo_code);
    }

    if (order.customer_email) {
      const orderLineItems = Array.isArray(order.line_items)
        ? order.line_items
        : (() => { try { return JSON.parse(order.line_items as any) || []; } catch { return []; } })();

      await sendOrderConfirmationEmail({
        orderId: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        amountTotal: Number(order.amount_total),
        lineItems: orderLineItems,
        shippingStreet1: order.shipping_street1,
        shippingStreet2: order.shipping_street2,
        shippingCity: order.shipping_city,
        shippingState: order.shipping_state,
        shippingZip: order.shipping_zip,
      });
    }
  }

  return NextResponse.json({ received: true });
}

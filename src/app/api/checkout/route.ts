import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/lib/cart-context';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  amount: number;
  amountFormatted: string;
}

interface CheckoutBody {
  items: CartItem[];
  shippingRate: ShippingRate;
  customerAddress: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { items, shippingRate, customerAddress }: CheckoutBody = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.img],
          description: item.desc?.substring(0, 200),
          metadata: { productId: String(item.id), category: item.cat },
        },
        unit_amount: item.startPrice * 100,
      },
      quantity: item.qty,
    }));

    // Add shipping as a line item if not free
    if (shippingRate && shippingRate.amount > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Shipping — ${shippingRate.carrier} ${shippingRate.service}`,
            images: [],
            description: `Shipping via ${shippingRate.carrier}`,
            metadata: { productId: 'shipping', category: 'shipping' },
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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      customer_email: undefined,
      shipping_address_collection: undefined, // We collect address ourselves
      billing_address_collection: 'auto',
      metadata: {
        source: 'sacred-hearts-website',
        shippo_rate_id: shippingRate?.id || 'free',
        ship_to: customerAddress ? `${customerAddress.street1}, ${customerAddress.city}, ${customerAddress.state} ${customerAddress.zip}` : '',
      },
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

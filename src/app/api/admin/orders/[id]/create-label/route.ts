import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getOrderById, saveLabelToOrder } from '@/lib/db';

const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY || '';

const FROM_ADDRESS = {
  name: 'The Sacred Hearts',
  street1: '5440 Moeller Avenue',
  street2: 'Suite 101',
  city: 'Cincinnati',
  state: 'OH',
  zip: '45212',
  country: 'US',
  phone: '5137413400',
  email: 'info@thesacredhearts.org',
};

async function shippoPost(endpoint: string, body: object) {
  const res = await fetch(`https://api.goshippo.com/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

function buildShipmentBody(order: any) {
  return {
    address_from: FROM_ADDRESS,
    address_to: {
      name: order.shipping_name || order.customer_name || 'Customer',
      street1: order.shipping_street1,
      street2: order.shipping_street2 || '',
      city: order.shipping_city,
      state: order.shipping_state,
      zip: order.shipping_zip,
      country: order.shipping_country || 'US',
    },
    parcels: [{
      length: '12',
      width: '10',
      height: '3',
      distance_unit: 'in',
      weight: String(Math.max(order.weight_oz || 8, 4)),
      mass_unit: 'oz',
    }],
    async: false,
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const order = await getOrderById(Number(id));
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.label_url) return NextResponse.json({ error: 'Label already created' }, { status: 400 });
  if (!order.shipping_street1) {
    return NextResponse.json({ error: 'Order has no shipping address on file' }, { status: 400 });
  }

  let rateId = order.shippo_rate_id;

  // No saved rate (e.g. free-shipping order) — get a fresh one
  if (!rateId) {
    const shipment = await shippoPost('shipments/', buildShipmentBody(order));
    const rates = (shipment.rates || []).filter((r: any) => r.amount && parseFloat(r.amount) > 0);
    if (!rates.length) {
      console.error('Shippo create-label: no rates returned for order', order.id, JSON.stringify(shipment));
      return NextResponse.json({ error: 'Could not retrieve shipping rates for this address' }, { status: 502 });
    }
    rates.sort((a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount));
    rateId = rates[0].object_id;
  }

  let transaction = await shippoPost('transactions/', {
    rate: rateId,
    label_file_type: 'PDF',
    async: false,
  });

  // Saved rate may have expired — retry once with a freshly requested rate
  if (transaction.status !== 'SUCCESS' && order.shippo_rate_id) {
    console.error('Shippo create-label: first attempt failed for order', order.id, JSON.stringify(transaction));
    const shipment = await shippoPost('shipments/', buildShipmentBody(order));
    const rates = (shipment.rates || []).filter((r: any) => r.amount && parseFloat(r.amount) > 0);
    if (rates.length) {
      rates.sort((a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount));
      transaction = await shippoPost('transactions/', {
        rate: rates[0].object_id,
        label_file_type: 'PDF',
        async: false,
      });
    }
  }

  if (transaction.status !== 'SUCCESS') {
    console.error('Shippo create-label: final failure for order', order.id, JSON.stringify(transaction));
    const detail = Array.isArray(transaction.messages) && transaction.messages.length > 0
      ? transaction.messages.map((m: any) => m.text || m.code || JSON.stringify(m)).join('; ')
      : (transaction.detail || transaction.error || 'Label purchase failed');
    return NextResponse.json({ error: detail }, { status: 502 });
  }

  const updated = await saveLabelToOrder(order.id, {
    shippo_transaction_id: transaction.object_id,
    label_url: transaction.label_url,
    tracking_number: transaction.tracking_number,
    tracking_url: transaction.tracking_url_provider || null,
    carrier: transaction.rate?.provider || 'Unknown',
  });

  return NextResponse.json({ success: true, order: updated });
}

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getOrderById, saveRefundToOrder } from '@/lib/db';

const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY || '';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const order = await getOrderById(Number(id));
  if (!order?.shippo_transaction_id) {
    return NextResponse.json({ error: 'No label to void' }, { status: 400 });
  }

  const refund = await fetch('https://api.goshippo.com/refunds/', {
    method: 'POST',
    headers: {
      Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transaction: order.shippo_transaction_id }),
  }).then(r => r.json());

  if (!refund.object_id) {
    return NextResponse.json({ error: 'Refund request failed' }, { status: 502 });
  }

  const updated = await saveRefundToOrder(order.id, {
    refund_request_id: refund.object_id,
    refund_status: refund.status || 'PENDING',
  });

  return NextResponse.json({ success: true, order: updated });
}

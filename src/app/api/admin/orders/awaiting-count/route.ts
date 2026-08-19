import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { createOrdersTable, getOrdersAwaitingLabelCount } from '@/lib/db';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await createOrdersTable();
  const count = await getOrdersAwaitingLabelCount();
  return NextResponse.json({ count });
}

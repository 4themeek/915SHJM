import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { createOrdersTable, getUnviewedOrderCount } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await createOrdersTable();
  const count = await getUnviewedOrderCount();
  return NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } });
}

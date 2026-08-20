import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { createDonationsTable, getUnviewedDonationCount } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await createDonationsTable();
  const count = await getUnviewedDonationCount();
  return NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } });
}

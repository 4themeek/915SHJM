import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { createContactMessagesTable, getUnviewedMessageCount } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await createContactMessagesTable();
  const count = await getUnviewedMessageCount();
  return NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } });
}

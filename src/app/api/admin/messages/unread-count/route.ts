import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { createContactMessagesTable, getUnreadMessageCount } from '@/lib/db';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await createContactMessagesTable();
  const count = await getUnreadMessageCount();
  return NextResponse.json({ count });
}

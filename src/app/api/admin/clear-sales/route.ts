import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { clearAllSaleFlags } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await clearAllSaleFlags();
    return NextResponse.json({ success: true, message: 'All sale flags cleared' });
  } catch (error) {
    console.error('Clear sales error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

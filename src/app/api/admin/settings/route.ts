import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { createSettingsTable, getSetting, setSetting } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await createSettingsTable();
    const threshold = await getSetting('free_shipping_threshold');
    return NextResponse.json({ free_shipping_threshold: threshold || '50' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await createSettingsTable();
    const { free_shipping_threshold } = await req.json();
    await setSetting('free_shipping_threshold', String(parseFloat(free_shipping_threshold) || 50));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

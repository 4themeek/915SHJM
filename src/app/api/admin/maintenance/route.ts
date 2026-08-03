import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { createSettingsTable, setSetting } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { enabled } = await req.json();
    await createSettingsTable();
    await setSetting('shop_maintenance_mode', enabled ? 'true' : 'false');
    return NextResponse.json({ success: true, enabled: Boolean(enabled) });
  } catch (error) {
    return NextResponse.json({ error: 'Database error: ' + String(error) }, { status: 500 });
  }
}

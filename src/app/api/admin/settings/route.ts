import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { createSettingsTable, getSetting, setSetting } from '@/lib/db';

// GET is intentionally public — free_shipping_threshold and
// packaging_handling_fee are display values needed by the public
// checkout page, not sensitive admin data. Writes (POST) stay admin-gated.
export async function GET(req: NextRequest) {
  try {
    await createSettingsTable();
    const threshold = await getSetting('free_shipping_threshold');
    const packagingHandlingFee = await getSetting('packaging_handling_fee');
    return NextResponse.json({
      free_shipping_threshold: threshold || '50',
      packaging_handling_fee: packagingHandlingFee || '3.25',
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await createSettingsTable();
    const { free_shipping_threshold, packaging_handling_fee } = await req.json();
    if (free_shipping_threshold !== undefined) {
      await setSetting('free_shipping_threshold', String(parseFloat(free_shipping_threshold) || 50));
    }
    if (packaging_handling_fee !== undefined) {
      const clamped = Math.min(10, Math.max(0, parseFloat(packaging_handling_fee) || 0));
      await setSetting('packaging_handling_fee', clamped.toFixed(2));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import {
  createSaleSettingsTable,
  getGlobalSaleEndDate,
  setGlobalSaleEndDate,
  applyGlobalSaleDateToAllSaleItems,
} from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await createSaleSettingsTable();
    const date = await getGlobalSaleEndDate();
    return NextResponse.json({ sale_ends_at: date });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { sale_ends_at, apply_to_all } = await req.json();

    await createSaleSettingsTable();
    await setGlobalSaleEndDate(sale_ends_at || null);

    if (apply_to_all) {
      await applyGlobalSaleDateToAllSaleItems(sale_ends_at || null);
    }

    return NextResponse.json({ success: true, sale_ends_at });
  } catch (error) {
    console.error('Sale settings error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

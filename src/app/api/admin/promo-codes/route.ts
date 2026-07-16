import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { createPromoCodesTable, getAllPromoCodes, createPromoCode } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await createPromoCodesTable();
    const codes = await getAllPromoCodes();
    return NextResponse.json({ codes });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await createPromoCodesTable();
    const data = await req.json();
    const code = await createPromoCode({
      code: data.code,
      type: data.type || 'percent',
      value: parseFloat(data.value) || 0,
      min_order: data.min_order ? parseFloat(data.min_order) : null,
      expires_at: data.expires_at || null,
      active: true,
      max_uses: data.max_uses ? parseInt(data.max_uses) : null,
    });
    return NextResponse.json({ code });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

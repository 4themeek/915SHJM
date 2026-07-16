import { NextRequest, NextResponse } from 'next/server';
import { createPromoCodesTable, validatePromoCode } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await createPromoCodesTable();
    const { code, orderTotal } = await req.json();
    if (!code) return NextResponse.json({ valid: false, error: 'No code provided' });
    const result = await validatePromoCode(code, orderTotal || 0);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ valid: false, error: String(error) }, { status: 500 });
  }
}

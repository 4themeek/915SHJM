import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { deletePromoCode, togglePromoCode } from '@/lib/db';

interface Props { params: Promise<{ id: string }>; }

export async function DELETE(req: NextRequest, { params }: Props) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await deletePromoCode(Number(id));
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: Props) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { active } = await req.json();
  await togglePromoCode(Number(id), Boolean(active));
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { deleteOrder } from '@/lib/db';

interface Props { params: Promise<{ id: string }>; }

export async function DELETE(req: NextRequest, { params }: Props) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await deleteOrder(Number(id));
  return NextResponse.json({ success: true });
}

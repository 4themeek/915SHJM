import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getProductById, updateProduct } from '@/lib/db';

// Temporary diagnostic for the Parish Display "Free" toggle not saving.
// Safe to delete once the bug is understood/fixed.
export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const before = await getProductById(33);
  const updated = await updateProduct(33, { is_free: false });
  const after = await getProductById(33);

  return NextResponse.json({
    before: { is_free: before?.is_free, price: before?.price },
    updateProductReturned: { is_free: updated?.is_free, price: updated?.price },
    after: { is_free: after?.is_free, price: after?.price },
  });
}

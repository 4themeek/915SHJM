import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { sql } from '@vercel/postgres';

// One-time migration: point Parish Display at its local image instead of
// the firewall-blocked wp-content URL. Safe to delete after running once.
export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rowCount } = await sql`
    UPDATE products SET img = '/images/products/product-33.jpg', updated_at = NOW() WHERE id = 33
  `;

  return NextResponse.json({ success: true, updated: (rowCount ?? 0) > 0 });
}

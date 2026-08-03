import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { sql } from '@vercel/postgres';

// One-time migration: restore the remaining 7 images missing since the
// ImageUploader onError bug, supplied by the site owner from their own
// photo backup. Safe to delete this route after it has been run once.
const MAPPING: { id: number; img: string }[] = [
  { id: 9, img: '/images/products/product-9.jpg' },
  { id: 10, img: '/images/products/product-10.jpg' },
  { id: 13, img: '/images/products/product-13.jpg' },
  { id: 14, img: '/images/products/product-14.jpg' },
  { id: 15, img: '/images/products/product-15.jpg' },
  { id: 16, img: '/images/products/product-16.jpg' },
  { id: 17, img: '/images/products/product-17.jpg' },
];

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const results = [];
  for (const { id, img } of MAPPING) {
    const { rowCount } = await sql`UPDATE products SET img = ${img}, updated_at = NOW() WHERE id = ${id}`;
    results.push({ id, img, updated: (rowCount ?? 0) > 0 });
  }

  return NextResponse.json({
    success: true,
    updatedCount: results.filter(r => r.updated).length,
    total: results.length,
    results,
  });
}

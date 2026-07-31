import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { sql } from '@vercel/postgres';

// One-time migration: restore images lost to the ImageUploader onError bug.
// Safe to delete this route after it has been run once successfully.
const MAPPING: { id: number; img: string }[] = [
  { id: 1, img: '/images/products/product-1.jpg' },
  { id: 2, img: '/images/products/product-2.jpg' },
  { id: 3, img: '/images/products/product-3.jpg' },
  { id: 4, img: '/images/products/product-4.jpg' },
  { id: 5, img: '/images/products/product-5.jpg' },
  { id: 7, img: '/images/products/product-7.jpg' },
  { id: 8, img: '/images/products/product-8.jpg' },
  { id: 11, img: '/images/products/product-11.png' },
  { id: 12, img: '/images/products/product-12.jpg' },
  { id: 18, img: '/images/products/product-18.jpg' },
  { id: 19, img: '/images/products/product-19.jpg' },
  { id: 21, img: '/images/products/product-21.jpg' },
  { id: 22, img: '/images/products/product-22.jpg' },
  { id: 23, img: '/images/products/product-23.jpg' },
  { id: 24, img: '/images/products/product-24.jpg' },
  { id: 25, img: '/images/products/product-25.jpg' },
  { id: 26, img: '/images/products/product-26.jpg' },
  { id: 27, img: '/images/products/product-27.jpg' },
  { id: 28, img: '/images/products/product-28.jpg' },
  { id: 29, img: '/images/products/product-29.jpg' },
  { id: 30, img: '/images/products/product-30.jpg' },
  { id: 31, img: '/images/products/product-31.jpg' },
  { id: 32, img: '/images/products/product-32.jpg' },
  { id: 34, img: '/images/products/product-34.jpg' },
  { id: 35, img: '/images/products/product-35.jpg' },
  { id: 36, img: '/images/products/product-36.jpg' },
  { id: 37, img: '/images/products/product-37.jpg' },
  { id: 38, img: '/images/products/product-38.jpg' },
  { id: 39, img: '/images/products/product-39.jpg' },
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

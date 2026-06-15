import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { createProductsTable, seedProducts } from '@/lib/db';
import { PRODUCTS, PRODUCT_WEIGHTS } from '@/lib/products';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await createProductsTable();

    const productsWithWeights = PRODUCTS.map(p => ({
      ...p,
      weightOz: PRODUCT_WEIGHTS[p.id] || 8,
    }));

    await seedProducts(productsWithWeights);

    return NextResponse.json({
      success: true,
      message: `Seeded ${productsWithWeights.length} products successfully`,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed: ' + String(error) }, { status: 500 });
  }
}

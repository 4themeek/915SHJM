import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getAllProductsAdmin, createProduct, createProductsTable } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await createProductsTable();
    const products = await getAllProductsAdmin();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    const product = await createProduct({
      name: data.name,
      cat: data.cat,
      price: data.price,
      start_price: parseFloat(data.start_price) || 0,
      img: data.img || '',
      desc: data.desc || '',
      sale: data.sale || false,
      out_of_stock: data.out_of_stock || false,
      is_free: data.is_free || false,
      weight_oz: parseInt(data.weight_oz) || 8,
      active: data.active !== false,
    });
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: Props) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const data = await req.json();
    const product = await updateProduct(Number(id), {
      name: data.name,
      cat: data.cat,
      price: data.price,
      start_price: data.start_price !== undefined ? parseFloat(data.start_price) : undefined,
      img: data.img,
      desc: data.desc,
      sale: data.sale,
      out_of_stock: data.out_of_stock,
      is_free: data.is_free,
      weight_oz: data.weight_oz !== undefined ? parseInt(data.weight_oz) : undefined,
      sale_price: data.sale_price !== undefined ? (data.sale_price ? parseFloat(data.sale_price) : null) : undefined,
      sale_ends_at: data.sale_ends_at !== undefined ? (data.sale_ends_at || null) : undefined,
      active: data.active,
    });
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await deleteProduct(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

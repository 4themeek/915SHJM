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

    // Explicitly sanitize every field — booleans must be Boolean(), numbers must be
    // valid or null, strings are passed as-is, undefined means "don't change"
    const sanitized: Record<string, any> = {};

    if (data.name !== undefined)        sanitized.name        = String(data.name);
    if (data.cat !== undefined)         sanitized.cat         = String(data.cat);
    if (data.price !== undefined)       sanitized.price       = String(data.price);
    if (data.img !== undefined)         sanitized.img         = String(data.img);
    if (data.desc !== undefined)        sanitized.desc        = String(data.desc);

    if (data.start_price !== undefined)
      sanitized.start_price = data.start_price !== '' && data.start_price !== null
        ? parseFloat(String(data.start_price)) : 0;

    if (data.weight_oz !== undefined)
      sanitized.weight_oz = data.weight_oz !== '' && data.weight_oz !== null
        ? parseInt(String(data.weight_oz)) : 8;

    // Booleans — explicitly convert so false is never lost
    if (data.active !== undefined)      sanitized.active      = Boolean(data.active);
    if (data.sale !== undefined)        sanitized.sale        = Boolean(data.sale);
    if (data.out_of_stock !== undefined) sanitized.out_of_stock = Boolean(data.out_of_stock);
    if (data.is_free !== undefined)     sanitized.is_free     = Boolean(data.is_free);

    // Sale pricing — null when empty or not on sale
    if (data.sale_price !== undefined)
      sanitized.sale_price = data.sale_price && Number(data.sale_price) > 0
        ? parseFloat(String(data.sale_price)) : null;

    if (data.sale_ends_at !== undefined)
      sanitized.sale_ends_at = data.sale_ends_at && data.sale_ends_at !== ''
        ? String(data.sale_ends_at) : null;

    const product = await updateProduct(Number(id), sanitized);
    return NextResponse.json({ product });

  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Database error: ' + String(error) }, { status: 500 });
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

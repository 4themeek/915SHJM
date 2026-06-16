import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getProductById, updateProduct, deleteProduct, runMigrations } from '@/lib/db';

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
    await runMigrations();
    const data = await req.json();

    console.log('PUT product data received:', JSON.stringify(data));

    const sanitized: Record<string, any> = {};

    // Strings
    if (data.name !== undefined)  sanitized.name  = String(data.name);
    if (data.cat !== undefined)   sanitized.cat   = String(data.cat);
    if (data.price !== undefined) sanitized.price = String(data.price);
    if (data.img !== undefined)   sanitized.img   = String(data.img);
    if (data.desc !== undefined)  sanitized.desc  = String(data.desc);

    // Numbers
    if (data.start_price !== undefined)
      sanitized.start_price = parseFloat(String(data.start_price)) || 0;
    if (data.weight_oz !== undefined)
      sanitized.weight_oz = parseInt(String(data.weight_oz)) || 8;

    // Booleans
    if (data.active !== undefined)     sanitized.active     = Boolean(data.active);
    if (data.out_of_stock !== undefined) sanitized.out_of_stock = Boolean(data.out_of_stock);
    if (data.is_free !== undefined)    sanitized.is_free    = Boolean(data.is_free);

    // Sale — handle all sale fields together
    const saleOn = data.sale !== undefined ? Boolean(data.sale) : undefined;

    if (saleOn !== undefined) {
      sanitized.sale = saleOn;

      if (!saleOn) {
        // Sale turned OFF — clear everything
        sanitized.sale_price = null;
        sanitized.sale_ends_at = null;
      } else {
        // Sale turned ON — save price and date from form
        const rawPrice = data.sale_price;
        const parsedPrice = rawPrice !== undefined && rawPrice !== null && rawPrice !== ''
          ? parseFloat(String(rawPrice))
          : null;
        sanitized.sale_price = parsedPrice && parsedPrice > 0 ? parsedPrice : null;

        const rawDate = data.sale_ends_at;
        if (!rawDate || rawDate === '') {
          sanitized.sale_ends_at = null;
        } else {
          try {
            const d = new Date(rawDate);
            sanitized.sale_ends_at = isNaN(d.getTime()) ? null : d.toISOString().substring(0, 10);
          } catch {
            sanitized.sale_ends_at = null;
          }
        }
      }
    } else {
      // sale flag not changing — still update price/date if provided
      if (data.sale_price !== undefined) {
        const p = parseFloat(String(data.sale_price));
        sanitized.sale_price = p > 0 ? p : null;
      }
      if (data.sale_ends_at !== undefined) {
        sanitized.sale_ends_at = data.sale_ends_at || null;
      }
    }

    console.log('Sanitized data to save:', JSON.stringify(sanitized));

    const product = await updateProduct(Number(id), sanitized);
    console.log('Saved product:', JSON.stringify(product));
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
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

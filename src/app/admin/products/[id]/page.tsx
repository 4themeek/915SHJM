import { redirect, notFound } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getProductById, getAllProductsAdmin, runMigrations } from '@/lib/db';
import ProductForm from '../../ProductForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  const { id } = await params;

  try {
    await runMigrations(); // ensure sale_price and sale_ends_at columns exist
    const product = await getProductById(Number(id));
    if (!product) notFound();

    let categories = ['All'];
    try {
      const products = await getAllProductsAdmin();
      categories = ['All', ...Array.from(new Set(products.map(p => p.cat)))];
    } catch {}

    // Serialize dates to strings so they're safe to pass to client components
    const serialized = {
      ...product,
      sale_price: product.sale_price != null ? Number(product.sale_price) : null,
      sale_ends_at: product.sale_ends_at
        ? String(product.sale_ends_at).substring(0, 10)
        : null,
      created_at: String(product.created_at),
      updated_at: String(product.updated_at),
    };

    return <ProductForm product={serialized} categories={categories} />;
  } catch (error) {
    console.error('Edit product page error:', error);
    redirect('/admin/dashboard');
  }
}

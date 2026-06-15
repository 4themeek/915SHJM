import { redirect, notFound } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getProductById, getAllProductsAdmin } from '@/lib/db';
import ProductForm from '../../ProductForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) notFound();

  let categories = ['All'];
  try {
    const products = await getAllProductsAdmin();
    categories = ['All', ...Array.from(new Set(products.map(p => p.cat)))];
  } catch {}

  return <ProductForm product={product} categories={categories} />;
}

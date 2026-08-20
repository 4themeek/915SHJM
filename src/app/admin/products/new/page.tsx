import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getAllProductsAdmin } from '@/lib/db';
import ProductForm from '../../ProductForm';

export default async function NewProductPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  let categories = ['All'];
  try {
    const products = await getAllProductsAdmin();
    const allCats = products.flatMap(p => p.categories && p.categories.length ? p.categories : [p.cat]);
    categories = ['All', ...Array.from(new Set(allCats))];
  } catch {}

  return <ProductForm categories={categories} />;
}

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getAllProductsAdmin, createProductsTable } from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  try {
    await createProductsTable();
    const products = await getAllProductsAdmin();
    return <AdminDashboardClient products={products} adminEmail={session} />;
  } catch (error) {
    // Database not connected yet - show setup screen
    return <AdminDashboardClient products={[]} adminEmail={session} dbError />;
  }
}

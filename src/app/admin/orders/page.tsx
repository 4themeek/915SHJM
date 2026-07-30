import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
import { getAdminSession } from '@/lib/auth';
import { getAllOrdersAdmin, createOrdersTable } from '@/lib/db';
import OrdersClient from './OrdersClient';

export default async function AdminOrdersPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  await createOrdersTable();
  const orders = await getAllOrdersAdmin();

  return <OrdersClient orders={orders} adminEmail={session} />;
}

import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
import { getAdminSession } from '@/lib/auth';
import { createOrdersTable, getAllOrdersAdmin } from '@/lib/db';
import ReportsClient from './ReportsClient';

export default async function AdminReportsPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  await createOrdersTable();
  const orders = await getAllOrdersAdmin();

  return <ReportsClient orders={orders} adminEmail={session} />;
}

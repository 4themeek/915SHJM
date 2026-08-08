import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
import { getAdminSession } from '@/lib/auth';
import { createOrdersTable, getAllOrdersAdmin, createDonationsTable, getAllDonationsAdmin } from '@/lib/db';
import ReportsClient from './ReportsClient';

export default async function AdminReportsPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  await createOrdersTable();
  await createDonationsTable();
  const orders = await getAllOrdersAdmin();
  const donations = await getAllDonationsAdmin();

  return <ReportsClient orders={orders} donations={donations} adminEmail={session} />;
}

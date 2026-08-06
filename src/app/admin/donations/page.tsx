import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
import { getAdminSession } from '@/lib/auth';
import { createDonationsTable, getAllDonationsAdmin, markAllDonationsViewed } from '@/lib/db';
import DonationsClient from './DonationsClient';

export default async function AdminDonationsPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  await createDonationsTable();
  const donations = await getAllDonationsAdmin();
  await markAllDonationsViewed();

  return <DonationsClient donations={donations} adminEmail={session} />;
}

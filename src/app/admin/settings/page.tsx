import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { createSettingsTable, createPromoCodesTable, getSetting, getAllPromoCodes } from '@/lib/db';
import AdminSettingsClient from './AdminSettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  await createSettingsTable();
  await createPromoCodesTable();

  const threshold = await getSetting('free_shipping_threshold') || '50';
  const promoCodes = await getAllPromoCodes();

  return <AdminSettingsClient
    freeShippingThreshold={threshold}
    promoCodes={promoCodes}
    adminEmail={session}
  />;
}

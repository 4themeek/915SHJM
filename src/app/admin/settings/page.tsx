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
  const packagingHandlingFee = await getSetting('packaging_handling_fee') || '3.25';
  const promoCodes = await getAllPromoCodes();
  const maintenanceMode = (await getSetting('shop_maintenance_mode')) === 'true';

  return <AdminSettingsClient
    freeShippingThreshold={threshold}
    packagingHandlingFee={packagingHandlingFee}
    promoCodes={promoCodes}
    adminEmail={session}
    maintenanceMode={maintenanceMode}
  />;
}

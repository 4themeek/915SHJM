import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import AdminLoginClient from './AdminLoginClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Login | The Sacred Hearts',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Still have a valid session (cookie lasts 7 days) — skip straight past
  // the login form instead of forcing a re-login via magic link.
  const session = await getAdminSession();
  if (session) redirect('/admin/dashboard');

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D1829 0%, #5C0F0F 100%)' }} />}>
      <AdminLoginClient />
    </Suspense>
  );
}

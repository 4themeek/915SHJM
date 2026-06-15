import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminLoginClient from './AdminLoginClient';

export const metadata: Metadata = {
  title: 'Admin Login | The Sacred Hearts',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D1829 0%, #5C0F0F 100%)' }} />}>
      <AdminLoginClient />
    </Suspense>
  );
}

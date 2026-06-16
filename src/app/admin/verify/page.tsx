import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

export default async function AdminVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect('/admin?error=missing_token');
  }

  const payload = await verifyToken(token);

  if (!payload || payload.type !== 'magic') {
    redirect('/admin?error=invalid_token');
  }

  // Don't set cookie here — redirect to API route which handles it
  redirect(`/api/admin/verify?token=${token}`);
}

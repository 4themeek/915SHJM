import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, setSessionCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/admin?error=missing_token', req.url));
  }

  const payload = await verifyToken(token);

  if (!payload || payload.type !== 'magic') {
    return NextResponse.redirect(new URL('/admin?error=invalid_token', req.url));
  }

  await setSessionCookie(payload.email);
  return NextResponse.redirect(new URL('/admin/dashboard', req.url));
}

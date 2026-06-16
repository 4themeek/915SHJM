import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateSessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/admin?error=missing_token', req.url));
  }

  const payload = await verifyToken(token);

  if (!payload || payload.type !== 'magic') {
    return NextResponse.redirect(new URL('/admin?error=invalid_token', req.url));
  }

  // Generate session token
  const sessionToken = await generateSessionToken(payload.email);

  // Redirect to dashboard with cookie set in the response
  const response = NextResponse.redirect(new URL('/admin/dashboard', req.url));
  
  response.cookies.set('sh_admin_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Short-circuits known WordPress-probe paths with an immediate 404 at the
// edge, before they reach the rest of the app. This site runs Next.js, not
// WordPress — these paths never correspond to a real route.
export function middleware(request: NextRequest) {
  return new NextResponse('Not Found', { status: 404 });
}

export const config = {
  matcher: [
    '/wp-content/:path*',
    '/wp-admin/:path*',
    '/wp-login.php',
    '/xmlrpc.php',
    '/.env',
  ],
};

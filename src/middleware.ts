import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSetting } from '@/lib/db';

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Under Construction | The Sacred Hearts</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Cinzel:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    height: 100%;
    background: linear-gradient(180deg, #0d1829 0%, #1a2744 40%, #3d0a0a 100%);
  }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 1.5rem;
    font-family: 'Cormorant Garamond', Georgia, serif;
  }
  .content { max-width: 640px; }
  .logo { width: min(340px, 70vw); height: auto; filter: drop-shadow(0 4px 24px rgba(0,0,0,0.5)); margin-bottom: 1.5rem; }
  .divider { display: flex; align-items: center; gap: 1rem; width: min(340px, 80vw); margin: 0 auto 1.5rem; }
  .divider-line { flex: 1; height: 1px; background: rgba(201, 168, 76, 0.5); }
  .divider-ornament { color: #C9A84C; font-size: 0.9rem; letter-spacing: 0.3em; opacity: 0.85; }
  h1 {
    font-family: 'Cinzel', serif;
    color: #C9A84C;
    font-size: clamp(1.5rem, 5vw, 2.2rem);
    letter-spacing: 0.08em;
    margin-bottom: 1.25rem;
  }
  p {
    color: #EDE0C8;
    font-size: clamp(1.05rem, 2.5vw, 1.25rem);
    line-height: 1.7;
    font-style: italic;
  }
  .phone {
    margin-top: 1.75rem;
    font-size: clamp(0.95rem, 2.2vw, 1.1rem);
    font-style: normal;
    line-height: 1.6;
  }
  .phone a {
    color: #C9A84C;
    text-decoration: none;
    font-weight: 500;
  }
  .phone a:hover { text-decoration: underline; }
  .signature {
    margin-top: 2rem;
    color: #C9A84C;
    font-family: 'Cinzel', serif;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    opacity: 0.8;
  }
</style>
</head>
<body>
  <div class="content">
    <img class="logo" src="/logo.png" alt="The Sacred Hearts" />
    <div class="divider">
      <div class="divider-line"></div>
      <span class="divider-ornament">&#10022; &#10022; &#10022;</span>
      <div class="divider-line"></div>
    </div>
    <h1>Under Construction</h1>
    <p>
      We're making some updates to bring you an even better experience.
      Please check back soon &mdash; thank you for your patience.
    </p>
    <p class="phone">Please call <a href="tel:5137413400">(513) 741-3400</a> in the meantime<br>M&ndash;F 11am&ndash;4pm EST</p>
    <p class="signature">The Sacred Hearts</p>
  </div>
  <script>setTimeout(function(){ location.reload(); }, 60000);</script>
</body>
</html>`;

// Short-circuits known WordPress-probe paths with an immediate 404 at the
// edge, before they reach the rest of the app. This site runs Next.js, not
// WordPress — these paths never correspond to a real route.
const WP_PROBE_PATTERNS = [
  /^\/wp-content\//,
  /^\/wp-admin\//,
  /^\/wp-login\.php$/,
  /^\/xmlrpc\.php$/,
  /^\/\.env$/,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (WP_PROBE_PATTERNS.some(pattern => pattern.test(pathname))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const maintenanceOn = (await getSetting('maintenance_mode')) === 'true';
    if (maintenanceOn) {
      return new NextResponse(MAINTENANCE_HTML, {
        status: 503,
        headers: { 'content-type': 'text/html; charset=utf-8', 'retry-after': '3600' },
      });
    }
  } catch {
    // If the maintenance-mode check itself fails, fail open — don't let a
    // transient DB hiccup take the whole site down.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|logo\\.png|images/|admin|api/admin|api/webhooks).*)',
  ],
};

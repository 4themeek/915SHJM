import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'sacred-hearts-admin-secret-change-in-production'
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@thesacredhearts.org';
const SESSION_COOKIE = 'sh_admin_session';

// Generate a magic link token (expires in 15 minutes)
export async function generateMagicToken(email: string): Promise<string> {
  return new SignJWT({ email, type: 'magic' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .setIssuedAt()
    .sign(SECRET);
}

// Generate a session token (expires in 7 days)
export async function generateSessionToken(email: string): Promise<string> {
  return new SignJWT({ email, type: 'session' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(SECRET);
}

// Verify any token
export async function verifyToken(token: string): Promise<{ email: string; type: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { email: string; type: string };
  } catch {
    return null;
  }
}

// Check if the request is authenticated
export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  if (!sessionCookie?.value) return null;

  const payload = await verifyToken(sessionCookie.value);
  if (!payload || payload.type !== 'session') return null;

  return payload.email;
}

// Set session cookie
export async function setSessionCookie(email: string): Promise<void> {
  const token = await generateSessionToken(email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Clear session cookie
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Send magic link email via Brevo (formerly Sendinblue)
export async function sendMagicLinkEmail(email: string, token: string): Promise<boolean> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const magicLink = `${siteUrl}/admin/verify?token=${token}`;

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not set');
    return false;
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'The Sacred Hearts Admin',
          email: 'themeek@hush.com',
        },
        to: [{ email }],
        subject: '✦ Your Sacred Hearts Admin Login Link',
        htmlContent: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #FAF6EF; border: 1px solid #C9A84C;">
            <h2 style="font-family: Georgia, serif; color: #8B1A1A; text-align: center; letter-spacing: 0.05em;">
              ✦ The Sacred Hearts
            </h2>
            <p style="color: #3D2B1F; font-size: 1.05rem; line-height: 1.7;">
              Click the button below to sign in to the Admin Panel. This link expires in <strong>15 minutes</strong>.
            </p>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="${magicLink}" style="background: #8B1A1A; color: #fff; padding: 0.9rem 2rem; font-family: Georgia, serif; font-size: 0.9rem; letter-spacing: 0.1em; text-decoration: none; display: inline-block;">
                Sign In to Admin Panel
              </a>
            </div>
            <p style="color: #7A6555; font-size: 0.85rem; font-style: italic; text-align: center;">
              If you did not request this, please ignore this email.
            </p>
            <hr style="border-color: #C9A84C; margin: 1.5rem 0;" />
            <p style="color: #7A6555; font-size: 0.75rem; text-align: center;">
              The Sacred Hearts · Cincinnati, Ohio · 501(c)3 Ministry
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Brevo error:', err);
    }

    return res.ok;
  } catch (err) {
    console.error('Brevo send error:', err);
    return false;
  }
}

export { ADMIN_EMAIL };

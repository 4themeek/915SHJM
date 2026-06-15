import { NextRequest, NextResponse } from 'next/server';
import { generateMagicToken, sendMagicLinkEmail, ADMIN_EMAIL } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Only allow the designated admin email
    if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      // Return success even for wrong email (security: don't reveal valid emails)
      return NextResponse.json({ success: true });
    }

    const token = await generateMagicToken(email);
    const sent = await sendMagicLinkEmail(email, token);

    if (!sent) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

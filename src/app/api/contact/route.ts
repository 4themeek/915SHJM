import { NextRequest, NextResponse } from 'next/server';
import { createContactMessagesTable, createContactMessage } from '@/lib/db';
import { sendContactNotificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !String(name).trim() || !email || !String(email).trim() || !message || !String(message).trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    await createContactMessagesTable();
    await createContactMessage({
      name: String(name).trim().substring(0, 200),
      email: String(email).trim().substring(0, 200),
      phone: phone ? String(phone).trim().substring(0, 50) : null,
      message: String(message).trim().substring(0, 5000),
    });

    // Message is saved regardless of email outcome — a failed notification
    // email doesn't mean the message was lost, it's still in /admin/messages.
    await sendContactNotificationEmail({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : null,
      message: String(message).trim(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact form error:', error?.message || error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

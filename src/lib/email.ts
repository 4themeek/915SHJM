// Sends the contact form notification via Brevo (same provider already used
// for admin magic-link login emails, see src/lib/auth.ts).
export async function sendContactNotificationEmail(data: {
  name: string;
  email: string;
  phone: string | null;
  message: string;
}): Promise<boolean> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not set');
    return false;
  }

  const escapedMessage = data.message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />');

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'The Sacred Hearts Website',
          email: 'themeek@hush.com',
        },
        to: [{ email: '4thesacredhearts@gmail.com' }],
        replyTo: { name: data.name, email: data.email },
        subject: `✦ New Contact Form Message from ${data.name}`,
        htmlContent: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #FAF6EF; border: 1px solid #C9A84C;">
            <h2 style="font-family: Georgia, serif; color: #8B1A1A; text-align: center; letter-spacing: 0.05em;">
              ✦ New Contact Form Message
            </h2>
            <p style="color: #3D2B1F; font-size: 1rem;"><strong>Name:</strong> ${data.name}</p>
            <p style="color: #3D2B1F; font-size: 1rem;"><strong>Email:</strong> ${data.email}</p>
            ${data.phone ? `<p style="color: #3D2B1F; font-size: 1rem;"><strong>Phone:</strong> ${data.phone}</p>` : ''}
            <p style="color: #3D2B1F; font-size: 1rem;"><strong>Message:</strong></p>
            <p style="color: #3D2B1F; font-size: 1rem; line-height: 1.7; white-space: pre-line;">${escapedMessage}</p>
            <hr style="border-color: #C9A84C; margin: 1.5rem 0;" />
            <p style="color: #7A6555; font-size: 0.8rem; text-align: center;">
              Reply directly to this email to respond to ${data.name}.
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

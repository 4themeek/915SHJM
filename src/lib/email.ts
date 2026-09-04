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

export async function sendOrderConfirmationEmail(data: {
  orderId: number;
  customerName: string | null;
  customerEmail: string;
  amountTotal: number;
  lineItems: { description: string; quantity: number; amount_total: number }[];
  shippingStreet1: string | null;
  shippingStreet2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
}): Promise<boolean> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not set');
    return false;
  }

  const greetingName = data.customerName ? data.customerName.split(' ')[0] : 'Friend';

  const itemsHtml = data.lineItems
    .map(li => `
      <tr>
        <td style="padding: 0.4rem 0; color: #3D2B1F;">${li.quantity}× ${li.description}</td>
        <td style="padding: 0.4rem 0; color: #3D2B1F; text-align: right;">$${Number(li.amount_total).toFixed(2)}</td>
      </tr>
    `)
    .join('');

  const hasAddress = data.shippingStreet1;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'The Sacred Hearts Ministry',
          email: 'themeek@hush.com',
        },
        to: [{ email: data.customerEmail, name: data.customerName || undefined }],
        subject: `✦ Order Confirmed — The Sacred Hearts (#${data.orderId})`,
        htmlContent: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #FAF6EF; border: 1px solid #C9A84C;">
            <h2 style="font-family: Georgia, serif; color: #8B1A1A; text-align: center; letter-spacing: 0.05em;">
              ✦ Thank You, ${greetingName} ✦
            </h2>
            <p style="color: #3D2B1F; font-size: 1rem; line-height: 1.7;">
              Your order has been received and is being prepared. Here's a summary for your records:
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
              ${itemsHtml}
              <tr>
                <td style="padding: 0.6rem 0 0; color: #3D2B1F; font-weight: bold; border-top: 1px solid #C9A84C;">Total</td>
                <td style="padding: 0.6rem 0 0; color: #3D2B1F; font-weight: bold; text-align: right; border-top: 1px solid #C9A84C;">$${data.amountTotal.toFixed(2)}</td>
              </tr>
            </table>
            ${hasAddress ? `
              <p style="color: #3D2B1F; font-size: 0.95rem; line-height: 1.6;">
                <strong>Shipping to:</strong><br />
                ${data.shippingStreet1}${data.shippingStreet2 ? `, ${data.shippingStreet2}` : ''}<br />
                ${data.shippingCity}, ${data.shippingState} ${data.shippingZip}
              </p>
            ` : ''}
            <p style="color: #3D2B1F; font-size: 1rem; line-height: 1.7;">
              We'll send another email with tracking information as soon as your order ships.
              As a 501(c)3 nonprofit, your purchase is a tax-deductible donation.
            </p>
            <p style="color: #3D2B1F; font-size: 1rem; line-height: 1.7;">
              With gratitude,<br />The Sacred Hearts Ministry
            </p>
            <hr style="border-color: #C9A84C; margin: 1.5rem 0;" />
            <p style="color: #7A6555; font-size: 0.8rem; text-align: center;">
              Order #${data.orderId} · Cincinnati, Ohio · 501(c)3 Ministry
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

export async function sendShippingNotificationEmail(data: {
  orderId: number;
  customerName: string | null;
  customerEmail: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string | null;
}): Promise<boolean> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not set');
    return false;
  }

  const greetingName = data.customerName ? data.customerName.split(' ')[0] : 'Friend';

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'The Sacred Hearts Ministry',
          email: 'themeek@hush.com',
        },
        to: [{ email: data.customerEmail, name: data.customerName || undefined }],
        subject: `✦ Your Order Has Shipped — The Sacred Hearts (#${data.orderId})`,
        htmlContent: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #FAF6EF; border: 1px solid #C9A84C;">
            <h2 style="font-family: Georgia, serif; color: #8B1A1A; text-align: center; letter-spacing: 0.05em;">
              ✦ Your Order Has Shipped, ${greetingName} ✦
            </h2>
            <p style="color: #3D2B1F; font-size: 1rem; line-height: 1.7;">
              Great news — your order is on its way! Here are your tracking details:
            </p>
            <p style="color: #3D2B1F; font-size: 1rem; line-height: 1.7;">
              <strong>Carrier:</strong> ${data.carrier}<br />
              <strong>Tracking Number:</strong> ${data.trackingNumber}
            </p>
            ${data.trackingUrl ? `
              <div style="text-align: center; margin: 1.5rem 0;">
                <a href="${data.trackingUrl}" style="background: #8B1A1A; color: #fff; padding: 0.8rem 1.75rem; font-family: Georgia, serif; font-size: 0.9rem; letter-spacing: 0.05em; text-decoration: none; display: inline-block;">
                  Track Your Package
                </a>
              </div>
            ` : ''}
            <p style="color: #3D2B1F; font-size: 1rem; line-height: 1.7;">
              Thank you again for supporting our ministry. May these sacred images bring God&rsquo;s love
              and peace into your home.
            </p>
            <p style="color: #3D2B1F; font-size: 1rem; line-height: 1.7;">
              With gratitude,<br />The Sacred Hearts Ministry
            </p>
            <hr style="border-color: #C9A84C; margin: 1.5rem 0;" />
            <p style="color: #7A6555; font-size: 0.8rem; text-align: center;">
              Order #${data.orderId} · Cincinnati, Ohio · 501(c)3 Ministry
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

export async function sendDonationThankYouEmail(data: {
  donorName: string | null;
  donorEmail: string;
  amount: number;
}): Promise<boolean> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not set');
    return false;
  }

  const greetingName = data.donorName ? data.donorName.split(' ')[0] : 'Friend';

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'The Sacred Hearts Ministry',
          email: 'themeek@hush.com',
        },
        to: [{ email: data.donorEmail, name: data.donorName || undefined }],
        subject: '✦ Thank You for Your Gift to The Sacred Hearts',
        htmlContent: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #FAF6EF; border: 1px solid #C9A84C;">
            <h2 style="font-family: Georgia, serif; color: #8B1A1A; text-align: center; letter-spacing: 0.05em;">
              ✦ Thank You, ${greetingName} ✦
            </h2>
            <p style="color: #3D2B1F; font-size: 1rem; line-height: 1.7;">
              On behalf of The Sacred Hearts Ministry, thank you for your generous gift of
              <strong>$${data.amount.toFixed(2)}</strong>. Your support helps us continue
              spreading devotion to the Sacred Heart of Jesus and the Immaculate Heart of Mary.
            </p>
            <p style="color: #3D2B1F; font-size: 1rem; line-height: 1.7;">
              The Sacred Hearts is a 501(c)3 nonprofit ministry, and your donation is tax-deductible.
            </p>
            <p style="color: #3D2B1F; font-size: 1rem; line-height: 1.7;">
              With gratitude,<br />The Sacred Hearts Ministry
            </p>
            <hr style="border-color: #C9A84C; margin: 1.5rem 0;" />
            <p style="color: #7A6555; font-size: 0.8rem; text-align: center;">
              Cincinnati, Ohio · 501(c)3 Ministry
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

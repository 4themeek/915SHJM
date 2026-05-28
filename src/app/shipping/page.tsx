import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shipping & Returns',
  description: 'Shipping and return policy for The Sacred Hearts. Most orders ship free. We accept returns within 30 days and offer financial assistance to those in need.',
};

export default function ShippingPage() {
  return (
    <>
      <div className="page-hero">
        <h1>Shipping &amp; Returns</h1>
        <p>Our commitment to delivering your sacred images safely</p>
      </div>
      <div className="content-block">
        <h2>Shipping Policy</h2>
        <p>
          Most of our prints and plaques ship free within the United States. Orders are typically
          processed within 2–3 business days and shipped via USPS or UPS. Delivery generally takes
          5–10 business days from the date of shipment.
        </p>
        <p>
          For expedited shipping or international orders, please contact us directly at{' '}
          <a href="mailto:info@thesacredhearts.org" style={{ color: 'var(--crimson)' }}>info@thesacredhearts.org</a>{' '}
          or call <a href="tel:5137413400" style={{ color: 'var(--crimson)' }}>513.741.3400</a>.
        </p>

        <h2>Returns &amp; Exchanges</h2>
        <p>
          We want you to be completely satisfied with your order. If your item arrives damaged or
          defective, please contact us within 14 days of receipt and we will make it right.
          We accept returns of unused, undamaged items within 30 days of purchase.
        </p>
        <p>
          To initiate a return or exchange, please email{' '}
          <a href="mailto:info@thesacredhearts.org" style={{ color: 'var(--crimson)' }}>info@thesacredhearts.org</a>{' '}
          with your order number and a brief description of the issue.
        </p>

        <h2>Financial Assistance</h2>
        <p>
          No family should be without these sacred images for financial reasons. We are happy to
          provide images at a reduced rate to those in need. Please <Link href="/contact" style={{ color: 'var(--crimson)' }}>contact us directly</Link> to discuss how we can help.
        </p>

        <h2>Questions?</h2>
        <p>
          We are here to help. Reach us Monday through Friday, 10am–5pm EST at{' '}
          <a href="tel:5137413400" style={{ color: 'var(--crimson)' }}>513.741.3400</a> or{' '}
          <a href="mailto:info@thesacredhearts.org" style={{ color: 'var(--crimson)' }}>info@thesacredhearts.org</a>.
        </p>
      </div>
    </>
  );
}

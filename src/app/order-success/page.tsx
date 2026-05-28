import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Order Confirmed' };

export default function OrderSuccessPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '600px' }}>
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '2rem', marginBottom: '1rem' }}>✦</p>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--crimson)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Thank You for Your Order
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.15rem', color: 'var(--ink-soft)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          Your order has been received and a confirmation email is on its way.
          Your purchase is a tax-deductible donation to our 501(c)3 ministry.
          May these sacred images bring God&apos;s love and peace into your home.
        </p>
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-dark)', fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '2rem' }}>
          ✦ &nbsp; AD MAJOREM DEI GLORIAM &nbsp; ✦
        </p>
        <Link href="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}

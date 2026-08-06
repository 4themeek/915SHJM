import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Thank You for Your Donation' };

export default function DonateSuccessPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '620px' }}>
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '2rem', marginBottom: '1rem' }}>✦</p>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--crimson)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Thank You for Your Donation
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.15rem', color: 'var(--ink-soft)', lineHeight: '1.8', marginBottom: '1.25rem' }}>
          Your generous gift has been received, and a receipt is on its way to your email.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', color: 'var(--ink-soft)', lineHeight: '1.8', marginBottom: '1.25rem' }}>
          Donations like yours are the lifeblood of The Sacred Hearts Ministry. They allow us to
          continue producing and sharing sacred art of the Sacred Heart of Jesus and the Immaculate
          Heart of Mary, reach families and parishes seeking to grow closer to Christ, and carry this
          work of faith forward for years to come. Nothing we do here would be possible without
          the generosity of people like you.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', color: 'var(--ink-soft)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          Please know how truly appreciated your support is — you and your intentions will be
          remembered in our prayers. Your gift is tax-deductible, as The Sacred Hearts is a
          registered 501(c)3 ministry.
        </p>
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-dark)', fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '2rem' }}>
          ✦ &nbsp; AD MAJOREM DEI GLORIAM &nbsp; ✦
        </p>
        <Link href="/" className="btn-primary">Return Home</Link>
      </div>
    </div>
  );
}

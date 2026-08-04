import type { Metadata } from 'next';
import styles from '../give.module.css';

export const metadata: Metadata = {
  title: 'Thank You',
  robots: { index: false, follow: false },
};

export default function GiveSuccessPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '2rem', marginBottom: '1rem' }}>✦</p>
        <h1 className={styles.heading}>Thank You for Your Gift</h1>
        <p className={styles.sub}>
          Your donation has been received and a receipt is on its way to your email.
          May these sacred images bring God&apos;s love and peace into your home.
        </p>
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-dark)', fontSize: '0.7rem', letterSpacing: '0.15em' }}>
          ✦ &nbsp; AD MAJOREM DEI GLORIAM &nbsp; ✦
        </p>
      </div>
    </div>
  );
}

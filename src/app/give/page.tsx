import type { Metadata } from 'next';
import Image from 'next/image';
import GiveClient from './GiveClient';
import styles from './give.module.css';

export const metadata: Metadata = {
  title: 'Give',
  robots: { index: false, follow: false },
};

export default function GivePage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Image
          src="/logo.png"
          alt="The Sacred Hearts"
          width={220}
          height={110}
          priority
          className={styles.logo}
        />
        <GiveClient />
      </div>
    </div>
  );
}

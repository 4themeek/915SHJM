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
        <h1 className={styles.heading}>✦ Support Our Ministry</h1>
        <p className={styles.sub}>
          Thank you for taking home a sacred image from our hall table today. Please make
          a donation to support our ministry, choose a preset general amount or enter your
          custom total amount below.
        </p>
        <GiveClient />
      </div>
    </div>
  );
}

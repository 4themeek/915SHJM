'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { cartCount, openCart } = useCart();

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          The Sacred Hearts
        </Link>
        <div className={styles.links}>
          <Link href="/shop" className={styles.link}>Shop</Link>
          <Link href="/promises" className={styles.link}>The 12 Promises</Link>
          <Link href="/immaculate-heart" className={styles.link}>Immaculate Heart</Link>
          <Link href="/holy-spirit" className={styles.link}>Holy Spirit</Link>
          <Link href="/about" className={styles.link}>About</Link>
          <Link href="/contact" className={styles.link}>Contact</Link>
          <Link href="/donate" className={styles.link}>Donate</Link>
          <Link href="/faq" className={styles.link}>FAQ</Link>
          <button className={styles.cartBtn} onClick={openCart} aria-label="Open cart">
            Cart ({cartCount})
          </button>
        </div>
      </div>
    </nav>
  );
}

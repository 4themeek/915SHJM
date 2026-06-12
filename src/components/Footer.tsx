import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.col}>
          <h4>The Sacred Hearts</h4>
          <p>Spreading devotion to the Sacred Heart of Jesus and Immaculate Heart of Mary through beautiful sacred art.</p>
          <p className={styles.tag}>501(c)3 Nonprofit · Tax-Deductible</p>
        </div>
        <div className={styles.col}>
          <h4>Shop</h4>
          <Link href="/shop">All Products</Link>
          <Link href="/shop?cat=Plaques">Plaques</Link>
          <Link href="/shop?cat=Sacred+Heart+of+Jesus">Sacred Heart of Jesus</Link>
          <Link href="/shop?cat=Immaculate+Heart+of+Mary">Immaculate Heart of Mary</Link>
          <Link href="/shop?cat=First+Holy+Communion">First Holy Communion</Link>
        </div>
        <div className={styles.col}>
          <h4>Ministry</h4>
          <Link href="/promises">The 12 Promises</Link>
      <Link href="/immaculate-heart">Immaculate Heart of Mary</Link>
      <Link href="/holy-spirit">The Holy Spirit</Link>
      <Link href="/about">About Us</Link>
          <Link href="/donate">Donate</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/shipping">Shipping &amp; Returns</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className={styles.col}>
          <h4>Contact</h4>
          <p>Tom & Terry Hale<br /> 5440 Moeller Avenue<br />Suite 101<br />Cincinnati, OH 45212</p>
          <p><a href="mailto:info@thesacredhearts.org">info@thesacredhearts.org</a></p>
          <p><a href="tel:5137413400">513.741.3400</a></p>
          <p className={styles.hours}>Mon–Fri, 10am–5pm EST</p>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>Copyright © {new Date().getFullYear()} The Sacred Hearts · All Rights Reserved · Cincinnati, Ohio</p>
        <p>Every purchase is a tax-deductible donation · 501(c)3 Nonprofit</p>
        <p className={styles.partnerLink}><a href="https://www.rejectedstones.org" target="_blank" rel="noopener noreferrer">God&apos;s Heart, Our Hands</a></p>
      </div>
    </footer>
  );
}

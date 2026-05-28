import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, FEATURED_IDS } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'The Sacred Hearts | Sacred Art Prints & Plaques',
  description:
    'Spread God\'s love with images of the Sacred Heart of Jesus and Immaculate Heart of Mary. High-quality prints and plaques from our 501(c)3 ministry in Cincinnati, Ohio.',
};

const featured = PRODUCTS.filter((p) => FEATURED_IDS.includes(p.id));

const INFO_CARDS = [
  { icon: '✦', title: 'Free Shipping', desc: 'Most orders ship free within the United States' },
  { icon: '✝', title: 'Tax-Deductible', desc: '501(c)3 nonprofit — every purchase is a donation' },
  { icon: '♥', title: 'Reduced Rates', desc: 'Financial assistance available — just contact us' },
  { icon: '☎', title: 'Personal Service', desc: 'Mon–Fri 10–5 EST · 513.741.3400' },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logoWrap}>
            <Image
              src="/logo.png"
              alt="The Sacred Hearts"
              width={560}
              height={280}
              priority
              className={styles.logo}
            />
          </div>
          <div className={styles.heroDivider}>
            <div className={styles.heroDividerLine} />
            <span className={styles.heroDividerOrnament}>✦ ✦ ✦</span>
            <div className={styles.heroDividerLine} />
          </div>
          <p className={styles.heroSub}>
            Spread God&apos;s love with images of the Sacred Heart of Jesus and the Immaculate Heart of Mary
          </p>
          <p className={styles.heroTagline}>
            Handcrafted Prints &amp; Plaques · Cincinnati, Ohio · 501(c)3 Ministry
          </p>
          <div className={styles.heroBtns}>
            <Link href="/shop" className={styles.heroCta}>View Our Collection</Link>
            <Link href="/about" className={styles.heroSecondary}>Our Mission</Link>
          </div>
        </div>
      </section>

      {/* MISSION BANNER */}
      <section className={styles.mission}>
        <h2>A Ministry of Beauty &amp; Devotion</h2>
        <p>
          We are a 501(c)3 ministry dedicated to spreading devotion to the Sacred Heart of Jesus
          and the Immaculate Heart of Mary through high-quality prints and plaques. Every purchase
          is a tax-deductible donation that goes directly back to our ministry.
        </p>
        <p className={styles.missionTag}>
          ✦ &nbsp; 501(c)3 Registered &nbsp; · &nbsp; Every Purchase Is Tax-Deductible &nbsp; ✦
        </p>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className={`${styles.featuredSection} section`}>
        <div className="container">
          <h2 className="section-title">Most-Loved Images</h2>
          <p className="section-sub">Our most cherished prints and plaques</p>
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-ornament">✦</span>
            <div className="divider-line" />
          </div>
          <div className={styles.productGrid}>
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className={styles.viewAll}>
            <Link href="/shop" className="btn-primary">View All 39 Items</Link>
          </div>
        </div>
      </section>

      {/* INFO CARDS */}
      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          {INFO_CARDS.map((c) => (
            <div key={c.title} className={styles.infoCard}>
              <div className={styles.infoIcon}>{c.icon}</div>
              <h4>{c.title}</h4>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

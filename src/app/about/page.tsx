import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about The Sacred Hearts ministry — a 501(c)3 nonprofit based in Cincinnati, Ohio dedicated to spreading devotion through beautiful sacred art.',
};

export default function AboutPage() {
  return (
    <>
      <div className="page-hero">
        <h1>About Our Ministry</h1>
        <p>Rooted in devotion, dedicated to beauty</p>
      </div>

      <div className={styles.introSection}>
        <div className={styles.introGrid}>
          <div className={styles.introText}>
            <h2>Our Story</h2>
            <p>The Sacred Hearts ministry was founded with a single purpose: to bring the beautiful and powerful images of the Sacred Heart of Jesus and the Immaculate Heart of Mary into homes, parishes, and schools across the country and beyond.</p>
            <p>Based in Cincinnati, Ohio, we are a registered 501(c)3 nonprofit organization. Every item we produce is crafted with devotion and care — meant not merely to decorate a wall, but to serve as a focal point of prayer, a reminder of God&apos;s boundless love, and an invitation to deeper relationship with Jesus and Mary.</p>
            <p>Our Cincinnati Enthronement Center serves as the heart of our ministry — a welcoming space where families can encounter these sacred images, learn about the Enthronement, and take home a piece of this devotion for their own homes.</p>
          </div>
          <div className={styles.introImg}>
            <Image src="/images/about/about-sign.jpg" alt="Sacred Hearts Jesus and Mary sign at our Cincinnati ministry location" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
          </div>
        </div>
      </div>

      <div className={styles.featureSection}>
        <div className={styles.featureImg}>
          <Image src="/images/about/about-paintings.jpg" alt="Beautiful framed Sacred Heart of Jesus and Immaculate Heart of Mary paintings at our ministry" fill sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center top' }} />
          <div className={styles.featureOverlay} />
          <div className={styles.featureCaption}>
            <p className={styles.featureCaptionTitle}>Our Signature Images</p>
            <p className={styles.featureCaptionText}>The Sacred Heart of Jesus &amp; the Immaculate Heart of Mary — the two Hearts that beat as one</p>
          </div>
        </div>
      </div>

      <div className={styles.missionSection}>
        <div className={styles.missionGrid}>
          <div className={styles.missionImg}>
            <Image src="/images/about/about-ministry.jpg" alt="Our ministry space showing sacred art prints and products available for families" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
          <div className={styles.missionText}>
            <h2>Our Mission</h2>
            <p>We believe sacred art has the power to transform hearts and homes. By placing images of the Sacred Heart of Jesus and Immaculate Heart of Mary in a place of honor, families participate in the ancient tradition of the Enthronement — an act of consecrating one&apos;s home to the Reign of Christ and the Queenship of Mary.</p>
            <p>We are happy to answer questions, respond to special requests, and send images at a reduced rate to those who need financial assistance. No family should be without these sacred images for financial reasons.</p>
            <Link href="/shop" className={styles.missionBtn}>View Our Collection</Link>
          </div>
        </div>
      </div>

      <div className={styles.collectionSection}>
        <div className={styles.collectionGrid}>
          <div className={styles.collectionText}>
            <h2>A Living Collection</h2>
            <p>Our Enthronement Center displays a rich collection of sacred images — from intimate devotional prints to large framed works — representing the full breadth of Catholic sacred art traditions honoring the Sacred Hearts.</p>
            <p>Each image in our collection has been chosen for its beauty, its theological authenticity, and its capacity to inspire genuine devotion. We carry images in a wide range of sizes and styles to suit every home, every budget, and every devotional tradition.</p>
          </div>
          <div className={styles.collectionImg}>
            <Image src="/images/about/about-collection.jpg" alt="Wall display of Sacred Heart and Immaculate Heart framed images at our Cincinnati center" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      <div className={styles.papalSection}>
        <div className={styles.papalGrid}>
          <div className={styles.papalImg}>
            <Image src="/images/about/about-papal.jpg" alt="Papal apostolic blessing document for the Sacred Heart Enthronement Center Cincinnati Ohio" fill sizes="(max-width: 768px) 100vw, 40vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
          </div>
          <div className={styles.papalText}>
            <p className={styles.papalEyebrow}>✦ A Treasured Heritage ✦</p>
            <h2>Apostolic Blessing</h2>
            <p>Among our most treasured possessions is this historic Apostolic Blessing, granted by the Holy Father to the Sacred Heart Enthronement Center of Cincinnati, Ohio — a testament to the deep roots and papal recognition of this ministry&apos;s mission to spread devotion to the Sacred Hearts throughout the Archdiocese and beyond.</p>
            <p>This blessing connects our humble ministry to the universal Church and to the long tradition of papal support for devotion to the Sacred Hearts of Jesus and Mary.</p>
          </div>
        </div>
      </div>

      <div className="content-block" style={{ maxWidth: '800px' }}>
        <h2>501(c)3 Status</h2>
        <p>We are a registered 501(c)3 nonprofit organization. Every purchase made through our shop is a tax-deductible donation that goes directly back to supporting and expanding our ministry. We are grateful for every order and every prayer offered on our behalf.</p>
        <div style={{ background: 'var(--cream-dark)', border: '1px solid var(--border)', padding: '1.5rem 2rem', margin: '2rem 0' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '0.08em', color: 'var(--navy)', marginBottom: '0.5rem' }}>Visit or Contact Us</p>
          <p>Tom & Terry Hale, 5440 Moeller Avenue, Suite 101, Cincinnati, OH 45212<br /><a href="mailto:info@thesacredhearts.org" style={{ color: 'var(--crimson)' }}>info@thesacredhearts.org</a>&nbsp;·&nbsp;<a href="tel:5137413400" style={{ color: 'var(--crimson)' }}>513.741.3400</a><br />Monday – Friday, 10am – 5pm EST</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/shop" className="btn-crimson">View Our Collection</Link>
          <Link href="/donate" className="btn-primary">Support Our Ministry</Link>
        </div>
      </div>
    </>
  );
}

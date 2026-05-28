import type { Metadata } from 'next';
import Link from 'next/link';

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
      <div className="content-block">
        <h2>Our Story</h2>
        <p>
          The Sacred Hearts ministry was founded with a single purpose: to bring the beautiful and powerful images
          of the Sacred Heart of Jesus and the Immaculate Heart of Mary into homes, parishes, and schools across
          the country and beyond.
        </p>
        <p>
          Based in Cincinnati, Ohio, we are a registered 501(c)3 nonprofit organization. Every item we produce
          is crafted with devotion and care — meant not merely to decorate a wall, but to serve as a focal point
          of prayer, a reminder of God&apos;s boundless love, and an invitation to deeper relationship with Jesus and Mary.
        </p>

        <h2>Our Mission</h2>
        <p>
          We believe sacred art has the power to transform hearts and homes. By placing images of the Sacred Heart
          of Jesus and Immaculate Heart of Mary in a place of honor, families participate in the ancient tradition
          of the Enthronement — an act of consecrating one&apos;s home to the Reign of Christ and the Queenship of Mary.
        </p>
        <p>
          We are happy to answer questions, respond to special requests, and send images at a reduced rate to those
          who need financial assistance. No family should be without these sacred images for financial reasons.
        </p>

        <h2>501(c)3 Status</h2>
        <p>
          We are a registered 501(c)3 nonprofit organization. Every purchase made through our shop is a
          tax-deductible donation that goes directly back to supporting and expanding our ministry. We are
          grateful for every order and every prayer offered on our behalf.
        </p>

        <div style={{ background: 'var(--cream-dark)', border: '1px solid var(--border)', padding: '1.5rem 2rem', margin: '2.5rem 0' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '0.08em', color: 'var(--navy)', marginBottom: '0.5rem' }}>
            Contact Us
          </p>
          <p>
            5440 Moeller Avenue, Suite 101, Cincinnati, OH 45212<br />
            <a href="mailto:info@thesacredhearts.org" style={{ color: 'var(--crimson)' }}>info@thesacredhearts.org</a>
            &nbsp;·&nbsp;
            <a href="tel:5137413400" style={{ color: 'var(--crimson)' }}>513.741.3400</a><br />
            Monday – Friday, 10am – 5pm EST
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/shop" className="btn-primary">View Our Collection</Link>
        </div>
      </div>
    </>
  );
}

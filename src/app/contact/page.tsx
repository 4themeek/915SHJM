import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact The Sacred Hearts ministry. We are happy to answer questions, respond to special requests, and provide images at a reduced rate for those in need.',
};

export default function ContactPage() {
  return (
    <>
      <div className="page-hero">
        <h1>Send Us a Note</h1>
        <p>We&apos;re happy to answer questions and respond to special requests</p>
      </div>
      <div className="content-block" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          <div>
            <h2>Get In Touch</h2>
            <p>
              Our business hours are Monday through Friday, 10am–5pm EST. We strive to respond
              to all inquiries within one business day.
            </p>
            <p>
              We also offer images at a reduced rate to those who need financial assistance.
              Please don&apos;t hesitate to reach out.
            </p>
            <div style={{ marginTop: '2rem' }}>
              {[
                { label: 'Address', value: '5440 Moeller Avenue, Suite 101\nCincinnati, OH 45212' },
                { label: 'Email', value: 'info@thesacredhearts.org', href: 'mailto:info@thesacredhearts.org' },
                { label: 'Phone', value: '513.741.3400', href: 'tel:5137413400' },
                { label: 'Hours', value: 'Monday – Friday\n10am – 5pm EST' },
              ].map((item) => (
                <div key={item.label} style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', letterSpacing: '0.1em', color: 'var(--gold-dark)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                    {item.label}
                  </p>
                  {item.href ? (
                    <a href={item.href} style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--crimson)', textDecoration: 'none' }}>
                      {item.value}
                    </a>
                  ) : (
                    <p style={{ whiteSpace: 'pre-line' }}>{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </>
  );
}

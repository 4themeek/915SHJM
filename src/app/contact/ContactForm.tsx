'use client';

import { useState } from 'react';
import styles from './contact.module.css';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    // TODO: connect to email service (e.g. Resend, SendGrid, or Formspree)
    setTimeout(() => setStatus('sent'), 1200);
  }

  if (status === 'sent') {
    return (
      <div className={styles.form} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.5rem', marginBottom: '1rem' }}>✦</p>
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--crimson)', fontSize: '1rem', letterSpacing: '0.05em' }}>Message Sent!</p>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
          We will respond within one business day.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.group}>
        <label className={styles.label}>Name</label>
        <input className={styles.input} type="text" placeholder="Your name" required />
      </div>
      <div className={styles.group}>
        <label className={styles.label}>Email *</label>
        <input className={styles.input} type="email" placeholder="your@email.com" required />
      </div>
      <div className={styles.group}>
        <label className={styles.label}>Phone (optional)</label>
        <input className={styles.input} type="tel" placeholder="(555) 000-0000" />
      </div>
      <div className={styles.group}>
        <label className={styles.label}>Message *</label>
        <textarea className={styles.textarea} placeholder="How can we help you?" required />
      </div>
      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

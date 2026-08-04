'use client';

import { useState } from 'react';
import styles from './contact.module.css';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setStatus('sent');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
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
        <input
          className={styles.input}
          type="text"
          placeholder="Your name"
          required
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className={styles.group}>
        <label className={styles.label}>Email *</label>
        <input
          className={styles.input}
          type="email"
          placeholder="your@email.com"
          required
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        />
      </div>
      <div className={styles.group}>
        <label className={styles.label}>Phone (optional)</label>
        <input
          className={styles.input}
          type="tel"
          placeholder="(555) 000-0000"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        />
      </div>
      <div className={styles.group}>
        <label className={styles.label}>Message *</label>
        <textarea
          className={styles.textarea}
          placeholder="How can we help you?"
          required
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        />
      </div>
      {error && (
        <p style={{ color: 'var(--crimson)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', margin: '0 0 1rem' }}>
          ⚠ {error}
        </p>
      )}
      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

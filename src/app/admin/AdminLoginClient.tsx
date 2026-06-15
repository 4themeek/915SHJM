'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './admin.module.css';

export default function AdminLoginClient() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStatus('sent');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStatus('idle');
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <p className={styles.loginCross}>✦</p>
          <h1 className={styles.loginTitle}>Sacred Hearts</h1>
          <p className={styles.loginSubtitle}>Admin Panel</p>
        </div>

        {status === 'sent' ? (
          <div className={styles.sentBox}>
            <p className={styles.sentIcon}>✉</p>
            <p className={styles.sentTitle}>Check Your Email</p>
            <p className={styles.sentText}>
              A magic sign-in link has been sent to <strong>{email}</strong>.
              The link expires in 15 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {urlError && (
              <div className={styles.errorBox}>
                {urlError === 'invalid_token'
                  ? 'This link has expired or is invalid. Please request a new one.'
                  : 'An error occurred. Please try again.'}
              </div>
            )}
            {error && <div className={styles.errorBox}>{error}</div>}

            <p className={styles.loginInstructions}>
              Enter your admin email address and we&apos;ll send you a secure sign-in link.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Admin Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Sending…' : 'Send Magic Link ✦'}
            </button>
          </form>
        )}

        <p className={styles.loginFooter}>
          The Sacred Hearts · Cincinnati, Ohio · 501(c)3
        </p>
      </div>
    </div>
  );
}

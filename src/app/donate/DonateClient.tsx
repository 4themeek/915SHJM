'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import styles from './donate.module.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const AMOUNTS = [
  { value: 25, label: '$25', desc: 'Provides images for one family' },
  { value: 50, label: '$50', desc: 'Helps two families' },
  { value: 100, label: '$100', desc: 'Equips a small parish' },
  { value: 250, label: '$250', desc: 'Sponsors a school program' },
  { value: 500, label: '$500', desc: 'Major ministry support' },
  { value: 0, label: 'Custom', desc: 'Choose your amount' },
];

export default function DonateClient() {
  const [selected, setSelected] = useState(25);
  const [custom, setCustom] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const isCustom = selected === 0;
  const finalAmount = isCustom ? Number(custom) : selected;

  async function handleDonate() {
    if (!finalAmount || finalAmount < 1) return;
    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount }),
      });

      const { sessionId, error: apiError } = await res.json();

      if (apiError) throw new Error(apiError);

      const stripe = await stripePromise;
      if (stripe && sessionId) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <div className={styles.amounts}>
        {AMOUNTS.map((a) => (
          <button
            key={a.value}
            className={`${styles.amtCard} ${selected === a.value ? styles.active : ''}`}
            onClick={() => setSelected(a.value)}
          >
            <span className={styles.amtLabel}>{a.label}</span>
            <small className={styles.amtDesc}>{a.desc}</small>
          </button>
        ))}
      </div>

      {isCustom && (
        <div className={styles.customWrap}>
          <label className={styles.customLabel}>Custom Amount ($)</label>
          <input
            type="number"
            min="1"
            placeholder="Enter amount"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className={styles.customInput}
          />
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--crimson)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', margin: '0.75rem 0' }}>
          ⚠ {error}
        </p>
      )}

      <button
        className={styles.donateBtn}
        onClick={handleDonate}
        disabled={processing || (isCustom && !custom) || finalAmount < 1}
      >
        {processing
          ? 'Redirecting to Stripe…'
          : `Donate ${finalAmount ? `$${finalAmount}` : ''} Securely via Stripe ✦`}
      </button>
      <p className={styles.note}>Secure payment processing by Stripe · Tax receipt provided · 501(c)3 nonprofit</p>
    </>
  );
}

'use client';

import { useState } from 'react';
import styles from './give.module.css';

const PRESET_AMOUNTS = [10, 20, 50, 100];

export default function GiveClient() {
  const [selected, setSelected] = useState<number | null>(20);
  const [custom, setCustom] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const isCustom = selected === null;
  const finalAmount = isCustom ? Number(custom) : selected;

  function selectPreset(amount: number) {
    setSelected(amount);
    setCustom('');
  }

  function selectCustom() {
    setSelected(null);
  }

  async function handleGive() {
    if (!finalAmount || finalAmount < 1) return;
    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/give', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount }),
      });

      const { url, error: apiError } = await res.json();

      if (apiError) throw new Error(apiError);

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned. Please try again.');
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
        {PRESET_AMOUNTS.map(amount => (
          <button
            key={amount}
            className={`${styles.amtCard} ${selected === amount ? styles.active : ''}`}
            onClick={() => selectPreset(amount)}
          >
            ${amount}
          </button>
        ))}
        <button
          className={`${styles.amtCard} ${isCustom ? styles.active : ''}`}
          onClick={selectCustom}
        >
          Custom
        </button>
      </div>

      {isCustom && (
        <div className={styles.customWrap}>
          <label className={styles.customLabel}>Enter Amount</label>
          <div className={styles.customInputWrap}>
            <span className={styles.dollarSign}>$</span>
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              className={styles.customInput}
              autoFocus
            />
          </div>
        </div>
      )}

      {error && <p className={styles.error}>⚠ {error}</p>}

      <button
        className={styles.payBtn}
        onClick={handleGive}
        disabled={processing || !finalAmount || finalAmount < 1}
      >
        {processing
          ? 'Redirecting to Stripe…'
          : `Donate ${finalAmount ? `$${finalAmount}` : ''} Securely ✦`}
      </button>

      <p className={styles.note}>Secure payment by Stripe · Tax-deductible · 501(c)3 nonprofit</p>
    </>
  );
}

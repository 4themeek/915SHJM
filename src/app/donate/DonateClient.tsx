'use client';

import { useState } from 'react';
import styles from './donate.module.css';

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

  const isCustom = selected === 0;
  const finalAmount = isCustom ? Number(custom) : selected;

  async function handleDonate() {
    if (!finalAmount || finalAmount < 1) return;
    setProcessing(true);
    // TODO: create Stripe donation session via /api/donate endpoint
    // For now, alert with placeholder message
    setTimeout(() => {
      alert(`Thank you for your generous gift of $${finalAmount}!\n\nStripe donation processing will be connected here. Contact your developer to finalize the /api/donate endpoint.`);
      setProcessing(false);
    }, 800);
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

      <button
        className={styles.donateBtn}
        onClick={handleDonate}
        disabled={processing || (isCustom && !custom)}
      >
        {processing ? 'Processing…' : `Donate ${finalAmount ? `$${finalAmount}` : ''} Securely via Stripe ✦`}
      </button>
      <p className={styles.note}>Secure payment processing by Stripe · Tax receipt provided</p>
    </>
  );
}

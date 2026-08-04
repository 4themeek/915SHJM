'use client';

import { useState } from 'react';
import styles from './give.module.css';

const PRESET_AMOUNTS = [10, 25, 50];

type Lang = 'en' | 'es';

const COPY: Record<Lang, {
  heading: string;
  sub: string;
  customBtn: string;
  customLabel: string;
  donateBtn: (amount: number | null) => string;
  redirecting: string;
  note: string;
  errGeneric: string;
  errNoUrl: string;
}> = {
  en: {
    heading: '✦ Support Our Ministry',
    sub: 'Thank you for taking home a sacred image from our hall table today. Please make a donation to support our ministry, choose a preset general amount or enter your custom total amount below.',
    customBtn: 'Enter $ Total of Items',
    customLabel: 'Enter Amount',
    donateBtn: amount => amount ? `Donate $${amount} Securely ✦` : 'Donate Securely ✦',
    redirecting: 'Redirecting to Stripe…',
    note: 'Secure payment by Stripe · Tax-deductible · 501(c)3 nonprofit',
    errGeneric: 'Something went wrong. Please try again.',
    errNoUrl: 'No checkout URL returned. Please try again.',
  },
  es: {
    heading: '✦ Apoye Nuestro Ministerio',
    sub: 'Gracias por llevarse hoy una imagen sagrada de nuestra mesa. Si desea hacer una donación para apoyar nuestro ministerio, elija un monto general o ingrese su monto total personalizado a continuación.',
    customBtn: 'Ingrese el Total en $ de los Artículos',
    customLabel: 'Ingrese el Monto',
    donateBtn: amount => amount ? `Donar $${amount} de Forma Segura ✦` : 'Donar de Forma Segura ✦',
    redirecting: 'Redirigiendo a Stripe…',
    note: 'Pago seguro con Stripe · Deducible de impuestos · Organización 501(c)3 sin fines de lucro',
    errGeneric: 'Algo salió mal. Por favor, inténtelo de nuevo.',
    errNoUrl: 'No se recibió la URL de pago. Por favor, inténtelo de nuevo.',
  },
};

export default function GiveClient() {
  const [lang, setLang] = useState<Lang>('en');
  const [selected, setSelected] = useState<number | null>(25);
  const [custom, setCustom] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const t = COPY[lang];
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
        throw new Error(t.errNoUrl);
      }
    } catch (err: any) {
      setError(err.message || t.errGeneric);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <div className={styles.langToggle}>
        <button
          className={`${styles.langBtn} ${lang === 'en' ? styles.active : ''}`}
          onClick={() => setLang('en')}
        >
          English
        </button>
        <button
          className={`${styles.langBtn} ${lang === 'es' ? styles.active : ''}`}
          onClick={() => setLang('es')}
        >
          Español
        </button>
      </div>

      <h1 className={styles.heading}>{t.heading}</h1>
      <p className={styles.sub}>{t.sub}</p>

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
          className={`${styles.amtCard} ${styles.customBtn} ${isCustom ? styles.active : ''}`}
          onClick={selectCustom}
        >
          {t.customBtn}
        </button>
      </div>

      {isCustom && (
        <div className={styles.customWrap}>
          <label className={styles.customLabel}>{t.customLabel}</label>
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
        {processing ? t.redirecting : t.donateBtn(finalAmount || null)}
      </button>

      <p className={styles.note}>{t.note}</p>
    </>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useCart } from '@/lib/cart-context';
import { loadStripe } from '@stripe/stripe-js';
import { PRODUCT_WEIGHTS } from '@/lib/products';
import Link from 'next/link';
import styles from './checkout.module.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface Address {
  name: string;
  email: string;
  phone: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  amount: number;
  amountFormatted: string;
  estimatedDays?: number;
  duration_terms?: string | null;
}

const EMPTY_ADDRESS: Address = {
  name: '', email: '', phone: '',
  street1: '', street2: '',
  city: '', state: '', zip: '', country: 'US',
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

type Step = 'address' | 'shipping' | 'review';

export default function CheckoutClient() {
  const { cart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<Partial<Address>>({});
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState('');
  const [processing, setProcessing] = useState(false);

  const totalWeightOz = cart.reduce((sum, item) => {
    return sum + (PRODUCT_WEIGHTS[item.id] || 8) * item.qty;
  }, 0);

  const allFreeShipping = cart.every(item => item.sale); // simplified — refine per your data
  const orderTotal = cartTotal + (selectedRate?.amount || 0);

  function updateAddress(field: keyof Address, value: string) {
    setAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validateAddress(): boolean {
    const newErrors: Partial<Address> = {};
    if (!address.name.trim()) newErrors.name = 'Required';
    if (!address.email.trim() || !/\S+@\S+\.\S+/.test(address.email)) newErrors.email = 'Valid email required';
    if (!address.street1.trim()) newErrors.street1 = 'Required';
    if (!address.city.trim()) newErrors.city = 'Required';
    if (!address.state) newErrors.state = 'Required';
    if (!address.zip.trim() || !/^\d{5}(-\d{4})?$/.test(address.zip)) newErrors.zip = 'Valid ZIP required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function fetchRates() {
    if (!validateAddress()) return;
    setLoadingRates(true);
    setRatesError('');
    setRates([]);
    setSelectedRate(null);

    try {
      const res = await fetch('/api/shipping-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAddress: address,
          weightOz: totalWeightOz,
          hasFreeShipping: allFreeShipping,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRates(data.rates || []);
      if (data.rates?.length > 0) {
        setSelectedRate(data.rates[0]); // pre-select cheapest
      }
      setStep('shipping');
    } catch (err: any) {
      setRatesError(err.message || 'Could not fetch shipping rates. Please try again.');
    } finally {
      setLoadingRates(false);
    }
  }

  async function handleCheckout() {
    if (!selectedRate) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          shippingRate: selectedRate,
          customerAddress: address,
        }),
      });
      const { sessionId, error } = await res.json();
      if (error) throw new Error(error);
      const stripe = await stripePromise;
      if (stripe && sessionId) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (err: any) {
      alert('Checkout error: ' + (err.message || 'Please try again.'));
    } finally {
      setProcessing(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <p className={styles.emptyIcon}>✦</p>
        <h2>Your cart is empty</h2>
        <p>Browse our collection of sacred prints and plaques.</p>
        <Link href="/shop" className={styles.shopBtn}>View Our Collection</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* STEP INDICATOR */}
      <div className={styles.steps}>
        <div className={`${styles.stepItem} ${step === 'address' ? styles.stepActive : styles.stepDone}`}>
          <span className={styles.stepNum}>1</span>
          <span className={styles.stepLabel}>Shipping Address</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.stepItem} ${step === 'shipping' ? styles.stepActive : step === 'review' ? styles.stepDone : styles.stepPending}`}>
          <span className={styles.stepNum}>2</span>
          <span className={styles.stepLabel}>Shipping Method</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.stepItem} ${step === 'review' ? styles.stepActive : styles.stepPending}`}>
          <span className={styles.stepNum}>3</span>
          <span className={styles.stepLabel}>Review &amp; Pay</span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* LEFT COLUMN — FORM */}
        <div className={styles.formCol}>

          {/* STEP 1 — ADDRESS */}
          {step === 'address' && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Shipping Address</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name *</label>
                  <input className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    type="text" placeholder="Jane Smith" value={address.name}
                    onChange={e => updateAddress('name', e.target.value)} />
                  {errors.name && <p className={styles.error}>{errors.name}</p>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address *</label>
                  <input className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    type="email" placeholder="jane@example.com" value={address.email}
                    onChange={e => updateAddress('email', e.target.value)} />
                  {errors.email && <p className={styles.error}>{errors.email}</p>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Phone (optional)</label>
                <input className={styles.input} type="tel" placeholder="(513) 000-0000"
                  value={address.phone} onChange={e => updateAddress('phone', e.target.value)} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Street Address *</label>
                <input className={`${styles.input} ${errors.street1 ? styles.inputError : ''}`}
                  type="text" placeholder="123 Main Street" value={address.street1}
                  onChange={e => updateAddress('street1', e.target.value)} />
                {errors.street1 && <p className={styles.error}>{errors.street1}</p>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Apartment, Suite, etc. (optional)</label>
                <input className={styles.input} type="text" placeholder="Apt 4B"
                  value={address.street2} onChange={e => updateAddress('street2', e.target.value)} />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label className={styles.label}>City *</label>
                  <input className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                    type="text" placeholder="Cincinnati" value={address.city}
                    onChange={e => updateAddress('city', e.target.value)} />
                  {errors.city && <p className={styles.error}>{errors.city}</p>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>State *</label>
                  <select className={`${styles.input} ${styles.select} ${errors.state ? styles.inputError : ''}`}
                    value={address.state} onChange={e => updateAddress('state', e.target.value)}>
                    <option value="">State</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className={styles.error}>{errors.state}</p>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>ZIP Code *</label>
                  <input className={`${styles.input} ${errors.zip ? styles.inputError : ''}`}
                    type="text" placeholder="45212" maxLength={10} value={address.zip}
                    onChange={e => updateAddress('zip', e.target.value)} />
                  {errors.zip && <p className={styles.error}>{errors.zip}</p>}
                </div>
              </div>

              {ratesError && <div className={styles.ratesError}>{ratesError}</div>}

              <button className={styles.primaryBtn} onClick={fetchRates} disabled={loadingRates}>
                {loadingRates ? '✦ Fetching Shipping Rates…' : 'Continue to Shipping →'}
              </button>
            </div>
          )}

          {/* STEP 2 — SHIPPING RATES */}
          {step === 'shipping' && (
            <div className={styles.card}>
              <div className={styles.cardTitleRow}>
                <h2 className={styles.cardTitle}>Choose Shipping Method</h2>
                <button className={styles.editBtn} onClick={() => setStep('address')}>Edit Address</button>
              </div>

              <div className={styles.addressSummary}>
                <p>📍 {address.name} · {address.street1}{address.street2 ? `, ${address.street2}` : ''}, {address.city}, {address.state} {address.zip}</p>
              </div>

              <div className={styles.ratesList}>
                {rates.length === 0 && (
                  <p className={styles.noRates}>No rates available for this address. Please <Link href="/contact">contact us</Link> for shipping options.</p>
                )}
                {rates.map(rate => (
                  <button
                    key={rate.id}
                    className={`${styles.rateOption} ${selectedRate?.id === rate.id ? styles.rateSelected : ''}`}
                    onClick={() => setSelectedRate(rate)}
                  >
                    <div className={styles.rateRadio}>
                      <div className={`${styles.radioOuter} ${selectedRate?.id === rate.id ? styles.radioChecked : ''}`}>
                        {selectedRate?.id === rate.id && <div className={styles.radioInner} />}
                      </div>
                    </div>
                    <div className={styles.rateInfo}>
                      <p className={styles.rateName}>{rate.carrier} — {rate.service}</p>
                      <p className={styles.rateEta}>
                        {rate.duration_terms || (rate.estimatedDays ? `Est. ${rate.estimatedDays} business days` : 'Estimated delivery varies')}
                      </p>
                    </div>
                    <div className={`${styles.ratePrice} ${rate.amount === 0 ? styles.rateFree : ''}`}>
                      {rate.amountFormatted}
                    </div>
                  </button>
                ))}
              </div>

              <button className={styles.primaryBtn}
                onClick={() => setStep('review')}
                disabled={!selectedRate}>
                Continue to Review →
              </button>
              <button className={styles.backBtn} onClick={() => setStep('address')}>← Back</button>
            </div>
          )}

          {/* STEP 3 — REVIEW & PAY */}
          {step === 'review' && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Review Your Order</h2>

              <div className={styles.reviewSection}>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Ship to</span>
                  <span className={styles.reviewValue}>
                    {address.name}<br />
                    {address.street1}{address.street2 ? `, ${address.street2}` : ''}<br />
                    {address.city}, {address.state} {address.zip}
                  </span>
                  <button className={styles.editBtn} onClick={() => setStep('address')}>Edit</button>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Shipping</span>
                  <span className={styles.reviewValue}>
                    {selectedRate?.carrier} — {selectedRate?.service}
                    {selectedRate?.estimatedDays && <><br /><span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Est. {selectedRate.estimatedDays} business days</span></>}
                  </span>
                  <button className={styles.editBtn} onClick={() => setStep('shipping')}>Edit</button>
                </div>
              </div>

              <div className={styles.reviewItems}>
                {cart.map(item => (
                  <div key={item.id} className={styles.reviewItem}>
                    <img src={item.img} alt={item.name} className={styles.reviewItemImg}
                      onError={e => { (e.target as HTMLImageElement).src = 'https://thesacredhearts.org/wp-content/uploads/woocommerce-placeholder.png'; }} />
                    <div className={styles.reviewItemInfo}>
                      <p className={styles.reviewItemName}>{item.name}</p>
                      <p className={styles.reviewItemQty}>Qty: {item.qty}</p>
                    </div>
                    <p className={styles.reviewItemPrice}>from ${(item.startPrice * item.qty).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>from ${cartTotal.toFixed(2)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Shipping ({selectedRate?.service})</span>
                  <span className={selectedRate?.amount === 0 ? styles.free : ''}>
                    {selectedRate?.amount === 0 ? 'Free' : `$${selectedRate?.amount.toFixed(2)}`}
                  </span>
                </div>
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <span>Total</span>
                  <span>from ${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <p className={styles.taxNote}>
                ✦ As a 501(c)3 nonprofit, your purchase is a tax-deductible donation. A receipt will be emailed to {address.email}.
              </p>

              <button className={styles.payBtn} onClick={handleCheckout} disabled={processing}>
                {processing ? '✦ Redirecting to Stripe…' : `✦ Pay Securely via Stripe · $${orderTotal.toFixed(2)}`}
              </button>
              <p className={styles.secureNote}>🔒 Secure payment · Powered by Stripe · Never stored on our servers</p>
              <button className={styles.backBtn} onClick={() => setStep('shipping')}>← Back to Shipping</button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — ORDER SUMMARY */}
        <div className={styles.summaryCol}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <div className={styles.summaryItems}>
              {cart.map(item => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.summaryItemImgWrap}>
                    <img src={item.img} alt={item.name} className={styles.summaryItemImg}
                      onError={e => { (e.target as HTMLImageElement).src = 'https://thesacredhearts.org/wp-content/uploads/woocommerce-placeholder.png'; }} />
                    <span className={styles.summaryItemQty}>{item.qty}</span>
                  </div>
                  <div className={styles.summaryItemInfo}>
                    <p className={styles.summaryItemName}>{item.name}</p>
                    <p className={styles.summaryItemCat}>{item.cat}</p>
                  </div>
                  <p className={styles.summaryItemPrice}>from ${(item.startPrice * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className={styles.summaryTotals}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>from ${cartTotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{selectedRate ? (selectedRate.amount === 0 ? 'Free' : `$${selectedRate.amount.toFixed(2)}`) : '—'}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryGrand}`}>
                <span>Total</span>
                <span>from ${orderTotal.toFixed(2)}</span>
              </div>
            </div>
            <p className={styles.summaryTax}>
              501(c)3 nonprofit · Every purchase is tax-deductible
            </p>
          </div>

          <div className={styles.trustBox}>
            <p>🔒 Secure Stripe Checkout</p>
            <p>📦 Ships from Cincinnati, OH</p>
            <p>✦ Tax-deductible donation</p>
            <p>☎ Questions? 513.741.3400</p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PromoCode } from '@/lib/db';
import styles from '../admin.module.css';
import settingsStyles from './settings.module.css';

interface Props {
  freeShippingThreshold: string;
  promoCodes: PromoCode[];
  adminEmail: string;
}

export default function AdminSettingsClient({ freeShippingThreshold, promoCodes: initialCodes, adminEmail }: Props) {
  const router = useRouter();
  const [threshold, setThreshold] = useState(freeShippingThreshold);
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [thresholdMsg, setThresholdMsg] = useState('');
  const [promoCodes, setPromoCodes] = useState(initialCodes);

  // New promo code form
  const [newCode, setNewCode] = useState({ code: '', type: 'percent', value: '', min_order: '', expires_at: '', max_uses: '' });
  const [savingPromo, setSavingPromo] = useState(false);
  const [promoMsg, setPromoMsg] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  async function saveThreshold() {
    setSavingThreshold(true);
    setThresholdMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ free_shipping_threshold: threshold }),
      });
      const data = await res.json();
      if (data.success) setThresholdMsg('✦ Saved successfully');
      else setThresholdMsg('❌ Error: ' + data.error);
    } catch { setThresholdMsg('❌ Network error'); }
    finally { setSavingThreshold(false); }
  }

  async function savePromoCode() {
    if (!newCode.code || !newCode.value) return;
    setSavingPromo(true);
    setPromoMsg('');
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCode),
      });
      const data = await res.json();
      if (data.code) {
        setPromoCodes(prev => [data.code, ...prev]);
        setNewCode({ code: '', type: 'percent', value: '', min_order: '', expires_at: '', max_uses: '' });
        setPromoMsg('✦ Promo code created');
      } else {
        setPromoMsg('❌ Error: ' + data.error);
      }
    } catch { setPromoMsg('❌ Network error'); }
    finally { setSavingPromo(false); }
  }

  async function togglePromo(id: number, active: boolean) {
    await fetch(`/api/admin/promo-codes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, active } : p));
  }

  async function deletePromo(id: number) {
    await fetch(`/api/admin/promo-codes/${id}`, { method: 'DELETE' });
    setPromoCodes(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
  }

  function discountDisplay(p: PromoCode) {
    return p.type === 'percent' ? `${p.value}% off` : `$${Number(p.value).toFixed(2)} off`;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashHeader}>
        <div className={styles.dashHeaderLeft}>
          <span className={styles.dashLogo}>✦ Sacred Hearts Admin</span>
          <span className={styles.dashEmail}>{adminEmail}</span>
        </div>
        <div className={styles.dashHeaderRight}>
          <Link href="/admin/dashboard" className={styles.dashViewSite}>← Products</Link>
          <Link href="/" className={styles.dashViewSite} target="_blank">View Site ↗</Link>
          <button className={styles.dashLogout} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className={styles.dashBody}>
        <h1 className={settingsStyles.pageTitle}>⚙ Store Settings</h1>

        {/* FREE SHIPPING THRESHOLD */}
        <div className={settingsStyles.section}>
          <h2 className={settingsStyles.sectionTitle}>Free Shipping Threshold</h2>
          <p className={settingsStyles.sectionDesc}>
            Orders at or above this amount automatically get free shipping at checkout.
            Set to 0 to disable free shipping threshold.
          </p>
          <div className={settingsStyles.thresholdRow}>
            <span className={settingsStyles.dollarSign}>$</span>
            <input
              type="number"
              min="0"
              step="1"
              className={settingsStyles.thresholdInput}
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
            />
            <button className={settingsStyles.saveBtn} onClick={saveThreshold} disabled={savingThreshold}>
              {savingThreshold ? 'Saving…' : 'Save'}
            </button>
          </div>
          {thresholdMsg && <p className={settingsStyles.msg}>{thresholdMsg}</p>}
          <p className={settingsStyles.hint}>
            Currently: orders over <strong>${threshold}</strong> get free shipping automatically
          </p>
        </div>

        {/* PROMO CODES */}
        <div className={settingsStyles.section}>
          <h2 className={settingsStyles.sectionTitle}>Promo Codes</h2>
          <p className={settingsStyles.sectionDesc}>
            Create discount codes customers can enter at checkout. Codes are not case-sensitive.
          </p>

          {/* CREATE NEW CODE */}
          <div className={settingsStyles.promoForm}>
            <h3 className={settingsStyles.promoFormTitle}>Create New Code</h3>
            <div className={settingsStyles.promoFormGrid}>
              <div className={settingsStyles.formGroup}>
                <label className={settingsStyles.label}>Code *</label>
                <input className={settingsStyles.input} type="text" placeholder="SAVE20"
                  value={newCode.code} onChange={e => setNewCode(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
              </div>
              <div className={settingsStyles.formGroup}>
                <label className={settingsStyles.label}>Type *</label>
                <select className={settingsStyles.input} value={newCode.type}
                  onChange={e => setNewCode(p => ({ ...p, type: e.target.value }))}>
                  <option value="percent">Percent Off (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div className={settingsStyles.formGroup}>
                <label className={settingsStyles.label}>Value *</label>
                <input className={settingsStyles.input} type="number" min="0" step="0.01"
                  placeholder={newCode.type === 'percent' ? '20' : '10.00'}
                  value={newCode.value} onChange={e => setNewCode(p => ({ ...p, value: e.target.value }))} />
              </div>
              <div className={settingsStyles.formGroup}>
                <label className={settingsStyles.label}>Min Order ($)</label>
                <input className={settingsStyles.input} type="number" min="0" step="0.01" placeholder="Optional"
                  value={newCode.min_order} onChange={e => setNewCode(p => ({ ...p, min_order: e.target.value }))} />
              </div>
              <div className={settingsStyles.formGroup}>
                <label className={settingsStyles.label}>Expires</label>
                <input className={settingsStyles.input} type="date"
                  value={newCode.expires_at} onChange={e => setNewCode(p => ({ ...p, expires_at: e.target.value }))} />
              </div>
              <div className={settingsStyles.formGroup}>
                <label className={settingsStyles.label}>Max Uses</label>
                <input className={settingsStyles.input} type="number" min="1" placeholder="Unlimited"
                  value={newCode.max_uses} onChange={e => setNewCode(p => ({ ...p, max_uses: e.target.value }))} />
              </div>
            </div>
            <button className={settingsStyles.createBtn} onClick={savePromoCode} disabled={savingPromo || !newCode.code || !newCode.value}>
              {savingPromo ? 'Creating…' : '✦ Create Promo Code'}
            </button>
            {promoMsg && <p className={settingsStyles.msg}>{promoMsg}</p>}
          </div>

          {/* EXISTING CODES */}
          <div className={settingsStyles.codesTable}>
            {promoCodes.length === 0 ? (
              <p className={settingsStyles.empty}>No promo codes yet.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Code</th>
                    <th className={styles.th}>Discount</th>
                    <th className={styles.th}>Min Order</th>
                    <th className={styles.th}>Expires</th>
                    <th className={styles.th}>Uses</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promoCodes.map(p => (
                    <tr key={p.id} className={`${styles.tr} ${!p.active ? styles.trInactive : ''}`}>
                      <td className={styles.td}><strong>{p.code}</strong></td>
                      <td className={styles.td}>{discountDisplay(p)}</td>
                      <td className={styles.td}>{p.min_order ? `$${Number(p.min_order).toFixed(2)}` : '—'}</td>
                      <td className={styles.td}>{p.expires_at ? String(p.expires_at).substring(0, 10) : '—'}</td>
                      <td className={styles.td}>{p.uses}{p.max_uses ? ` / ${p.max_uses}` : ''}</td>
                      <td className={styles.td}>
                        {p.active ? <span className={styles.badgeActive}>Active</span> : <span className={styles.badgeHidden}>Disabled</span>}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                          <button className={styles.toggleBtn} onClick={() => togglePromo(p.id, !p.active)}>
                            {p.active ? 'Disable' : 'Enable'}
                          </button>
                          <button className={styles.deleteBtn} onClick={() => setDeleteId(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION */}
      {deleteId !== null && (
        <>
          <div className={styles.modalOverlay} onClick={() => setDeleteId(null)} />
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Delete Promo Code?</h3>
            <p className={styles.modalText}>This cannot be undone.</p>
            <div className={styles.modalBtns}>
              <button className={styles.modalCancel} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.modalDelete} onClick={() => deletePromo(deleteId)}>Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

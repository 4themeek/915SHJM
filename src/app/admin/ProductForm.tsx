'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DbProduct } from '@/lib/db';
import styles from './admin.module.css';
import ImageUploader from './ImageUploader';

interface Props {
  product?: DbProduct;
  categories: string[];
}

const EMPTY_FORM = {
  name: '', cat: '', price: '', start_price: '',
  img: '', desc: '', sale: false, out_of_stock: false,
  is_free: false, weight_oz: '8', active: true,
  sale_price: '', sale_ends_at: '',
};

export default function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState(() => {
    if (!product) return EMPTY_FORM;
    try {
      return {
        name: product.name || '',
        cat: product.cat || '',
        price: product.price || '',
        start_price: product.start_price != null ? String(product.start_price) : '',
        img: product.img || '',
        desc: product.desc || '',
        sale: Boolean(product.sale),
        out_of_stock: Boolean(product.out_of_stock),
        is_free: Boolean(product.is_free),
        weight_oz: product.weight_oz != null ? String(product.weight_oz) : '8',
        active: product.active !== false,
        sale_price: product.sale_price != null ? String(product.sale_price) : '',
        sale_ends_at: product.sale_ends_at
          ? String(product.sale_ends_at).substring(0, 10)
          : '',
      };
    } catch {
      return EMPTY_FORM;
    }
  });

  const [newCat, setNewCat] = useState('');
  const [globalSaleDate, setGlobalSaleDate] = useState('');
  const [applyToAll, setApplyToAll] = useState(false);
  const [saleMsg, setSaleMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function applyGlobalSaleDate() {
    if (!globalSaleDate) return;
    setSaleMsg('Applying...');
    try {
      const res = await fetch('/api/admin/sale-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_ends_at: globalSaleDate, apply_to_all: applyToAll }),
      });
      const data = await res.json();
      if (data.success) {
        setSaleMsg('✦ Sale date saved' + (applyToAll ? ' and applied to all sale items' : ''));
        if (!form.sale_ends_at) update('sale_ends_at', globalSaleDate);
      }
    } catch {
      setSaleMsg('Error saving sale date');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      cat: newCat.trim() || form.cat,
      start_price: parseFloat(form.start_price) || 0,
      weight_oz: parseInt(form.weight_oz) || 8,
      sale_price: (() => {
        console.log('sale_price debug - form.sale:', form.sale, 'form.sale_price:', form.sale_price, 'type:', typeof form.sale_price);
        if (!form.sale) { console.log('returning null: sale is off'); return null; }
        if (!form.sale_price || form.sale_price === '') { console.log('returning null: no price entered'); return null; }
        const p = parseFloat(String(form.sale_price));
        console.log('parsed price:', p);
        return isNaN(p) || p <= 0 ? null : p;
      })(),
      sale_ends_at: (() => {
        if (!form.sale || !form.sale_ends_at || form.sale_ends_at === '') return null;
        try {
          const d = new Date(form.sale_ends_at);
          return isNaN(d.getTime()) ? null : d.toISOString().substring(0, 10);
        } catch { return null; }
      })(),
    };

    try {
      const url = isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      console.log('Saving product payload:', JSON.stringify(payload));
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Use hard redirect so dashboard always gets fresh server data
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashHeader}>
        <div className={styles.dashHeaderLeft}>
          <span className={styles.dashLogo}>✦ Sacred Hearts Admin</span>
          <span className={styles.dashEmail}>{isEdit ? 'Edit Product' : 'Add New Product'}</span>
        </div>
        <div className={styles.dashHeaderRight}>
          <button className={styles.dashLogout} onClick={() => router.push('/admin/dashboard')}>
            ← Back to Products
          </button>
        </div>
      </div>

      <div className={styles.dashBody}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>{isEdit ? `Editing: ${product!.name}` : 'Add New Product'}</h2>

          {error && <div className={styles.formError}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              {/* NAME */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Product Name *</label>
                <input className={styles.input} type="text" required
                  placeholder="Sacred Heart of Jesus – Classic Plaque"
                  value={form.name} onChange={e => update('name', e.target.value)} />
              </div>

              {/* CATEGORY */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Category *</label>
                <select className={styles.input} value={form.cat}
                  onChange={e => update('cat', e.target.value)}>
                  <option value="">Select category…</option>
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* NEW CATEGORY */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Or Create New Category</label>
                <input className={styles.input} type="text"
                  placeholder="e.g. Saints, Marian…"
                  value={newCat} onChange={e => setNewCat(e.target.value)} />
              </div>

              {/* PRICE DISPLAY */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Price Display *</label>
                <input className={styles.input} type="text" required
                  placeholder="$25.00 – $150.00"
                  value={form.price} onChange={e => update('price', e.target.value)} />
                <p className={styles.fieldHint}>Shown to customers (e.g. "$25.00 – $150.00" or "$15.00")</p>
              </div>

              {/* STARTING PRICE */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Starting Price (USD) *</label>
                <input className={styles.input} type="number" required min="0" step="0.01"
                  placeholder="25.00"
                  value={form.start_price} onChange={e => update('start_price', e.target.value)} />
                <p className={styles.fieldHint}>Lowest price — used for cart total & shipping calc</p>
              </div>

              {/* WEIGHT */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Weight (ounces) *</label>
                <input className={styles.input} type="number" required min="1"
                  placeholder="8"
                  value={form.weight_oz} onChange={e => update('weight_oz', e.target.value)} />
                <p className={styles.fieldHint}>Used for shipping rate calculations</p>
              </div>

              {/* IMAGE UPLOAD */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Product Image</label>
                <ImageUploader
                  currentUrl={form.img}
                  onUpload={(url) => update('img', url)}
                />
              </div>

              {/* DESCRIPTION */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea className={`${styles.input} ${styles.textarea}`}
                  placeholder="A beautiful devotional print of… Free Shipping."
                  value={form.desc} onChange={e => update('desc', e.target.value)} />
              </div>

              {/* TOGGLES */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Product Status</label>
                <div className={styles.toggleRow}>
                  {[
                    { key: 'active', label: 'Active (visible in shop)' },
                    { key: 'sale', label: 'Show Sale badge' },
                    { key: 'out_of_stock', label: 'Out of Stock' },
                    { key: 'is_free', label: 'Free item (contact us)' },
                  ].map(({ key, label }) => (
                    <label key={key} className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={form[key as keyof typeof form] as boolean}
                        onChange={e => update(key, e.target.checked)}
                      />
                      <span className={styles.toggleLabel}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SALE PRICING */}
              {form.sale && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Sale Price (USD)</label>
                    <input className={styles.input} type="number" min="0" step="0.01"
                      placeholder="19.99"
                      value={form.sale_price}
                      onChange={e => update('sale_price', e.target.value)} />
                    <p className={styles.fieldHint}>Discounted price shown during sale</p>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Sale End Date</label>
                    <input className={styles.input} type="date"
                      value={form.sale_ends_at}
                      onChange={e => update('sale_ends_at', e.target.value)} />
                    <p className={styles.fieldHint}>Sale badge auto-hides after this date</p>
                  </div>

                  {/* GLOBAL SALE DATE PANEL */}
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <div className={styles.globalSaleBox}>
                      <p className={styles.globalSaleTitle}>✦ Global Sale End Date</p>
                      <p className={styles.globalSaleHint}>
                        Set one end date and optionally apply it to ALL products currently on sale at once.
                      </p>
                      <div className={styles.globalSaleRow}>
                        <input className={styles.input} type="date"
                          value={globalSaleDate}
                          onChange={e => setGlobalSaleDate(e.target.value)}
                          style={{ maxWidth: '200px' }} />
                        <label className={styles.toggle}>
                          <input type="checkbox"
                            checked={applyToAll}
                            onChange={e => setApplyToAll(e.target.checked)} />
                          <span className={styles.toggleLabel}>Apply to all sale items</span>
                        </label>
                        <button type="button" className={styles.globalSaleBtn}
                          onClick={applyGlobalSaleDate}
                          disabled={!globalSaleDate}>
                          Apply Date
                        </button>
                      </div>
                      {saleMsg && <p className={styles.saleMsg}>{saleMsg}</p>}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn}
                onClick={() => router.push('/admin/dashboard')}>
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? 'Saving…' : isEdit ? '✦ Save Changes' : '✦ Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

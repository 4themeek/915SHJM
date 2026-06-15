'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DbProduct } from '@/lib/db';
import styles from './admin.module.css';

interface Props {
  product?: DbProduct;
  categories: string[];
}

const EMPTY_FORM = {
  name: '', cat: '', price: '', start_price: '',
  img: '', desc: '', sale: false, out_of_stock: false,
  is_free: false, weight_oz: '8', active: true,
};

export default function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState(product ? {
    name: product.name,
    cat: product.cat,
    price: product.price,
    start_price: String(product.start_price),
    img: product.img,
    desc: product.desc,
    sale: product.sale,
    out_of_stock: product.out_of_stock,
    is_free: product.is_free,
    weight_oz: String(product.weight_oz),
    active: product.active,
  } : EMPTY_FORM);

  const [newCat, setNewCat] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
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
    };

    try {
      const url = isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      router.push('/admin/dashboard');
      router.refresh();
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
                <p className={styles.fieldHint}>Used for Shippo shipping rate calculation</p>
              </div>

              {/* IMAGE URL */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Image URL</label>
                <input className={styles.input} type="url"
                  placeholder="https://thesacredhearts.org/wp-content/uploads/…"
                  value={form.img} onChange={e => update('img', e.target.value)} />
                {form.img && (
                  <div className={styles.imgPreview}>
                    <img src={form.img} alt="Preview"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
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
                <label className={styles.label}>Product Flags</label>
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DbProduct } from '@/lib/db';
import { TOP_OF_SHOP_CATEGORY } from '@/lib/products';
import styles from './admin.module.css';
import ImageUploader from './ImageUploader';

interface Props {
  product?: DbProduct;
  categories: string[];
}

const MAX_CATEGORIES = 5;

const EMPTY_FORM = {
  name: '', categories: [] as string[], price: '', start_price: '',
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
        categories: product.categories && product.categories.length
          ? product.categories
          : (product.cat ? [product.cat] : []),
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

  function toggleCategory(c: string) {
    setForm(prev => {
      const has = prev.categories.includes(c);
      if (has) return { ...prev, categories: prev.categories.filter(x => x !== c) };
      if (prev.categories.length >= MAX_CATEGORIES) return prev;
      return { ...prev, categories: [...prev.categories, c] };
    });
  }

  function addNewCategory() {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    setForm(prev => {
      if (prev.categories.includes(trimmed) || prev.categories.length >= MAX_CATEGORIES) return prev;
      return { ...prev, categories: [...prev.categories, trimmed] };
    });
    setNewCat('');
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

    // A category typed into the "create new" field but never explicitly
    // added is still what the admin intended to select — fold it in now.
    const categories = newCat.trim() && !form.categories.includes(newCat.trim()) && form.categories.length < MAX_CATEGORIES
      ? [...form.categories, newCat.trim()]
      : form.categories;

    if (categories.length === 0) {
      setError('Select at least one category');
      return;
    }

    setSaving(true);
    setError('');

    // Build payload explicitly — no spread to avoid override issues
    const payload = {
      name: form.name,
      categories,
      price: form.price,
      start_price: parseFloat(form.start_price) || 0,
      img: form.img,
      desc: form.desc,
      weight_oz: parseInt(form.weight_oz) || 8,
      active: Boolean(form.active),
      sale: Boolean(form.sale),
      out_of_stock: Boolean(form.out_of_stock),
      is_free: Boolean(form.is_free),
      sale_price: form.sale && form.sale_price !== ''
        ? parseFloat(String(form.sale_price)) || null
        : null,
      sale_ends_at: form.sale && form.sale_ends_at && form.sale_ends_at !== ''
        ? form.sale_ends_at
        : null,
    };

    console.log('Full payload being sent:', JSON.stringify(payload));

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

              {/* CATEGORIES */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>
                  Categories * <span className={styles.fieldHint} style={{ display: 'inline' }}>
                    (choose up to {MAX_CATEGORIES} — {form.categories.length}/{MAX_CATEGORIES} selected)
                  </span>
                </label>
                <div className={styles.toggleRow}>
                  {Array.from(new Set([...categories.filter(c => c !== 'All'), TOP_OF_SHOP_CATEGORY])).map(c => {
                    const checked = form.categories.includes(c);
                    const disabled = !checked && form.categories.length >= MAX_CATEGORIES;
                    return (
                      <label key={c} className={styles.toggle} style={disabled ? { opacity: 0.45 } : undefined}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleCategory(c)}
                        />
                        <span className={styles.toggleLabel}>
                          {c}
                          {c === TOP_OF_SHOP_CATEGORY && (
                            <span style={{ color: 'var(--gold-dark)', fontWeight: 600 }}> — Top of page in Shop</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* NEW CATEGORY */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Or Create New Category</label>
                <div className={styles.globalSaleRow}>
                  <input className={styles.input} type="text"
                    placeholder="e.g. Saints, Marian…"
                    value={newCat}
                    onChange={e => setNewCat(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addNewCategory(); } }} />
                  <button type="button" className={styles.globalSaleBtn}
                    onClick={addNewCategory}
                    disabled={!newCat.trim() || form.categories.length >= MAX_CATEGORIES}>
                    Add
                  </button>
                </div>
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

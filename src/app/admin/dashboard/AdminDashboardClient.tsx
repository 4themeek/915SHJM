'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DbProduct } from '@/lib/db';
import styles from '../admin.module.css';

interface Props {
  products: DbProduct[];
  adminEmail: string;
  dbError?: boolean;
}

export default function AdminDashboardClient({ products: initialProducts, adminEmail, dbError }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [clearingSales, setClearingSales] = useState(false);
  const router = useRouter();

  const categories = ['All', ...Array.from(new Set(products.map(p => p.cat)))];

  const filtered = products.filter(p => {
    const matchCat = catFilter === 'All' || p.cat === catFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
    setDeleteId(null);
  }

  async function clearAllSales() {
    const confirmed = window.confirm(
      'This will remove the Sale badge, sale price, and sale end date from ALL products.\n\nContinue?'
    );
    if (!confirmed) return;
    setClearingSales(true);
    setSeedMsg('');
    try {
      const res = await fetch('/api/admin/clear-sales', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedMsg('✦ All sale flags cleared successfully');
        // Update local state so UI reflects change immediately
        setProducts(prev => prev.map(p => ({
          ...p,
          sale: false,
          sale_price: null,
          sale_ends_at: null,
        })));
      } else {
        setSeedMsg('❌ Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      setSeedMsg('❌ Network error: ' + err.message);
    } finally {
      setClearingSales(false);
    }
  }

  async function handleSeed() {
    const confirmed = window.confirm(
      'This will UPDATE existing products with original data but will NOT create duplicates.\n\nSafe to run at any time. Continue?'
    );
    if (!confirmed) return;

    setSeeding(true);
    setSeedMsg('');
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedMsg(`✦ ${data.message} — reloading...`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setSeedMsg('Error: ' + data.error);
      }
    } catch {
      setSeedMsg('Seed failed. Check console.');
    } finally {
      setSeeding(false);
    }
  }

  async function toggleActive(product: DbProduct) {
    const newActive = !product.active;
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: Boolean(newActive) }),
    });
    if (res.ok) {
      const { product: updated } = await res.json();
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
    } else {
      const data = await res.json();
      alert('Error: ' + data.error);
    }
  }

  return (
    <div className={styles.dashboard}>
      {/* HEADER */}
      <div className={styles.dashHeader}>
        <div className={styles.dashHeaderLeft}>
          <span className={styles.dashLogo}>✦ Sacred Hearts Admin</span>
          <span className={styles.dashEmail}>{adminEmail}</span>
        </div>
        <div className={styles.dashHeaderRight}>
          <Link href="/" className={styles.dashViewSite} target="_blank">View Site ↗</Link>
          <button className={styles.dashLogout} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className={styles.dashBody}>
        {/* DB ERROR / SETUP */}
        {dbError && (
          <div className={styles.setupBox}>
            <h2 className={styles.setupTitle}>⚙ Database Setup Required</h2>
            <p className={styles.setupText}>
              Your Vercel Postgres database is not connected yet. Please add the
              <code>POSTGRES_URL</code> environment variable in your Vercel project settings,
              then come back and click the button below to initialize and seed all 39 products.
            </p>
            <button
              className={styles.seedBtn}
              onClick={handleSeed}
              disabled={seeding}
            >
              {seeding ? 'Seeding…' : '✦ Initialize Database & Load All 39 Products'}
            </button>
            {seedMsg && <p className={styles.seedMsg}>{seedMsg}</p>}
          </div>
        )}

        {/* STATS BAR */}
        {!dbError && (
          <>
            <div className={styles.statsBar}>
              <div className={styles.statCard}>
                <span className={styles.statNum}>{products.length}</span>
                <span className={styles.statLabel}>Total Products</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>{products.filter(p => p.active).length}</span>
                <span className={styles.statLabel}>Active</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>{products.filter(p => !p.active).length}</span>
                <span className={styles.statLabel}>Hidden</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>{products.filter(p => p.out_of_stock).length}</span>
                <span className={styles.statLabel}>Out of Stock</span>
              </div>
              <div className={styles.statActions}>
                <Link href="/admin/products/new" className={styles.addBtn}>+ Add New Product</Link>
                <button className={styles.seedBtnSmall} onClick={handleSeed} disabled={seeding}>
                  {seeding ? 'Updating…' : '↺ Restore Original Products'}
                </button>
                <button className={styles.clearSaleBtn} onClick={clearAllSales} disabled={clearingSales}>
                  {clearingSales ? 'Clearing…' : '✕ Clear All Sales'}
                </button>
              </div>
            </div>
            {seedMsg && <p className={styles.seedMsg}>{seedMsg}</p>}

            {/* FILTERS */}
            <div className={styles.filters}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select
                className={styles.catSelect}
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className={styles.filterCount}>{filtered.length} products</span>
            </div>

            {/* PRODUCT TABLE */}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>ID</th>
                    <th className={styles.th}>Image</th>
                    <th className={styles.th}>Name</th>
                    <th className={styles.th}>Category</th>
                    <th className={styles.th}>Price</th>
                    <th className={styles.th}>Weight</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => (
                    <tr key={product.id} className={`${styles.tr} ${!product.active ? styles.trInactive : ''}`}>
                      <td className={styles.td}><span className={styles.idBadge}>{product.id}</span></td>
                      <td className={styles.td}>
                        {product.img && (
                          <img
                            src={product.img}
                            alt={product.name}
                            className={styles.productThumb}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                      </td>
                      <td className={styles.td}>
                        <p className={styles.productName}>{product.name}</p>
                        <p className={styles.productDesc}>{product.desc?.substring(0, 60)}…</p>
                      </td>
                      <td className={styles.td}><span className={styles.catBadge}>{product.cat}</span></td>
                      <td className={styles.td}>
                        <p className={styles.priceText}>{product.price}</p>
                        <p className={styles.priceFrom}>from ${product.start_price}</p>
                      </td>
                      <td className={styles.td}><span className={styles.weightBadge}>{product.weight_oz} oz</span></td>
                      <td className={styles.td}>
                        <div className={styles.statusBadges}>
                          {product.active
                            ? <span className={styles.badgeActive}>Active</span>
                            : <span className={styles.badgeHidden}>Hidden</span>}
                          {product.sale && (
                            <span className={styles.badgeSale}>
                              Sale{product.sale_price != null && Number(product.sale_price) > 0
                                ? ` · $${Number(product.sale_price).toFixed(2)}`
                                : ''}
                            </span>
                          )}
                          {product.out_of_stock && <span className={styles.badgeOos}>Out of Stock</span>}
                          {product.is_free && <span className={styles.badgeFree}>Free</span>}
                        </div>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                          <Link href={`/admin/products/${product.id}`} className={styles.editBtn}>Edit</Link>
                          <button
                            className={styles.toggleBtn}
                            onClick={() => toggleActive(product)}
                          >
                            {product.active ? 'Hide' : 'Show'}
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => setDeleteId(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className={styles.emptyTable}>
                  <p>No products found.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId !== null && (
        <>
          <div className={styles.modalOverlay} onClick={() => setDeleteId(null)} />
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Delete Product?</h3>
            <p className={styles.modalText}>
              This will permanently delete this product from the database. This cannot be undone.
            </p>
            <div className={styles.modalBtns}>
              <button className={styles.modalCancel} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.modalDelete} onClick={() => handleDelete(deleteId)}>Delete Permanently</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

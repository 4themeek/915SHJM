'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DbOrder } from '@/lib/db';
import styles from '../admin.module.css';
import DonationsNavBadge from '../DonationsNavBadge';

interface Props {
  orders: DbOrder[];
  adminEmail: string;
}

type RangeKey = '7d' | '30d' | 'ytd';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: 'ytd', label: 'Year to Date' },
];

function cutoffFor(range: RangeKey): Date {
  const now = new Date();
  if (range === '7d') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (range === '30d') {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return d;
  }
  return new Date(now.getFullYear(), 0, 1);
}

export default function ReportsClient({ orders, adminEmail }: Props) {
  const [range, setRange] = useState<RangeKey>('7d');
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  const filtered = useMemo(() => {
    const cutoff = cutoffFor(range);
    return orders
      .filter(o => new Date(o.created_at) >= cutoff)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, range]);

  const totalRevenue = filtered.reduce((sum, o) => sum + Number(o.amount_total), 0);
  const avgOrder = filtered.length ? totalRevenue / filtered.length : 0;

  const promoOrders = filtered.filter(o => o.promo_code);
  const totalDiscount = promoOrders.reduce((sum, o) => sum + Number(o.promo_discount || 0), 0);

  const promoBreakdown = useMemo(() => {
    const map = new Map<string, { uses: number; discount: number }>();
    for (const o of filtered) {
      if (!o.promo_code) continue;
      const entry = map.get(o.promo_code) || { uses: 0, discount: 0 };
      entry.uses += 1;
      entry.discount += Number(o.promo_discount || 0);
      map.set(o.promo_code, entry);
    }
    return Array.from(map.entries())
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => b.uses - a.uses);
  }, [filtered]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashHeader}>
        <div className={styles.dashHeaderLeft}>
          <span className={styles.dashLogo}>✦ Sacred Hearts Admin</span>
          <span className={styles.dashEmail}>{adminEmail}</span>
        </div>
        <div className={styles.dashHeaderRight}>
          <Link href="/admin/dashboard" className={styles.dashViewSite}>← Products</Link>
          <Link href="/admin/orders" className={styles.dashViewSite}>📦 Orders</Link>
          <Link href="/admin/donations" className={styles.dashViewSite}><span style={{ color: '#16a34a' }}>$</span> Donations Rec&apos;d<DonationsNavBadge /></Link>
          <Link href="/admin/messages" className={styles.dashViewSite}>✉ Messages</Link>
          <Link href="/admin/settings" className={styles.dashViewSite}>⚙ Settings</Link>
          <Link href="/" className={styles.dashViewSite} target="_blank">View Site ↗</Link>
          <button className={styles.dashLogout} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className={styles.dashBody}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={styles.addBtn}
              style={{
                background: range === r.key ? 'var(--crimson)' : 'var(--cream-dark)',
                color: range === r.key ? '#fff' : 'var(--ink-soft)',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{filtered.length}</span>
            <span className={styles.statLabel}>Orders</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>${totalRevenue.toFixed(2)}</span>
            <span className={styles.statLabel}>Total Revenue</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>${avgOrder.toFixed(2)}</span>
            <span className={styles.statLabel}>Avg Order Value</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{promoOrders.length}</span>
            <span className={styles.statLabel}>Promo Redemptions</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>${totalDiscount.toFixed(2)}</span>
            <span className={styles.statLabel}>Discounts Given</span>
          </div>
        </div>

        {promoBreakdown.length > 0 && (
          <div className={styles.tableWrap} style={{ marginBottom: '1.5rem' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Promo Code</th>
                  <th className={styles.th}>Redemptions</th>
                  <th className={styles.th}>Total Discount</th>
                </tr>
              </thead>
              <tbody>
                {promoBreakdown.map(p => (
                  <tr key={p.code}>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>{p.code}</td>
                    <td>{p.uses}</td>
                    <td>${p.discount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} style={{ width: '5.5rem' }}>Order</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Customer</th>
                <th className={styles.th}>Total</th>
                <th className={styles.th}>Promo Code</th>
                <th className={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td style={{ width: '5.5rem' }}>#{order.id}</td>
                  <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    {order.customer_name}<br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{order.customer_email}</span>
                  </td>
                  <td>${Number(order.amount_total).toFixed(2)}</td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {order.promo_code ? (
                      <>
                        {order.promo_code}
                        <br />
                        <span style={{ color: 'var(--gold-dark)' }}>−${Number(order.promo_discount).toFixed(2)}</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--ink-soft)' }}>—</span>
                    )}
                  </td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className={styles.emptyTable}>
              <p>No orders in this range.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

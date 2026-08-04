'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DbOrder } from '@/lib/db';
import styles from '../admin.module.css';

interface Props {
  orders: DbOrder[];
  adminEmail: string;
}

export default function OrdersClient({ orders: initialOrders, adminEmail }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<{ id: number; msg: string } | null>(null);
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  async function createLabel(id: number) {
    setBusyId(id);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}/create-label`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg({ id, msg: data.error || 'Failed to create label' });
      } else {
        setOrders(prev => prev.map(o => (o.id === id ? data.order : o)));
      }
    } catch (err: any) {
      setErrorMsg({ id, msg: 'Network error: ' + err.message });
    } finally {
      setBusyId(null);
    }
  }

  async function voidLabel(id: number) {
    if (!window.confirm('Void this label and request a refund from Shippo?')) return;
    setBusyId(id);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}/void-label`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg({ id, msg: data.error || 'Failed to void label' });
      } else {
        setOrders(prev => prev.map(o => (o.id === id ? data.order : o)));
      }
    } catch (err: any) {
      setErrorMsg({ id, msg: 'Network error: ' + err.message });
    } finally {
      setBusyId(null);
    }
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
          <Link href="/admin/messages" className={styles.dashViewSite}>✉ Messages</Link>
          <Link href="/" className={styles.dashViewSite} target="_blank">View Site ↗</Link>
          <button className={styles.dashLogout} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className={styles.dashBody}>
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{orders.length}</span>
            <span className={styles.statLabel}>Total Orders</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{orders.filter(o => o.status === 'paid').length}</span>
            <span className={styles.statLabel}>Awaiting Label</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{orders.filter(o => o.status === 'shipped').length}</span>
            <span className={styles.statLabel}>Shipped</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Ship To</th>
                <th>Total</th>
                <th>Status</th>
                <th>Label / Tracking</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>
                    {order.customer_name}<br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{order.customer_email}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {order.shipping_street1}<br />
                    {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                  </td>
                  <td>
                    ${Number(order.amount_total).toFixed(2)}
                    {order.promo_code && (
                      <><br /><span style={{ fontSize: '0.75rem', color: 'var(--gold-dark)' }}>
                        {order.promo_code} (−${Number(order.promo_discount).toFixed(2)})
                      </span></>
                    )}
                  </td>
                  <td>{order.status}</td>
                  <td>
                    {order.label_url ? (
                      <>
                        <a href={order.label_url} target="_blank" rel="noreferrer">Print Label</a>
                        <br />
                        <span style={{ fontSize: '0.8rem' }}>{order.carrier} — {order.tracking_number}</span>
                        <br />
                        {order.refund_status ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--gold-dark)' }}>
                            Refund: {order.refund_status}
                          </span>
                        ) : (
                          <button
                            onClick={() => voidLabel(order.id)}
                            disabled={busyId === order.id}
                            style={{ fontSize: '0.75rem', color: '#8B1A1A', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            {busyId === order.id ? 'Voiding…' : 'Void / Refund'}
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => createLabel(order.id)}
                        disabled={busyId === order.id}
                        className={styles.addBtn}
                      >
                        {busyId === order.id ? 'Creating…' : 'Create Label'}
                      </button>
                    )}
                    {errorMsg?.id === order.id && (
                      <p style={{ color: '#8B1A1A', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errorMsg.msg}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

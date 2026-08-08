'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Donation } from '@/lib/db';
import styles from '../admin.module.css';

interface Props {
  donations: Donation[];
  adminEmail: string;
}

const SOURCE_LABELS: Record<string, string> = {
  donation: 'Online',
  table_donation: 'Table (QR)',
};

export default function DonationsClient({ donations, adminEmail }: Props) {
  const [rows, setRows] = useState(donations);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<{ id: number; msg: string } | null>(null);
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  async function sendThankYou(id: number) {
    setBusyId(id);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/donations/${id}/thank-you`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg({ id, msg: data.error || 'Failed to send thank-you email' });
      } else {
        setRows(prev => prev.map(d => (d.id === id ? data.donation : d)));
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
          <Link href="/admin/orders" className={styles.dashViewSite}>📦 Orders</Link>
          <Link href="/admin/messages" className={styles.dashViewSite}>✉ Messages</Link>
          <Link href="/admin/settings" className={styles.dashViewSite}>⚙ Settings</Link>
          <Link href="/admin/reports" className={styles.dashViewSite}>📊 Reports</Link>
          <Link href="/" className={styles.dashViewSite} target="_blank">View Site ↗</Link>
          <button className={styles.dashLogout} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className={styles.dashBody}>
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{rows.length}</span>
            <span className={styles.statLabel}>Total Donations</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>
              ${rows.reduce((sum, d) => sum + Number(d.amount), 0).toFixed(2)}
            </span>
            <span className={styles.statLabel}>Total Received</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{rows.filter(d => !d.thank_you_sent_at).length}</span>
            <span className={styles.statLabel}>Awaiting Thank You</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date / Time</th>
                <th className={styles.th}>Donor</th>
                <th className={styles.th}>Amount</th>
                <th className={styles.th}>Source</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Thank You</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(d => (
                <tr key={d.id}>
                  <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                      {new Date(d.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </td>
                  <td>
                    {d.donor_name || <span style={{ color: 'var(--ink-soft)' }}>—</span>}
                    <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{d.donor_email || '—'}</span>
                  </td>
                  <td>${Number(d.amount).toFixed(2)}</td>
                  <td style={{ fontSize: '0.85rem' }}>{SOURCE_LABELS[d.source] || d.source}</td>
                  <td>{d.status}</td>
                  <td>
                    {d.thank_you_sent_at ? (
                      <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>
                        ✓ Sent {new Date(d.thank_you_sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    ) : (
                      <button
                        onClick={() => sendThankYou(d.id)}
                        disabled={busyId === d.id || !d.donor_email}
                        className={styles.addBtn}
                      >
                        {busyId === d.id ? 'Sending…' : 'Send Thank You'}
                      </button>
                    )}
                    {errorMsg?.id === d.id && (
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

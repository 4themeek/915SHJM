'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ContactMessage } from '@/lib/db';
import styles from '../admin.module.css';

interface Props {
  messages: ContactMessage[];
  adminEmail: string;
}

export default function MessagesClient({ messages: initialMessages, adminEmail }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  async function toggleRead(msg: ContactMessage) {
    setBusyId(msg.id);
    try {
      const res = await fetch(`/api/admin/messages/${msg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !msg.read }),
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, read: !m.read } : m)));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessages(prev => prev.filter(m => m.id !== id));
    }
    setDeleteId(null);
  }

  const unreadCount = messages.filter(m => !m.read).length;

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
          <Link href="/admin/settings" className={styles.dashViewSite}>⚙ Settings</Link>
          <Link href="/" className={styles.dashViewSite} target="_blank">View Site ↗</Link>
          <button className={styles.dashLogout} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className={styles.dashBody}>
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{messages.length}</span>
            <span className={styles.statLabel}>Total Messages</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{unreadCount}</span>
            <span className={styles.statLabel}>Unread</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>From</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <tr key={msg.id} style={!msg.read ? { fontWeight: 600 } : undefined}>
                  <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {new Date(msg.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {msg.name}<br />
                    <a href={`mailto:${msg.email}`} style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{msg.email}</a>
                    {msg.phone && <><br /><span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{msg.phone}</span></>}
                  </td>
                  <td style={{ maxWidth: '360px', whiteSpace: 'pre-line', fontWeight: 400 }}>{msg.message}</td>
                  <td>
                    {msg.read
                      ? <span className={styles.badgeHidden}>Read</span>
                      : <span className={styles.badgeActive}>Unread</span>}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.toggleBtn}
                        onClick={() => toggleRead(msg)}
                        disabled={busyId === msg.id}
                      >
                        {msg.read ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteId(msg.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {messages.length === 0 && (
            <div className={styles.emptyTable}>
              <p>No messages yet.</p>
            </div>
          )}
        </div>
      </div>

      {deleteId !== null && (
        <>
          <div className={styles.modalOverlay} onClick={() => setDeleteId(null)} />
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Delete Message?</h3>
            <p className={styles.modalText}>
              This will permanently delete this message. This cannot be undone.
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

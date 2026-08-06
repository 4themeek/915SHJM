'use client';

import { useEffect, useState } from 'react';
import styles from './admin.module.css';

export default function DonationsNavBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/donations/unread-count')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!cancelled && data) setCount(data.count);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!count) return null;
  return <span className={styles.navBubble}>{count}</span>;
}

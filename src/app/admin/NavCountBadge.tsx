'use client';

import { useEffect, useState } from 'react';
import styles from './admin.module.css';

export default function NavCountBadge({ endpoint }: { endpoint: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(endpoint)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!cancelled && data) setCount(data.count);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [endpoint]);

  if (!count) return null;
  return <span className={styles.navBubble}>{count}</span>;
}

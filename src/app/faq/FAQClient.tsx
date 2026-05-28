'use client';

import { useState } from 'react';
import styles from './faq.module.css';

interface FAQ { q: string; a: string; }

export default function FAQClient({ faqs }: { faqs: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className={styles.list}>
      {faqs.map((f, i) => (
        <div key={i} className={styles.item} onClick={() => setOpen(open === i ? null : i)}>
          <div className={styles.question}>
            <span>{f.q}</span>
            <span className={styles.toggle}>{open === i ? '−' : '+'}</span>
          </div>
          {open === i && <p className={styles.answer}>{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

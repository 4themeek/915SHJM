'use client';

import { useState } from 'react';
import { Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import styles from './shop.module.css';

interface Props {
  products: Product[];
  categories: string[];
}

export default function ShopClient({ products, categories }: Props) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered =
    activeFilter === 'All' ? products : products.filter((p) => p.cat === activeFilter);

  return (
    <section className="section">
      <div className="container">
        <div className={styles.filterBar}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${activeFilter === cat ? styles.active : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <p className={styles.count}>
          Showing {filtered.length} of {products.length} items
        </p>
        <div className={styles.grid}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

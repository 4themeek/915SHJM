'use client';

import { useCart } from '@/lib/cart-context';
import { Product } from '@/lib/products';
import { useState } from 'react';
import styles from './product.module.css';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart, openCart } = useCart();
  const [added, setAdded] = useState(false);

  function handle() {
    addToCart(product);
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button className={styles.btnAdd} onClick={handle}>
      {added ? '✦ Added to Cart!' : 'Add to Cart'}
    </button>
  );
}

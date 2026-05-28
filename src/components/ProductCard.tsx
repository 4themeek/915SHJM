'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { useCart } from '@/lib/cart-context';
import styles from './ProductCard.module.css';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart, openCart } = useCart();

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addToCart(product);
    openCart();
  }

  return (
    <Link href={`/shop/${product.id}`} className={styles.card}>
      {product.sale && <span className={styles.saleBadge}>Sale</span>}
      {product.outOfStock && <span className={styles.outBadge}>Out of Stock</span>}
      <div className={styles.imgWrap}>
        <Image
          src={product.img}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={styles.img}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://thesacredhearts.org/wp-content/uploads/woocommerce-placeholder.png';
          }}
        />
      </div>
      <div className={styles.body}>
        <p className={styles.cat}>{product.cat}</p>
        <p className={styles.name}>{product.name}</p>
        <p className={styles.price}>{product.price}</p>
        {product.outOfStock ? (
          <button className={styles.btnDisabled} disabled>Out of Stock</button>
        ) : product.isFree ? (
          <Link href="/contact" className={styles.btnNav}>Contact Us</Link>
        ) : (
          <button className={styles.btnAdd} onClick={handleAdd}>Add to Cart</button>
        )}
      </div>
    </Link>
  );
}

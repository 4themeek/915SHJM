import type { Metadata } from 'next';
import { PRODUCTS, CATEGORIES } from '@/lib/products';
import ShopClient from './ShopClient';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our full collection of 39 high-quality sacred prints and plaques.',
};

export default function ShopPage() {
  return (
    <>
      <div className="page-hero">
        <h1>Our Collection</h1>
        <p>High-quality prints and plaques of the Sacred Hearts</p>
      </div>
      <ShopClient products={PRODUCTS} categories={CATEGORIES} />
    </>
  );
}

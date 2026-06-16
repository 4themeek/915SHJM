import type { Metadata } from 'next';
import { getAllProducts, createProductsTable, runMigrations } from '@/lib/db';
import { PRODUCTS, CATEGORIES } from '@/lib/products';
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our full collection of sacred prints and plaques.',
};

export default async function ShopPage() {
  let products: any[] = [];
  let categories: string[] = [];

  try {
    await createProductsTable();
    await runMigrations();
    const dbProducts = await getAllProducts();

    if (dbProducts.length > 0) {
      // Map DB products to the shape the client expects
      products = dbProducts
        .filter(p => p.active)
        .map(p => ({
          id: p.id,
          name: p.name,
          cat: p.cat,
          price: p.price,
          startPrice: Number(p.start_price),
          img: p.img,
          desc: p.desc,
          sale: p.sale && (!p.sale_ends_at || new Date(p.sale_ends_at) > new Date()),
          sale_price: p.sale_price ? Number(p.sale_price) : null,
          sale_ends_at: p.sale_ends_at,
          outOfStock: p.out_of_stock,
          isFree: p.is_free,
          weight_oz: p.weight_oz,
        }));
      categories = ['All', ...Array.from(new Set(products.map(p => p.cat)))];
    } else {
      // Fallback to static products if DB is empty
      products = PRODUCTS;
      categories = CATEGORIES;
    }
  } catch {
    // Fallback to static products if DB not connected
    products = PRODUCTS;
    categories = CATEGORIES;
  }

  return (
    <>
      <div className="page-hero">
        <h1>Our Collection</h1>
        <p>High-quality prints and plaques of the Sacred Hearts</p>
      </div>
      <ShopClient products={products} categories={categories} />
    </>
  );
}

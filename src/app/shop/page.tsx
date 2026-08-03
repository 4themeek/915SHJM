import type { Metadata } from 'next';
import { getAllProducts, createProductsTable, runMigrations, getSetting } from '@/lib/db';
import { PRODUCTS, CATEGORIES } from '@/lib/products';
import ShopClient from './ShopClient';
import styles from './shop.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our full collection of sacred prints and plaques.',
};

export default async function ShopPage() {
  let products: any[] = [];
  let categories: string[] = [];
  const shopMaintenance = (await getSetting('shop_maintenance_mode')) === 'true';

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
      {shopMaintenance && (
        <div className={styles.maintenanceBanner}>
          <p className={styles.maintenanceBannerTitle}>✦ Shop Under Construction ✦</p>
          <p className={styles.maintenanceBannerText}>
            We're making some updates and aren't able to take orders online right now. Browse our
            full catalog below for reference, and call <a href="tel:5137413400">(513) 741-3400</a> (M&ndash;F
            11am&ndash;4pm EST) to place an order in the meantime.
          </p>
        </div>
      )}
      <ShopClient products={products} categories={categories} />
    </>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProducts, getProductById, createProductsTable, runMigrations } from '@/lib/db';
import { PRODUCTS } from '@/lib/products';
import AddToCartButton from './AddToCartButton';
import styles from './product.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

function dbToProduct(p: any) {
  return {
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
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    await createProductsTable();
    const p = await getProductById(Number(id));
    if (p) return { title: p.name, description: p.desc };
  } catch {}
  const p = PRODUCTS.find(p => p.id === Number(id));
  return p ? { title: p.name, description: p.desc } : { title: 'Product Not Found' };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  let product: any = null;
  let allProducts: any[] = [];

  try {
    await createProductsTable();
    await runMigrations();
    const dbProduct = await getProductById(Number(id));
    if (dbProduct && dbProduct.active) {
      product = dbToProduct(dbProduct);
    }
    const allDb = await getAllProducts();
    if (allDb.length > 0) {
      allProducts = allDb.filter(p => p.active).map(dbToProduct);
    } else {
      allProducts = PRODUCTS;
    }
  } catch {
    // Fallback to static
    product = PRODUCTS.find(p => p.id === Number(id)) || null;
    allProducts = PRODUCTS;
  }

  if (!product) notFound();

  const related = allProducts
    .filter(p => p.cat === product.cat && p.id !== product.id)
    .slice(0, 4);

  const saleActive = product.sale &&
    (!product.sale_ends_at || new Date(product.sale_ends_at) > new Date());

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/shop">← Back to Shop</Link>
      </div>

      <div className={styles.productPage}>
        <div className={styles.imageWrap}>
          {saleActive && <span className={styles.saleBadge}>Sale</span>}
          {product.outOfStock && <span className={styles.oosBadge}>Out of Stock</span>}
          {product.img ? (
            <Image
              src={product.img}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'contain' }}
              priority
            />
          ) : (
            <div className={styles.noImage}>✦</div>
          )}
        </div>

        <div className={styles.productInfo}>
          <p className={styles.category}>{product.cat}</p>
          <h1 className={styles.productName}>{product.name}</h1>

          {saleActive && product.sale_price ? (
            <div className={styles.priceWrap}>
              <p className={styles.salePrice}>${Number(product.sale_price).toFixed(2)}</p>
              <p className={styles.originalPrice}>{product.price}</p>
            </div>
          ) : (
            <p className={styles.price}>{product.price}</p>
          )}

          <p className={styles.desc}>{product.desc}</p>

          {product.isFree ? (
            <div className={styles.freeNote}>
              <p>This item is available free of charge.</p>
              <Link href="/contact" className={styles.contactBtn}>Contact Us to Request</Link>
            </div>
          ) : product.outOfStock ? (
            <button className={styles.addToCartBtn} disabled>Out of Stock</button>
          ) : (
            <AddToCartButton product={product} />
          )}

          <div className={styles.metaInfo}>
            <p>✦ Ships from Cincinnati, Ohio</p>
            <p>✦ Tax-deductible donation · 501(c)3 nonprofit</p>
            <p>✦ Questions? <a href="tel:5137413400">513.741.3400</a></p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className={styles.related}>
          <h2 className={styles.relatedTitle}>More in {product.cat}</h2>
          <div className={styles.relatedGrid}>
            {related.map(p => (
              <Link key={p.id} href={`/shop/${p.id}`} className={styles.relatedCard}>
                <div className={styles.relatedImg}>
                  {p.img && (
                    <Image src={p.img} alt={p.name} fill
                      sizes="200px" style={{ objectFit: 'cover' }} />
                  )}
                </div>
                <p className={styles.relatedName}>{p.name}</p>
                <p className={styles.relatedPrice}>{p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

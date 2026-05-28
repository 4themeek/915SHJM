import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '@/lib/products';
import AddToCartButton from './AddToCartButton';
import styles from './product.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === Number(id));
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.desc,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === Number(id));
  if (!product) notFound();

  const related = PRODUCTS.filter(
    (p) => p.cat === product.cat && p.id !== product.id
  ).slice(0, 4);

  return (
    <>
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link href="/shop" className={styles.back}>← Back to Shop</Link>
          <span className={styles.breadSep}>/</span>
          <span className={styles.breadCurrent}>{product.cat}</span>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className={styles.detail}>
            <div className={styles.imgCol}>
              <div className={styles.imgWrap}>
                <Image
                  src={product.img}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </div>

            <div className={styles.infoCol}>
              <p className={styles.cat}>✦ {product.cat}</p>
              <h1 className={styles.name}>{product.name}</h1>
              <p className={styles.price}>{product.price}</p>
              <p className={styles.desc}>{product.desc}</p>

              {product.outOfStock ? (
                <button className={styles.btnDisabled} disabled>Currently Out of Stock</button>
              ) : product.isFree ? (
                <Link href="/contact" className={styles.btnNav}>Contact Us to Request</Link>
              ) : (
                <AddToCartButton product={product} />
              )}

              <p className={styles.footnote}>
                Free shipping on most orders · Every purchase is a tax-deductible donation
              </p>

              <div className={styles.trustBadges}>
                <span>✦ 501(c)3 Nonprofit</span>
                <span>✦ Secure Checkout</span>
                <span>✦ Made with Devotion</span>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className={styles.related}>
              <h2 className="section-title">More in {product.cat}</h2>
              <div className={styles.relatedGrid}>
                {related.map((p) => (
                  <Link key={p.id} href={`/shop/${p.id}`} className={styles.relatedCard}>
                    <div className={styles.relatedImg}>
                      <Image src={p.img} alt={p.name} fill sizes="200px" style={{ objectFit: 'cover' }} />
                    </div>
                    <p className={styles.relatedName}>{p.name}</p>
                    <p className={styles.relatedPrice}>{p.price}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

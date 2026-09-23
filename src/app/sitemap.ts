import type { MetadataRoute } from 'next';
import { getAllProducts, createProductsTable, runMigrations } from '@/lib/db';
import { PRODUCTS } from '@/lib/products';

export const dynamic = 'force-dynamic';

const STATIC_PAGES: {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  priority: number;
}[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/shop', changeFrequency: 'daily', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/donate', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/shipping', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/promises', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/immaculate-heart', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/holy-spirit', changeFrequency: 'monthly', priority: 0.6 },
];

// Regenerated fresh on every crawl request (force-dynamic) so new or
// deactivated products, and edits to any product, show up immediately —
// nothing here is baked in at build time.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thesacredhearts.org').replace(/\/$/, '');
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(p => ({
    url: `${siteUrl}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  let productEntries: MetadataRoute.Sitemap;
  try {
    await createProductsTable();
    await runMigrations();
    const products = await getAllProducts();
    productEntries = products.map(p => ({
      url: `${siteUrl}/shop/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (err) {
    // Fails open to the static fallback catalog rather than shipping a
    // sitemap with no products at all, mirroring the same DB-unreachable
    // fallback already used on the homepage and /shop.
    console.error('Sitemap: DB unreachable, falling back to static product catalog', err);
    productEntries = PRODUCTS.map(p => ({
      url: `${siteUrl}/shop/${p.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  }

  return [...staticEntries, ...productEntries];
}

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thesacredhearts.org').replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/checkout',
        '/order-success',
        '/donate/success',
        '/give',
        '/give/success',
        '/api',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

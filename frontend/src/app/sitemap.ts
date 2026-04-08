import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://dhanunjaiah.com';
const API = process.env.NEXT_PUBLIC_API_URL || '';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/sarees`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE}/register`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE}/track`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/shipping-policy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/return-policy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/privacy-policy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/terms-and-conditions`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/api/products/sitemap`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const products: { id: string; name: string; createdTime: string }[] = await res.json();
      productPages = products.map((p) => ({
        url: `${SITE}/sarees/${p.id}`,
        lastModified: new Date(p.createdTime),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch {
    // Sitemap still works without products
  }

  return [...staticPages, ...productPages];
}

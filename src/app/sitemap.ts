/**
 * app/sitemap.ts — Sitemap XML otomatis dengan indeks artikel.
 */

import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';
import { getPublishedArticles } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const articles = await getPublishedArticles();

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/artikel`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  for (const art of articles) {
    entries.push({
      url: `${siteUrl}/artikel/${art.slug}`,
      lastModified: art.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return entries;
}

import type { MetadataRoute } from 'next';
import {
  getPublishedArticles,
  getServiceSlugsWithDetail,
  getTranslatedSlugs,
} from '@/lib/content';
import { getSiteUrl } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [articles, serviceSlugs, translated] = await Promise.all([
    getPublishedArticles(500),
    getServiceSlugsWithDetail(),
    getTranslatedSlugs(),
  ]);

  const homeLangs = {
    id: siteUrl,
    en: `${siteUrl}/en`,
    'x-default': siteUrl,
  };

  const artikelLangs = {
    id: `${siteUrl}/artikel`,
    en: `${siteUrl}/en/artikel`,
    'x-default': `${siteUrl}/artikel`,
  };

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: homeLangs },
    },
    {
      url: `${siteUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: homeLangs },
    },
    {
      url: `${siteUrl}/artikel`,
      lastModified: articles[0]?.updatedAt ?? new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: artikelLangs },
    },
    {
      url: `${siteUrl}/en/artikel`,
      lastModified: articles[0]?.updatedAt ?? new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: artikelLangs },
    },
    {
      url: `${siteUrl}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/en/llms.txt`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  for (const art of articles) {
    const idUrl = `${siteUrl}/artikel/${art.slug}`;
    const enUrl = `${siteUrl}/en/artikel/${art.slug}`;
    const hasEn = translated.articles.has(art.slug);
    const languages = hasEn
      ? { id: idUrl, en: enUrl, 'x-default': idUrl }
      : undefined;

    entries.push({
      url: idUrl,
      lastModified: art.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
      ...(languages ? { alternates: { languages } } : {}),
    });

    if (hasEn) {
      entries.push({
        url: enUrl,
        lastModified: art.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  for (const svc of serviceSlugs) {
    const idUrl = `${siteUrl}/layanan/${svc.slug}`;
    const enUrl = `${siteUrl}/en/layanan/${svc.slug}`;
    const hasEn = translated.services.has(svc.slug);
    const languages = hasEn
      ? { id: idUrl, en: enUrl, 'x-default': idUrl }
      : undefined;

    entries.push({
      url: idUrl,
      lastModified: svc.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
      ...(languages ? { alternates: { languages } } : {}),
    });

    if (hasEn) {
      entries.push({
        url: enUrl,
        lastModified: svc.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}

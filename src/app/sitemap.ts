import type { MetadataRoute } from 'next';
import {
  getContentLastModified,
  getPublishedArticles,
  latestDate,
  getServiceSlugsWithDetail,
  getTranslatedSlugs,
} from '@/lib/content';
import { getSiteUrl } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [articles, serviceSlugs, translated, lastMod] = await Promise.all([
    getPublishedArticles(500),
    getServiceSlugsWithDetail(),
    getTranslatedSlugs(),
    getContentLastModified(),
  ]);
  const homeLastMod = latestDate(lastMod.site, lastMod.articles);
  const lm = (d: Date | null) => (d ? { lastModified: d } : {});

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
      ...lm(homeLastMod),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: homeLangs },
    },
    {
      url: `${siteUrl}/en`,
      ...lm(homeLastMod),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: homeLangs },
    },
    {
      url: `${siteUrl}/artikel`,
      ...lm(lastMod.articles),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: artikelLangs },
    },
    {
      url: `${siteUrl}/en/artikel`,
      ...lm(lastMod.articles),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: artikelLangs },
    },
    {
      url: `${siteUrl}/llms.txt`,
      ...lm(homeLastMod),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/en/llms.txt`,
      ...lm(homeLastMod),
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

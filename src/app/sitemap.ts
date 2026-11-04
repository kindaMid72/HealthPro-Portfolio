/**
 * app/sitemap.ts — Sitemap XML otomatis (Fase 4: SEO)
 *
 * Dirender oleh Next.js di path /sitemap.xml.
 * Berisi beranda, indeks & artikel, serta halaman layanan yang punya konten detail.
 * Crawler (Googlebot, dll) akan pakai ini untuk indexing.
 */

import type { MetadataRoute } from "next";
import { getPublishedArticles, getServiceSlugsWithDetail } from "@/lib/content";
import { getSiteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [articles, serviceSlugs] = await Promise.all([
    getPublishedArticles(500),
    getServiceSlugsWithDetail(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/artikel`,
      lastModified: articles[0]?.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  for (const art of articles) {
    entries.push({
      url: `${siteUrl}/artikel/${art.slug}`,
      lastModified: art.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const svc of serviceSlugs) {
    entries.push({
      url: `${siteUrl}/layanan/${svc.slug}`,
      lastModified: svc.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}

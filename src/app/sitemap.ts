/**
 * app/sitemap.ts — Sitemap XML otomatis (Fase 4: SEO)
 *
 * Dirender oleh Next.js di path /sitemap.xml.
 * Single-page site, jadi hanya 1 entry — halaman utama.
 * Crawler (Googlebot, dll) akan pakai ini untuk indexing.
 */

import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}

/**
 * app/sitemap.ts — Sitemap XML otomatis (Fase 4: SEO)
 *
 * Dirender oleh Next.js di path /sitemap.xml.
 * Single-page site, jadi hanya 1 entry — halaman utama.
 * Crawler (Googlebot, dll) akan pakai ini untuk indexing.
 */

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

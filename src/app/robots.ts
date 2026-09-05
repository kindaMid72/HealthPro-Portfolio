/**
 * app/robots.ts — robots.txt otomatis (Fase 4: SEO)
 *
 * Dirender oleh Next.js di path /robots.txt.
 * Izinkan semua crawler, dan arahkan ke sitemap.
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

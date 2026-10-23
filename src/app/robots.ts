/**
 * app/robots.ts — robots.txt otomatis (SEO + GEO + Admin Disallow)
 */

import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'DuckAssistBot',
  'MistralAI-User',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin'],
      },
      {
        userAgent: AI_CRAWLERS,
        allow: '/',
        disallow: ['/admin', '/api/admin'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl.replace(/^https?:\/\//i, ''),
  };
}

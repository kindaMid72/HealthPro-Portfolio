/**
 * app/robots.ts — automated robots.txt (Phase 4: SEO + GEO)
 *
 * Rendered by Next.js at path /robots.txt.
 * Standard search crawlers AND AI/LLM crawlers are explicitly allowed so the site
 * can be cited/recommended by ChatGPT, Claude, Perplexity, Gemini, etc.
 * To restrict training access only: move training bots (GPTBot, ClaudeBot,
 * Google-Extended, Applebot-Extended, CCBot) to `disallow: "/"` rule.
 */

import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

const AI_CRAWLERS = [
  // OpenAI
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Google (Gemini / AI Overviews) & Apple
  "Google-Extended",
  "Applebot-Extended",
  // Others
  "Bingbot",
  "DuckAssistBot",
  "MistralAI-User",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: ["/admin", "/api/admin"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    // Host: domain name only without protocol (Yandex standard, ignored by Google).
    // Proper format: "dryuliana.my.id", not "https://dryuliana.my.id".
    host: siteUrl.replace(/^https?:\/\//i, ""),
  };
}

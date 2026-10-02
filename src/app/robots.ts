/**
 * app/robots.ts — robots.txt otomatis (Fase 4: SEO + GEO)
 *
 * Dirender oleh Next.js di path /robots.txt.
 * Crawler search biasa DAN crawler AI/LLM diizinkan eksplisit supaya situs
 * bisa dikutip/direkomendasikan oleh ChatGPT, Claude, Perplexity, Gemini, dsb.
 * Mau menutup akses training saja? Pindahkan bot training (GPTBot, ClaudeBot,
 * Google-Extended, Applebot-Extended, CCBot) ke aturan `disallow: "/"`.
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
  // Lainnya
  "Bingbot",
  "DuckAssistBot",
  "MistralAI-User",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

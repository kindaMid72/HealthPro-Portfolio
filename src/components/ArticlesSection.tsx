/**
 * components/ArticlesSection.tsx — Section artikel edukasi terbaru di halaman utama.
 * Return null jika belum ada artikel terbit (FR-4).
 */

import Link from 'next/link';
import type { PublicArticleSummary } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';

interface ArticlesSectionProps {
  articles: PublicArticleSummary[];
}

export default function ArticlesSection({ articles }: ArticlesSectionProps) {
  if (articles.length === 0) return null;

  const latestArticles = articles.slice(0, 3);

  return (
    <section
      id="artikel"
      aria-labelledby="artikel-heading"
      className="section-divider section-spacing px-4 bg-surface"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Edukasi Kesehatan
          </span>
          <h2
            id="artikel-heading"
            className="mt-2 text-3xl font-bold md:text-4xl text-primary-dark font-heading tracking-tight"
          >
            Artikel Terbaru
          </h2>
          <div aria-hidden="true" className="mt-3 flex items-center justify-center gap-2">
            <div className="h-1 w-12 rounded-full bg-primary" />
            <div className="h-1 w-4 rounded-full bg-accent" />
          </div>
          <p className="mt-4 text-sm text-text-body/70 max-w-md mx-auto">
            Wawasan dan panduan praktis seputar kesehatan telinga, hidung, dan tenggorok.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {latestArticles.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/artikel"
            className="inline-flex items-center rounded-full border-2 border-primary px-6 py-2.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white"
          >
            Lihat Semua Artikel →
          </Link>
        </div>
      </div>
    </section>
  );
}

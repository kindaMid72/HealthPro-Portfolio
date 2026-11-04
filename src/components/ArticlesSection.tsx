import Link from 'next/link';
import ArticleCard from './ArticleCard';
import type { PublicArticleSummary } from '@/lib/types';

interface ArticlesSectionProps {
  articles: PublicArticleSummary[];
}

export default function ArticlesSection({ articles }: ArticlesSectionProps) {
  if (articles.length === 0) {
    return null;
  }

  const featured = articles.slice(0, 3);

  return (
    <section
      id="artikel"
      aria-labelledby="artikel-heading"
      className="section-divider section-spacing bg-bg px-4"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2
              id="artikel-heading"
              className="font-heading text-3xl font-bold tracking-tight text-primary-dark md:text-4xl"
            >
              Artikel Edukasi Kesehatan THT
            </h2>
            <div
              aria-hidden="true"
              className="mt-3 flex items-center gap-2"
            >
              <div className="h-1 w-12 rounded-full bg-primary" />
              <div className="h-1 w-4 rounded-full bg-accent" />
            </div>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-body/80">
              Informasi medis seputar kesehatan telinga, hidung, tenggorok, dan
              bedah kepala-leher yang ditinjau langsung oleh dokter spesialis.
            </p>
          </div>

          <Link
            href="/artikel"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-white px-5 py-2.5 font-heading text-xs font-semibold text-primary shadow-xs transition-all hover:border-primary hover:bg-primary hover:text-white"
          >
            Lihat Semua Artikel →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

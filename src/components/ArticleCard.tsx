/**
 * components/ArticleCard.tsx — Kartu ringkasan artikel edukasi kesehatan THT.
 */

import Link from 'next/link';
import type { PublicArticleSummary } from '@/lib/types';
import { formatDateId } from '@/lib/format';

interface ArticleCardProps {
  article: PublicArticleSummary;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = formatDateId(article.publishedAt);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <Link href={`/artikel/${article.slug}`} className="block aspect-[16/9] w-full overflow-hidden bg-surface">
        {article.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImageUrl}
            alt={article.coverAlt || article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
            <span className="text-xs font-semibold uppercase tracking-wider">Artikel THT</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
          <span>{article.authorName}</span>
          <span>•</span>
          <time dateTime={article.publishedAt.toISOString()}>{formattedDate}</time>
        </div>

        <h3 className="text-lg font-bold text-text-heading group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/artikel/${article.slug}`}>
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p className="mt-2 text-sm text-text-body line-clamp-3">
            {article.excerpt}
          </p>
        )}

        <div className="mt-auto pt-4">
          <Link
            href={`/artikel/${article.slug}`}
            className="inline-flex items-center text-xs font-semibold text-primary group-hover:underline"
          >
            Baca Selengkapnya →
          </Link>
        </div>
      </div>
    </article>
  );
}

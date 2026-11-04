import Link from 'next/link';
import { Clock, BookOpen } from 'lucide-react';
import { formatDateShortId } from '@/lib/format';
import type { PublicArticleSummary } from '@/lib/types';

interface ArticleCardProps {
  article: PublicArticleSummary;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      <Link
        href={`/artikel/${article.slug}`}
        className="relative block aspect-[16/9] w-full overflow-hidden bg-primary/10"
      >
        {article.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImageUrl}
            alt={article.coverAlt || article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-white"
            style={{
              background:
                'linear-gradient(135deg, #3F6B74 0%, #243138 100%)',
            }}
          >
            <BookOpen size={28} className="text-white/75" aria-hidden="true" />
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide text-white/90">
              {article.categoryLabel}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
            {article.categoryLabel}
          </span>
          <span aria-hidden="true">•</span>
          <time dateTime={article.publishedAt.toISOString()}>
            {formatDateShortId(article.publishedAt)}
          </time>
          <span aria-hidden="true">•</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} aria-hidden="true" />
            {article.readingTimeMinutes} mnt baca
          </span>
        </div>

        <h3 className="mb-2 line-clamp-2 font-heading text-lg font-bold leading-snug text-primary-dark transition-colors group-hover:text-primary">
          <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
        </h3>

        {article.excerpt && (
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-text-body">
            {article.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-4 text-xs">
          <span className="truncate font-medium text-text-muted">
            Oleh {article.authorName}
          </span>
          <Link
            href={`/artikel/${article.slug}`}
            className="shrink-0 font-heading font-semibold text-primary transition-colors group-hover:text-primary-dark"
          >
            Baca Selengkapnya →
          </Link>
        </div>
      </div>
    </article>
  );
}

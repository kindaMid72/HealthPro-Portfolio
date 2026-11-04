import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { formatDateShortId } from '@/lib/format';
import type { PublicArticleSummary } from '@/lib/types';

interface ArticleCardProps {
  article: PublicArticleSummary;
  variant?: 'default' | 'compact';
}

function Cover({ article, className }: { article: PublicArticleSummary; className: string }) {
  return (
    <div className={`relative overflow-hidden bg-primary-tint ${className}`}>
      {article.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImageUrl}
          alt={article.coverAlt || article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-primary" aria-hidden="true">
          <BookOpen size={28} />
        </div>
      )}
    </div>
  );
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const href = `/artikel/${article.slug}`;

  if (variant === 'compact') {
    return (
      <article className="group relative grid grid-cols-[6.5rem_1fr] gap-4">
        <Cover article={article} className="aspect-square rounded-lg" />
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary">
            <Link href={href} className="after:absolute after:inset-0">
              {article.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            <time dateTime={article.publishedAt.toISOString()}>{formatDateShortId(article.publishedAt)}</time>
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col">
      <Cover article={article} className="aspect-[16/10] rounded-xl" />
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
        <span className="chip min-h-7 bg-primary-tint px-2.5 text-xs font-semibold text-primary">
          {article.categoryLabel}
        </span>
        <time dateTime={article.publishedAt.toISOString()}>{formatDateShortId(article.publishedAt)}</time>
      </div>
      <h3 className="mt-2 line-clamp-3 text-xl font-semibold leading-snug group-hover:text-primary">
        <Link href={href} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </h3>
      {article.excerpt && <p className="mt-2 line-clamp-2">{article.excerpt}</p>}
      <p className="mt-3 text-sm text-text-muted">{article.readingTimeMinutes} menit baca</p>
    </article>
  );
}

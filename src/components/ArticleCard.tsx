import Link from 'next/link';
import { BookOpen, Clock } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { format } from '@/i18n/dictionary';
import { localePath } from '@/i18n/path';
import { formatDateShort } from '@/lib/format';
import type { PublicArticleSummary } from '@/lib/types';

interface ArticleCardProps {
  article: PublicArticleSummary;
  variant?: 'default' | 'compact';
  locale: Locale;
  dict: Dictionary;
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

export default function ArticleCard({
  article,
  variant = 'default',
  locale,
  dict,
}: ArticleCardProps) {
  const href = localePath(locale, `/artikel/${article.slug}`);
  const isUntranslatedEn = locale === 'en' && !article.translated;

  if (variant === 'compact') {
    return (
      <article className="group card-clinical card-clinical-interactive relative grid grid-cols-[6rem_1fr] items-center gap-4 p-3.5">
        <Cover article={article} className="aspect-square rounded-xl border border-border" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-primary">{article.categoryLabel}</span>
            {isUntranslatedEn && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-amber-800">
                {dict.translationNotice.badge}
              </span>
            )}
          </div>
          <h3
            className="mt-0.5 line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary"
            {...(isUntranslatedEn ? { lang: 'id' } : {})}
          >
            <Link href={href} className="after:absolute after:inset-0">
              {article.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            <time dateTime={article.publishedAt.toISOString()}>
              {formatDateShort(article.publishedAt, locale)}
            </time>
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group card-clinical card-clinical-interactive relative flex flex-col overflow-hidden">
      <Cover article={article} className="aspect-[16/10] border-b border-border" />
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
            <span className="text-xs font-semibold text-primary">{article.categoryLabel}</span>
            {isUntranslatedEn && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-amber-800">
                {dict.translationNotice.badge}
              </span>
            )}
            <time dateTime={article.publishedAt.toISOString()}>
              {formatDateShort(article.publishedAt, locale)}
            </time>
          </div>
          <h3
            className="mt-3 line-clamp-3 text-xl font-semibold leading-snug group-hover:text-primary"
            {...(isUntranslatedEn ? { lang: 'id' } : {})}
          >
            <Link href={href} className="after:absolute after:inset-0">
              {article.title}
            </Link>
          </h3>
          {article.excerpt && (
            <p
              className="mt-2 line-clamp-2"
              {...(isUntranslatedEn ? { lang: 'id' } : {})}
            >
              {article.excerpt}
            </p>
          )}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="inline-flex items-center gap-1.5 text-text-muted">
            <Clock size={14} aria-hidden="true" />
            {format(dict.articleCard.minuteRead, {
              minutes: article.readingTimeMinutes,
            })}
          </span>
          <span className="font-semibold text-primary">{dict.articleCard.readArticle}</span>
        </div>
      </div>
    </article>
  );
}

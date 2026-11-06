import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { localePath } from '@/i18n/path';
import type { PublicArticleSummary } from '@/lib/types';
import ArticleCard from './ArticleCard';
import SectionHeading from './SectionHeading';

interface ArticlesSectionProps {
  articles: PublicArticleSummary[];
  locale: Locale;
  dict: Dictionary;
}

export default function ArticlesSection({
  articles,
  locale,
  dict,
}: ArticlesSectionProps) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles.slice(0, 3);

  return (
    <section
      id="artikel"
      aria-labelledby="artikel-heading"
      className="section-spacing border-t border-border bg-bg px-4 md:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="artikel-heading"
          title={dict.articlesSection.sectionTitle}
          intro={dict.articlesSection.sectionIntro}
          action={
            <Link
              href={localePath(locale, '/artikel')}
              className="btn btn-sm btn-secondary"
            >
              {dict.articlesSection.allArticles}
            </Link>
          }
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <ArticleCard article={lead} locale={locale} dict={dict} />
          {rest.length > 0 && (
            <div className="grid content-start gap-4">
              {rest.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="compact"
                  locale={locale}
                  dict={dict}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { Search } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { format, plural } from '@/i18n/dictionary';
import { localePath } from '@/i18n/path';
import type { PaginatedArticlesResult } from '@/lib/content';
import { ARTICLE_CATEGORY_VALUES, type ArticleCategory } from '@/lib/types';

interface ArticleIndexViewProps {
  doctorName: string;
  paginated: PaginatedArticlesResult;
  activeCategory?: ArticleCategory;
  searchQuery?: string;
  locale: Locale;
  dict: Dictionary;
}

const CHIP_ACTIVE = 'bg-primary text-white';
const CHIP_IDLE =
  'border border-border bg-surface text-text-body hover:border-primary hover:text-primary';

export default function ArticleIndexView({
  doctorName,
  paginated,
  activeCategory,
  searchQuery,
  locale,
  dict,
}: ArticleIndexViewProps) {
  const basePath = localePath(locale, '/artikel');
  const allHref = searchQuery ? `${basePath}?q=${encodeURIComponent(searchQuery)}` : basePath;

  const introText = format(dict.articleIndex.intro, { doctor: `__DOC__` });
  const [introPrefix, introSuffix] = introText.split('__DOC__');

  return (
    <section className="bg-bg px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="card-clinical mb-10 p-6 md:p-8">
          <h1 className="max-w-3xl font-display text-h2 font-semibold">
            {dict.articleIndex.title}
          </h1>
          {paginated.currentPage > 1 && (
            <p className="mt-2 text-text-muted">
              {format(dict.articleIndex.pageSubtitle, {
                current: paginated.currentPage,
                total: paginated.totalPages,
              })}
            </p>
          )}
          <p className="mt-3 max-w-3xl text-lg">
            {introPrefix}
            <strong className="font-semibold text-text-heading">{doctorName}</strong>
            {introSuffix}
          </p>

          <form
            method="GET"
            action={basePath}
            className="mt-6 flex w-full items-center gap-2 md:max-w-xl"
          >
            {activeCategory && <input type="hidden" name="kategori" value={activeCategory} />}
            <label htmlFor="artikel-q" className="sr-only">
              {dict.articleIndex.searchLabel}
            </label>
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <input
                id="artikel-q"
                type="search"
                name="q"
                defaultValue={searchQuery ?? ''}
                placeholder={dict.articleIndex.searchPlaceholder}
                className="min-h-12 w-full rounded-full border border-border bg-bg pl-10 pr-4 text-base text-text-heading placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {dict.articleIndex.searchButton}
            </button>
          </form>

          <div className="-mx-6 mt-5 flex gap-2 overflow-x-auto border-t border-border px-6 pb-1 pt-5 md:-mx-8 md:flex-wrap md:px-8">
            <Link
              href={allHref}
              aria-current={!activeCategory ? 'page' : undefined}
              className={`chip shrink-0 ${!activeCategory ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {dict.articleIndex.allTopics}
            </Link>
            {ARTICLE_CATEGORY_VALUES.map((cat) => {
              const params = new URLSearchParams();
              params.set('kategori', cat);
              if (searchQuery) params.set('q', searchQuery);
              const isActive = activeCategory === cat;
              return (
                <Link
                  key={cat}
                  href={`${basePath}?${params.toString()}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`chip shrink-0 ${isActive ? CHIP_ACTIVE : CHIP_IDLE}`}
                >
                  {dict.categories[cat]}
                </Link>
              );
            })}
          </div>
        </header>

        {(activeCategory || searchQuery) && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-text-muted">
            <span>
              {plural(dict.articleIndex.showingArticles, paginated.total, { count: paginated.total }, locale)}
              {activeCategory
                ? format(dict.articleIndex.inTopic, { topic: dict.categories[activeCategory] })
                : ''}
              {searchQuery ? format(dict.articleIndex.forSearch, { query: searchQuery }) : ''}.
            </span>
            <Link href={basePath} className="link">
              {dict.articleIndex.clearFilter}
            </Link>
          </div>
        )}

        {paginated.items.length === 0 ? (
          <div className="card-clinical py-16 text-center">
            <p className="text-lg font-semibold text-text-heading">
              {dict.articleIndex.emptyTitle}
            </p>
            <p className="mt-1 text-text-muted">{dict.articleIndex.emptyDesc}</p>
            {(activeCategory || searchQuery) && (
              <Link href={basePath} className="btn btn-primary mt-6">
                {dict.articleIndex.seeAll}
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.items.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  locale={locale}
                  dict={dict}
                />
              ))}
            </div>
            <Pagination
              currentPage={paginated.currentPage}
              totalPages={paginated.totalPages}
              basePath={basePath}
              queryParams={{
                ...(activeCategory ? { kategori: activeCategory } : {}),
                ...(searchQuery ? { q: searchQuery } : {}),
              }}
              dict={dict.pagination}
            />
          </>
        )}
      </div>
    </section>
  );
}

import Link from 'next/link';
import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { format, plural } from '@/i18n/dictionary';
import { localePath } from '@/i18n/path';
import {
  ARTICLE_ORDER_VALUES,
  ARTICLE_SORT_VALUES,
  type ArticleListFilters,
  buildArticleListHref,
  hasActiveFilters,
  PER_PAGE_OPTIONS,
  READING_TIME_VALUES,
} from '@/lib/article-filters';
import type { PaginatedArticlesResult } from '@/lib/content';
import { ARTICLE_CATEGORY_VALUES } from '@/lib/types';

interface ArticleIndexViewProps {
  doctorName: string;
  paginated: PaginatedArticlesResult;
  filters: ArticleListFilters;
  locale: Locale;
  dict: Dictionary;
}

const CHIP_ACTIVE = 'bg-primary text-white';
const CHIP_IDLE =
  'border border-border bg-surface text-text-body hover:border-primary hover:text-primary';
const CONTROL_CLASS =
  'min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-base text-text-heading focus:border-primary focus:outline-none';

function FilterField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ArticleIndexView({
  doctorName,
  paginated,
  filters,
  locale,
  dict,
}: ArticleIndexViewProps) {
  const basePath = localePath(locale, '/artikel');
  const hrefFor = (page: number) => buildArticleListHref(basePath, filters, page);
  const allHref = buildArticleListHref(basePath, { ...filters, category: undefined }, 1);
  const isFiltered = hasActiveFilters(filters);

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

          <form method="GET" action={basePath} className="mt-6">
            <div className="flex w-full items-center gap-2 md:max-w-xl">
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
                  defaultValue={filters.query ?? ''}
                  placeholder={dict.articleIndex.searchPlaceholder}
                  className="min-h-12 w-full rounded-full border border-border bg-bg pl-10 pr-4 text-base text-text-heading placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {dict.articleIndex.searchButton}
              </button>
            </div>

            {filters.category && <input type="hidden" name="kategori" value={filters.category} />}

            <p className="mt-5 text-sm font-semibold text-text-heading">
              {dict.articleIndex.filterHeading}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              <FilterField id="artikel-urut" label={dict.articleIndex.sortLabel}>
                <select id="artikel-urut" name="urut" defaultValue={filters.sort} className={CONTROL_CLASS}>
                  {ARTICLE_SORT_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {dict.articleIndex.sortOptions[value]}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField id="artikel-arah" label={dict.articleIndex.orderLabel}>
                <select id="artikel-arah" name="arah" defaultValue={filters.order} className={CONTROL_CLASS}>
                  {ARTICLE_ORDER_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {dict.articleIndex.orderOptions[value]}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField id="artikel-waktu" label={dict.articleIndex.readingLabel}>
                <select id="artikel-waktu" name="waktu" defaultValue={filters.reading ?? ''} className={CONTROL_CLASS}>
                  <option value="">{dict.articleIndex.readingOptions.all}</option>
                  {READING_TIME_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {dict.articleIndex.readingOptions[value]}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField id="artikel-dari" label={dict.articleIndex.dateFromLabel}>
                <input
                  id="artikel-dari"
                  type="date"
                  name="dari"
                  defaultValue={filters.from ?? ''}
                  className={CONTROL_CLASS}
                />
              </FilterField>

              <FilterField id="artikel-sampai" label={dict.articleIndex.dateToLabel}>
                <input
                  id="artikel-sampai"
                  type="date"
                  name="sampai"
                  defaultValue={filters.to ?? ''}
                  className={CONTROL_CLASS}
                />
              </FilterField>

              <FilterField id="artikel-per" label={dict.articleIndex.perPageLabel}>
                <select id="artikel-per" name="per" defaultValue={filters.perPage} className={CONTROL_CLASS}>
                  {PER_PAGE_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </FilterField>
            </div>

            <div className="mt-4 flex justify-end">
              <button type="submit" className="btn btn-primary">
                {dict.articleIndex.applyButton}
              </button>
            </div>
          </form>

          <div className="-mx-6 mt-5 flex gap-2 overflow-x-auto border-t border-border px-6 pb-1 pt-5 md:-mx-8 md:flex-wrap md:px-8">
            <Link
              href={allHref}
              aria-current={!filters.category ? 'page' : undefined}
              className={`chip shrink-0 ${!filters.category ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {dict.articleIndex.allTopics}
            </Link>
            {ARTICLE_CATEGORY_VALUES.map((cat) => {
              const isActive = filters.category === cat;
              return (
                <Link
                  key={cat}
                  href={buildArticleListHref(basePath, { ...filters, category: cat }, 1)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`chip shrink-0 ${isActive ? CHIP_ACTIVE : CHIP_IDLE}`}
                >
                  {dict.categories[cat]}
                </Link>
              );
            })}
          </div>
        </header>

        {isFiltered && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-text-muted">
            <span>
              {plural(dict.articleIndex.showingArticles, paginated.total, { count: paginated.total }, locale)}
              {filters.category
                ? format(dict.articleIndex.inTopic, { topic: dict.categories[filters.category] })
                : ''}
              {filters.query ? format(dict.articleIndex.forSearch, { query: filters.query }) : ''}
              {filters.reading
                ? format(dict.articleIndex.forReading, {
                    bucket: dict.articleIndex.readingOptions[filters.reading],
                  })
                : ''}
              {filters.from ? format(dict.articleIndex.forFrom, { date: filters.from }) : ''}
              {filters.to ? format(dict.articleIndex.forTo, { date: filters.to }) : ''}.
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
            {isFiltered && (
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
              hrefFor={hrefFor}
              dict={dict.pagination}
            />
          </>
        )}
      </div>
    </section>
  );
}

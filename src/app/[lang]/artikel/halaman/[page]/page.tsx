import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ArticleIndexView from '@/components/ArticleIndexView';
import SiteShell from '@/components/SiteShell';
import { hasLocale, OG_LOCALE, type Locale } from '@/i18n/config';
import { format, getDictionaryFor } from '@/i18n/dictionary';
import { buildAlternates, localePath } from '@/i18n/path';
import {
  buildArticleListHref,
  hasActiveFilters,
  needsCanonicalRedirect,
  parseArticleFilters,
  parseArticlePageParam,
  type RawSearchParams,
} from '@/lib/article-filters';
import { getAllSiteData, getPaginatedArticles } from '@/lib/content';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ lang: string; page: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang, page } = await params;
  const pageNum = parseArticlePageParam(page);
  if (!hasLocale(rawLang) || pageNum === null) {
    return {};
  }
  const locale: Locale = rawLang;
  const dict = await getDictionaryFor(locale);
  const { profile } = await getAllSiteData(locale);
  const alternates = buildAlternates({
    locale,
    path: `/artikel/halaman/${pageNum}`,
    enAvailable: true,
  });

  const title = format(dict.seo.articlePaginationTitle, {
    page: pageNum,
    doctor: profile.full_name,
  });
  const description = format(dict.seo.articlePaginationDesc, {
    page: pageNum,
    doctor: profile.full_name,
  });

  const filters = parseArticleFilters(await searchParams);

  return {
    title,
    description,
    robots: hasActiveFilters(filters) ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      locale: OG_LOCALE[locale],
    },
  };
}

export default async function ArtikelPaginatedPage({
  params,
  searchParams,
}: PageProps) {
  const { lang: rawLang, page } = await params;
  const pageNum = parseArticlePageParam(page);
  if (!hasLocale(rawLang) || pageNum === null) {
    notFound();
  }
  const locale: Locale = rawLang;
  const rawSearch = await searchParams;
  const filters = parseArticleFilters(rawSearch);
  const basePath = localePath(locale, '/artikel');

  if (pageNum === 1 || needsCanonicalRedirect(rawSearch, filters)) {
    redirect(buildArticleListHref(basePath, filters, pageNum));
  }

  const dict = await getDictionaryFor(locale);

  const [{ profile, locations }, paginated] = await Promise.all([
    getAllSiteData(locale),
    getPaginatedArticles({
      page: pageNum,
      category: filters.category,
      query: filters.query,
      sort: filters.sort,
      order: filters.order,
      reading: filters.reading,
      from: filters.from,
      to: filters.to,
      limit: filters.perPage,
      locale,
    }),
  ]);

  if (pageNum > paginated.totalPages) {
    notFound();
  }

  return (
    <SiteShell profile={profile} locations={locations} locale={locale} dict={dict}>
      <ArticleIndexView
        doctorName={profile.full_name}
        paginated={paginated}
        filters={filters}
        locale={locale}
        dict={dict}
      />
    </SiteShell>
  );
}

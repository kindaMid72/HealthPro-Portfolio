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
  type RawSearchParams,
} from '@/lib/article-filters';
import { getAllSiteData, getPaginatedArticles } from '@/lib/content';

export const revalidate = 3600;

interface ArtikelIndexProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({
  params,
  searchParams,
}: ArtikelIndexProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!hasLocale(rawLang)) {
    return {};
  }
  const locale: Locale = rawLang;
  const dict = await getDictionaryFor(locale);
  const { profile } = await getAllSiteData(locale);
  const alternates = buildAlternates({ locale, path: '/artikel', enAvailable: true });

  const title = format(dict.seo.articlePageTitle, {
    doctor: profile.full_name,
    specialty: profile.specialty,
  });
  const description = format(dict.seo.articlePageDesc, {
    doctor: profile.full_name,
    specialty: profile.specialty,
  });

  return {
    title,
    description,
    robots: hasActiveFilters(parseArticleFilters(await searchParams))
      ? { index: false, follow: true }
      : undefined,
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

export default async function ArtikelIndexPage({
  params,
  searchParams,
}: ArtikelIndexProps) {
  const { lang: rawLang } = await params;
  if (!hasLocale(rawLang)) {
    notFound();
  }
  const locale: Locale = rawLang;
  const dict = await getDictionaryFor(locale);

  const rawSearch = await searchParams;
  const filters = parseArticleFilters(rawSearch);
  const basePath = localePath(locale, '/artikel');
  if (needsCanonicalRedirect(rawSearch, filters)) {
    redirect(buildArticleListHref(basePath, filters, 1));
  }

  const [{ profile, locations }, paginated] = await Promise.all([
    getAllSiteData(locale),
    getPaginatedArticles({
      page: 1,
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

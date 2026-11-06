import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ArticleIndexView from '@/components/ArticleIndexView';
import SiteShell from '@/components/SiteShell';
import { hasLocale, OG_LOCALE, type Locale } from '@/i18n/config';
import { format, getDictionaryFor } from '@/i18n/dictionary';
import { buildAlternates, localePath } from '@/i18n/path';
import { getAllSiteData, getPaginatedArticles } from '@/lib/content';
import { type ArticleCategory, isValidArticleCategory } from '@/lib/types';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ lang: string; page: string }>;
  searchParams: Promise<{ kategori?: string; q?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang, page } = await params;
  if (!hasLocale(rawLang)) {
    return {};
  }
  const locale: Locale = rawLang;
  const pageNum = Number(page);
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

  return {
    title,
    description,
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
  if (!hasLocale(rawLang)) {
    notFound();
  }
  const locale: Locale = rawLang;
  const pageNum = Number(page);

  if (pageNum === 1) {
    redirect(localePath(locale, '/artikel'));
  }

  if (!Number.isInteger(pageNum) || pageNum < 1) {
    notFound();
  }

  const dict = await getDictionaryFor(locale);
  const { kategori, q } = await searchParams;
  const activeCategory: ArticleCategory | undefined = isValidArticleCategory(kategori)
    ? kategori
    : undefined;
  const searchQuery = q?.trim() || undefined;

  const [{ profile, locations }, paginated] = await Promise.all([
    getAllSiteData(locale),
    getPaginatedArticles({
      page: pageNum,
      category: activeCategory,
      query: searchQuery,
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
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        locale={locale}
        dict={dict}
      />
    </SiteShell>
  );
}

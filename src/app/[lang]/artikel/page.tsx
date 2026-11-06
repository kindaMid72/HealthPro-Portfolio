import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleIndexView from '@/components/ArticleIndexView';
import SiteShell from '@/components/SiteShell';
import { hasLocale, OG_LOCALE, type Locale } from '@/i18n/config';
import { format, getDictionaryFor } from '@/i18n/dictionary';
import { buildAlternates } from '@/i18n/path';
import { getAllSiteData, getPaginatedArticles } from '@/lib/content';
import { type ArticleCategory, isValidArticleCategory } from '@/lib/types';

export const revalidate = 3600;

interface ArtikelIndexProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ kategori?: string; q?: string }>;
}

export async function generateMetadata({
  params,
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

  const { kategori, q } = await searchParams;
  const activeCategory: ArticleCategory | undefined = isValidArticleCategory(kategori)
    ? kategori
    : undefined;
  const searchQuery = q?.trim() || undefined;

  const [{ profile, locations }, paginated] = await Promise.all([
    getAllSiteData(locale),
    getPaginatedArticles({
      page: 1,
      category: activeCategory,
      query: searchQuery,
      locale,
    }),
  ]);

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

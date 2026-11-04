import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import SiteShell from '@/components/SiteShell';
import ArticleIndexView from '@/components/ArticleIndexView';
import { getAllSiteData, getPaginatedArticles } from '@/lib/content';
import { getSiteUrl } from '@/lib/seo';
import { type ArticleCategory, isValidArticleCategory } from '@/lib/types';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ kategori?: string; q?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { page } = await params;
  const pageNum = Number(page);
  const { profile } = await getAllSiteData();
  const siteUrl = getSiteUrl();

  return {
    title: `Artikel Kesehatan THT (Halaman ${pageNum}) — ${profile.full_name}`,
    description: `Arsip artikel edukasi kesehatan THT halaman ${pageNum} oleh ${profile.full_name}.`,
    alternates: {
      canonical: `${siteUrl}/artikel/halaman/${pageNum}`,
    },
  };
}

export default async function ArtikelPaginatedPage({
  params,
  searchParams,
}: PageProps) {
  const { page } = await params;
  const { kategori, q } = await searchParams;
  const pageNum = Number(page);

  if (pageNum === 1) {
    redirect('/artikel');
  }

  if (!Number.isInteger(pageNum) || pageNum < 1) {
    notFound();
  }

  const activeCategory: ArticleCategory | undefined = isValidArticleCategory(
    kategori,
  )
    ? kategori
    : undefined;
  const searchQuery = q?.trim() || undefined;

  const [{ profile, locations }, paginated] = await Promise.all([
    getAllSiteData(),
    getPaginatedArticles({
      page: pageNum,
      category: activeCategory,
      query: searchQuery,
    }),
  ]);

  if (pageNum > paginated.totalPages) {
    notFound();
  }

  return (
    <SiteShell profile={profile} locations={locations}>
      <ArticleIndexView
        doctorName={profile.full_name}
        paginated={paginated}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
      />
    </SiteShell>
  );
}

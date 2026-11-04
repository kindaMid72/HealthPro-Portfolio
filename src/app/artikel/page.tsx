import type { Metadata } from 'next';
import SiteShell from '@/components/SiteShell';
import ArticleIndexView from '@/components/ArticleIndexView';
import { getAllSiteData, getPaginatedArticles } from '@/lib/content';
import { getSiteUrl } from '@/lib/seo';
import { type ArticleCategory, isValidArticleCategory } from '@/lib/types';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getAllSiteData();
  const siteUrl = getSiteUrl();

  return {
    title: `Artikel Edukasi Kesehatan THT — ${profile.full_name}`,
    description: `Kumpulan artikel dan panduan edukasi kesehatan Telinga, Hidung, Tenggorok, dan Bedah Kepala-Leher oleh ${profile.full_name} (${profile.specialty}).`,
    alternates: {
      canonical: `${siteUrl}/artikel`,
    },
  };
}

interface ArtikelIndexProps {
  searchParams: Promise<{ kategori?: string; q?: string }>;
}

export default async function ArtikelIndexPage({
  searchParams,
}: ArtikelIndexProps) {
  const { kategori, q } = await searchParams;
  const activeCategory: ArticleCategory | undefined = isValidArticleCategory(
    kategori,
  )
    ? kategori
    : undefined;
  const searchQuery = q?.trim() || undefined;

  const [{ profile, locations }, paginated] = await Promise.all([
    getAllSiteData(),
    getPaginatedArticles({
      page: 1,
      category: activeCategory,
      query: searchQuery,
    }),
  ]);

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

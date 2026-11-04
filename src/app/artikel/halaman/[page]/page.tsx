import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import SiteShell from '@/components/SiteShell';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import { getAllSiteData, getPaginatedArticles } from '@/lib/content';
import { getSiteUrl } from '@/lib/seo';
import {
  ARTICLE_CATEGORIES,
  type ArticleCategory,
  isValidArticleCategory,
} from '@/lib/types';

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
      <section className="bg-bg px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 font-heading text-xs font-semibold uppercase tracking-wider text-primary">
                Arsip Artikel — Halaman {pageNum} dari {paginated.totalPages}
              </p>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-primary-dark">
                Artikel Kesehatan THT-BKL
              </h1>
              {activeCategory && (
                <p className="mt-1 text-sm text-text-muted">
                  Topik: {ARTICLE_CATEGORIES[activeCategory]}
                </p>
              )}
            </div>
            <Link
              href="/artikel"
              className="text-xs font-semibold text-primary hover:underline"
            >
              ← Kembali ke Halaman 1
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <Pagination
            currentPage={paginated.currentPage}
            totalPages={paginated.totalPages}
            basePath="/artikel"
            queryParams={{
              kategori: activeCategory,
              q: searchQuery,
            }}
          />
        </div>
      </section>
    </SiteShell>
  );
}

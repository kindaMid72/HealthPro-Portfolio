import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import SiteShell from '@/components/SiteShell';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import { getAllSiteData, getPaginatedArticles } from '@/lib/content';
import { getSiteUrl } from '@/lib/seo';
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_VALUES,
  type ArticleCategory,
  isValidArticleCategory,
} from '@/lib/types';

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
      <section className="bg-bg px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="mb-2 font-heading text-xs font-semibold uppercase tracking-wider text-primary">
              Portal Edukasi Pasien
            </p>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-primary-dark md:text-4xl">
              Artikel Kesehatan THT-BKL
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-body md:text-base">
              Artikel informasi medis seputar kesehatan telinga, hidung,
              tenggorok, serta kepala dan leher yang ditulis dan ditinjau oleh{' '}
              <strong className="font-semibold text-primary-dark">
                {profile.full_name}
              </strong>
              .
            </p>
          </div>

          {/* Bar Filter Kategori & Pencarian */}
          <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-xs md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={
                  searchQuery
                    ? `/artikel?q=${encodeURIComponent(searchQuery)}`
                    : '/artikel'
                }
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  !activeCategory
                    ? 'bg-primary text-white'
                    : 'bg-bg text-text-body hover:bg-primary/10 hover:text-primary'
                }`}
              >
                Semua Topik
              </Link>
              {ARTICLE_CATEGORY_VALUES.map((cat) => {
                const isActive = activeCategory === cat;
                const params = new URLSearchParams();
                params.set('kategori', cat);
                if (searchQuery) params.set('q', searchQuery);

                return (
                  <Link
                    key={cat}
                    href={`/artikel?${params.toString()}`}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-bg text-text-body hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {ARTICLE_CATEGORIES[cat]}
                  </Link>
                );
              })}
            </div>

            <form
              method="GET"
              action="/artikel"
              className="flex w-full items-center gap-2 md:w-72"
            >
              {activeCategory && (
                <input type="hidden" name="kategori" value={activeCategory} />
              )}
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  name="q"
                  defaultValue={searchQuery ?? ''}
                  placeholder="Cari topik atau gejala..."
                  aria-label="Cari artikel"
                  className="w-full rounded-xl border border-border bg-bg py-2 pl-9 pr-3 text-xs text-primary-dark placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-primary px-3.5 py-2 font-heading text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Cari
              </button>
            </form>
          </div>

          {(activeCategory || searchQuery) && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
              <span>
                Menampilkan {paginated.total} artikel
                {activeCategory
                  ? ` dalam topik "${ARTICLE_CATEGORIES[activeCategory]}"`
                  : ''}
                {searchQuery ? ` untuk pencarian "${searchQuery}"` : ''}.
              </span>
              <Link
                href="/artikel"
                className="font-semibold text-primary hover:underline"
              >
                Reset filter ✕
              </Link>
            </div>
          )}

          {paginated.items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-12 text-center">
              <p className="font-heading text-base font-semibold text-primary-dark">
                Belum ada artikel yang sesuai
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Silakan pilih kategori lain atau hapus kata kunci pencarian.
              </p>
              {(activeCategory || searchQuery) && (
                <Link
                  href="/artikel"
                  className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
                >
                  Lihat Semua Artikel
                </Link>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

/**
 * app/artikel/page.tsx — Halaman daftar artikel edukasi publik (Halaman 1).
 */

import type { Metadata } from 'next';
import { getAllSiteData, getPaginatedArticles } from '@/lib/content';
import { getSiteUrl } from '@/lib/seo';
import SiteShell from '@/components/SiteShell';
import { ArticleCard } from '@/components/ArticleCard';
import { Pagination } from '@/components/Pagination';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getAllSiteData();
  const siteUrl = getSiteUrl();

  const title = `Artikel Kesehatan THT — ${profile.full_name}`;
  const description = `Kumpulan artikel, tips, dan panduan kesehatan telinga, hidung, dan tenggorok (THT-BKL) oleh ${profile.full_name}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/artikel`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/artikel`,
      type: 'website',
    },
  };
}

export default async function ArticlesIndexPage() {
  const [{ profile, locations }, { items: articles, totalPages }] = await Promise.all([
    getAllSiteData(),
    getPaginatedArticles({ page: 1 }),
  ]);

  return (
    <SiteShell profile={profile} locations={locations}>
      <section className="bg-surface py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Edukasi Kesehatan
            </span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-heading sm:text-4xl">
              Artikel & Wawasan THT
            </h1>
            <p className="mt-3 text-base text-text-body">
              Informasi medis tepercaya dan panduan praktis seputar kesehatan telinga, hidung,
              dan tenggorok oleh {profile.full_name}.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
              <h2 className="text-lg font-semibold text-text-heading">Belum Ada Artikel</h2>
              <p className="mt-2 text-sm text-text-muted">
                Artikel edukasi kesehatan sedang disiapkan. Silakan kembali lagi segera.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((art) => (
                  <ArticleCard key={art.id} article={art} />
                ))}
              </div>

              <Pagination currentPage={1} totalPages={totalPages} basePath="/artikel" />
            </>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

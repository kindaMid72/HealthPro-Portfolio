/**
 * app/artikel/halaman/[page]/page.tsx — Halaman paginasi artikel edukasi publik (Halaman 2+).
 */

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getAllSiteData, getPaginatedArticles } from '@/lib/content';
import { getSiteUrl } from '@/lib/seo';
import SiteShell from '@/components/SiteShell';
import { ArticleCard } from '@/components/ArticleCard';
import { Pagination } from '@/components/Pagination';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page: pageStr } = await params;
  const pageNum = parseInt(pageStr, 10);
  if (isNaN(pageNum) || pageNum < 1) return {};

  const { profile } = await getAllSiteData();
  const siteUrl = getSiteUrl();

  const title = `Artikel Kesehatan THT — Halaman ${pageNum} — ${profile.full_name}`;
  const description = `Kumpulan artikel, tips, dan panduan kesehatan THT oleh ${profile.full_name} — Halaman ${pageNum}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/artikel/halaman/${pageNum}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/artikel/halaman/${pageNum}`,
      type: 'website',
    },
  };
}

export default async function PaginatedArticlesPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageStr } = await params;
  const pageNum = parseInt(pageStr, 10);

  if (isNaN(pageNum) || pageNum < 1) notFound();
  if (pageNum === 1) redirect('/artikel');

  const [{ profile, locations }, { items: articles, totalPages }] = await Promise.all([
    getAllSiteData(),
    getPaginatedArticles({ page: pageNum }),
  ]);

  if (pageNum > totalPages) notFound();

  return (
    <SiteShell profile={profile} locations={locations}>
      <section className="bg-surface py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Edukasi Kesehatan • Halaman {pageNum}
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>

          <Pagination currentPage={pageNum} totalPages={totalPages} basePath="/artikel" />
        </div>
      </section>
    </SiteShell>
  );
}

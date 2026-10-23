/**
 * app/artikel/[slug]/page.tsx — Halaman baca artikel edukasi publik.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllArticleSlugs,
  getAllSiteData,
  getArticleBySlug,
} from '@/lib/content';
import { getCtaLinks } from '@/lib/cta';
import { getSiteUrl } from '@/lib/seo';
import SiteShell from '@/components/SiteShell';
import { formatDateId } from '@/lib/format';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [{ profile }, article] = await Promise.all([
    getAllSiteData(),
    getArticleBySlug(slug),
  ]);

  if (!article) return {};

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/artikel/${article.slug}`;
  const title = `${article.title} — ${profile.full_name}`;
  const description =
    article.excerpt ||
    `Artikel edukasi kesehatan THT: ${article.title} oleh ${profile.full_name}.`;

  const ogImages = article.coverImageUrl
    ? [{ url: `${siteUrl}${article.coverImageUrl}`, alt: article.coverAlt || article.title }]
    : [];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.authorName],
      images: ogImages,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ profile, locations }, article] = await Promise.all([
    getAllSiteData(),
    getArticleBySlug(slug),
  ]);

  if (!article) notFound();

  const siteUrl = getSiteUrl();
  const { bookingUrl, whatsappFallback } = getCtaLinks(profile, locations);

  const formattedDate = formatDateId(article.publishedAt);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.coverImageUrl ? [`${siteUrl}${article.coverImageUrl}`] : undefined,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: `${siteUrl}/artikel/${article.slug}`,
    inLanguage: 'id-ID',
    author: {
      '@type': 'Physician',
      '@id': `${siteUrl}/#physician`,
      name: article.authorName,
    },
    publisher: {
      '@type': 'Physician',
      '@id': `${siteUrl}/#physician`,
      name: profile.full_name,
    },
  };

  return (
    <SiteShell profile={profile} locations={locations}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <article className="py-10 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-text-muted">
            <Link href="/" className="hover:text-primary hover:underline">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/artikel" className="hover:text-primary hover:underline">
              Artikel
            </Link>
            <span>/</span>
            <span className="truncate text-text-body font-medium" aria-current="page">
              {article.title}
            </span>
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-text-heading sm:text-4xl">
              {article.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-text-muted">
              <span className="font-medium text-text-body">Ditulis oleh {article.authorName}</span>
              <span>•</span>
              <time dateTime={article.publishedAt.toISOString()}>{formattedDate}</time>
            </div>

            {article.excerpt && (
              <p className="mt-4 border-l-4 border-primary pl-4 text-base italic text-text-body">
                {article.excerpt}
              </p>
            )}

            {article.coverImageUrl && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.coverImageUrl}
                  alt={article.coverAlt || article.title}
                  className="max-h-[480px] w-full object-cover"
                />
              </div>
            )}
          </header>

          {/* Body Konten */}
          <div
            className="prose prose-primary max-w-none prose-headings:font-bold prose-headings:text-text-heading prose-p:text-text-body prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* Kotak CTA di bawah artikel */}
          <div className="mt-14 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
            <h2 className="text-xl font-bold text-text-heading">
              Butuh Konsultasi Terkait Keluhan THT?
            </h2>
            <p className="mt-2 text-sm text-text-body">
              Jadwalkan kunjungan Anda atau konsultasikan langsung dengan {profile.full_name} di lokasi praktik terdekat.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {bookingUrl && (
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors"
                >
                  Jadwalkan Konsultasi
                </a>
              )}
              {whatsappFallback && (
                <a
                  href={whatsappFallback}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border-2 border-primary px-6 py-2.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Chat WhatsApp Lokasi
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    </SiteShell>
  );
}

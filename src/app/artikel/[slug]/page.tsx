import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CalendarCheck,
  Clock,
  ListTree,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import SiteShell from '@/components/SiteShell';
import ArticleCard from '@/components/ArticleCard';
import ArticleShareBar from '@/components/ArticleShareBar';
import ArticleViewTracker from '@/components/ArticleViewTracker';
import {
  getAllArticleSlugs,
  getAllSiteData,
  getArticleBySlug,
  getRelatedArticles,
} from '@/lib/content';
import { getCtaLinks } from '@/lib/cta';
import { formatDateId } from '@/lib/format';
import { absoluteUrl, getSiteUrl } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [{ profile }, article] = await Promise.all([
    getAllSiteData(),
    getArticleBySlug(slug),
  ]);

  if (!article) {
    return {
      title: `Artikel Tidak Ditemukan — ${profile.full_name}`,
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/artikel/${article.slug}`;
  const ogImage = article.coverImageUrl
    ? absoluteUrl(article.coverImageUrl)
    : `${siteUrl}/opengraph-image`;
  const description =
    article.excerpt || `${article.title} — Edukasi THT oleh ${profile.full_name}`;

  return {
    title: `${article.title} — ${profile.full_name}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: article.title,
      description,
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      section: article.categoryLabel,
      authors: [article.authorName],
      images: [
        {
          url: ogImage,
          alt: article.coverAlt || article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [{ profile, locations }, article] = await Promise.all([
    getAllSiteData(),
    getArticleBySlug(slug),
  ]);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles({
    currentId: article.id,
    category: article.category,
    limit: 3,
  });

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/artikel/${article.slug}`;
  const { bookingUrl, whatsappFallback } = getCtaLinks(profile, locations);
  const strSipClean =
    profile.str_sip_display &&
    !profile.str_sip_display.includes('[BELUM DIISI]')
      ? profile.str_sip_display
      : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: article.title,
        description: article.excerpt || article.title,
        inLanguage: 'id-ID',
        datePublished: article.publishedAt.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        lastReviewed: article.updatedAt.toISOString(),
        reviewedBy: {
          '@type': 'Physician',
          '@id': `${siteUrl}/#physician`,
          name: profile.full_name,
        },
        about: {
          '@type': 'MedicalCondition',
          name: article.categoryLabel,
        },
      },
      {
        '@type': 'BlogPosting',
        '@id': `${canonicalUrl}#article`,
        headline: article.title,
        description: article.excerpt || article.title,
        image: article.coverImageUrl
          ? absoluteUrl(article.coverImageUrl)
          : `${siteUrl}/opengraph-image`,
        datePublished: article.publishedAt.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        wordCount: article.wordCount,
        timeRequired: `PT${article.readingTimeMinutes}M`,
        articleSection: article.categoryLabel,
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
        mainEntityOfPage: {
          '@id': `${canonicalUrl}#webpage`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Beranda',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Artikel',
            item: `${siteUrl}/artikel`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <SiteShell profile={profile} locations={locations}>
      <script
        type="application/ld+json"
        // `<` di-escape agar judul/konten artikel tidak bisa menutup tag <script>
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <article className="bg-bg px-4 py-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-text-muted"
          >
            <Link href="/" className="hover:text-primary">
              Beranda
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/artikel" className="hover:text-primary">
              Artikel
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href={`/artikel?kategori=${article.category}`}
              className="hover:text-primary"
            >
              {article.categoryLabel}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="line-clamp-1 font-medium text-primary-dark">
              {article.title}
            </span>
          </nav>

          {/* Header Artikel */}
          <header className="mb-8">
            <Link
              href={`/artikel?kategori=${article.category}`}
              className="mb-3 inline-flex rounded-full bg-primary/10 px-3.5 py-1 font-heading text-xs font-semibold text-primary hover:bg-primary/20"
            >
              {article.categoryLabel}
            </Link>

            <h1 className="font-heading text-2xl font-bold leading-tight tracking-tight text-primary-dark sm:text-3xl md:text-4xl">
              {article.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
              <span>
                Ditulis oleh{' '}
                <strong className="font-semibold text-primary-dark">
                  {article.authorName}
                </strong>
              </span>
              <span aria-hidden="true">•</span>
              <time dateTime={article.publishedAt.toISOString()}>
                {formatDateId(article.publishedAt)}
              </time>
              <span aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} aria-hidden="true" />
                {article.readingTimeMinutes} menit baca
              </span>
              <span aria-hidden="true">•</span>
              <ArticleViewTracker
                slug={article.slug}
                initialViews={article.viewCount}
              />
            </div>
          </header>

          {/* Medical Review Badge */}
          <div className="mb-8 flex items-start gap-3.5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-text-body">
            <ShieldCheck
              size={22}
              className="mt-0.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-primary-dark">
                Ditinjau secara medis oleh{' '}
                <strong className="font-bold">{profile.full_name}</strong> (
                {profile.specialty})
              </p>
              {strSipClean && (
                <p className="mt-0.5 text-text-muted">{strSipClean}</p>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {article.coverImageUrl && (
            <figure className="mb-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImageUrl}
                alt={article.coverAlt || article.title}
                className="max-h-[460px] w-full object-cover"
              />
              {article.coverAlt && (
                <figcaption className="border-t border-border/60 px-4 py-2.5 text-center text-xs text-text-muted">
                  {article.coverAlt}
                </figcaption>
              )}
            </figure>
          )}

          {/* Daftar Isi (TOC) Otomatis */}
          {article.toc.length >= 2 && (
            <nav
              aria-label="Daftar Isi"
              className="mb-8 rounded-2xl border border-border bg-surface p-5 shadow-xs"
            >
              <div className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-primary-dark">
                <ListTree size={16} className="text-primary" aria-hidden="true" />
                <span>Daftar Isi Artikel</span>
              </div>
              <ol className="space-y-2 text-sm">
                {article.toc.map((item) => (
                  <li
                    key={item.id}
                    className={item.level === 3 ? 'pl-4 text-xs' : 'font-medium'}
                  >
                    <a
                      href={`#${item.id}`}
                      className="text-text-body transition-colors hover:text-primary hover:underline"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Konten Utama Artikel */}
          <div
            className="prose prose-slate article-prose max-w-none rounded-2xl border border-border bg-surface p-6 shadow-xs md:p-10 prose-headings:font-heading prose-headings:text-primary-dark prose-a:text-primary prose-strong:text-primary-dark"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* Share Bar */}
          <ArticleShareBar title={article.title} url={canonicalUrl} />

          {/* Disclaimer Medis */}
          <div className="mb-8 rounded-xl border border-border bg-surface/70 p-4 text-xs leading-relaxed text-text-muted">
            <strong className="font-semibold text-primary-dark">
              Catatan Medis:
            </strong>{' '}
            Artikel ini disusun sebagai bahan edukasi kesehatan umum bagi pasien
            dan keluarga, serta tidak menggantikan pemeriksaan fisik, diagnosis,
            maupun tata laksana medis langsung oleh dokter spesialis THT-BKL.
          </div>

          {/* Kartu CTA Konsultasi */}
          {(bookingUrl || whatsappFallback) && (
            <div className="rounded-2xl border border-primary/20 bg-surface p-6 shadow-sm md:p-8">
              <h2 className="font-heading text-xl font-bold text-primary-dark">
                Memiliki Keluhan Telinga, Hidung, atau Tenggorok?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-body">
                Konsultasikan keluhan Anda secara langsung bersama{' '}
                <strong className="font-semibold text-primary-dark">
                  {profile.full_name}
                </strong>{' '}
                untuk pemeriksaan menyeluruh dan penanganan yang tepat.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {bookingUrl && (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent"
                  >
                    <CalendarCheck size={18} aria-hidden="true" />
                    Jadwalkan Konsultasi
                  </a>
                )}
                {whatsappFallback && (
                  <a
                    href={whatsappFallback}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-primary"
                  >
                    <MessageCircle size={18} aria-hidden="true" />
                    Chat WhatsApp Lokasi
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Artikel Terkait */}
        {relatedArticles.length > 0 && (
          <div className="mx-auto mt-16 max-w-5xl border-t border-border pt-12">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-primary-dark">
                Artikel Terkait Lainnya
              </h2>
              <Link
                href="/artikel"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Lihat Semua →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        )}
      </article>
    </SiteShell>
  );
}

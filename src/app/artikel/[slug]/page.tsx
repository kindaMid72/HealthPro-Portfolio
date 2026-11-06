import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteShell from '@/components/SiteShell';
import ArticleCard from '@/components/ArticleCard';
import ArticleShareBar from '@/components/ArticleShareBar';
import ArticleViewTracker from '@/components/ArticleViewTracker';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConsultCta from '@/components/ConsultCta';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import MedicalReviewNote from '@/components/MedicalReviewNote';
import ProseContent from '@/components/ProseContent';
import SectionHeading from '@/components/SectionHeading';
import TableOfContents from '@/components/TableOfContents';
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

      <article className="px-4 py-10 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Artikel', href: '/artikel' },
            { label: article.categoryLabel, href: `/artikel?kategori=${article.category}` },
            { label: article.title },
          ]}
        />

        <header className="card-clinical p-6 md:p-8">
          <h1 className="max-w-4xl font-display text-display font-semibold">{article.title}</h1>
          {article.excerpt && <p className="mt-4 max-w-3xl text-xl text-text-body">{article.excerpt}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-text-muted">
            <span>
              Ditulis oleh <strong className="font-semibold text-text-heading">{article.authorName}</strong>
            </span>
            <time dateTime={article.publishedAt.toISOString()}>{formatDateId(article.publishedAt)}</time>
            <span>{article.readingTimeMinutes} menit baca</span>
            <ArticleViewTracker slug={article.slug} initialViews={article.viewCount} />
          </div>

          <MedicalReviewNote
            fullName={profile.full_name}
            specialty={profile.specialty}
            strSip={strSipClean}
          />
        </header>

        {article.coverImageUrl && (
          <figure className="card-clinical mx-auto mt-6 max-w-6xl overflow-hidden bg-primary-tint">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImageUrl}
              alt={article.coverAlt || article.title}
              className="max-h-[460px] w-full object-cover"
            />
            {article.coverAlt && (
              <figcaption className="border-t border-border bg-surface px-4 py-2.5 text-sm text-text-muted">
                {article.coverAlt}
              </figcaption>
            )}
          </figure>
        )}

        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            {article.toc.length >= 2 && (
              <div className="mb-6">
                <TableOfContents placement="inline" items={article.toc} />
              </div>
            )}
            <div className="card-clinical p-6 sm:p-8 md:p-10">
              <ProseContent html={article.contentHtml} />
            </div>
            <ArticleShareBar title={article.title} url={canonicalUrl} />
            <MedicalDisclaimer />
            <ConsultCta
              heading="Punya keluhan telinga, hidung, atau tenggorok?"
              doctorName={profile.full_name}
              bookingUrl={bookingUrl}
              whatsappFallback={whatsappFallback}
            />
          </div>
          {article.toc.length >= 2 && (
            <aside className="lg:col-span-4">
              <TableOfContents placement="aside" items={article.toc} />
            </aside>
          )}
        </div>

        {relatedArticles.length > 0 && (
          <section aria-labelledby="terkait-heading" className="mt-20 border-t border-border pt-12">
            <SectionHeading
              id="terkait-heading"
              title="Artikel terkait"
              action={
                <Link href="/artikel" className="link">
                  Semua artikel
                </Link>
              }
            />
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </section>
        )}
        </div>
      </article>
    </SiteShell>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import ArticleShareBar from '@/components/ArticleShareBar';
import ArticleViewTracker from '@/components/ArticleViewTracker';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConsultCta from '@/components/ConsultCta';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import MedicalReviewNote from '@/components/MedicalReviewNote';
import ProseContent from '@/components/ProseContent';
import SectionHeading from '@/components/SectionHeading';
import SiteShell from '@/components/SiteShell';
import TableOfContents from '@/components/TableOfContents';
import { hasLocale, INTL_LOCALE, LOCALES, OG_LOCALE, type Locale } from '@/i18n/config';
import { getDictionaryFor } from '@/i18n/dictionary';
import { buildAlternates, localePath, absoluteUrl as localizedAbsoluteUrl } from '@/i18n/path';
import {
  getAllArticleSlugs,
  getAllSiteData,
  getArticleBySlug,
  getRelatedArticles,
} from '@/lib/content';
import { getCtaLinks } from '@/lib/cta';
import { formatDate } from '@/lib/format';
import { absoluteUrl, getSiteUrl } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

interface ArticlePageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  if (!hasLocale(rawLang)) {
    return {};
  }
  const locale: Locale = rawLang;
  const dict = await getDictionaryFor(locale);
  const [{ profile }, article] = await Promise.all([
    getAllSiteData(locale),
    getArticleBySlug(slug, locale),
  ]);

  if (!article) {
    return {
      title: `${dict.articlePage.notFoundTitle} — ${profile.full_name}`,
    };
  }

  const enAvailable = article.translated;
  const alternates = buildAlternates({
    locale,
    path: `/artikel/${article.slug}`,
    enAvailable,
  });

  const isUntranslatedEn = locale === 'en' && !article.translated;
  const ogImage = article.coverImageUrl
    ? absoluteUrl(article.coverImageUrl)
    : localizedAbsoluteUrl(locale, '/opengraph-image');
  const description =
    article.excerpt || `${article.title} — ${profile.full_name}`;

  return {
    title: `${article.title} — ${profile.full_name}`,
    description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    robots: isUntranslatedEn
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: 'article',
      url: alternates.canonical,
      title: article.title,
      description,
      locale: OG_LOCALE[locale],
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
  const { lang: rawLang, slug } = await params;
  if (!hasLocale(rawLang)) {
    notFound();
  }
  const locale: Locale = rawLang;
  const dict = await getDictionaryFor(locale);

  const [{ profile, locations }, article] = await Promise.all([
    getAllSiteData(locale),
    getArticleBySlug(slug, locale),
  ]);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles({
    currentId: article.id,
    category: article.category,
    limit: 3,
    locale,
  });

  const isUntranslatedEn = locale === 'en' && !article.translated;
  const alternates = buildAlternates({
    locale,
    path: `/artikel/${article.slug}`,
    enAvailable: article.translated,
  });
  const canonicalUrl = alternates.canonical;

  const siteUrl = getSiteUrl();
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
        inLanguage: INTL_LOCALE[locale],
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
        inLanguage: INTL_LOCALE[locale],
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
            name: dict.breadcrumbs.home,
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: dict.breadcrumbs.articles,
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
    <SiteShell profile={profile} locations={locations} locale={locale} dict={dict}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <article className="px-4 py-10 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs
            items={[
              { label: dict.breadcrumbs.home, href: localePath(locale, '/') },
              { label: dict.breadcrumbs.articles, href: localePath(locale, '/artikel') },
              {
                label: article.categoryLabel,
                href: `${localePath(locale, '/artikel')}?kategori=${article.category}`,
              },
              { label: article.title },
            ]}
          />

          {isUntranslatedEn && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900 shadow-2xs"
            >
              {dict.translationNotice.banner}
            </div>
          )}

          <header
            className="card-clinical p-6 md:p-8"
            {...(isUntranslatedEn ? { lang: 'id' } : {})}
          >
            <h1 className="max-w-4xl font-display text-display font-semibold">{article.title}</h1>
            {article.excerpt && (
              <p className="mt-4 max-w-3xl text-xl text-text-body">{article.excerpt}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-text-muted">
              <span>
                {dict.articlePage.writtenBy}{' '}
                <strong className="font-semibold text-text-heading">{article.authorName}</strong>
              </span>
              <time dateTime={article.publishedAt.toISOString()}>
                {formatDate(article.publishedAt, locale)}
              </time>
              <span>{article.readingTimeMinutes} menit baca</span>
              <ArticleViewTracker
                slug={article.slug}
                initialViews={article.viewCount}
                locale={locale}
                template={dict.seo.viewsCount}
              />
            </div>

            <MedicalReviewNote
              fullName={profile.full_name}
              specialty={profile.specialty}
              strSip={strSipClean}
              dict={dict.medical}
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
                <figcaption
                  className="border-t border-border bg-surface px-4 py-2.5 text-sm text-text-muted"
                  {...(isUntranslatedEn ? { lang: 'id' } : {})}
                >
                  {article.coverAlt}
                </figcaption>
              )}
            </figure>
          )}

          <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">
              {article.toc.length >= 2 && (
                <div className="mb-6">
                  <TableOfContents placement="inline" items={article.toc} dict={dict.toc} />
                </div>
              )}
              <div
                className="card-clinical p-6 sm:p-8 md:p-10"
                {...(isUntranslatedEn ? { lang: 'id' } : {})}
              >
                <ProseContent html={article.contentHtml} />
              </div>
              <ArticleShareBar title={article.title} url={canonicalUrl} dict={dict.share} />
              <MedicalDisclaimer dict={dict.medical} />
              <ConsultCta
                heading={dict.cta.consultHeadingDefault}
                doctorName={profile.full_name}
                bookingUrl={bookingUrl}
                whatsappFallback={whatsappFallback}
                locale={locale}
                labels={dict.cta}
              />
            </div>
            {article.toc.length >= 2 && (
              <aside className="lg:col-span-4">
                <TableOfContents placement="aside" items={article.toc} dict={dict.toc} />
              </aside>
            )}
          </div>

          {relatedArticles.length > 0 && (
            <section aria-labelledby="terkait-heading" className="mt-20 border-t border-border pt-12">
              <SectionHeading
                id="terkait-heading"
                title={dict.articlePage.relatedArticles}
                action={
                  <Link href={localePath(locale, '/artikel')} className="link">
                    {dict.articlesSection.allArticles}
                  </Link>
                }
              />
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {relatedArticles.map((rel) => (
                  <ArticleCard key={rel.id} article={rel} locale={locale} dict={dict} />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </SiteShell>
  );
}

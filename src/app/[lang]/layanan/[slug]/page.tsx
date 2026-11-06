import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConsultCta from '@/components/ConsultCta';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import MedicalReviewNote from '@/components/MedicalReviewNote';
import ProseContent from '@/components/ProseContent';
import SectionHeading from '@/components/SectionHeading';
import SiteShell from '@/components/SiteShell';
import TableOfContents from '@/components/TableOfContents';
import { hasLocale, INTL_LOCALE, LOCALES, OG_LOCALE, type Locale } from '@/i18n/config';
import { format, getDictionaryFor } from '@/i18n/dictionary';
import { buildAlternates, localePath } from '@/i18n/path';
import {
  getAllSiteData,
  getPaginatedArticles,
  getServiceBySlug,
  getServiceSlugsWithDetail,
} from '@/lib/content';
import { getCtaLinks } from '@/lib/cta';
import { getSiteUrl } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getServiceSlugsWithDetail();
  return LOCALES.flatMap((lang) => slugs.map(({ slug }) => ({ lang, slug })));
}

interface ServicePageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  if (!hasLocale(rawLang)) {
    return {};
  }
  const locale: Locale = rawLang;
  const dict = await getDictionaryFor(locale);
  const [{ profile }, service] = await Promise.all([
    getAllSiteData(locale),
    getServiceBySlug(slug, locale),
  ]);

  if (!service) {
    return { title: `${dict.servicePage.notFoundTitle} — ${profile.full_name}` };
  }

  const enAvailable = service.translated;
  const alternates = buildAlternates({
    locale,
    path: `/layanan/${service.slug}`,
    enAvailable,
  });

  const isUntranslatedEn = locale === 'en' && !service.translated;
  const description =
    service.service_description ||
    `${service.service_name} — ${profile.full_name} (${profile.specialty}).`;

  return {
    title: `${service.service_name} — ${profile.full_name}`,
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
      title: service.service_name,
      description,
      locale: OG_LOCALE[locale],
      modifiedTime: service.updatedAt.toISOString(),
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { lang: rawLang, slug } = await params;
  if (!hasLocale(rawLang)) {
    notFound();
  }
  const locale: Locale = rawLang;
  const dict = await getDictionaryFor(locale);

  const [{ profile, locations }, service] = await Promise.all([
    getAllSiteData(locale),
    getServiceBySlug(slug, locale),
  ]);

  if (!service) notFound();

  const isUntranslatedEn = locale === 'en' && !service.translated;
  const alternates = buildAlternates({
    locale,
    path: `/layanan/${service.slug}`,
    enAvailable: service.translated,
  });
  const canonicalUrl = alternates.canonical;

  const related = service.category
    ? (await getPaginatedArticles({ category: service.category, limit: 3, locale })).items
    : [];

  const siteUrl = getSiteUrl();
  const { bookingUrl, whatsappFallback } = getCtaLinks(profile, locations);
  const strSipClean =
    profile.str_sip_display && !profile.str_sip_display.includes('[BELUM DIISI]')
      ? profile.str_sip_display
      : null;
  const description =
    service.service_description ||
    `${service.service_name} — ${profile.full_name} (${profile.specialty}).`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: service.service_name,
        description,
        inLanguage: INTL_LOCALE[locale],
        dateModified: service.updatedAt.toISOString(),
        lastReviewed: service.updatedAt.toISOString(),
        reviewedBy: { '@id': `${siteUrl}/#physician` },
        mainEntity: { '@id': `${canonicalUrl}#procedure` },
      },
      {
        '@type': 'MedicalProcedure',
        '@id': `${canonicalUrl}#procedure`,
        name: service.service_name,
        description,
        url: canonicalUrl,
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
            name: dict.breadcrumbs.services,
            item: `${siteUrl}/#layanan`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: service.service_name,
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
              { label: dict.breadcrumbs.services, href: localePath(locale, '/#layanan') },
              { label: service.service_name },
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
            <h1 className="max-w-4xl font-display text-display font-semibold">
              {service.service_name}
            </h1>
            {service.service_description && (
              <p className="mt-4 max-w-3xl text-xl text-text-body">
                {service.service_description}
              </p>
            )}
            <MedicalReviewNote
              fullName={profile.full_name}
              specialty={profile.specialty}
              strSip={strSipClean}
              dict={dict.medical}
            />
          </header>

          <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">
              {service.toc.length >= 2 && (
                <div className="mb-6">
                  <TableOfContents placement="inline" items={service.toc} dict={dict.toc} />
                </div>
              )}
              <div
                className="card-clinical p-6 sm:p-8 md:p-10"
                {...(isUntranslatedEn ? { lang: 'id' } : {})}
              >
                <ProseContent html={service.contentHtml} />
              </div>

              {locations.length > 0 && (
                <section aria-labelledby="jadwal-layanan" className="card-clinical mt-8 p-6">
                  <h2 id="jadwal-layanan" className="text-xl font-bold">
                    {dict.servicePage.practiceSchedule}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {locations.map((loc) => (
                      <li key={loc.location_name}>
                        <p className="font-semibold text-text-heading">{loc.location_name}</p>
                        <p className="text-text-body">{loc.practice_hours}</p>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={localePath(locale, '/#lokasi')}
                    className="link mt-4 inline-block"
                  >
                    {dict.servicePage.viewFullSchedule}
                  </Link>
                </section>
              )}

              <MedicalDisclaimer dict={dict.medical} />
              <ConsultCta
                heading={format(dict.servicePage.consultHeading, {
                  name: service.service_name,
                })}
                doctorName={profile.full_name}
                bookingUrl={bookingUrl}
                whatsappFallback={whatsappFallback}
                locale={locale}
                labels={dict.cta}
              />
            </div>
            {service.toc.length >= 2 && (
              <aside className="lg:col-span-4">
                <TableOfContents placement="aside" items={service.toc} dict={dict.toc} />
              </aside>
            )}
          </div>

          {related.length > 0 && (
            <section aria-labelledby="terkait-heading" className="mt-20 border-t border-border pt-12">
              <SectionHeading
                id="terkait-heading"
                title={dict.articlePage.relatedArticles}
              />
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    locale={locale}
                    dict={dict}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </SiteShell>
  );
}

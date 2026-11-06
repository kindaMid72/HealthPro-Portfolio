import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteShell from '@/components/SiteShell';
import ArticleCard from '@/components/ArticleCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConsultCta from '@/components/ConsultCta';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import MedicalReviewNote from '@/components/MedicalReviewNote';
import ProseContent from '@/components/ProseContent';
import SectionHeading from '@/components/SectionHeading';
import TableOfContents from '@/components/TableOfContents';
import {
  getAllSiteData,
  getPaginatedArticles,
  getServiceBySlug,
  getServiceSlugsWithDetail,
} from '@/lib/content';
import { getCtaLinks } from '@/lib/cta';
import { getSiteUrl } from '@/lib/seo';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getServiceSlugsWithDetail();
  return slugs.map(({ slug }) => ({ slug }));
}

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [{ profile }, service] = await Promise.all([getAllSiteData(), getServiceBySlug(slug)]);

  if (!service) {
    return { title: `Layanan Tidak Ditemukan — ${profile.full_name}` };
  }

  const canonicalUrl = `${getSiteUrl()}/layanan/${service.slug}`;
  const description =
    service.service_description ||
    `${service.service_name} di praktik ${profile.full_name} (${profile.specialty}).`;

  return {
    title: `${service.service_name} — ${profile.full_name}`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: service.service_name,
      description,
      modifiedTime: service.updatedAt.toISOString(),
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [{ profile, locations }, service] = await Promise.all([
    getAllSiteData(),
    getServiceBySlug(slug),
  ]);

  if (!service) notFound();

  const related = service.category
    ? (await getPaginatedArticles({ category: service.category, limit: 3 })).items
    : [];

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/layanan/${service.slug}`;
  const { bookingUrl, whatsappFallback } = getCtaLinks(profile, locations);
  const strSipClean =
    profile.str_sip_display && !profile.str_sip_display.includes('[BELUM DIISI]')
      ? profile.str_sip_display
      : null;
  const description =
    service.service_description ||
    `${service.service_name} di praktik ${profile.full_name} (${profile.specialty}).`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: service.service_name,
        description,
        inLanguage: 'id-ID',
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
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Layanan', item: `${siteUrl}/#layanan` },
          { '@type': 'ListItem', position: 3, name: service.service_name, item: canonicalUrl },
        ],
      },
    ],
  };

  return (
    <SiteShell profile={profile} locations={locations}>
      <script
        type="application/ld+json"
        // `<` di-escape agar konten tidak bisa menutup tag <script>
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <article className="px-4 py-10 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Layanan', href: '/#layanan' },
            { label: service.service_name },
          ]}
        />

        <header className="card-clinical p-6 md:p-8">
          <h1 className="max-w-4xl font-display text-display font-semibold">{service.service_name}</h1>
          {service.service_description && (
            <p className="mt-4 max-w-3xl text-xl text-text-body">{service.service_description}</p>
          )}
          <MedicalReviewNote
            fullName={profile.full_name}
            specialty={profile.specialty}
            strSip={strSipClean}
          />
        </header>

        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            {service.toc.length >= 2 && (
              <div className="mb-6">
                <TableOfContents placement="inline" items={service.toc} />
              </div>
            )}
            <div className="card-clinical p-6 sm:p-8 md:p-10">
              <ProseContent html={service.contentHtml} />
            </div>

            {locations.length > 0 && (
              <section aria-labelledby="jadwal-layanan" className="card-clinical mt-8 p-6">
                <h2 id="jadwal-layanan" className="text-xl font-bold">
                  Jadwal praktik
                </h2>
                <ul className="mt-4 space-y-3">
                  {locations.map((loc) => (
                    <li key={loc.location_name}>
                      <p className="font-semibold text-text-heading">{loc.location_name}</p>
                      <p className="text-text-body">{loc.practice_hours}</p>
                    </li>
                  ))}
                </ul>
                <Link href="/#lokasi" className="link mt-4 inline-block">
                  Lihat jadwal &amp; lokasi lengkap
                </Link>
              </section>
            )}

            <MedicalDisclaimer />
            <ConsultCta
              heading={`Konsultasi ${service.service_name}`}
              doctorName={profile.full_name}
              bookingUrl={bookingUrl}
              whatsappFallback={whatsappFallback}
            />
          </div>
          {service.toc.length >= 2 && (
            <aside className="lg:col-span-4">
              <TableOfContents placement="aside" items={service.toc} />
            </aside>
          )}
        </div>

        {related.length > 0 && (
          <section aria-labelledby="terkait-heading" className="mt-20 border-t border-border pt-12">
            <SectionHeading id="terkait-heading" title="Artikel terkait" />
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}
        </div>
      </article>
    </SiteShell>
  );
}

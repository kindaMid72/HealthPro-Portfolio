import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { lang } from 'next/root-params';
import '../globals.css';
import { figtree, literata } from '@/lib/fonts';
import { LOCALES, OG_LOCALE, hasLocale, type Locale } from '@/i18n/config';
import { absoluteUrl, buildAlternates } from '@/i18n/path';
import { format, getDictionaryFor } from '@/i18n/dictionary';
import { getAllSiteData } from '@/lib/content';
import { META_DESCRIPTION_MAX, truncateMeta } from '@/lib/meta-text';
import { buildDescription, getServiceAreas, getSiteUrl } from '@/lib/seo';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!hasLocale(rawLang)) {
    return {};
  }
  const locale: Locale = rawLang;
  const dict = await getDictionaryFor(locale);
  const { profile, locations, services } = await getAllSiteData(locale);

  const siteUrl = getSiteUrl();
  const doctorName = profile.full_name;
  const specialty = profile.specialty;
  const areas = getServiceAreas(locations);
  const lastArea = areas.length ? areas[areas.length - 1] : '';

  const title = lastArea
    ? format(dict.seo.homeTitleWithArea, { doctor: doctorName, specialty, area: lastArea })
    : format(dict.seo.homeTitle, { doctor: doctorName, specialty });
  const description = truncateMeta(
    buildDescription(profile, locations, services, locale),
    META_DESCRIPTION_MAX,
  );
  const ogImageUrl = absoluteUrl(locale, '/opengraph-image');
  const alternates = buildAlternates({ locale, path: '/', enAvailable: true });
  const llmsUrl = absoluteUrl(locale, '/llms.txt');

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: doctorName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${doctorName} — ${specialty}`,
        },
      ],
      locale: OG_LOCALE[locale],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    authors: [{ name: doctorName, url: alternates.canonical }],
    keywords: [doctorName, specialty, ...services.map((s) => s.service_name), ...areas],
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
      types: { 'text/markdown': llmsUrl },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function PublicRootLayout({ children, params }: LayoutProps) {
  const { lang: paramLang } = await params;
  if (!hasLocale(paramLang)) {
    notFound();
  }
  const currentLang = await lang();

  return (
    <html lang={currentLang} className={`${figtree.variable} ${literata.variable}`}>
      <body>{children}</body>
    </html>
  );
}

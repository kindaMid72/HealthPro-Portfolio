import { notFound } from 'next/navigation';
import AboutSection from '@/components/AboutSection';
import ArticlesSection from '@/components/ArticlesSection';
import ContactSection from '@/components/ContactSection';
import HeroSection from '@/components/HeroSection';
import JsonLd from '@/components/JsonLd';
import LocationsSection from '@/components/LocationsSection';
import ServicesSection from '@/components/ServicesSection';
import SiteShell from '@/components/SiteShell';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionaryFor } from '@/i18n/dictionary';
import {
  getAllSiteData,
  getContentLastModified,
  getPublishedArticles,
  latestDate,
} from '@/lib/content';
import { getCtaLinks } from '@/lib/cta';
import { describeServiceArea } from '@/lib/seo';

export const revalidate = 3600;

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export default async function Home({ params }: HomePageProps) {
  const { lang: rawLang } = await params;
  if (!hasLocale(rawLang)) {
    notFound();
  }
  const locale: Locale = rawLang;
  const dict = await getDictionaryFor(locale);

  const [{ profile, locations, services }, articles, lastMod] = await Promise.all([
    getAllSiteData(locale),
    getPublishedArticles(3, locale),
    getContentLastModified(),
  ]);

  const { bookingUrl, whatsappFallback } = getCtaLinks(profile, locations);

  return (
    <SiteShell profile={profile} locations={locations} locale={locale} dict={dict}>
      <JsonLd
        profile={profile}
        locations={locations}
        services={services}
        locale={locale}
        dict={dict}
        lastModified={latestDate(lastMod.site, lastMod.articles)}
      />

      <HeroSection
        profile={profile}
        bookingUrl={bookingUrl}
        whatsappFallback={whatsappFallback}
        locations={locations}
        tagline={profile.hero_tagline ?? describeServiceArea(locations, locale)}
        locale={locale}
        dict={dict}
      />
      <LocationsSection
        locations={locations}
        globalBookingUrl={bookingUrl}
        locale={locale}
        dict={dict}
      />
      <ServicesSection services={services} locale={locale} dict={dict} />
      <AboutSection profile={profile} dict={dict} />
      <ArticlesSection articles={articles} locale={locale} dict={dict} />
      <ContactSection
        profile={profile}
        locations={locations}
        dict={dict}
        surface={articles.length > 0}
      />
    </SiteShell>
  );
}

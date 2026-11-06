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
import { getAllSiteData, getPublishedArticles } from '@/lib/content';
import { getCtaLinks } from '@/lib/cta';
import { buildPracticeSlots } from '@/lib/schedule';
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

  const [{ profile, locations, services }, articles] = await Promise.all([
    getAllSiteData(locale),
    getPublishedArticles(3, locale),
  ]);

  const { bookingUrl, whatsappFallback } = getCtaLinks(profile, locations);
  const slots = buildPracticeSlots(locations);

  return (
    <SiteShell profile={profile} locations={locations} locale={locale} dict={dict}>
      <JsonLd
        profile={profile}
        locations={locations}
        services={services}
        locale={locale}
        dict={dict}
      />

      <HeroSection
        profile={profile}
        bookingUrl={bookingUrl}
        whatsappFallback={whatsappFallback}
        slots={slots}
        serviceArea={describeServiceArea(locations, locale)}
        locale={locale}
        dict={dict}
      />
      <LocationsSection
        locations={locations}
        slots={slots}
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

/**
 * app/page.tsx — Home Page
 *
 * Server Component: ambil data via getAllSiteData() (database), render JSON-LD
 * dan section di dalam SiteShell. Revalidate jaring pengaman 1 jam;
 * perubahan dari admin langsung tampil lewat revalidatePublicSite().
 */

import { getAllSiteData, getPublishedArticles } from "@/lib/content";
import HeroSection from "@/components/HeroSection";
import JsonLd from "@/components/JsonLd";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import LocationsSection from "@/components/LocationsSection";
import ArticlesSection from "@/components/ArticlesSection";
import ContactSection from "@/components/ContactSection";
import SiteShell from "@/components/SiteShell";
import { getCtaLinks } from "@/lib/cta";

export const revalidate = 3600;

export default async function Home() {
  const [{ profile, locations, services }, articles] = await Promise.all([
    getAllSiteData(),
    getPublishedArticles(),
  ]);
  const { bookingUrl, whatsappFallback } = getCtaLinks(profile, locations);

  return (
    <>
      <JsonLd profile={profile} locations={locations} services={services} />

      <SiteShell profile={profile} locations={locations}>
        <HeroSection
          profile={profile}
          bookingUrl={bookingUrl}
          whatsappFallback={whatsappFallback}
        />
        <AboutSection profile={profile} />
        <ServicesSection services={services} />
        <LocationsSection locations={locations} globalBookingUrl={bookingUrl} />
        <ArticlesSection articles={articles} />
        <ContactSection profile={profile} locations={locations} />
      </SiteShell>
    </>
  );
}

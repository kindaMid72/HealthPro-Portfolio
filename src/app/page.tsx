/**
 * app/page.tsx — Beranda, urutan berorientasi kebutuhan pasien:
 * Hero (status praktik hari ini) → Jadwal & Lokasi → Layanan → Tentang → Artikel → Kontak.
 *
 * Server Component: data lewat getAllSiteData(); logika CTA diselesaikan di sini.
 */

import { getAllSiteData, getPublishedArticles } from "@/lib/content";
import { getCtaLinks } from "@/lib/cta";
import { buildPracticeSlots } from "@/lib/schedule";
import { describeServiceArea } from "@/lib/seo";
import SiteShell from "@/components/SiteShell";
import HeroSection from "@/components/HeroSection";
import JsonLd from "@/components/JsonLd";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import LocationsSection from "@/components/LocationsSection";
import ArticlesSection from "@/components/ArticlesSection";
import ContactSection from "@/components/ContactSection";

export const revalidate = 3600;

export default async function Home() {
  const [{ profile, locations, services }, articles] = await Promise.all([
    getAllSiteData(),
    getPublishedArticles(3),
  ]);

  const { bookingUrl, whatsappFallback } = getCtaLinks(profile, locations);
  const slots = buildPracticeSlots(locations);

  return (
    <SiteShell profile={profile} locations={locations}>
      <JsonLd profile={profile} locations={locations} services={services} />

      <HeroSection
        profile={profile}
        bookingUrl={bookingUrl}
        whatsappFallback={whatsappFallback}
        slots={slots}
        serviceArea={describeServiceArea(locations)}
      />
      <LocationsSection locations={locations} slots={slots} globalBookingUrl={bookingUrl} />
      <ServicesSection services={services} />
      <AboutSection profile={profile} />
      <ArticlesSection articles={articles} />
      <ContactSection profile={profile} locations={locations} />
    </SiteShell>
  );
}

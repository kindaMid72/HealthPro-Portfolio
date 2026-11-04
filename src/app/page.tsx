/**
 * app/page.tsx — Home Page (Fase 1: semua section terpasang)
 *
 * Server Component: fetch data via getAllSiteData(), lalu render semua section.
 * Logika resolusi CTA booking diselesaikan di sini sebelum diturunkan ke komponen.
 *
 * CATATAN: Navbar menggunakan `fixed` positioning, sehingga dibutuhkan
 * spacer <div className="h-16" /> setelah Navbar agar konten tidak tertutup.
 */

import { getAllSiteData, getPublishedArticles } from "@/lib/content";
import { getCtaLinks } from "@/lib/cta";
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

  return (
    <SiteShell profile={profile} locations={locations}>
      <JsonLd profile={profile} locations={locations} services={services} />

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
  );
}

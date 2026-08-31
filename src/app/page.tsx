/**
 * app/page.tsx — Home Page (Fase 1: semua section terpasang)
 *
 * Server Component: fetch data via getAllSiteData(), lalu render semua section.
 * Logika resolusi CTA booking diselesaikan di sini sebelum diturunkan ke komponen.
 */

import { getAllSiteData } from "@/lib/sheets";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import LocationsSection from "@/components/LocationsSection";
import ContactSection from "@/components/ContactSection";
import StickyCTA from "@/components/StickyCTA";

export default async function Home() {
  const { profile, locations, services } = await getAllSiteData();

  /**
   * Resolusi booking CTA:
   * - Utama: profile.booking_url (global)
   * - Fallback: nomor WA dari lokasi pertama yang punya kontak WA
   *
   * FR-4: kalau booking_url kosong → jangan tampilkan tombol booking broken.
   * Ganti dengan CTA WhatsApp kalau tersedia.
   */
  const bookingUrl = profile.booking_url ?? null;
  const firstWa = locations.find((l) => l.whatsapp)?.whatsapp;
  const whatsappFallback = firstWa
    ? `https://wa.me/62${firstWa.replace(/\D/g, "").replace(/^0/, "")}`
    : null;

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-20 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Langsung ke konten utama
      </a>

      <Navbar doctorName={profile.full_name} />

      <main id="main-content">
        <HeroSection
          profile={profile}
          bookingUrl={bookingUrl}
          whatsappFallback={whatsappFallback}
        />
        <AboutSection profile={profile} />
        <ServicesSection services={services} />
        <LocationsSection locations={locations} globalBookingUrl={bookingUrl} />
        <ContactSection profile={profile} locations={locations} />
      </main>

      <StickyCTA bookingUrl={bookingUrl} whatsappFallback={whatsappFallback} />

      {/* Spacer bawah di mobile agar konten tidak tertutup StickyCTA */}
      {(bookingUrl || whatsappFallback) && (
        <div className="h-20 md:hidden" aria-hidden="true" />
      )}
    </>
  );
}

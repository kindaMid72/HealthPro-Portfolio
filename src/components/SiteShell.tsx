/**
 * components/SiteShell.tsx
 * Kerangka halaman publik: skip-link, Navbar, konten, Footer, StickyCTA.
 * Dipakai home dan halaman artikel supaya chrome-nya identik.
 *
 * CATATAN: Navbar menggunakan `fixed` positioning, sehingga dibutuhkan
 * spacer <div className="h-16" /> setelah Navbar agar konten tidak tertutup.
 */

import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import StickyCTA from "@/components/StickyCTA";
import Footer from "@/components/Footer";
import { getCtaLinks } from "@/lib/cta";
import type { Location, Profile } from "@/lib/types";

interface SiteShellProps {
  profile: Profile;
  locations: Location[];
  children: ReactNode;
}

export default function SiteShell({ profile, locations, children }: SiteShellProps) {
  const { bookingUrl, whatsappFallback } = getCtaLinks(profile, locations);

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-20 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:text-primary"
      >
        Langsung ke konten utama
      </a>

      <Navbar doctorName={profile.full_name} />

      {/* Spacer kompensasi fixed navbar (h-16 = 64px = tinggi navbar) */}
      <div className="h-16" aria-hidden="true" />

      <main id="main-content">{children}</main>

      <Footer />

      <StickyCTA bookingUrl={bookingUrl} whatsappFallback={whatsappFallback} />

      {/* Spacer bawah di mobile agar konten tidak tertutup StickyCTA */}
      {(bookingUrl || whatsappFallback) && (
        <div className="h-20 md:hidden" aria-hidden="true" />
      )}
    </>
  );
}

import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import StickyCTA from './StickyCTA';
import { getCtaLinks } from '@/lib/cta';
import type { Location, Profile } from '@/lib/types';

interface SiteShellProps {
  profile: Profile;
  locations: Location[];
  children: ReactNode;
}

export default function SiteShell({
  profile,
  locations,
  children,
}: SiteShellProps) {
  const { bookingUrl, whatsappFallback } = getCtaLinks(profile, locations);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary focus:shadow-card"
      >
        Langsung ke konten utama
      </a>

      <Navbar
        doctorName={profile.full_name}
        bookingUrl={bookingUrl}
        whatsappFallback={whatsappFallback}
      />

      <div id="top" className="h-16" aria-hidden="true" />

      <main id="main-content">{children}</main>

      <Footer profile={profile} />

      <StickyCTA bookingUrl={bookingUrl} whatsappFallback={whatsappFallback} />

      {(bookingUrl || whatsappFallback) && (
        <div className="h-24 md:hidden" aria-hidden="true" />
      )}
    </>
  );
}

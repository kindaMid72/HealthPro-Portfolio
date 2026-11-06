import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { getCtaLinks } from '@/lib/cta';
import type { Location, Profile } from '@/lib/types';
import Footer from './Footer';
import Navbar from './Navbar';
import StickyCTA from './StickyCTA';

interface SiteShellProps {
  profile: Profile;
  locations: Location[];
  children: ReactNode;
  locale: Locale;
  dict: Dictionary;
}

export default function SiteShell({
  profile,
  locations,
  children,
  locale,
  dict,
}: SiteShellProps) {
  const { bookingUrl, whatsappFallback } = getCtaLinks(profile, locations);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary focus:shadow-card"
      >
        {dict.shell.skipToContent}
      </a>

      <Navbar
        doctorName={profile.full_name}
        bookingUrl={bookingUrl}
        whatsappFallback={whatsappFallback}
        locale={locale}
        dict={dict}
      />

      <div id="top" className="h-16" aria-hidden="true" />

      <main id="main-content">{children}</main>

      <Footer profile={profile} locale={locale} dict={dict} />

      <StickyCTA
        bookingUrl={bookingUrl}
        whatsappFallback={whatsappFallback}
        labels={{
          bookingNow: dict.common.bookingNow,
          whatsapp: dict.common.whatsapp,
          quickActionsAria: dict.shell.quickActionsAria,
        }}
      />

      {(bookingUrl || whatsappFallback) && (
        <div className="h-24 md:hidden" aria-hidden="true" />
      )}
    </>
  );
}

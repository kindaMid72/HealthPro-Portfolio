import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { localePath } from '@/i18n/path';
import { NAV_LINKS } from '@/lib/nav';
import { getCredentials, getDisplayName } from '@/lib/seo';
import BrandMark from './BrandMark';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';
import NavCta from './NavCta';
import NavLinks from './NavLinks';

interface NavbarProps {
  doctorName: string;
  bookingUrl: string | null;
  whatsappFallback: string | null;
  locale: Locale;
  dict: Dictionary;
}

export default function Navbar({
  doctorName,
  bookingUrl,
  whatsappFallback,
  locale,
  dict,
}: NavbarProps) {
  const credentials = getCredentials(doctorName).join(', ');
  const localizedLinks = NAV_LINKS.map((link) => ({
    href: localePath(locale, link.href),
    label: dict.nav[link.key],
  }));

  const ctaLabels = {
    booking: dict.common.booking,
    whatsapp: dict.common.whatsapp,
    viewSchedule: dict.common.viewSchedule,
  };

  return (
    <header
      id="navbar"
      className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border bg-surface/95 px-4 backdrop-blur-md md:px-6"
    >
      <nav
        aria-label={dict.nav.mainNavAria}
        className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4"
      >
        <Link
          href={localePath(locale, '/')}
          aria-label={dict.nav.backToHome}
          className="group flex min-w-0 items-center gap-3"
        >
          <BrandMark className="h-9 w-9 shrink-0 text-primary transition-colors group-hover:text-primary-hover" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-display text-lg font-semibold tracking-tight text-text-heading">
              {getDisplayName(doctorName)}
            </span>
            {credentials && (
              <span className="truncate text-xs font-medium text-text-muted">
                {credentials}
              </span>
            )}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <NavLinks links={localizedLinks} />
          <LanguageSwitcher
            locale={locale}
            labels={dict.languageSwitcher}
            className="hidden md:inline-flex"
          />
          <NavCta
            bookingUrl={bookingUrl}
            whatsappFallback={whatsappFallback}
            locale={locale}
            labels={ctaLabels}
            className="ml-2 hidden md:inline-flex"
          />
          <MobileMenu
            bookingUrl={bookingUrl}
            whatsappFallback={whatsappFallback}
            locale={locale}
            links={localizedLinks}
            menuOpenLabel={dict.shell.menuOpen}
            menuCloseLabel={dict.shell.menuClose}
            ctaLabels={ctaLabels}
            languageSwitcherLabels={dict.languageSwitcher}
          />
        </div>
      </nav>
    </header>
  );
}

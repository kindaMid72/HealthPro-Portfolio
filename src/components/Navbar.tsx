/**
 * components/Navbar.tsx
 * Navigasi tetap (fixed) — spacer h-16 ada di SiteShell.
 * Server Component; item aktif ditangani NavLinks (client).
 */

import Link from "next/link";
import BrandMark from "./BrandMark";
import { getCredentials, getDisplayName } from "@/lib/seo";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import NavCta from "./NavCta";

interface NavbarProps {
  doctorName: string;
  bookingUrl: string | null;
  whatsappFallback: string | null;
}

export default function Navbar({ doctorName, bookingUrl, whatsappFallback }: NavbarProps) {
  const credentials = getCredentials(doctorName).join(", ");
  return (
    <header
      id="navbar"
      className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border bg-surface/95 px-4 backdrop-blur-md md:px-6"
    >
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4"
      >
        <Link
          href="/"
          aria-label="Kembali ke beranda"
          className="group flex min-w-0 items-center gap-3"
        >
          <BrandMark className="h-9 w-9 shrink-0 text-primary transition-colors group-hover:text-primary-hover" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-display text-lg font-semibold tracking-tight text-text-heading">
              {getDisplayName(doctorName)}
            </span>
            {credentials && (
              <span className="truncate text-xs font-medium text-text-muted">{credentials}</span>
            )}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <NavLinks />
          <NavCta
            bookingUrl={bookingUrl}
            whatsappFallback={whatsappFallback}
            className="ml-3 hidden md:inline-flex"
          />
          <MobileMenu bookingUrl={bookingUrl} whatsappFallback={whatsappFallback} />
        </div>
      </nav>
    </header>
  );
}

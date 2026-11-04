/**
 * components/Navbar.tsx
 * Navigasi tetap (fixed) — spacer h-16 ada di SiteShell.
 * Server Component; item aktif ditangani NavLinks (client).
 */

import Link from "next/link";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import NavCta from "./NavCta";

interface NavbarProps {
  doctorName: string;
  bookingUrl: string | null;
  whatsappFallback: string | null;
}

export default function Navbar({ doctorName, bookingUrl, whatsappFallback }: NavbarProps) {
  return (
    <header
      id="navbar"
      className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border bg-surface/90 backdrop-blur-md"
    >
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6"
      >
        <Link
          href="/"
          aria-label="Kembali ke beranda"
          className="truncate text-base font-bold tracking-tight text-text-heading hover:text-primary"
        >
          {doctorName}
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

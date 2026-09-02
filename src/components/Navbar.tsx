/**
 * components/Navbar.tsx
 * Desktop fixed navigation dengan anchor links ke tiap section.
 * Mobile: disembunyikan (hidden md:flex) — navigasi mobile via StickyCTA.
 *
 * PENTING: Navbar menggunakan `fixed` (bukan sticky) agar bekerja
 * di semua browser meski parent punya overflow-x: clip.
 * Kompensasi: page.tsx menambahkan spacer <div className="h-16" /> setelah Navbar.
 *
 * Styling: sesuai 04-design.md — warna primary, font heading, micro-interaction 150ms.
 * Note: Server Component — tidak boleh ada event handler, pakai CSS hover saja.
 */

import Link from "next/link";

interface NavbarProps {
  doctorName: string;
}

const NAV_LINKS = [
  { href: "#tentang",  label: "Tentang" },
  { href: "#layanan",  label: "Layanan" },
  { href: "#lokasi",   label: "Jadwal & Lokasi" },
  { href: "#kontak",   label: "Kontak" },
] as const;

export default function Navbar({ doctorName }: NavbarProps) {
  return (
    <header
      id="navbar"
      role="banner"
      className="fixed top-0 left-0 right-0 z-40 w-full h-16 bg-white/90 backdrop-blur-md border-b border-border shadow-[0_1px_12px_rgba(36,49,56,0.07)] animate-slide-in-down"
    >
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-full max-w-5xl items-center justify-between px-5 md:px-8"
      >
        {/* Logo / nama dokter */}
        <Link
          href="#hero"
          id="navbar-logo"
          aria-label="Kembali ke atas halaman"
          className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors duration-200"
        >
          {/* Pulse dot — trust indicator kecil */}
          <span
            aria-hidden="true"
            className="relative flex h-2.5 w-2.5 shrink-0"
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary/40 animate-pulse-ring" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <span className="text-sm font-bold md:text-base font-heading tracking-tight leading-tight">
            {doctorName}
          </span>
        </Link>

        {/* Anchor links — hanya tampil di desktop */}
        <ul
          id="navbar-links"
          role="list"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="relative px-3 py-2 text-sm font-medium font-body text-text-body hover:text-primary transition-colors duration-200 rounded-lg hover:bg-primary/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary block"
              >
                {label}
              </a>
            </li>
          ))}

          {/* CTA Booking di navbar desktop */}
          <li className="ml-3">
            <a
              href="#lokasi"
              id="navbar-cta"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold font-heading bg-primary text-white hover:bg-primary-dark transition-colors duration-200 shadow-sm"
            >
              Booking
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

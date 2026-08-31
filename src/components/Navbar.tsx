/**
 * components/Navbar.tsx
 * Desktop sticky navigation dengan anchor links ke tiap section.
 * Mobile: disembunyikan (hidden md:flex) — navigasi mobile via StickyCTA.
 *
 * Styling: sesuai 04-design.md — warna primary, font heading, micro-interaction 150ms.
 * Note: Server Component — tidak boleh ada event handler, pakai CSS hover saja.
 */

import Link from "next/link";

interface NavbarProps {
  doctorName: string;
}

const NAV_LINKS = [
  { href: "#tentang", label: "Tentang" },
  { href: "#layanan", label: "Layanan" },
  { href: "#lokasi", label: "Jadwal & Lokasi" },
  { href: "#kontak", label: "Kontak" },
] as const;

export default function Navbar({ doctorName }: NavbarProps) {
  return (
    <header
      id="navbar"
      role="banner"
      className="sticky top-0 z-40 w-full h-16 bg-white/75 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300"
    >
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-full max-w-5xl items-center justify-between px-4 md:px-8"
      >
        {/* Logo / nama dokter */}
        <Link
          href="#hero"
          id="navbar-logo"
          aria-label="Kembali ke atas halaman"
          className="text-primary hover:text-primary-dark transition-colors duration-300 text-sm font-bold md:text-base font-heading tracking-tight"
        >
          {doctorName}
        </Link>

        {/* Anchor links — hanya tampil di desktop */}
        <ul
          id="navbar-links"
          role="list"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a 
                href={href} 
                className="text-text-body hover:text-primary transition-colors duration-300 text-sm font-medium font-body focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary rounded-sm"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

/**
 * components/Navbar.tsx
 * Desktop sticky navigation dengan anchor links ke tiap section.
 * Mobile: disembunyikan (hidden md:flex) — navigasi mobile via StickyCTA.
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
      className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm"
      style={{ height: "var(--navbar-height)" }}
    >
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-full max-w-5xl items-center justify-between px-4 md:px-6"
      >
        {/* Logo / nama dokter */}
        <Link
          href="#hero"
          id="navbar-logo"
          className="text-sm font-semibold text-gray-900 md:text-base"
          aria-label="Kembali ke atas halaman"
        >
          {doctorName}
        </Link>

        {/* Anchor links — hanya tampil di desktop */}
        <ul
          id="navbar-links"
          role="list"
          className="hidden items-center gap-6 md:flex"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="text-sm text-gray-600 transition-colors hover:text-gray-900"
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

export const NAV_LINKS = [
  { href: '/#lokasi', label: 'Jadwal & Lokasi' },
  { href: '/#layanan', label: 'Layanan' },
  { href: '/#tentang', label: 'Tentang' },
  { href: '/artikel', label: 'Artikel' },
  { href: '/#kontak', label: 'Kontak' },
] as const;

/** Prefiks rute yang menandai item nav aktif di halaman non-beranda. */
export const NAV_ACTIVE_PREFIX: Record<string, string> = {
  '/artikel': '/artikel',
  '/#layanan': '/layanan',
};

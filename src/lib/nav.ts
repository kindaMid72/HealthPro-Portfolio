export type NavLinkKey = 'schedule' | 'services' | 'about' | 'articles' | 'contact';

export interface NavLinkItem {
  key: NavLinkKey;
  href: string;
}

export const NAV_LINKS: readonly NavLinkItem[] = [
  { key: 'schedule', href: '/#lokasi' },
  { key: 'services', href: '/#layanan' },
  { key: 'about', href: '/#tentang' },
  { key: 'articles', href: '/artikel' },
  { key: 'contact', href: '/#kontak' },
] as const;

/** Prefiks rute yang menandai item nav aktif di halaman non-beranda. */
export const NAV_ACTIVE_PREFIX: Record<string, string> = {
  '/artikel': '/artikel',
  '/#layanan': '/layanan',
};

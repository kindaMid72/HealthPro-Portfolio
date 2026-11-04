import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { logoutAction } from '../actions';

export const metadata: Metadata = {
  title: 'Admin Dashboard — Portal Dokter',
  robots: { index: false, follow: false },
};

const ADMIN_NAV = [
  { href: '/admin', label: 'Beranda' },
  { href: '/admin/articles', label: 'Artikel' },
  { href: '/admin/profile', label: 'Profil Dokter' },
  { href: '/admin/locations', label: 'Lokasi Praktik' },
  { href: '/admin/services', label: 'Layanan' },
  { href: '/admin/account', label: 'Akun' },
] as const;

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-dvh bg-bg text-text-body">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-heading text-base font-bold text-primary-dark hover:text-primary"
            >
              Admin Dokter
            </Link>

            <nav aria-label="Menu Admin" className="flex flex-wrap items-center gap-1">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-text-body transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/"
              target="_blank"
              className="rounded-lg border border-border bg-bg px-3 py-1.5 font-medium text-text-body transition-colors hover:border-primary hover:text-primary"
            >
              Lihat Website ↗
            </Link>
            <span className="hidden font-medium text-text-muted sm:inline">
              {user.name}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}

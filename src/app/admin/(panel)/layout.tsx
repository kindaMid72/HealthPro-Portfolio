/**
 * app/admin/(panel)/layout.tsx — kerangka panel admin yang butuh login.
 * Semua halaman di grup (panel) lewat requireUser(); halaman login ada di luar grup ini.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { logoutAction } from '../actions';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/admin" className="hover:underline">
              Beranda
            </Link>
            <Link href="/admin/articles" className="hover:underline">
              Artikel
            </Link>
            <Link href="/admin/profile" className="hover:underline">
              Profil Dokter
            </Link>
            <Link href="/admin/locations" className="hover:underline">
              Lokasi Praktik
            </Link>
            <Link href="/admin/services" className="hover:underline">
              Layanan
            </Link>
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-primary hover:underline font-medium"
            >
              Lihat Website ↗
            </Link>
            <span className="text-gray-600">{user.name}</span>
            <form action={logoutAction}>
              <button type="submit" className="rounded-md border border-gray-300 px-3 py-1">
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}

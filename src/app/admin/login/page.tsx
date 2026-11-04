import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Lock } from 'lucide-react';
import { getSessionUser } from '@/lib/session';
import { loginAction } from '../actions';

export const metadata: Metadata = {
  title: 'Login Admin — Portal Dokter',
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const user = await getSessionUser();
  if (user) {
    redirect('/admin');
  }

  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock size={22} aria-hidden="true" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-primary-dark">
            Panel Admin Dokter
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Masuk untuk mengelola artikel edukasi, profil, lokasi, dan layanan.
          </p>
        </div>

        {error === 'invalid' && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
          >
            Email atau kata sandi tidak sesuai. Silakan periksa kembali.
          </div>
        )}

        {error === 'locked' && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800"
          >
            Akun dikunci sementara selama 15 menit karena terlalu banyak
            percobaan gagal.
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block font-heading text-xs font-semibold text-primary-dark"
            >
              Alamat Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nama@domain.id"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block font-heading text-xs font-semibold text-primary-dark"
            >
              Kata Sandi
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-primary px-4 py-3 font-heading text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-dark"
          >
            Masuk ke Dashboard
          </button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-text-muted hover:text-primary"
          >
            ← Kembali ke Halaman Publik
          </Link>
        </div>
      </div>
    </div>
  );
}

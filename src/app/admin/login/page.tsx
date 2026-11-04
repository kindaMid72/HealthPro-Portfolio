import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Lock } from 'lucide-react';
import Alert from '@/components/admin/Alert';
import { TextField } from '@/components/admin/Field';
import { getSessionUser } from '@/lib/session';
import { loginAction } from '../actions';
import LoginSubmitButton from './LoginSubmitButton';

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
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-tint text-primary">
            <Lock size={22} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold">Panel Admin Dokter</h1>
          <p className="mt-1 text-sm text-text-muted">
            Masuk untuk mengelola artikel edukasi, profil, lokasi, dan layanan.
          </p>
        </div>

        {error === 'invalid' && (
          <div className="mb-5">
            <Alert tone="error">Email atau kata sandi tidak sesuai. Silakan periksa kembali.</Alert>
          </div>
        )}

        {error === 'locked' && (
          <div className="mb-5">
            <Alert tone="error">
              Akun dikunci sementara selama 15 menit karena terlalu banyak percobaan gagal.
            </Alert>
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          <TextField
            label="Alamat email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@domain.id"
          />
          <TextField
            label="Kata sandi"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
          />
          <LoginSubmitButton />
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center">
          <Link href="/" className="text-sm font-medium text-text-muted hover:text-primary">
            ← Kembali ke halaman publik
          </Link>
        </div>
      </div>
    </div>
  );
}

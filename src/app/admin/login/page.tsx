/**
 * app/admin/login/page.tsx — halaman masuk admin (Bahasa Indonesia).
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { loginAction } from '../actions';

export const metadata: Metadata = {
  title: 'Masuk Admin',
  robots: { index: false, follow: false },
};

const ERROR_TEXT: Record<string, string> = {
  invalid: 'Email atau password salah.',
  locked: 'Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.',
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSessionUser()) redirect('/admin');

  const { error } = await searchParams;
  const message = error ? ERROR_TEXT[error] : undefined;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Masuk Admin</h1>

      {message && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {message}
        </p>
      )}

      <form action={loginAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 font-medium text-white"
        >
          Masuk
        </button>
      </form>
    </main>
  );
}

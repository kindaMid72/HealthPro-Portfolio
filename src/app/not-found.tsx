import type { Metadata } from 'next';
import Link from 'next/link';
import SiteShell from '@/components/SiteShell';
import { getAllSiteData } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan',
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const { profile, locations } = await getAllSiteData();

  return (
    <SiteShell profile={profile} locations={locations}>
      <section className="bg-bg px-4 py-20 md:py-28">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Kesalahan 404
          </p>
          <h1 className="mt-3 text-3xl font-bold text-text-heading md:text-4xl">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-4 text-text-body">
            Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.
            Silakan kembali ke beranda atau telusuri artikel edukasi kesehatan.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/artikel"
              className="rounded-full border border-primary/30 px-6 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Lihat Artikel
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

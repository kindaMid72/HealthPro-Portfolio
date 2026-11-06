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
        <div className="card-clinical mx-auto max-w-xl p-8 text-center md:p-10">
          <h1 className="font-display text-h2 font-semibold">Halaman tidak ditemukan</h1>
          <p className="mt-4">
            Alamat yang Anda buka tidak tersedia atau sudah dipindahkan. Silakan kembali ke beranda
            atau telusuri artikel edukasi kesehatan.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn btn-primary">
              Kembali ke beranda
            </Link>
            <Link href="/artikel" className="btn btn-secondary">
              Lihat artikel
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

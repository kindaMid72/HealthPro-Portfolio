/**
 * app/page.tsx — Home Page (Fase 0: verifikasi data pipeline)
 *
 * Fase 0 DoD: console.log data dari Sheet/fixture jalan tanpa error.
 * Komponen UI lengkap akan dibangun di Fase 1.
 */

import { getAllSiteData } from '@/lib/sheets';

export default async function Home() {
  // --- DoD Fase 0: fetch data & log ke server console ---
  const siteData = await getAllSiteData();

  console.log('=== [Fase 0 DoD] Data Pipeline Test ===');
  console.log('[profile]', JSON.stringify(siteData.profile, null, 2));
  console.log('[locations]', JSON.stringify(siteData.locations, null, 2));
  console.log('[services]', JSON.stringify(siteData.services, null, 2));
  console.log('=== End Data Pipeline Test ===');

  return (
    <main className="min-h-screen p-8 font-sans">
      {/* Fase 0 — placeholder page, akan diganti UI di Fase 1 */}
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-700 mb-1">
            ✅ Fase 0 DoD — Data pipeline aktif
          </p>
          <p className="text-xs text-green-600">
            Cek terminal server (bukan browser console) untuk melihat data yang berhasil di-fetch.
          </p>
        </div>

        <section>
          <h1 className="text-xl font-bold text-gray-800">
            {siteData.profile.full_name}
          </h1>
          <p className="text-gray-600">{siteData.profile.specialty}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Lokasi Praktik</h2>
          <ul className="space-y-2">
            {siteData.locations.map((loc, i) => (
              <li key={i} className="p-3 bg-gray-50 rounded border text-sm">
                <strong>{loc.location_name}</strong>
                <br />
                <span className="text-gray-500">{loc.practice_hours}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Layanan</h2>
          <ul className="space-y-2">
            {siteData.services.map((svc, i) => (
              <li key={i} className="p-3 bg-gray-50 rounded border text-sm">
                <strong>{svc.service_name}</strong>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-xs text-gray-400 pt-4 border-t">
          Halaman ini adalah placeholder Fase 0. Desain UI akan diimplementasikan di Fase 1.
        </p>
      </div>
    </main>
  );
}

/**
 * components/LocationsSection.tsx
 * Kartu lokasi praktik multi-lokasi — semua lokasi setara (tidak ada "utama").
 * Keputusan desain dikonfirmasi 28 Agustus 2026 (lihat 03-sitemap.md).
 *
 * Logika tiap kartu (FR-4):
 * - whatsapp ada → tombol WA
 * - phone ada → tombol telepon
 * - booking_url_override ada → pakai sebagai link booking lokasi ini
 * - Kontak semua kosong → kartu tetap tampil (nama+alamat+jam), tanpa tombol kontak
 */

import { Location } from "@/lib/types";

interface LocationsSectionProps {
  locations: Location[];
  globalBookingUrl: string | null;
}

/** Konversi nomor WA Indonesia ke format wa.me (08xxx → 628xxx) */
function toWaLink(wa: string): string {
  const digits = wa.replace(/\D/g, "");
  const normalized = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits;
  return `https://wa.me/${normalized}`;
}

export default function LocationsSection({
  locations,
  globalBookingUrl,
}: LocationsSectionProps) {
  return (
    <section
      id="lokasi"
      aria-labelledby="lokasi-heading"
      className="border-t border-gray-100 px-4 py-16 md:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="lokasi-heading"
          className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl"
        >
          Jadwal & Lokasi Praktik
        </h2>

        {locations.length === 0 ? (
          <p id="lokasi-empty" className="text-gray-500">
            Informasi lokasi praktik segera hadir.
          </p>
        ) : (
          <ul id="locations-list" role="list" className="space-y-4">
            {locations.map((loc, i) => {
              const effectiveBookingUrl =
                loc.booking_url_override ?? globalBookingUrl;
              const hasContact =
                loc.whatsapp || loc.phone || effectiveBookingUrl;

              return (
                <li
                  key={i}
                  id={`location-card-${i}`}
                  className="rounded-lg border border-gray-200 bg-white p-5"
                >
                  {/* Nama lokasi */}
                  <h3
                    id={`location-name-${i}`}
                    className="text-base font-semibold text-gray-900"
                  >
                    {loc.location_name}
                  </h3>

                  {/* Alamat */}
                  <address
                    id={`location-address-${i}`}
                    className="mt-1 text-sm not-italic text-gray-600"
                  >
                    {loc.address}
                  </address>

                  {/* Jam praktik */}
                  <p
                    id={`location-hours-${i}`}
                    className="mt-2 text-sm text-gray-500"
                  >
                    <span className="font-medium text-gray-700">
                      Jam Praktik:
                    </span>{" "}
                    <time>{loc.practice_hours}</time>
                  </p>

                  {/* Tombol kontak — hanya tampil kalau ada data */}
                  {hasContact && (
                    <div
                      id={`location-actions-${i}`}
                      className="mt-4 flex flex-wrap gap-2"
                    >
                      {loc.whatsapp && (
                        <a
                          id={`location-wa-${i}`}
                          href={toWaLink(loc.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-50"
                        >
                          WhatsApp
                        </a>
                      )}
                      {loc.phone && (
                        <a
                          id={`location-phone-${i}`}
                          href={`tel:${loc.phone}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Telepon
                        </a>
                      )}
                      {effectiveBookingUrl && (
                        <a
                          id={`location-booking-${i}`}
                          href={effectiveBookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          Booking
                        </a>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* CTA Booking global — terpisah dari per-lokasi */}
        {globalBookingUrl && (
          <div className="mt-8">
            <a
              id="cta-booking-lokasi"
              href={globalBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Booking Sekarang
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

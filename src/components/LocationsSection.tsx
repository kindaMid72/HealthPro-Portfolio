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
 *
 * Styling: sesuai 04-design.md — surface putih, grid 1→3 kolom, ikon Lucide,
 *          hover via CSS class, bukan event handler (Server Component).
 */

import { MapPin, Clock, MessageCircle, Phone, CalendarCheck } from "lucide-react";
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
  const gridClass =
    locations.length === 1
      ? "grid-cols-1"
      : locations.length === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id="lokasi"
      aria-labelledby="lokasi-heading"
      className="section-divider section-spacing px-4 bg-surface"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="lokasi-heading"
          className="mb-10 text-3xl font-bold md:text-4xl text-primary-dark font-heading tracking-tight"
        >
          Jadwal & Lokasi Praktik
        </h2>

        {locations.length === 0 ? (
          <p id="lokasi-empty" className="text-text-body text-center py-8">
            Informasi lokasi praktik segera hadir.
          </p>
        ) : (
          <ul
            id="locations-list"
            role="list"
            className={`grid gap-4 ${gridClass}`}
          >
            {locations.map((loc, i) => {
              const effectiveBookingUrl =
                loc.booking_url_override ?? globalBookingUrl;
              const hasContact =
                loc.whatsapp || loc.phone || effectiveBookingUrl;

              return (
                <li
                  key={i}
                  id={`location-card-${i}`}
                  className="bg-surface border border-border rounded-xl flex flex-col p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Nama lokasi */}
                  <h3
                    id={`location-name-${i}`}
                    className="mb-4 text-lg font-semibold text-primary-dark font-heading leading-tight"
                  >
                    {loc.location_name}
                  </h3>

                  {/* Alamat */}
                  <address
                    id={`location-address-${i}`}
                    className="mb-3 flex items-start gap-3 text-sm not-italic leading-relaxed text-text-body"
                  >
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{loc.address}</span>
                  </address>

                  {/* Jam praktik */}
                  <p
                    id={`location-hours-${i}`}
                    className="mb-6 flex items-start gap-3 text-sm text-text-body"
                  >
                    <Clock
                      size={16}
                      className="mt-0.5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="font-medium text-primary-dark">
                        Jam Praktik:{" "}
                      </span>
                      <time>{loc.practice_hours}</time>
                    </span>
                  </p>

                  {/* Spacer — push tombol ke bawah kartu */}
                  <div className="flex-1" />

                  {/* Tombol kontak — hanya tampil kalau ada data */}
                  {hasContact && (
                    <div
                      id={`location-actions-${i}`}
                      className="flex flex-wrap gap-2.5 pt-2"
                    >
                      {loc.whatsapp && (
                        <a
                          id={`location-wa-${i}`}
                          href={toWaLink(loc.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                        >
                          <MessageCircle size={14} aria-hidden="true" />
                          WhatsApp
                        </a>
                      )}
                      {loc.phone && (
                        <a
                          id={`location-phone-${i}`}
                          href={`tel:${loc.phone}`}
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border border-border text-text-body hover:border-primary hover:text-primary transition-all duration-300 bg-surface shadow-sm hover:shadow-md"
                        >
                          <Phone size={14} aria-hidden="true" />
                          Telepon
                        </a>
                      )}
                      {effectiveBookingUrl && (
                        <a
                          id={`location-booking-${i}`}
                          href={effectiveBookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold bg-accent text-white hover:brightness-90 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <CalendarCheck size={14} aria-hidden="true" />
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
          <div className="mt-10">
            <a
              id="cta-booking-lokasi"
              href={globalBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent"
            >
              <CalendarCheck size={18} aria-hidden="true" />
              Booking Sekarang
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

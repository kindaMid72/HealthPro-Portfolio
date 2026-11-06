/**
 * components/LocationsSection.tsx
 * Papan jadwal mingguan + kartu lokasi praktik. Semua lokasi setara (03-sitemap.md).
 *
 * Aksi tiap kartu (FR-4): WhatsApp / Telepon / Booking hanya bila datanya ada;
 * kontak kosong → kartu tetap tampil tanpa baris aksi.
 */

import { MessageCircle, Phone, CalendarCheck, ExternalLink } from "lucide-react";
import type { Location } from "@/lib/types";
import { mapsSearchUrl } from "@/lib/seo";
import { toWaLink } from "@/lib/cta";
import { parsePracticeHours, type PracticeSlot } from "@/lib/schedule";
import SectionHeading from "./SectionHeading";
import ScheduleBoard from "./ScheduleBoard";

interface LocationsSectionProps {
  locations: Location[];
  slots: PracticeSlot[];
  globalBookingUrl: string | null;
}

export default function LocationsSection({ locations, slots, globalBookingUrl }: LocationsSectionProps) {
  const unparsed = locations
    .filter((l) => !parsePracticeHours(l.practice_hours))
    .map((l) => ({ name: l.location_name, hours: l.practice_hours }));

  return (
    <section
      id="lokasi"
      aria-labelledby="lokasi-heading"
      className="section-spacing border-t border-border bg-bg px-4 md:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="lokasi-heading"
          title="Jadwal & lokasi praktik"
          intro="Pilih lokasi dan jadwal yang paling dekat dengan Anda."
        />

        {locations.length === 0 ? (
          <p id="lokasi-empty" className="py-8 text-text-body">
            Informasi lokasi praktik segera hadir.
          </p>
        ) : (
          <>
            <ScheduleBoard slots={slots} unparsed={unparsed} />
            <ul id="locations-list" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((loc, i) => {
                const effectiveBookingUrl = loc.booking_url_override ?? globalBookingUrl;
                const wa = loc.whatsapp ? toWaLink(loc.whatsapp) : null;
                const hasContact = wa || loc.phone || effectiveBookingUrl;

                return (
                  <li
                    key={i}
                    id={`location-card-${i}`}
                    className="card-clinical flex flex-col justify-between p-6"
                  >
                    <div>
                      <h3 id={`location-name-${i}`} className="text-xl font-semibold leading-snug text-text-heading">
                        {loc.location_name}
                      </h3>

                      <dl className="mt-4 space-y-4 text-sm">
                        <div>
                          <dt className="text-xs font-medium text-text-muted">Alamat</dt>
                          <dd id={`location-address-${i}`} className="mt-1 text-text-body">
                            <address className="not-italic">{loc.address}</address>
                            <a
                              id={`location-map-${i}`}
                              href={mapsSearchUrl(loc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              Buka di Google Maps
                              <ExternalLink size={12} aria-hidden="true" />
                            </a>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-text-muted">Jam praktik (WITA)</dt>
                          <dd id={`location-hours-${i}`} className="mt-1 font-semibold tabular-nums text-text-heading">
                            {loc.practice_hours}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {hasContact && (
                      <div id={`location-actions-${i}`} className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                        {wa && (
                          <a
                            id={`location-wa-${i}`}
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-secondary"
                          >
                            <MessageCircle size={16} aria-hidden="true" />
                            WhatsApp
                          </a>
                        )}
                        {loc.phone && (
                          <a id={`location-phone-${i}`} href={`tel:${loc.phone}`} className="btn btn-sm btn-secondary">
                            <Phone size={16} aria-hidden="true" />
                            Telepon
                          </a>
                        )}
                        {effectiveBookingUrl && (
                          <a
                            id={`location-booking-${i}`}
                            href={effectiveBookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-accent"
                          >
                            <CalendarCheck size={16} aria-hidden="true" />
                            Booking
                          </a>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

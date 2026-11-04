/**
 * components/LocationsSection.tsx
 * Papan jadwal mingguan + kartu lokasi praktik. Semua lokasi setara (03-sitemap.md).
 *
 * Aksi tiap kartu (FR-4): WhatsApp / Telepon / Booking hanya bila datanya ada;
 * kontak kosong → kartu tetap tampil tanpa baris aksi.
 */

import { MapPin, Clock, MessageCircle, Phone, CalendarCheck } from "lucide-react";
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
      className="section-spacing border-t border-border bg-surface px-4 md:px-6"
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
                    className="flex flex-col rounded-xl border border-border bg-surface p-6 shadow-card"
                  >
                    <h3 id={`location-name-${i}`} className="text-lg font-semibold leading-snug">
                      {loc.location_name}
                    </h3>

                    <address
                      id={`location-address-${i}`}
                      className="mt-3 flex items-start gap-3 text-[0.9375rem] not-italic"
                    >
                      <MapPin size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                      <span>
                        {loc.address}{" "}
                        <a
                          id={`location-map-${i}`}
                          href={mapsSearchUrl(loc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link whitespace-nowrap"
                        >
                          Buka di Google Maps
                        </a>
                      </span>
                    </address>

                    <p id={`location-hours-${i}`} className="mt-3 flex items-start gap-3 text-[0.9375rem]">
                      <Clock size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                      <span>{loc.practice_hours}</span>
                    </p>

                    {hasContact && (
                      <div id={`location-actions-${i}`} className="mt-auto flex flex-wrap gap-2 pt-5">
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

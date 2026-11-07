import { CalendarCheck, ExternalLink, MessageCircle, Phone } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { toWaLink } from '@/lib/cta';
import { describeHours } from '@/lib/schedule';
import { mapsSearchUrl } from '@/lib/seo';
import type { Location } from '@/lib/types';
import ScheduleBoard from './ScheduleBoard';
import ExceptionNotices from './ExceptionNotices';
import SectionHeading from './SectionHeading';

interface LocationsSectionProps {
  locations: Location[];
  globalBookingUrl: string | null;
  locale: Locale;
  dict: Dictionary;
}

export default function LocationsSection({
  locations,
  globalBookingUrl,
  locale,
  dict,
}: LocationsSectionProps) {

  return (
    <section
      id="lokasi"
      aria-labelledby="lokasi-heading"
      className="section-spacing border-t border-border bg-surface px-4 md:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="lokasi-heading"
          title={dict.locations.sectionTitle}
          intro={dict.locations.sectionIntro}
        />

        {locations.length === 0 ? (
          <p id="lokasi-empty" className="py-8 text-text-body">
            {dict.locations.empty}
          </p>
        ) : (
          <>
            <ScheduleBoard locations={locations} locale={locale} labels={dict.schedule} />
            <ExceptionNotices locations={locations} locale={locale} labels={dict.schedule} />
            <ul id="locations-list" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((loc, i) => {
                const effectiveBookingUrl = loc.booking_url_override ?? globalBookingUrl;
                const wa = loc.whatsapp ? toWaLink(loc.whatsapp) : null;
                const hasContact = wa || loc.phone || effectiveBookingUrl;
                const hoursLines = describeHours(loc.slots, loc.note, dict.schedule.daysLong, locale);

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
                          <dt className="text-xs font-medium text-text-muted">{dict.locations.addressLabel}</dt>
                          <dd id={`location-address-${i}`} className="mt-1 text-text-body">
                            <address className="not-italic">{loc.address}</address>
                            <a
                              id={`location-map-${i}`}
                              href={mapsSearchUrl(loc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              {dict.common.openInGoogleMaps}
                              <ExternalLink size={12} aria-hidden="true" />
                            </a>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-text-muted">{dict.locations.hoursLabel}</dt>
                          <dd id={`location-hours-${i}`} className="mt-1 font-semibold tabular-nums text-text-heading">
                            {hoursLines.map((line) => (
                              <span key={line} className="block">
                                {line}
                              </span>
                            ))}
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
                            {dict.common.whatsapp}
                          </a>
                        )}
                        {loc.phone && (
                          <a id={`location-phone-${i}`} href={`tel:${loc.phone}`} className="btn btn-sm btn-secondary">
                            <Phone size={16} aria-hidden="true" />
                            {dict.common.phone}
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
                            {dict.common.booking}
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

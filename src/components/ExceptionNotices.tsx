import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { format } from '@/i18n/format';
import { formatClock, type ScheduleException } from '@/lib/schedule';
import type { Location } from '@/lib/types';

interface ExceptionNoticesProps {
  locations: Location[];
  locale: Locale;
  labels: Dictionary['schedule'];
}

interface Notice {
  key: string;
  exception: ScheduleException;
  locationNames: string[];
}

/**
 * Lists upcoming closures and special hours. Dates are formatted in UTC because they are
 * plain ISO calendar dates, so server and client render identical text (no hydration drift).
 */
export default function ExceptionNotices({ locations, locale, labels }: ExceptionNoticesProps) {
  // A global closure is copied into every location; dedupe so it is listed once.
  const byKey = new Map<string, Notice>();
  locations.forEach((loc) => {
    for (const exception of loc.exceptions) {
      const key = `${exception.start_date}|${exception.end_date}|${exception.closed}|${JSON.stringify(exception.hours)}|${exception.reason ?? ''}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.locationNames.push(loc.location_name);
      } else {
        byKey.set(key, { key, exception, locationNames: [loc.location_name] });
      }
    }
  });
  if (byKey.size === 0) return null;

  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

  return (
    <section aria-labelledby="schedule-changes-heading" className="mb-6 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <h3 id="schedule-changes-heading" className="text-base font-bold text-text-heading">
        {labels.exceptionsTitle}
      </h3>
      <ul className="mt-3 space-y-2 text-sm text-text-body">
        {[...byKey.values()].map(({ key, exception, locationNames }) => {
          const { start_date, end_date, closed, hours, reason } = exception;
          const dates = [...new Set([start_date, end_date])]
            .map((d) => dateFormat.format(new Date(`${d}T00:00:00Z`)))
            .join(' – ');
          const appliesToAll = locations.length > 1 && locationNames.length === locations.length;
          const scope = appliesToAll ? labels.allLocations : locationNames.join(', ');
          const text = closed
            ? format(labels.closedNotice, { dates })
            : format(labels.specialHoursNotice, {
                dates,
                hours: hours.map((h) => `${formatClock(h.opens, locale)}–${formatClock(h.closes, locale)}`).join(', '),
              });
          return (
            <li key={key}>
              <span className="font-semibold text-text-heading">{scope}:</span> {text}
              {reason ? ` (${reason})` : ''}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { CalendarClock, ChevronRight } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { id as idDictionary } from '@/i18n/dictionaries/id';
import { format } from '@/i18n/format';
import { formatClock, getTodayStatus, getWitaClock } from '@/lib/schedule';
import type { Location } from '@/lib/types';
import { useNowMinute } from './useNowMinute';

interface TodayStatusProps {
  locations: Location[];
  locale?: Locale;
  labels?: Dictionary['schedule'];
}

function describe(
  locations: Location[],
  minute: number,
  locale: Locale,
  labels: Dictionary['schedule'],
): { text: string; ongoing: boolean } | null {
  const clock = getWitaClock(new Date(minute * 60_000));
  const status = getTodayStatus(locations, clock);
  if (!status) return null;
  const { slot } = status;
  const range = `${formatClock(slot.opens, locale)}–${formatClock(slot.closes, locale)}`;

  if (status.kind === 'ongoing') {
    return {
      text: format(labels.ongoing, {
        location: slot.locationName,
        closes: formatClock(slot.closes, locale),
      }),
      ongoing: true,
    };
  }

  if (status.kind === 'later-today') {
    return {
      text: format(labels.laterToday, {
        range,
        location: slot.locationName,
      }),
      ongoing: false,
    };
  }

  const dayIndex = (clock.dayIndex + status.daysAhead) % 7;
  const dayName = labels.daysLong[dayIndex];

  if (status.daysAhead === 1) {
    return {
      text: format(labels.nextTomorrow, {
        day: dayName,
        range,
        location: slot.locationName,
      }),
      ongoing: false,
    };
  }

  return {
    text: format(labels.nextUpcoming, {
      day: dayName,
      range,
      location: slot.locationName,
    }),
    ongoing: false,
  };
}

export default function TodayStatus({
  locations,
  locale = 'id',
  labels = idDictionary.schedule,
}: TodayStatusProps) {
  const minute = useNowMinute();
  const info = useMemo(
    () => (minute === null ? null : describe(locations, minute, locale, labels)),
    [locations, minute, locale, labels],
  );

  const hasSchedule = locations.some((l) => l.slots.length > 0 || l.exceptions.length > 0);
  if (!hasSchedule) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-card">
      {info?.ongoing ? (
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center">
          <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary"
        >
          <CalendarClock size={18} />
        </span>
      )}
      <p aria-live="polite" className="min-w-0 flex-1 text-sm font-semibold leading-snug text-text-heading">
        {info ? info.text : labels.viewPracticeSchedule}
      </p>
      <Link
        href="#lokasi"
        className="link inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold sm:text-sm"
      >
        {labels.fullSchedule}
        <ChevronRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}

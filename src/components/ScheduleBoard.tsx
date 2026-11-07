'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { id as idDictionary } from '@/i18n/dictionaries/id';
import { format } from '@/i18n/format';
import { formatClock, getWitaClock } from '@/lib/schedule';
import type { Location } from '@/lib/types';
import { useNowMinute } from './useNowMinute';

interface ScheduleBoardProps {
  locations: Location[];
  locale?: Locale;
  labels?: Dictionary['schedule'];
}

export default function ScheduleBoard({
  locations,
  locale = 'id',
  labels = idDictionary.schedule,
}: ScheduleBoardProps) {
  const minute = useNowMinute();
  const todayIndex =
    minute === null ? null : getWitaClock(new Date(minute * 60_000)).dayIndex;
  const [selectedDayOverride, setSelectedDayOverride] = useState<number | null>(null);
  const activeDay = selectedDayOverride ?? todayIndex ?? 0;

  const hasSlots = locations.some((l) => l.slots.length > 0);
  if (!hasSlots) return null;

  const daysLong = labels.daysLong;
  const daysShort = labels.daysShort;

  const slotsByDay = daysLong.map((_, d) =>
    locations
      .flatMap((loc, locationIndex) =>
        loc.slots
          .filter((s) => s.day === d)
          .map((s) => ({
            key: `${locationIndex}-${s.opens}`,
            locationName: loc.location_name,
            opens: s.opens,
            closes: s.closes,
          })),
      )
      .sort((a, b) => a.opens.localeCompare(b.opens)),
  );
  const activeSlots = slotsByDay[activeDay];

  return (
    <div className="mb-10">
      {/* Mobile / tablet: day tabs */}
      <div className="card-clinical p-4 sm:p-5 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-text-heading">
            <CalendarDays size={18} className="text-primary" aria-hidden="true" />
            {labels.title}
          </h3>
          {todayIndex !== null && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              {format(labels.todayIs, { day: daysLong[todayIndex] })}
            </span>
          )}
        </div>

        <div role="group" aria-label={labels.selectDayAria} className="mt-4 grid grid-cols-7 gap-1.5">
          {daysShort.map((short, d) => {
            const selected = d === activeDay;
            const hasDaySlots = slotsByDay[d].length > 0;
            return (
              <button
                key={short}
                type="button"
                aria-pressed={selected}
                aria-label={daysLong[d]}
                onClick={() => setSelectedDayOverride(d)}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  selected
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-surface text-text-body hover:bg-bg-subtle'
                }`}
              >
                {short}
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${
                    hasDaySlots ? (selected ? 'bg-white' : 'bg-primary') : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl bg-bg p-4" aria-live="polite">
          <div className="flex items-center gap-2">
            <p className="font-bold text-text-heading">{daysLong[activeDay]}</p>
            {todayIndex === activeDay && (
              <span className="chip min-h-7 bg-primary px-2.5 text-xs text-white">
                {labels.today}
              </span>
            )}
          </div>
          <div className="mt-3 space-y-2">
            {activeSlots.length === 0 ? (
              <p className="text-sm text-text-muted">{labels.noRegularSchedule}</p>
            ) : (
              activeSlots.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
                >
                  <span className="rounded-lg bg-primary-tint px-2.5 py-1 text-sm font-bold tabular-nums text-primary">
                    {formatClock(s.opens, locale)}–{formatClock(s.closes, locale)}
                  </span>
                  <span className="min-w-0 text-sm font-semibold text-text-heading">{s.locationName}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Desktop: 7-column timetable */}
      <div className="card-clinical hidden overflow-hidden lg:block">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-bg-subtle/60 px-5 py-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-text-heading">
            <CalendarDays size={18} className="text-primary" aria-hidden="true" />
            {labels.title}
          </h3>
        </div>
        <ol aria-label={labels.scheduleListAria} className="grid grid-cols-7 divide-x divide-border">
          {daysLong.map((label, d) => {
            const daySlots = slotsByDay[d];
            const isToday = todayIndex === d;
            return (
              <li
                key={label}
                aria-current={isToday ? 'date' : undefined}
                className={`flex min-h-40 flex-col ${isToday ? 'bg-primary-tint/35' : ''}`}
              >
                <div className="flex flex-col items-start gap-1 border-b border-border px-3 py-3">
                  <p className="font-bold text-text-heading">{label}</p>
                  {isToday && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[0.6875rem] font-semibold text-white">
                      {labels.today}
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-2 p-2.5">
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-text-muted">{labels.noSchedule}</p>
                  ) : (
                    daySlots.map((s) => (
                      <div
                        key={s.key}
                        className="rounded-xl border border-border bg-surface p-2.5 shadow-2xs"
                      >
                        <p className="text-xs font-bold tabular-nums text-primary">
                          {formatClock(s.opens, locale)}–{formatClock(s.closes, locale)}
                        </p>
                        <p className="mt-1 text-xs leading-snug text-text-body">{s.locationName}</p>
                      </div>
                    ))
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

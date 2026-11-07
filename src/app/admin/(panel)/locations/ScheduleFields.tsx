'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { rangeErrorMessage, type WeeklyRanges } from '@/app/admin/locations/model';
import { Button } from '@/components/admin/Button';
import { CONTROL } from '@/components/admin/Field';
import { id } from '@/i18n/dictionaries/id';
import { MAX_RANGES_PER_DAY, type TimeRange } from '@/lib/schedule';

const DEFAULT_RANGE: TimeRange = { opens: '08:00', closes: '12:00' };

/** Editable "HH:MM – HH:MM" ranges for one day, or for one date exception. Updates are immutable. */
export function RangeList({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TimeRange[];
  onChange: (next: TimeRange[]) => void;
}) {
  function update(index: number, patch: Partial<TimeRange>) {
    onChange(value.map((range, i) => (i === index ? { ...range, ...patch } : range)));
  }

  return (
    <div className="space-y-2">
      {value.map((range, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="time"
            aria-label={`Jam buka ${label} rentang ${index + 1}`}
            value={range.opens}
            onChange={(e) => update(index, { opens: e.target.value })}
            className={`${CONTROL} min-w-0 flex-1 py-2`}
          />
          <span aria-hidden="true" className="text-text-muted">
            –
          </span>
          <input
            type="time"
            aria-label={`Jam tutup ${label} rentang ${index + 1}`}
            value={range.closes}
            onChange={(e) => update(index, { closes: e.target.value })}
            className={`${CONTROL} min-w-0 flex-1 py-2`}
          />
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Hapus rentang ${label} ${index + 1}`}
            title="Hapus rentang"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="secondary"
        disabled={value.length >= MAX_RANGES_PER_DAY}
        onClick={() => onChange([...value, { ...DEFAULT_RANGE }])}
      >
        <Plus size={16} aria-hidden="true" />
        Tambah rentang
      </Button>
    </div>
  );
}

/** Seven-day weekly pattern (Monday first). A day with no ranges means "not practicing". */
export function WeeklyScheduleEditor({
  value,
  onChange,
}: {
  value: WeeklyRanges;
  onChange: (next: WeeklyRanges) => void;
}) {
  const dayNames = id.schedule.daysLong;
  // Day whose ranges are being copied (null = no panel open) and which other days receive them.
  const [copyFrom, setCopyFrom] = useState<number | null>(null);
  const [copyTargets, setCopyTargets] = useState<boolean[]>([]);

  function openCopy(day: number) {
    setCopyFrom(day);
    setCopyTargets(dayNames.map((_, i) => i !== day));
  }

  function applyCopy() {
    if (copyFrom === null) return;
    const source = value[copyFrom];
    onChange(
      value.map((ranges, day) =>
        copyTargets[day] && day !== copyFrom ? source.map((r) => ({ ...r })) : ranges,
      ),
    );
    setCopyFrom(null);
  }

  return (
    <div className="divide-y divide-border">
      {dayNames.map((dayName, day) => {
        const error = rangeErrorMessage(value[day], dayName);
        return (
          <fieldset key={dayName} className="py-3 first:pt-0 last:pb-0">
            <legend className="text-sm font-semibold text-text-heading">{dayName}</legend>
            {value[day].length === 0 && (
              <p className="mb-2 text-xs text-text-muted">Tidak praktik pada hari ini.</p>
            )}
            <RangeList
              label={dayName}
              value={value[day]}
              onChange={(next) => onChange(value.map((ranges, i) => (i === day ? next : ranges)))}
            />
            {error && (
              <p role="alert" className="mt-2 text-xs text-red-700">
                {error}
              </p>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="mt-2"
              disabled={value[day].length === 0}
              onClick={() => openCopy(day)}
            >
              Salin ke…
            </Button>
            {copyFrom === day && (
              <div className="mt-3 rounded-lg border border-border bg-bg p-3">
                <p className="text-xs font-medium text-text-heading">Salin jam {dayName} ke:</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {dayNames.map((targetName, target) =>
                    target === day ? null : (
                      <label key={targetName} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={copyTargets[target]}
                          onChange={(e) =>
                            setCopyTargets((current) =>
                              current.map((on, i) => (i === target ? e.target.checked : on)),
                            )
                          }
                        />
                        {targetName}
                      </label>
                    ),
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={applyCopy}>
                    Terapkan
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setCopyFrom(null)}>
                    Batal
                  </Button>
                </div>
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

"use client";

import { DAY_LABELS, formatClock, getWitaClock, type PracticeSlot } from "@/lib/schedule";
import { useNowMinute } from "./useNowMinute";

interface ScheduleBoardProps {
  slots: PracticeSlot[];
  /** Lokasi yang jamnya tidak bisa di-parse → ditampilkan sebagai teks apa adanya. */
  unparsed: { name: string; hours: string }[];
}

export default function ScheduleBoard({ slots, unparsed }: ScheduleBoardProps) {
  const minute = useNowMinute();
  const todayIndex = minute === null ? null : getWitaClock(new Date(minute * 60_000)).dayIndex;

  if (slots.length === 0 && unparsed.length === 0) return null;

  return (
    <div className="mb-10">
      {slots.length > 0 && (
        <ol aria-label="Jadwal praktik per hari" className="grid gap-3 lg:grid-cols-7">
          {DAY_LABELS.map((label, d) => {
            const daySlots = slots
              .filter((s) => s.days.includes(d))
              .sort((a, b) => a.opens.localeCompare(b.opens));
            const isToday = todayIndex === d;
            return (
              <li
                key={label}
                aria-current={isToday ? "date" : undefined}
                className={`flex gap-4 rounded-xl border p-4 lg:flex-col lg:gap-3 ${
                  isToday ? "border-primary bg-primary-tint" : "border-border bg-surface"
                }`}
              >
                <div className="w-20 shrink-0 lg:w-auto">
                  <p className="font-semibold text-text-heading">{label}</p>
                  {isToday && <span className="chip mt-1 min-h-7 bg-primary px-2.5 text-xs text-white">Hari ini</span>}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {daySlots.length === 0 ? (
                    <p className="text-sm text-text-muted">Tidak ada jadwal</p>
                  ) : (
                    daySlots.map((s) => (
                      <div key={s.locationIndex}>
                        <p className="font-semibold tabular-nums text-text-heading">
                          {formatClock(s.opens)}–{formatClock(s.closes)}
                        </p>
                        <p className="text-sm text-text-muted">{s.locationName}</p>
                      </div>
                    ))
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {unparsed.map((u) => (
        <p key={u.name} className="mt-3 text-sm">
          Jadwal {u.name}: {u.hours}
        </p>
      ))}
    </div>
  );
}

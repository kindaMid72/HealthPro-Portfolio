"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarClock, ChevronRight } from "lucide-react";
import { DAY_LABELS, formatClock, getTodayStatus, getWitaClock, type PracticeSlot } from "@/lib/schedule";
import { useNowMinute } from "./useNowMinute";

function describe(slots: PracticeSlot[], minute: number): { text: string; ongoing: boolean } | null {
  const clock = getWitaClock(new Date(minute * 60_000));
  const status = getTodayStatus(slots, clock);
  if (!status) return null;
  const { slot } = status;
  const range = `${formatClock(slot.opens)}–${formatClock(slot.closes)}`;
  if (status.kind === "ongoing") {
    return { text: `Sedang praktik di ${slot.locationName} sampai pukul ${formatClock(slot.closes)}`, ongoing: true };
  }
  if (status.kind === "later-today") {
    return { text: `Hari ini praktik pukul ${range} di ${slot.locationName}`, ongoing: false };
  }
  const dayIndex = (clock.dayIndex + status.daysAhead) % 7;
  const day = status.daysAhead === 1 ? `Besok (${DAY_LABELS[dayIndex]})` : DAY_LABELS[dayIndex];
  return { text: `Jadwal berikutnya: ${day}, pukul ${range} di ${slot.locationName}`, ongoing: false };
}

export default function TodayStatus({ slots }: { slots: PracticeSlot[] }) {
  const minute = useNowMinute();
  const info = useMemo(() => (minute === null ? null : describe(slots, minute)), [slots, minute]);

  if (slots.length === 0) return null;

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
        {info ? info.text : "Lihat jadwal praktik"}
      </p>
      <Link
        href="#lokasi"
        className="link inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold sm:text-sm"
      >
        Jadwal lengkap
        <ChevronRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}

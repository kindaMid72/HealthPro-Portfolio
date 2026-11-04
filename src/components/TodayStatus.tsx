"use client";

import Link from "next/link";
import { useMemo } from "react";
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
    <div className="min-h-[4.5rem] rounded-xl bg-primary-tint p-4">
      <p aria-live="polite" className="flex items-start gap-2.5 text-[0.9375rem] font-semibold text-text-heading">
        {info ? (
          <>
            <span
              aria-hidden="true"
              className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${info.ongoing ? "bg-primary" : "border-2 border-primary"}`}
            />
            <span>{info.text}</span>
          </>
        ) : null}
      </p>
      <Link href="#lokasi" className="link mt-1 inline-block text-sm">
        {info ? "Lihat jadwal lengkap" : "Lihat jadwal praktik"}
      </Link>
    </div>
  );
}

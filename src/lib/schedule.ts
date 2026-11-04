/**
 * lib/schedule.ts
 * Parsing jam praktik ("Senin–Sabtu, 17.00–21.00") + penentuan status "praktik hari ini".
 * Murni & aman dipakai di client (hanya impor type).
 */

import type { Location } from "./types";

/** Index 0 = Senin */
export const DAY_LABELS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"] as const;

const DAY_INDEX: Record<string, number> = {
  senin: 0,
  selasa: 1,
  rabu: 2,
  kamis: 3,
  jumat: 4,
  "jum'at": 4,
  sabtu: 5,
  minggu: 6,
};

export interface ParsedHours {
  days: number[];
  opens: string;
  closes: string;
}

export interface PracticeSlot extends ParsedHours {
  locationIndex: number;
  locationName: string;
}

/**
 * Parse "Senin–Sabtu, 17.00–21.00" atau "Senin, Rabu, Sabtu, 13.00–15.00".
 * Rentang hari dengan "–"/"-"/"s/d", daftar hari dengan koma/"dan".
 * Gagal parse → null (tidak menebak).
 */
export function parsePracticeHours(text: string): ParsedHours | null {
  const time = text.match(/(\d{1,2})[.:](\d{2})\s*(?:–|-|—|s\/d|sampai)\s*(\d{1,2})[.:](\d{2})/i);
  if (!time) return null;
  const pad = (h: string, m: string) => `${h.padStart(2, "0")}:${m}`;
  const opens = pad(time[1], time[2]);
  const closes = pad(time[3], time[4]);
  // Jam lewat tengah malam tidak dimodelkan.
  if (closes <= opens) return null;
  // Lebih dari satu rentang jam / hari berbeda per jam ("08.00–12.00 dan 16.00–20.00") tidak dimodelkan:
  // lebih baik tampil sebagai teks apa adanya daripada status "praktik" yang salah.
  const rest = text.slice(time.index! + time[0].length).toLowerCase();
  if (/\d{1,2}[.:]\d{2}/.test(rest) || /\b(senin|selasa|rabu|kamis|jum'?at|sabtu|minggu)\b/.test(rest)) return null;

  const dayPart = text.slice(0, time.index).toLowerCase();
  const days = new Set<number>();

  const range = dayPart.match(/([a-z']+)\s*(?:–|-|—|s\/d|sampai)\s*([a-z']+)/);
  if (range && range[1] in DAY_INDEX && range[2] in DAY_INDEX) {
    for (let i = DAY_INDEX[range[1]]; i <= DAY_INDEX[range[2]]; i++) days.add(i);
  } else {
    for (const token of dayPart.split(/[^a-z']+/)) {
      if (token in DAY_INDEX) days.add(DAY_INDEX[token]);
    }
  }
  if (days.size === 0) return null;

  return { days: [...days].sort((a, b) => a - b), opens, closes };
}

/** Lokasi dengan jam yang tidak bisa di-parse dilewati. */
export function buildPracticeSlots(locations: Location[]): PracticeSlot[] {
  const slots: PracticeSlot[] = [];
  locations.forEach((l, locationIndex) => {
    const parsed = parsePracticeHours(l.practice_hours);
    if (parsed) slots.push({ ...parsed, locationIndex, locationName: l.location_name });
  });
  return slots;
}

const WEEKDAY_TO_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

const wita = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Makassar",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Hari & menit-sejak-tengah-malam di WITA (zona praktik), apa pun zona perangkat. */
export function getWitaClock(date: Date): { dayIndex: number; minutes: number } {
  const parts = wita.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    dayIndex: WEEKDAY_TO_INDEX[get("weekday")] ?? 0,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export type TodayStatus =
  | { kind: "ongoing"; slot: PracticeSlot }
  | { kind: "later-today"; slot: PracticeSlot }
  | { kind: "next"; slot: PracticeSlot; daysAhead: number };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function getTodayStatus(
  slots: PracticeSlot[],
  clock: { dayIndex: number; minutes: number },
): TodayStatus | null {
  if (slots.length === 0) return null;
  const byOpens = (a: PracticeSlot, b: PracticeSlot) => toMinutes(a.opens) - toMinutes(b.opens);
  const today = slots.filter((s) => s.days.includes(clock.dayIndex)).sort(byOpens);

  const ongoing = today.find((s) => toMinutes(s.opens) <= clock.minutes && clock.minutes < toMinutes(s.closes));
  if (ongoing) return { kind: "ongoing", slot: ongoing };

  const later = today.find((s) => toMinutes(s.opens) > clock.minutes);
  if (later) return { kind: "later-today", slot: later };

  for (let d = 1; d <= 7; d++) {
    const day = (clock.dayIndex + d) % 7;
    const next = slots.filter((s) => s.days.includes(day)).sort(byOpens)[0];
    if (next) return { kind: "next", slot: next, daysAhead: d };
  }
  return null;
}

/** "17:00" → "17.00" (format penulisan Indonesia) */
export function formatClock(hhmm: string): string {
  return hhmm.replace(":", ".");
}

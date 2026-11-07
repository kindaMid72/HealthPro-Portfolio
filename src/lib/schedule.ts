/**
 * lib/schedule.ts
 * Structured practice schedule: weekly per-day time ranges, date exceptions, and the
 * "practice today" status. Pure & safe for client-side use (type-only imports).
 * All calendar logic works on ISO dates (YYYY-MM-DD) in WITA, never on device time zone.
 */

import type { Locale } from "@/i18n/config";

export interface TimeRange {
  opens: string;
  closes: string;
}

export interface DaySlot extends TimeRange {
  /** 0 = Monday … 6 = Sunday */
  day: number;
}

export interface ScheduleException {
  start_date: string;
  end_date: string;
  closed: boolean;
  hours: TimeRange[];
  reason?: string;
}

export interface ScheduleLocation {
  location_name: string;
  slots: DaySlot[];
  exceptions: ScheduleException[];
}

export interface ResolvedSlot extends TimeRange {
  locationIndex: number;
  locationName: string;
  /** True when the time comes from a date exception instead of the weekly pattern. */
  special: boolean;
}

export interface ResolvedClosure {
  locationIndex: number;
  locationName: string;
  reason?: string;
}

export interface ResolvedDay {
  isoDate: string;
  dayIndex: number;
  slots: ResolvedSlot[];
  closures: ResolvedClosure[];
}

export interface WitaClock {
  dayIndex: number;
  minutes: number;
  isoDate: string;
}

const wita = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Makassar",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const WEEKDAY_TO_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

/** Day, minutes-since-midnight and ISO date in WITA (practice time zone), regardless of device time zone. */
export function getWitaClock(date: Date): WitaClock {
  const parts = wita.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    dayIndex: WEEKDAY_TO_INDEX[get("weekday")] ?? 0,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    isoDate: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

/** Pure calendar arithmetic on ISO dates; no local time zone involved. */
export function addDays(isoDate: string, n: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** 0 = Monday … 6 = Sunday for an ISO date. */
export function dayIndexOf(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const jsDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday
  return (jsDay + 6) % 7;
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Effective schedule for one calendar date. Per location: an active closure wins over
 * special hours, special hours win over the weekly pattern.
 */
export function resolveDay(locations: ScheduleLocation[], isoDate: string): ResolvedDay {
  const dayIndex = dayIndexOf(isoDate);
  const slots: ResolvedSlot[] = [];
  const closures: ResolvedClosure[] = [];

  locations.forEach((loc, locationIndex) => {
    const active = loc.exceptions.filter((e) => e.start_date <= isoDate && isoDate <= e.end_date);

    const closed = active.find((e) => e.closed);
    if (closed) {
      closures.push({ locationIndex, locationName: loc.location_name, reason: closed.reason || undefined });
      return;
    }

    const specialRanges = active.flatMap((e) => e.hours);
    const ranges: { opens: string; closes: string; special: boolean }[] =
      active.some((e) => e.hours.length > 0)
        ? specialRanges.map((r) => ({ ...r, special: true }))
        : loc.slots.filter((s) => s.day === dayIndex).map((s) => ({ ...s, special: false }));

    for (const r of ranges) {
      slots.push({ locationIndex, locationName: loc.location_name, opens: r.opens, closes: r.closes, special: r.special });
    }
  });

  slots.sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens) || a.locationIndex - b.locationIndex);
  return { isoDate, dayIndex, slots, closures };
}

export type TodayStatus =
  | { kind: "ongoing"; slot: ResolvedSlot }
  | { kind: "later-today"; slot: ResolvedSlot }
  | { kind: "next"; slot: ResolvedSlot; daysAhead: number };

/** How far ahead to look for the next practice day (covers a full two-month closure window). */
const MAX_LOOKAHEAD_DAYS = 60;

export function getTodayStatus(locations: ScheduleLocation[], clock: WitaClock): TodayStatus | null {
  const today = resolveDay(locations, clock.isoDate).slots;

  const ongoing = today.find((s) => toMinutes(s.opens) <= clock.minutes && clock.minutes < toMinutes(s.closes));
  if (ongoing) return { kind: "ongoing", slot: ongoing };

  const later = today.find((s) => toMinutes(s.opens) > clock.minutes);
  if (later) return { kind: "later-today", slot: later };

  for (let d = 1; d <= MAX_LOOKAHEAD_DAYS; d++) {
    const next = resolveDay(locations, addDays(clock.isoDate, d)).slots[0];
    if (next) return { kind: "next", slot: next, daysAhead: d };
  }
  return null;
}

/** Consecutive day indexes → "Senin–Rabu, Jumat" (runs of 3+ collapse to a range). */
function formatDayRuns(days: number[], dayNames: readonly string[]): string {
  const parts: string[] = [];
  let runStart = 0;
  for (let i = 1; i <= days.length; i++) {
    const endsRun = i === days.length || days[i] !== days[i - 1] + 1;
    if (!endsRun) continue;
    const run = days.slice(runStart, i);
    if (run.length >= 3) parts.push(`${dayNames[run[0]]}–${dayNames[run[run.length - 1]]}`);
    else for (const d of run) parts.push(dayNames[d]);
    runStart = i;
  }
  return parts.join(", ");
}

/**
 * Human-readable weekly summary. Days sharing identical ranges are grouped:
 * ["Senin–Sabtu: 09.00–11.00, 17.00–21.00"]. Groups ordered by first day.
 */
export function summarizeWeekly(slots: DaySlot[], dayNames: readonly string[], locale: Locale): string[] {
  if (slots.length === 0) return [];

  const rangesByDay = new Map<number, TimeRange[]>();
  for (const s of slots) {
    const list = rangesByDay.get(s.day) ?? [];
    list.push({ opens: s.opens, closes: s.closes });
    rangesByDay.set(s.day, list);
  }

  const groups = new Map<string, { ranges: TimeRange[]; days: number[] }>();
  for (let day = 0; day <= 6; day++) {
    const list = rangesByDay.get(day);
    if (!list) continue;
    const ranges = [...list].sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens));
    const key = ranges.map((r) => `${r.opens}-${r.closes}`).join("|");
    const group = groups.get(key) ?? { ranges, days: [] };
    group.days.push(day);
    groups.set(key, group);
  }

  return [...groups.values()].map(
    (g) =>
      `${formatDayRuns(g.days, dayNames)}: ${g.ranges
        .map((r) => `${formatClock(r.opens, locale)}–${formatClock(r.closes, locale)}`)
        .join(", ")}`,
  );
}

export type RangeError = "invalid" | "order" | "overlap" | "too-many";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_RANGES_PER_DAY = 4;

/** Validates one day's ranges. Touching ranges (closes === next opens) are allowed. */
export function validateRanges(ranges: TimeRange[]): RangeError | null {
  if (ranges.length > MAX_RANGES_PER_DAY) return "too-many";
  for (const r of ranges) {
    if (!HHMM.test(r.opens) || !HHMM.test(r.closes)) return "invalid";
    if (toMinutes(r.closes) <= toMinutes(r.opens)) return "order";
  }
  const sorted = ranges.map((r) => ({ opens: toMinutes(r.opens), closes: toMinutes(r.closes) })).sort((a, b) => a.opens - b.opens);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].opens < sorted[i - 1].closes) return "overlap";
  }
  return null;
}

/** "17:00" → "17.00" (id) or "17:00" (en) */
export function formatClock(hhmm: string, locale: Locale = 'id'): string {
  if (locale === 'en') {
    return hhmm.replace('.', ':');
  }
  return hhmm.replace(':', '.');
}

/** Minutes since midnight → "HH:MM" (storage format for weekly slots and exceptions). */
export function minutesToHhmm(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Display lines for a location's hours: weekly summary followed by the free-text note. */
export function describeHours(slots: DaySlot[], note: string, dayNames: readonly string[], locale: Locale): string[] {
  const lines = summarizeWeekly(slots, dayNames, locale);
  if (note) lines.push(note);
  return lines;
}

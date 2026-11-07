/**
 * Legacy free-text practice-hours parser ("Senin–Sabtu, 09:00-11:00 & 17.00-21.00").
 * Used ONLY by one-off backfill and seed scripts to convert the old `practice_hours` text
 * into structured `location_slots`. Never guesses: returns null whenever the text cannot be
 * mapped to one identical set of ranges for every listed day.
 */

export interface LegacyRange {
  opens: string;
  closes: string;
}

export interface LegacyHours {
  /** 0 = Monday … 6 = Sunday */
  days: number[];
  ranges: LegacyRange[];
}

/** Index 0 = Monday */
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

const TIME_PATTERN = /(\d{1,2})[.:](\d{2})\s*(?:–|-|—|s\/d|sampai)\s*(\d{1,2})[.:](\d{2})/gi;
const DAY_WORD = /\b(senin|selasa|rabu|kamis|jum'?at|sabtu|minggu)\b/i;
const RANGE_SEPARATORS = /&|\bdan\b|,/gi;

const pad = (h: string, m: string) => `${h.padStart(2, "0")}:${m}`;

export function parseLegacyHours(text: string): LegacyHours | null {
  const times = [...text.matchAll(TIME_PATTERN)];
  if (times.length === 0) return null;

  // Text after the first time may only hold more time ranges and separators.
  // Any weekday word there means different hours per day ("Senin 08.00-10.00, Selasa 13.00-15.00").
  const afterFirst = text.slice(times[0].index!);
  const leftover = afterFirst.replace(TIME_PATTERN, " ").replace(RANGE_SEPARATORS, " ");
  if (/\d/.test(leftover) || DAY_WORD.test(leftover)) return null;

  const ranges: LegacyRange[] = [];
  for (const t of times) {
    if (Number(t[1]) > 23 || Number(t[3]) > 23 || Number(t[2]) > 59 || Number(t[4]) > 59) return null;
    const opens = pad(t[1], t[2]);
    const closes = pad(t[3], t[4]);
    // Past-midnight hours are not modeled.
    if (closes <= opens) return null;
    ranges.push({ opens, closes });
  }
  ranges.sort((a, b) => (a.opens < b.opens ? -1 : a.opens > b.opens ? 1 : 0));
  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i].opens < ranges[i - 1].closes) return null;
  }

  const dayPart = text.slice(0, times[0].index!).toLowerCase();
  const days = new Set<number>();
  const dayRange = dayPart.match(/([a-z']+)\s*(?:–|-|—|s\/d|sampai)\s*([a-z']+)/);
  if (dayRange && dayRange[1] in DAY_INDEX && dayRange[2] in DAY_INDEX) {
    for (let i = DAY_INDEX[dayRange[1]]; i <= DAY_INDEX[dayRange[2]]; i++) days.add(i);
  } else {
    for (const token of dayPart.split(/[^a-z']+/)) {
      if (token in DAY_INDEX) days.add(DAY_INDEX[token]);
    }
  }
  if (days.size === 0) return null;

  return { days: [...days].sort((a, b) => a - b), ranges };
}

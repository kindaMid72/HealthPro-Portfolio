/**
 * Shared types and pure helpers for the admin locations screens. Imported by server actions,
 * the server loader and client components, so this file must not touch the database.
 */
import { INTL_LOCALE } from '@/i18n/config';
import { id } from '@/i18n/dictionaries/id';
import { MAX_RANGES_PER_DAY, type RangeError as RangeErrorCode, type TimeRange, validateRanges } from '@/lib/schedule';

export const DAY_COUNT = 7;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Weekly ranges indexed by day (0 = Monday). An empty array means closed that day. */
export type WeeklyRanges = TimeRange[][];

export function emptyWeek(): WeeklyRanges {
  return Array.from({ length: DAY_COUNT }, () => []);
}

export interface LocationEnglish {
  locationName: string;
  address: string;
  scheduleNote: string;
}

export interface LocationItem {
  id: string;
  sortOrder: number;
  locationName: string;
  address: string;
  scheduleNote: string;
  whatsapp: string;
  phone: string;
  bookingUrlOverride: string;
  weekly: WeeklyRanges;
  en: LocationEnglish;
}

/** Form state for one location. `id` is undefined while creating. */
export interface LocationDraft {
  id?: string;
  locationName: string;
  address: string;
  scheduleNote: string;
  whatsapp: string;
  phone: string;
  bookingUrlOverride: string;
  en: LocationEnglish;
  weekly: WeeklyRanges;
}

export function emptyLocationDraft(): LocationDraft {
  return {
    locationName: '',
    address: '',
    scheduleNote: '',
    whatsapp: '',
    phone: '',
    bookingUrlOverride: '',
    en: { locationName: '', address: '', scheduleNote: '' },
    weekly: emptyWeek(),
  };
}

export function locationToDraft(loc: LocationItem): LocationDraft {
  return {
    id: loc.id,
    locationName: loc.locationName,
    address: loc.address,
    scheduleNote: loc.scheduleNote,
    whatsapp: loc.whatsapp,
    phone: loc.phone,
    bookingUrlOverride: loc.bookingUrlOverride,
    en: { ...loc.en },
    weekly: loc.weekly.map((ranges) => [...ranges]),
  };
}

export interface ExceptionItem {
  id: string;
  /** null = all locations (closures only). */
  locationId: string | null;
  startDate: string;
  endDate: string;
  closed: boolean;
  hours: TimeRange[];
  reason: string;
  reasonEn: string;
}

/** Form state for one date exception. `locationId: null` means all locations (closure only). */
export interface ExceptionDraft {
  id?: string;
  locationId: string | null;
  startDate: string;
  endDate: string;
  closed: boolean;
  hours: TimeRange[];
  reason: string;
  reasonEn: string;
}

export function emptyExceptionDraft(): ExceptionDraft {
  return {
    locationId: null,
    startDate: '',
    endDate: '',
    closed: true,
    hours: [],
    reason: '',
    reasonEn: '',
  };
}

export function exceptionToDraft(item: ExceptionItem): ExceptionDraft {
  return {
    id: item.id,
    locationId: item.locationId,
    startDate: item.startDate,
    endDate: item.endDate,
    closed: item.closed,
    hours: item.hours.map((r) => ({ ...r })),
    reason: item.reason,
    reasonEn: item.reasonEn,
  };
}

const RANGE_ERROR_MESSAGES: Record<RangeErrorCode, (scope: string) => string> = {
  invalid: () => 'Format jam tidak valid (HH:MM).',
  order: () => 'Jam tutup harus setelah jam buka.',
  overlap: (scope) => `Rentang jam ${scope} saling tumpang tindih.`,
  'too-many': () => `Maksimal ${MAX_RANGES_PER_DAY} rentang jam per hari.`,
};

/**
 * Indonesian message for the first problem in one set of ranges, or null when valid.
 * `scope` completes "Rentang jam … saling tumpang tindih".
 */
export function rangeErrorMessage(ranges: TimeRange[], scope: string): string | null {
  const code = validateRanges(ranges);
  return code ? RANGE_ERROR_MESSAGES[code](scope) : null;
}

export function weeklyDraftError(week: WeeklyRanges): string | null {
  for (let day = 0; day < DAY_COUNT; day++) {
    const error = rangeErrorMessage(week[day], id.schedule.daysLong[day]);
    if (error) return error;
  }
  return null;
}

export function hasWeeklySlots(week: WeeklyRanges): boolean {
  return week.some((ranges) => ranges.length > 0);
}

export function locationDraftError(draft: LocationDraft): string | null {
  if (!draft.locationName.trim() || !draft.address.trim()) {
    return 'Nama lokasi dan alamat wajib diisi.';
  }
  if (!hasWeeklySlots(draft.weekly) && !draft.scheduleNote.trim()) {
    return 'Isi jam praktik per hari, atau isi catatan jadwal jika jadwalnya tidak tetap.';
  }
  return weeklyDraftError(draft.weekly);
}

export function exceptionDraftError(draft: ExceptionDraft): string | null {
  if (!ISO_DATE.test(draft.startDate) || !ISO_DATE.test(draft.endDate)) {
    return 'Tanggal mulai dan tanggal selesai wajib diisi.';
  }
  if (draft.endDate < draft.startDate) {
    return 'Tanggal selesai tidak boleh sebelum tanggal mulai.';
  }
  if (draft.locationId === null && !draft.closed) {
    return 'Pengecualian untuk semua lokasi hanya bisa berupa libur.';
  }
  if (!draft.reason.trim()) {
    return 'Keterangan (Bahasa Indonesia) wajib diisi; keterangan ini tampil di website.';
  }
  if (!draft.closed) {
    if (draft.hours.length === 0) return 'Isi minimal satu rentang jam, atau pilih libur.';
    return rangeErrorMessage(draft.hours, 'pada tanggal ini');
  }
  return null;
}

/** "2026-05-17" → "17 Mei 2026" (UTC, so the result never depends on the admin's device time zone). */
export function formatDateId(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(INTL_LOCALE.id, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * lib/format.ts — formatting helper tanggal dan teks (WITA / Asia/Makassar).
 */

const ID_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'long',
  timeZone: 'Asia/Makassar',
});

const ID_SHORT_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Makassar',
});

export function formatDateId(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return ID_FORMATTER.format(d);
}

export function formatDateShortId(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return ID_SHORT_FORMATTER.format(d);
}

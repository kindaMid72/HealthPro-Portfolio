import { INTL_LOCALE, type Locale } from '@/i18n/config';

export function formatDate(date: Date | string | number, locale: Locale = 'id'): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    dateStyle: 'long',
    timeZone: 'Asia/Makassar',
  }).format(d);
}

export function formatDateShort(date: Date | string | number, locale: Locale = 'id'): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Makassar',
  }).format(d);
}

/** Format phone number to Indonesian format (+62 811-5553-556); return unformatted if unrecognized. */
export function formatPhoneId(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const national = digits.startsWith('62') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : null;
  if (!national || national.length < 9) return raw;
  const rest = national.slice(7);
  return `+62 ${national.slice(0, 3)}-${national.slice(3, 7)}${rest ? `-${rest}` : ''}`;
}

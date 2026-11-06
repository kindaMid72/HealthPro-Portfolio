export const LOCALES = ['id', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'id';

export function hasLocale(v: string | undefined): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v);
}

export const INTL_LOCALE: Record<Locale, string> = {
  id: 'id-ID',
  en: 'en-GB',
};

export const OG_LOCALE: Record<Locale, string> = {
  id: 'id_ID',
  en: 'en_US',
};

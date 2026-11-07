import { getSiteUrl } from '@/lib/seo';
import type { Locale } from './config';

/**
 * Convert internal path to localized path:
 * - 'id': path unchanged (unprefixed URL)
 * - 'en': '/en' + path (except '/' -> '/en', '/#x' -> '/en#x', '/?x' -> '/en?x')
 */
export function localePath(locale: Locale, path: string): string {
  if (locale === 'id') {
    return path;
  }

  const clean = path.trim();
  if (clean === '' || clean === '/') {
    return '/en';
  }

  if (clean.startsWith('/#') || clean.startsWith('/?')) {
    return `/en${clean.slice(1)}`;
  }

  if (clean.startsWith('#') || clean.startsWith('?')) {
    return `/en${clean}`;
  }

  return clean.startsWith('/') ? `/en${clean}` : `/en/${clean}`;
}

/**
 * Localized absolute URL using getSiteUrl() from lib/seo.
 */
export function absoluteUrl(locale: Locale, path: string): string {
  const base = getSiteUrl();
  const localized = localePath(locale, path);
  if (!localized || localized === '/') {
    return base;
  }
  return `${base}${localized.startsWith('/') ? localized : `/${localized}`}`;
}

/**
 * Strip /en or /id prefix from pathname (e.g. /en/artikel -> /artikel, /en -> /).
 */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/en' || pathname === '/id') {
    return '/';
  }
  if (pathname.startsWith('/en/')) {
    return pathname.slice(3);
  }
  if (pathname.startsWith('/id/')) {
    return pathname.slice(3);
  }
  return pathname;
}

export interface BuildAlternatesParams {
  locale: Locale;
  path: string;
  enAvailable: boolean;
}

/**
 * Alternates metadata (canonical & hreflang):
 * - enAvailable true: languages { id, en, 'x-default' }
 * - enAvailable false: languages { id, 'x-default' }
 * - locale === 'en' && !enAvailable: canonical points to Indonesian version URL
 */
export function buildAlternates({
  locale,
  path,
  enAvailable,
}: BuildAlternatesParams): {
  canonical: string;
  languages: Record<string, string>;
} {
  const idUrl = absoluteUrl('id', path);
  const enUrl = absoluteUrl('en', path);

  const canonical = locale === 'en' && !enAvailable ? idUrl : absoluteUrl(locale, path);

  const languages: Record<string, string> = enAvailable
    ? {
        id: idUrl,
        en: enUrl,
        'x-default': idUrl,
      }
    : {
        id: idUrl,
        'x-default': idUrl,
      };

  return { canonical, languages };
}

import { INTL_LOCALE, type Locale } from './config';

/**
 * Format string dengan placeholder `{key}`.
 */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in vars ? String(vars[key]) : match;
  });
}

/**
 * Pluralisasi berbasis Intl.PluralRules.
 */
export function plural(
  entry: { one: string; other: string },
  n: number,
  vars: Record<string, string | number> = { count: n },
  locale: Locale = 'id',
): string {
  const pr = new Intl.PluralRules(INTL_LOCALE[locale]);
  const rule = pr.select(n);
  const template = rule === 'one' ? entry.one : entry.other;
  return format(template, { count: n, ...vars });
}

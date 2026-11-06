import { type ArticleCategory, isValidArticleCategory } from './types';

export const ARTICLE_SORT_VALUES = ['tanggal', 'populer', 'judul', 'baca'] as const;
export type ArticleSort = (typeof ARTICLE_SORT_VALUES)[number];

export const ARTICLE_ORDER_VALUES = ['desc', 'asc'] as const;
export type ArticleOrder = (typeof ARTICLE_ORDER_VALUES)[number];

export const READING_TIME_VALUES = ['singkat', 'sedang', 'panjang'] as const;
export type ReadingTimeBucket = (typeof READING_TIME_VALUES)[number];

export const READING_TIME_RANGES: Record<ReadingTimeBucket, { min?: number; max?: number }> = {
  singkat: { max: 3 },
  sedang: { min: 4, max: 7 },
  panjang: { min: 8 },
};

export const PER_PAGE_OPTIONS = [9, 18, 36] as const;
export type PerPage = (typeof PER_PAGE_OPTIONS)[number];

export const DEFAULT_SORT: ArticleSort = 'tanggal';
export const DEFAULT_PER_PAGE: PerPage = 9;
export const MAX_QUERY_LENGTH = 100;

export function defaultOrderFor(sort: ArticleSort): ArticleOrder {
  return sort === 'judul' || sort === 'baca' ? 'asc' : 'desc';
}

export interface ArticleListFilters {
  category?: ArticleCategory;
  query?: string;
  sort: ArticleSort;
  order: ArticleOrder;
  reading?: ReadingTimeBucket;
  /** 'YYYY-MM-DD', inclusive, Asia/Makassar days. */
  from?: string;
  /** 'YYYY-MM-DD', inclusive, Asia/Makassar days. */
  to?: string;
  perPage: PerPage;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

const URL_KEYS = ['kategori', 'q', 'urut', 'arah', 'waktu', 'dari', 'sampai', 'per'] as const;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isOneOf<T extends string | number>(values: readonly T[], value: unknown): value is T {
  return (values as readonly unknown[]).includes(value);
}

function parseDay(value: string | undefined): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10) === value ? value : undefined;
}

export function parseArticleFilters(raw: RawSearchParams): ArticleListFilters {
  const categoryRaw = first(raw.kategori);
  const category = isValidArticleCategory(categoryRaw) ? categoryRaw : undefined;

  const query = first(raw.q)?.trim().slice(0, MAX_QUERY_LENGTH).trim() || undefined;

  const urutRaw = first(raw.urut);
  const sort: ArticleSort = isOneOf(ARTICLE_SORT_VALUES, urutRaw) ? urutRaw : DEFAULT_SORT;

  const arahRaw = first(raw.arah);
  const order: ArticleOrder = isOneOf(ARTICLE_ORDER_VALUES, arahRaw)
    ? arahRaw
    : defaultOrderFor(sort);

  const waktuRaw = first(raw.waktu);
  const reading = isOneOf(READING_TIME_VALUES, waktuRaw) ? waktuRaw : undefined;

  let from = parseDay(first(raw.dari));
  let to = parseDay(first(raw.sampai));
  if (from && to && from > to) {
    [from, to] = [to, from];
  }

  const perRaw = Number(first(raw.per));
  const perPage: PerPage = isOneOf(PER_PAGE_OPTIONS, perRaw) ? perRaw : DEFAULT_PER_PAGE;

  return { category, query, sort, order, reading, from, to, perPage };
}

export function toSearchParams(f: ArticleListFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.category) params.set('kategori', f.category);
  if (f.query) params.set('q', f.query);
  if (f.sort !== DEFAULT_SORT) params.set('urut', f.sort);
  if (f.order !== defaultOrderFor(f.sort)) params.set('arah', f.order);
  if (f.reading) params.set('waktu', f.reading);
  if (f.from) params.set('dari', f.from);
  if (f.to) params.set('sampai', f.to);
  if (f.perPage !== DEFAULT_PER_PAGE) params.set('per', String(f.perPage));
  return params;
}

export function hasActiveFilters(f: ArticleListFilters): boolean {
  return toSearchParams(f).size > 0;
}

/**
 * True when the raw URL is not the canonical form of the parsed filters:
 * repeated keys, invalid/empty/default-valued known keys, or swapped dates.
 * Unknown keys (e.g. utm_*) are ignored.
 */
export function needsCanonicalRedirect(raw: RawSearchParams, f: ArticleListFilters): boolean {
  const rawMap = new Map<string, string>();
  for (const key of URL_KEYS) {
    const value = raw[key];
    if (value === undefined) continue;
    if (Array.isArray(value)) return true;
    rawMap.set(key, value);
  }

  const canonical = new Map(toSearchParams(f));
  if (rawMap.size !== canonical.size) return true;
  for (const [key, value] of canonical) {
    if (rawMap.get(key) !== value) return true;
  }
  return false;
}

export function buildArticleListHref(basePath: string, f: ArticleListFilters, page = 1): string {
  const path = page <= 1 ? basePath : `${basePath}/halaman/${page}`;
  const qs = toSearchParams(f).toString();
  return qs ? `${path}?${qs}` : path;
}

/** Canonical page number from a `[page]` route segment; null when not a canonical positive integer. */
export function parseArticlePageParam(raw: string): number | null {
  return /^[1-9]\d{0,5}$/.test(raw) ? Number(raw) : null;
}

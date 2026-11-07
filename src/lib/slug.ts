/** Pure URL slug (safe for client and server). Empty result means input had no a-z0-9 characters. */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/** Unique slugs for in-memory name list: first occurrence = base, subsequent = `-2`, `-3`, etc. */
export function uniqueSlugs(names: string[], fallback = 'layanan'): string[] {
  const used = new Map<string, number>();
  return names.map((name) => {
    const base = toSlug(name) || fallback;
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}

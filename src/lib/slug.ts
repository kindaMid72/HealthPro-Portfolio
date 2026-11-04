/** Slug URL murni (aman dipakai di client dan server). Hasil kosong berarti input tak punya karakter a-z0-9. */
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

/** Slug unik untuk daftar nama di memori: pemakaian pertama = dasar, berikutnya `-2`, `-3`, … */
export function uniqueSlugs(names: string[], fallback = 'layanan'): string[] {
  const used = new Map<string, number>();
  return names.map((name) => {
    const base = toSlug(name) || fallback;
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}

/**
 * Is service short description eligible for public display? Legacy placeholders ("jadi otoskopi itu...") or
 * [BELUM DIISI] are hidden per 02-content-data.md rules (empty fields → hide).
 */
export function isProperServiceDescription(desc: string): boolean {
  const d = desc.trim();
  return d.length >= 20 && !d.includes('[BELUM DIISI]') && !/^jadi\s+.*\s+itu\.{2,}$/i.test(d);
}

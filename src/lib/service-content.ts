/**
 * Deskripsi singkat layanan layak tampil publik? Placeholder lama ("jadi otoskopi itu...") atau
 * [BELUM DIISI] disembunyikan sesuai aturan 02-content-data.md (field kosong → sembunyikan).
 */
export function isProperServiceDescription(desc: string): boolean {
  const d = desc.trim();
  return d.length >= 20 && !d.includes('[BELUM DIISI]') && !/^jadi\s+.*\s+itu\.{2,}$/i.test(d);
}

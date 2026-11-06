import { isIP } from 'node:net';

// Hanya mengembalikan alamat IP valid. Nilai '*' (bucket gabungan login-throttle)
// dan header palsu tidak pernah lolos sebagai IP klien.
export function getClientIp(h: Headers): string {
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  const candidate = forwarded || h.get('x-real-ip')?.trim();
  return candidate && isIP(candidate) !== 0 ? candidate : 'unknown';
}

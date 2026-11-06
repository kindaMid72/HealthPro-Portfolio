import { createHmac } from 'node:crypto';

/**
 * Bucket pengunjung 12-bit untuk dedupe view harian. HMAC dengan secret server
 * agar bucket tidak bisa dibalik ke IP. Hanya IP yang dihash (tanpa User-Agent)
 * agar rotasi UA tidak membuat pengunjung baru. Mengembalikan null jika secret
 * belum di-set; pemanggil harus fail closed.
 */
export function visitorBucket(ip: string, day: string): number | null {
  const secret = process.env.VIEW_HASH_SECRET;
  if (!secret) return null;
  return createHmac('sha256', secret).update(`${day}|${ip}`).digest().readUInt16BE(0) % 4096;
}

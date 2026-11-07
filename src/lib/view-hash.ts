import { createHmac } from 'node:crypto';

/**
 * 12-bit visitor bucket for daily view deduplication. HMAC with server secret
 * prevents reversing the bucket to an IP. Only the IP is hashed (without User-Agent)
 * so that UA rotation does not register as a new visitor. Returns null if secret
 * is not configured; callers must fail closed.
 */
export function visitorBucket(ip: string, day: string): number | null {
  const secret = process.env.VIEW_HASH_SECRET;
  if (!secret) return null;
  return createHmac('sha256', secret).update(`${day}|${ip}`).digest().readUInt16BE(0) % 4096;
}

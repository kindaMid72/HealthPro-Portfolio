import { isIP } from 'node:net';

// Returns only valid IP addresses. '*' (combined login-throttle bucket)
// and spoofed headers never pass as client IP.
export function getClientIp(h: Headers): string {
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  const candidate = forwarded || h.get('x-real-ip')?.trim();
  return candidate && isIP(candidate) !== 0 ? candidate : 'unknown';
}

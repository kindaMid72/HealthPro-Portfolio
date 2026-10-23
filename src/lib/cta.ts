/**
 * lib/cta.ts — resolusi tautan CTA (booking & WhatsApp).
 * Dipakai home (SiteShell), halaman artikel (kotak CTA penutup), dan komponen kontak.
 *
 * FR-4: kalau booking_url kosong → jangan tampilkan tombol booking broken.
 * Ganti dengan CTA WhatsApp kalau tersedia.
 */

import type { Location, Profile } from "./types";

export interface CtaLinks {
  bookingUrl: string | null;
  whatsappFallback: string | null;
}

/**
 * Nomor WA Indonesia (08xx / +628xx / 628xx) → https://wa.me/628xx.
 * Return null kalau kosong.
 */
export function toWaLink(raw: string | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("62")
    ? digits
    : digits.startsWith("0")
      ? `62${digits.slice(1)}`
      : `62${digits}`;
  return `https://wa.me/${normalized}`;
}

export function getCtaLinks(profile: Profile, locations: Location[]): CtaLinks {
  const bookingUrl = profile.booking_url ?? null;
  const whatsappFallback = toWaLink(locations.find((l) => l.whatsapp)?.whatsapp);
  return { bookingUrl, whatsappFallback };
}

import type { Location, Profile } from './types';

export function toWaLink(raw: string | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}

export function getCtaLinks(
  profile: Profile,
  locations: Location[],
): { bookingUrl: string | null; whatsappFallback: string | null } {
  const bookingUrl = profile.booking_url ?? null;
  const firstWa = locations.find((l) => l.whatsapp && l.whatsapp.trim() !== '')?.whatsapp;
  const whatsappFallback = toWaLink(firstWa);
  return { bookingUrl, whatsappFallback };
}

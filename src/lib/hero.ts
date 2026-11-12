export const HERO_LIMITS = { tagline: 160, ctaLabel: 40 } as const;

/** Trim + collapse all whitespace (incl. newlines) to single spaces. */
export function cleanHeroText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** Returns an Indonesian error message, or null when valid. Inputs are already cleaned. */
export function validateHeroFields(f: {
  tagline: string;
  bookingLabel: string;
  whatsappLabel: string;
}): string | null {
  if (f.tagline.length > HERO_LIMITS.tagline) {
    return `Tagline hero maksimal ${HERO_LIMITS.tagline} karakter.`;
  }
  if (f.bookingLabel.length > HERO_LIMITS.ctaLabel || f.whatsappLabel.length > HERO_LIMITS.ctaLabel) {
    return `Label tombol maksimal ${HERO_LIMITS.ctaLabel} karakter.`;
  }
  return null;
}

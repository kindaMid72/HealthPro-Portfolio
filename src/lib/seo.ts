/**
 * lib/seo.ts
 * SEO / GEO (Generative Engine Optimization) helpers — used by JsonLd, llms.txt, and metadata.
 *
 * RULE: all output is derived from Sheet data (Profile/Locations/Services).
 * No medical/personal facts are authored here. Empty fields = omitted.
 */

import type { Locale } from "@/i18n/config";
import { id as idDictionary } from "@/i18n/dictionaries/id";
import { en as enDictionary } from "@/i18n/dictionaries/en";
import { format } from "@/i18n/format";
import { ensureSentence } from "./meta-text";
import type { DaySlot } from "./schedule";
import type { Location, Profile } from "./types";

/** Canonical host without "www." — must match property in Google Search Console */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dryuliana.my.id")
    .replace(/\/+$/, "")
    .replace(/^(https?:\/\/)www\./i, "$1");
}

/** Split list string in "a | b" format (or ";" / newline) into array */
export function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\||\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Extract valid https URLs from social_links field (separated by | , ; space or newline) */
export function parseSocialLinks(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[|,;\s]+/)
    .map((s) => s.trim())
    .filter((s) => {
      try {
        return new URL(s).protocol === "https:";
      } catch {
        return false;
      }
    });
}

/** Absolute URL for photo; photo_url can be /public path or full URL */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${getSiteUrl()}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** Indonesian phone number (08xx / +628xx / 628xx) → E.164 format (+628xx). Return undefined if empty. */
export function toE164(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  return `+62${digits}`;
}

/** "Kec. Simpang Empat, Kab. Tanah Bumbu" → locality & region (without administrative prefix) */
export function parseAddressLocality(address: string): { locality: string; region: string } {
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    return {
      locality: parts[parts.length - 2].replace(/^(Kec\.|Kecamatan|Desa|Kel\.|Kelurahan)\s+/i, ""),
      region: parts[parts.length - 1].replace(/^(Kab\.|Kabupaten|Kota)\s+/i, ""),
    };
  }
  return { locality: address, region: "Kalimantan Selatan" };
}

const SCHEMA_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface OpeningHours {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

/**
 * schema.org OpeningHoursSpecification per time range; days sharing a range are grouped.
 * Built from structured slots only, so no hours are guessed from text.
 */
export function buildOpeningHoursSpecs(slots: DaySlot[]): OpeningHours[] {
  const groups = new Map<string, { opens: string; closes: string; days: number[] }>();
  for (const s of slots) {
    const key = `${s.opens}-${s.closes}`;
    const group = groups.get(key) ?? { opens: s.opens, closes: s.closes, days: [] };
    group.days.push(s.day);
    groups.set(key, group);
  }
  return [...groups.values()].map((g) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [...g.days].sort((a, b) => a - b).map((d) => SCHEMA_DAYS[d]),
    opens: g.opens,
    closes: g.closes,
  }));
}

/** Name without titles/credentials, e.g. "dr. Yuliana, Sp.THTBKL, M.Kes" → "Yuliana" */
export function getPlainName(fullName: string): string {
  return fullName.replace(/^(dr\.|dr)\s*/i, "").split(",")[0].trim();
}

/** Degrees/credentials after name: "Sp.THTBKL", "M.Kes" */
export function getCredentials(fullName: string): string[] {
  return fullName
    .split(",")
    .slice(1)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** "dr. Yuliana, Sp.THTBKL, M.Kes" → "dr. Yuliana" (name + prefix "dr." if present). */
export function getDisplayName(fullName: string): string {
  const hasTitle = /^dr\.?\s/i.test(fullName);
  return `${hasTitle ? "dr. " : ""}${getPlainName(fullName)}`;
}

/** List of unique service areas from location addresses (subdistrict/regency) */
export function getServiceAreas(locations: Location[]): string[] {
  const localities = new Set<string>();
  const regions = new Set<string>();
  for (const l of locations) {
    const { locality, region } = parseAddressLocality(l.address);
    localities.add(locality);
    regions.add(region);
  }
  // Subdistrict first, regency last (used as primary area in title)
  return [...new Set([...localities, ...regions])].filter(Boolean);
}

/** ["A","B","C"] → "A, B, and C"; ["A","B"] → "A and B" */
export function joinList(items: string[], andWord = "dan"): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} ${andWord} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${andWord} ${items[items.length - 1]}`;
}

/** Service area descriptive sentence from location data (not hardcoded text); null if no locations. */
export function describeServiceArea(locations: Location[], locale: Locale = 'id'): string | null {
  if (locations.length === 0) return null;
  const localities: string[] = [];
  const regions: string[] = [];
  for (const l of locations) {
    const { locality, region } = parseAddressLocality(l.address);
    if (locality && !localities.includes(locality)) localities.push(locality);
    if (region && !regions.includes(region)) regions.push(region);
  }
  if (localities.length === 0) return null;
  const dict = locale === 'en' ? enDictionary : idDictionary;
  const localitiesFormatted = joinList(localities, dict.seo.and);
  return format(dict.seo.servingPatientsIn, {
    localities: localitiesFormatted,
    regions: regions.join(" & "),
  });
}

/** Doctor summary text for meta description — derived only from existing data */
export function buildDescription(
  profile: Profile,
  locations: Location[],
  services: { service_name: string }[],
  locale: Locale = 'id',
): string {
  const dict = locale === 'en' ? enDictionary : idDictionary;
  const areas = getServiceAreas(locations);
  const names = locations.map((l) => l.location_name);
  const svc = services.map((s) => s.service_name);
  const parts = [`${profile.full_name} — ${profile.specialty}.`];
  if (profile.hero_tagline) parts.push(ensureSentence(profile.hero_tagline));
  else if (names.length) parts.push(format(dict.seo.practiceAt, { names: names.join(", ") }));
  else if (areas.length) parts.push(format(dict.seo.servingPatientsIn, { localities: areas.join(", "), regions: '' }).replace(/,\s*\./, '.'));
  if (svc.length) parts.push(format(dict.seo.services, { services: svc.join(", ") }));
  parts.push(dict.seo.seeScheduleCta);
  return parts.join(" ");
}

/** Google Maps search link from address (without fabricated coordinates) */
export function mapsSearchUrl(location: Location): string {
  const q = encodeURIComponent(`${location.location_name}, ${location.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

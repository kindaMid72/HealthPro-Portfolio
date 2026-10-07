/**
 * lib/seo.ts
 * Helper SEO / GEO (Generative Engine Optimization) — dipakai oleh JsonLd, llms.txt, dan metadata.
 *
 * ATURAN: semua output diturunkan dari data Sheet (Profile/Locations/Services).
 * Tidak ada fakta medis/personal yang ditulis di sini. Field kosong = dihilangkan.
 */

import type { Location, Profile, Service } from "./types";

/** Host kanonis tanpa "www." — harus sama dengan property di Google Search Console */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dryuliana.my.id")
    .replace(/\/+$/, "")
    .replace(/^(https?:\/\/)www\./i, "$1");
}

/** Pecah string list berformat "a | b" (atau ";" / baris baru) jadi array */
export function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\||\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Ambil hanya URL https valid dari field social_links (dipisah | , ; spasi atau baris baru) */
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

/** URL absolut untuk foto; photo_url bisa path /public atau URL penuh */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${getSiteUrl()}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** Nomor Indonesia (08xx / +628xx / 628xx) → format E.164 (+628xx). Return undefined kalau kosong. */
export function toE164(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  return `+62${digits}`;
}

/** "Kec. Simpang Empat, Kab. Tanah Bumbu" → locality & region (tanpa prefix administratif) */
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

const DAY_INDEX: Record<string, number> = {
  senin: 0,
  selasa: 1,
  rabu: 2,
  kamis: 3,
  jumat: 4,
  "jum'at": 4,
  sabtu: 5,
  minggu: 6,
};
const SCHEMA_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface OpeningHours {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

/**
 * Parse jam praktik format "Senin–Sabtu, 17.00–21.00" atau "Senin, Rabu, Sabtu, 13.00–15.00".
 * Rentang hari dengan "–"/"-"/"s/d", daftar hari dengan koma/"dan".
 * Gagal parse → undefined (field dihilangkan, bukan ditebak).
 */
export function parseOpeningHours(text: string): OpeningHours | undefined {
  const time = text.match(/(\d{1,2})[.:](\d{2})\s*(?:–|-|—|s\/d|sampai)\s*(\d{1,2})[.:](\d{2})/i);
  if (!time) return undefined;
  const pad = (h: string, m: string) => `${h.padStart(2, "0")}:${m}`;
  const opens = pad(time[1], time[2]);
  const closes = pad(time[3], time[4]);

  const dayPart = text.slice(0, time.index).toLowerCase();
  const days = new Set<number>();

  const range = dayPart.match(/([a-z']+)\s*(?:–|-|—|s\/d|sampai)\s*([a-z']+)/);
  if (range && range[1] in DAY_INDEX && range[2] in DAY_INDEX) {
    for (let i = DAY_INDEX[range[1]]; i <= DAY_INDEX[range[2]]; i++) days.add(i);
  } else {
    for (const token of dayPart.split(/[^a-z']+/)) {
      if (token in DAY_INDEX) days.add(DAY_INDEX[token]);
    }
  }
  if (days.size === 0) return undefined;

  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [...days].sort().map((d) => SCHEMA_DAYS[d]),
    opens,
    closes,
  };
}

/** Nama tanpa gelar, mis. "dr. Yuliana, Sp.THTBKL, M.Kes" → "Yuliana" */
export function getPlainName(fullName: string): string {
  return fullName.replace(/^(dr\.|dr)\s*/i, "").split(",")[0].trim();
}

/** Gelar/credential setelah nama: "Sp.THTBKL", "M.Kes" */
export function getCredentials(fullName: string): string[] {
  return fullName
    .split(",")
    .slice(1)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Daftar wilayah layanan unik dari alamat lokasi (kecamatan/kab) */
export function getServiceAreas(locations: Location[]): string[] {
  const localities = new Set<string>();
  const regions = new Set<string>();
  for (const l of locations) {
    const { locality, region } = parseAddressLocality(l.address);
    localities.add(locality);
    regions.add(region);
  }
  // Kecamatan dulu, kabupaten terakhir (dipakai sebagai area utama di title)
  return [...new Set([...localities, ...regions])].filter(Boolean);
}

/** Ringkasan teks dokter untuk meta description — hanya dari data yang ada */
export function buildDescription(profile: Profile, locations: Location[], services: Service[]): string {
  const areas = getServiceAreas(locations);
  const names = locations.map((l) => l.location_name);
  const svc = services.map((s) => s.service_name);
  const parts = [`${profile.full_name} — ${profile.specialty}.`];
  if (names.length) parts.push(`Praktik di ${names.join(", ")}.`);
  else if (areas.length) parts.push(`Melayani pasien di ${areas.join(", ")}.`);
  if (svc.length) parts.push(`Layanan: ${svc.join(", ")}.`);
  parts.push("Lihat jadwal, alamat, dan cara booking.");
  return parts.join(" ");
}

/** Link Google Maps pencarian dari alamat (tanpa koordinat karangan) */
export function mapsSearchUrl(location: Location): string {
  const q = encodeURIComponent(`${location.location_name}, ${location.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

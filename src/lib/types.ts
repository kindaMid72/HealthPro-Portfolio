/**
 * lib/types.ts
 * Zod schemas + TypeScript types untuk semua data yang ditarik dari Google Sheets.
 * Sinkron dengan: docs/02-content-data.md dan docs/07-data-architecture.md
 *
 * ATURAN: Kalau skema di sini berubah, docs/02-content-data.md WAJIB diupdate
 * di PR yang sama, dan sebaliknya.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Tab "Profile" — 1 baris data, kolom = field
// ---------------------------------------------------------------------------
export const ProfileSchema = z.object({
  full_name: z.string().min(1),
  specialty: z.string().min(1),
  sub_specialty: z.string().optional(),
  str_sip_display: z.string().optional(), // nomor STR/SIP, ditampilkan kalau diisi
  photo_url: z.string().default('/images/dr-profile-placeholder.jpg'), // path ke /public
  education: z.string(),
  certifications: z.string().optional(),
  experience_history: z.string(),
  organizations: z.string().optional(),
  /**
   * booking_url: WAJIB diisi sebelum Fase 3.
   * Optional di schema supaya build tidak gagal total selama masih kosong.
   * Komponen CTA WAJIB fallback ke WhatsApp kalau field ini kosong (lihat FR-4).
   */
  booking_url: z.union([z.string().url(), z.literal('')]).optional().transform(e => e === '' ? undefined : e),
  email: z.union([z.string().email(), z.literal('')]).optional().transform(e => e === '' ? undefined : e),
  social_links: z.string().optional(),
  personal_story: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// ---------------------------------------------------------------------------
// Tab "Locations" — banyak baris, 1 baris = 1 lokasi praktik
// ---------------------------------------------------------------------------
export const LocationSchema = z.object({
  location_name: z.string().min(1),
  address: z.string().min(1),
  practice_hours: z.string().min(1),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  /**
   * booking_url_override: kalau lokasi ini punya link booking sendiri,
   * berbeda dari Profile.booking_url global.
   */
  booking_url_override: z.union([z.string().url(), z.literal('')]).optional().transform(e => e === '' ? undefined : e),
});

export const LocationsListSchema = z.array(LocationSchema);

export type Location = z.infer<typeof LocationSchema>;

// ---------------------------------------------------------------------------
// Tab "Services" — banyak baris, 1 baris = 1 layanan
// ---------------------------------------------------------------------------
export const ServiceSchema = z.object({
  service_name: z.string().min(1),
  /**
   * service_description: WAJIB diisi oleh dokter.
   * Agent TIDAK BOLEH menulis deskripsi tindakan medis sendiri.
   */
  service_description: z.string(),
});

export const ServicesListSchema = z.array(ServiceSchema);

export type Service = z.infer<typeof ServiceSchema>;

// ---------------------------------------------------------------------------
// Aggregate type — seluruh data yang dipakai halaman utama
// ---------------------------------------------------------------------------
export interface SiteData {
  profile: Profile;
  locations: Location[];
  services: Service[];
}

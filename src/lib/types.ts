/**
 * lib/types.ts
 * Zod schemas + TypeScript types for all data ingested from Google Sheets.
 * Synchronized with: docs/02-content-data.md and docs/07-data-architecture.md
 *
 * RULE: If schemas here change, docs/02-content-data.md MUST be updated
 * in the same PR, and vice versa.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// "Profile" Tab — 1 row of data, column = field
// ---------------------------------------------------------------------------
export const ProfileSchema = z.object({
  full_name: z.string().min(1),
  specialty: z.string().min(1),
  sub_specialty: z.string().optional(),
  str_sip_display: z.string().optional(), // STR/SIP number, displayed if provided
  photo_url: z.string().default('/images/dokter-profile.webp'), // Path to /public
  education: z.string(),
  certifications: z.string().optional(),
  experience_history: z.string(),
  organizations: z.string().optional(),
  /**
   * booking_url: MUST be provided before Phase 3.
   * Optional in schema so build does not fail while still empty.
   * CTA components MUST fallback to WhatsApp if this field is empty (see FR-4).
   */
  booking_url: z.union([z.string().url(), z.literal('')]).optional().transform(e => e === '' ? undefined : e),
  email: z.union([z.string().email(), z.literal('')]).optional().transform(e => e === '' ? undefined : e),
  social_links: z.string().optional(),
  personal_story: z.string().optional(),
  hero_tagline: z.string().optional(),
  hero_booking_label: z.string().optional(),
  hero_whatsapp_label: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// ---------------------------------------------------------------------------
// "Locations" Tab — multiple rows, 1 row = 1 practice location
// ---------------------------------------------------------------------------
const HHMM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const TimeRangeSchema = z.object({
  opens: z.string().regex(HHMM_PATTERN),
  closes: z.string().regex(HHMM_PATTERN),
});

const DaySlotSchema = TimeRangeSchema.extend({
  /** 0 = Monday … 6 = Sunday */
  day: z.number().int().min(0).max(6),
});

const ScheduleExceptionSchema = z.object({
  start_date: z.string().regex(ISO_DATE_PATTERN),
  end_date: z.string().regex(ISO_DATE_PATTERN),
  closed: z.boolean(),
  hours: z.array(TimeRangeSchema),
  reason: z.string().optional(),
});

export const LocationSchema = z.object({
  location_name: z.string().min(1),
  address: z.string().min(1),
  /** Weekly practice ranges; empty when the location publishes only a note. */
  slots: z.array(DaySlotSchema).default([]),
  /** Date exceptions that apply to this location (global closures are copied in by content.ts). */
  exceptions: z.array(ScheduleExceptionSchema).default([]),
  /** Free-text schedule note (e.g. "Jadwal berubah saat libur nasional"), shown verbatim. */
  note: z.string(),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  /**
   * booking_url_override: if this location has its own booking link,
   * overriding Profile.booking_url globally.
   */
  booking_url_override: z.union([z.string().url(), z.literal('')]).optional().transform(e => e === '' ? undefined : e),
});

export const LocationsListSchema = z.array(LocationSchema);

export type Location = z.infer<typeof LocationSchema>;

// ---------------------------------------------------------------------------
// "Services" Tab — multiple rows, 1 row = 1 service
// ---------------------------------------------------------------------------
export const ServiceSchema = z.object({
  service_name: z.string().min(1),
  /**
   * service_description: MUST be written by the doctor.
   * Agents MUST NOT author medical procedure descriptions themselves.
   */
  service_description: z.string(),
});

export const ServicesListSchema = z.array(ServiceSchema);

export type Service = z.infer<typeof ServiceSchema>;

// ---------------------------------------------------------------------------
// Aggregate type — complete data consumed by the homepage
// ---------------------------------------------------------------------------
export interface SiteData {
  profile: Profile;
  locations: Location[];
  services: PublicService[];
}

// ---------------------------------------------------------------------------
// Health Education Articles & ENT Categories
// ---------------------------------------------------------------------------
export type ArticleCategory = 'telinga' | 'hidung' | 'tenggorok' | 'kepala-leher' | 'umum';

export const ARTICLE_CATEGORY_VALUES: ArticleCategory[] = [
  'telinga',
  'hidung',
  'tenggorok',
  'kepala-leher',
  'umum',
];


export function isValidArticleCategory(val: string | undefined): val is ArticleCategory {
  return !!val && (ARTICLE_CATEGORY_VALUES as string[]).includes(val);
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Services for public display (filtered and augmented with slug/detail). */
export interface PublicService {
  service_name: string;
  nameId: string;
  /** Empty if description is not eligible for public display (placeholder / too short). */
  service_description: string;
  slug: string;
  category: ArticleCategory | null;
  /** true if rich-text content is populated → /layanan/[slug] page is available. */
  hasDetail: boolean;
  translated: boolean;
}

export interface PublicServiceDetail extends PublicService {
  contentHtml: string;
  toc: TocItem[];
  updatedAt: Date;
}

export interface PublicArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  categoryLabel: string;
  readingTimeMinutes: number;
  viewCount: number;
  coverImageUrl: string | null;
  coverAlt: string;
  authorName: string;
  publishedAt: Date;
  updatedAt: Date;
  translated: boolean;
}

export interface PublicArticleDetail extends PublicArticleSummary {
  contentHtml: string;
  toc: TocItem[];
  wordCount: number;
}

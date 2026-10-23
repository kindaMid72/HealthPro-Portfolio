/**
 * lib/content.ts — satu-satunya pintu akses data konten (database Postgres).
 *
 * Komponen TIDAK PERNAH query DB langsung. Setiap fungsi dibungkus `cache`
 * (react) supaya layout + page dalam satu request hanya query sekali.
 * Kalau DB tidak bisa dibaca / data invalid → fallback snapshot JSON di data/fallback-*.json
 * (FR-4: build & halaman tidak pernah gagal total karena data).
 */

import { cache } from 'react';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import {
  articles as articlesTable,
  locations as locationsTable,
  profile as profileTable,
  services as servicesTable,
  users as usersTable,
} from '@/db/schema';
import type { JSONContent } from '@tiptap/core';
import { renderArticleContentHtml } from './articles';
import {
  Profile,
  ProfileSchema,
  Location,
  LocationsListSchema,
  Service,
  ServicesListSchema,
  SiteData,
  PublicArticleSummary,
  PublicArticleDetail,
} from './types';
import fallbackProfileJson from '../../data/fallback-profile.json';
import fallbackLocationsJson from '../../data/fallback-locations.json';
import fallbackServicesJson from '../../data/fallback-services.json';

// ---------------------------------------------------------------------------
// Fallback (snapshot JSON di repo)
// ---------------------------------------------------------------------------

const MINIMAL_PROFILE_FALLBACK: Profile = {
  full_name: '[BELUM DIISI]',
  specialty: '[BELUM DIISI]',
  sub_specialty: '',
  photo_url: '/images/dokter-profile.webp',
  education: '[BELUM DIISI]',
  experience_history: '[BELUM DIISI]',
  booking_url: undefined,
  email: undefined,
};

function loadFallbackProfile(): Profile {
  const parsed = ProfileSchema.safeParse(fallbackProfileJson);
  return parsed.success ? parsed.data : MINIMAL_PROFILE_FALLBACK;
}

function loadFallbackLocations(): Location[] {
  const parsed = LocationsListSchema.safeParse(fallbackLocationsJson);
  return parsed.success ? parsed.data : [];
}

function loadFallbackServices(): Service[] {
  const parsed = ServicesListSchema.safeParse(fallbackServicesJson);
  return parsed.success ? parsed.data : [];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const getProfile = cache(async (): Promise<Profile> => {
  try {
    const [row] = await getDb()
      .select({
        fullName: profileTable.fullName,
        specialty: profileTable.specialty,
        subSpecialty: profileTable.subSpecialty,
        strSipDisplay: profileTable.strSipDisplay,
        education: profileTable.education,
        certifications: profileTable.certifications,
        experienceHistory: profileTable.experienceHistory,
        organizations: profileTable.organizations,
        bookingUrl: profileTable.bookingUrl,
        email: profileTable.email,
        socialLinks: profileTable.socialLinks,
        personalStory: profileTable.personalStory,
        photoImageId: profileTable.photoImageId,
      })
      .from(profileTable)
      .where(eq(profileTable.id, 1))
      .limit(1);

    if (!row) {
      console.error('[content] Row profile belum ada, pakai fallback.');
      return loadFallbackProfile();
    }

    const result = ProfileSchema.safeParse({
      full_name: row.fullName,
      specialty: row.specialty,
      sub_specialty: row.subSpecialty,
      str_sip_display: row.strSipDisplay,
      photo_url: row.photoImageId ? `/media/${row.photoImageId}` : '/images/dokter-profile.webp',
      education: row.education,
      certifications: row.certifications,
      experience_history: row.experienceHistory,
      organizations: row.organizations,
      booking_url: row.bookingUrl,
      email: row.email,
      social_links: row.socialLinks,
      personal_story: row.personalStory,
    });

    if (!result.success) {
      console.error('[content] Data Profile tidak valid:', result.error.flatten());
      return loadFallbackProfile();
    }
    return result.data;
  } catch (err) {
    console.error('[content] Gagal baca Profile:', err);
    return loadFallbackProfile();
  }
});

export const getLocations = cache(async (): Promise<Location[]> => {
  try {
    const rows = await getDb()
      .select({
        location_name: locationsTable.locationName,
        address: locationsTable.address,
        practice_hours: locationsTable.practiceHours,
        whatsapp: locationsTable.whatsapp,
        phone: locationsTable.phone,
        booking_url_override: locationsTable.bookingUrlOverride,
      })
      .from(locationsTable)
      .orderBy(asc(locationsTable.sortOrder));

    const result = LocationsListSchema.safeParse(rows);
    if (!result.success) {
      console.error('[content] Data Locations tidak valid:', result.error.flatten());
      return loadFallbackLocations();
    }
    return result.data;
  } catch (err) {
    console.error('[content] Gagal baca Locations:', err);
    return loadFallbackLocations();
  }
});

export const getServices = cache(async (): Promise<Service[]> => {
  try {
    const rows = await getDb()
      .select({
        service_name: servicesTable.serviceName,
        service_description: servicesTable.serviceDescription,
      })
      .from(servicesTable)
      .orderBy(asc(servicesTable.sortOrder));

    const result = ServicesListSchema.safeParse(rows);
    if (!result.success) {
      console.error('[content] Data Services tidak valid:', result.error.flatten());
      return loadFallbackServices();
    }
    return result.data;
  } catch (err) {
    console.error('[content] Gagal baca Services:', err);
    return loadFallbackServices();
  }
});

/**
 * getAllSiteData — fetch semua data sekaligus untuk layout & page.
 */
export const getAllSiteData = cache(async (): Promise<SiteData> => {
  const [profile, locations, services] = await Promise.all([
    getProfile(),
    getLocations(),
    getServices(),
  ]);
  return { profile, locations, services };
});

// ---------------------------------------------------------------------------
// Artikel Publik
// ---------------------------------------------------------------------------

export const PAGE_SIZE = 12;

export interface PaginatedArticlesResult {
  items: PublicArticleSummary[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export const getPaginatedArticles = cache(
  async (options?: { page?: number; limit?: number }): Promise<PaginatedArticlesResult> => {
    const page = Math.max(1, options?.page ?? 1);
    const limit = options?.limit ?? PAGE_SIZE;
    const offset = (page - 1) * limit;

    try {
      const db = getDb();
      const [countRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(articlesTable)
        .where(eq(articlesTable.status, 'published'));

      const total = countRow?.count ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      const rows = await db
        .select({
          id: articlesTable.id,
          slug: articlesTable.slug,
          title: articlesTable.title,
          excerpt: articlesTable.excerpt,
          coverImageId: articlesTable.coverImageId,
          coverAlt: articlesTable.coverAlt,
          authorName: usersTable.name,
          publishedAt: articlesTable.publishedAt,
          updatedAt: articlesTable.updatedAt,
        })
        .from(articlesTable)
        .leftJoin(usersTable, eq(usersTable.id, articlesTable.authorId))
        .where(eq(articlesTable.status, 'published'))
        .orderBy(desc(articlesTable.publishedAt))
        .limit(limit)
        .offset(offset);

      const items: PublicArticleSummary[] = rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        coverImageUrl: r.coverImageId ? `/media/${r.coverImageId}` : null,
        coverAlt: r.coverAlt,
        authorName: r.authorName ?? 'dr. Yuliana',
        publishedAt: r.publishedAt ?? r.updatedAt,
        updatedAt: r.updatedAt,
      }));

      return { items, total, totalPages, currentPage: page };
    } catch (err) {
      console.error('[content] Gagal baca Artikel Publik:', err);
      return { items: [], total: 0, totalPages: 1, currentPage: page };
    }
  }
);

export const getPublishedArticles = cache(async (): Promise<PublicArticleSummary[]> => {
  const res = await getPaginatedArticles({ page: 1, limit: 100 });
  return res.items;
});

export const getArticleBySlug = cache(async (slug: string): Promise<PublicArticleDetail | null> => {
  try {
    const [row] = await getDb()
      .select({
        id: articlesTable.id,
        slug: articlesTable.slug,
        title: articlesTable.title,
        excerpt: articlesTable.excerpt,
        coverImageId: articlesTable.coverImageId,
        coverAlt: articlesTable.coverAlt,
        content: articlesTable.content,
        authorName: usersTable.name,
        publishedAt: articlesTable.publishedAt,
        updatedAt: articlesTable.updatedAt,
      })
      .from(articlesTable)
      .leftJoin(usersTable, eq(usersTable.id, articlesTable.authorId))
      .where(and(eq(articlesTable.slug, slug), eq(articlesTable.status, 'published')))
      .limit(1);

    if (!row) return null;

    const contentHtml = renderArticleContentHtml(row.content as JSONContent);

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      coverImageUrl: row.coverImageId ? `/media/${row.coverImageId}` : null,
      coverAlt: row.coverAlt,
      authorName: row.authorName ?? 'dr. Yuliana',
      publishedAt: row.publishedAt ?? row.updatedAt,
      updatedAt: row.updatedAt,
      contentHtml,
    };
  } catch (err) {
    console.error(`[content] Gagal baca Artikel ${slug}:`, err);
    return null;
  }
});

export const getAllArticleSlugs = cache(async (): Promise<string[]> => {
  try {
    const rows = await getDb()
      .select({ slug: articlesTable.slug })
      .from(articlesTable)
      .where(eq(articlesTable.status, 'published'));
    return rows.map((r) => r.slug);
  } catch (err) {
    console.error('[content] Gagal baca Article Slugs:', err);
    return [];
  }
});

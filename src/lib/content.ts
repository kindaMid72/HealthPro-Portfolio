import fallbackLocationsJson from '../../data/fallback-locations.json';
import fallbackProfileJson from '../../data/fallback-profile.json';
import fallbackServicesJson from '../../data/fallback-services.json';
import { cache } from 'react';
import type { JSONContent } from '@tiptap/core';
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  ne,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { getDb } from '@/db/client';
import {
  articles as articlesTable,
  locations as locationsTable,
  profile as profileTable,
  services as servicesTable,
  users as usersTable,
} from '@/db/schema';
import { escapeLike, renderArticleContentWithToc } from './articles';
import {
  ARTICLE_CATEGORIES,
  type ArticleCategory,
  isValidArticleCategory,
  type Location,
  LocationsListSchema,
  type Profile,
  ProfileSchema,
  type PublicArticleDetail,
  type PublicArticleSummary,
  type Service,
  ServicesListSchema,
  type SiteData,
} from './types';

export const PAGE_SIZE = 9;

function loadFallbackProfile(): Profile {
  try {
    return ProfileSchema.parse(fallbackProfileJson);
  } catch {
    return {
      full_name: '[BELUM DIISI]',
      specialty: '[BELUM DIISI]',
      sub_specialty: '',
      photo_url: '/images/dokter-profile.webp',
      education: '[BELUM DIISI]',
      experience_history: '[BELUM DIISI]',
      booking_url: undefined,
      email: undefined,
    };
  }
}

function loadFallbackLocations(): Location[] {
  try {
    return LocationsListSchema.parse(fallbackLocationsJson);
  } catch {
    return [];
  }
}

function loadFallbackServices(): Service[] {
  try {
    return ServicesListSchema.parse(fallbackServicesJson);
  } catch {
    return [];
  }
}

export const getProfile = cache(async (): Promise<Profile> => {
  try {
    const rows = await getDb()
      .select()
      .from(profileTable)
      .where(eq(profileTable.id, 1))
      .limit(1);

    const row = rows[0];
    if (!row || !row.fullName.trim()) {
      return loadFallbackProfile();
    }

    return ProfileSchema.parse({
      full_name: row.fullName,
      specialty: row.specialty,
      sub_specialty: row.subSpecialty || undefined,
      str_sip_display: row.strSipDisplay || undefined,
      photo_url: row.photoImageId
        ? `/media/${row.photoImageId}`
        : '/images/dokter-profile.webp',
      education: row.education,
      certifications: row.certifications || undefined,
      experience_history: row.experienceHistory,
      organizations: row.organizations || undefined,
      booking_url: row.bookingUrl || undefined,
      email: row.email || undefined,
      social_links: row.socialLinks || undefined,
      personal_story: row.personalStory || undefined,
    });
  } catch (err) {
    console.error('[content] getProfile gagal, memakai data fallback:', err);
    return loadFallbackProfile();
  }
});

export const getLocations = cache(async (): Promise<Location[]> => {
  try {
    const rows = await getDb()
      .select()
      .from(locationsTable)
      .orderBy(asc(locationsTable.sortOrder));

    if (rows.length === 0) {
      return loadFallbackLocations();
    }

    return LocationsListSchema.parse(
      rows.map((r) => ({
        location_name: r.locationName,
        address: r.address,
        practice_hours: r.practiceHours,
        whatsapp: r.whatsapp || undefined,
        phone: r.phone || undefined,
        booking_url_override: r.bookingUrlOverride || undefined,
      })),
    );
  } catch (err) {
    console.error('[content] getLocations gagal, memakai data fallback:', err);
    return loadFallbackLocations();
  }
});

export const getServices = cache(async (): Promise<Service[]> => {
  try {
    const rows = await getDb()
      .select()
      .from(servicesTable)
      .orderBy(asc(servicesTable.sortOrder));

    if (rows.length === 0) {
      return loadFallbackServices();
    }

    return ServicesListSchema.parse(
      rows.map((r) => ({
        service_name: r.serviceName,
        service_description: r.serviceDescription,
      })),
    );
  } catch (err) {
    console.error('[content] getServices gagal, memakai data fallback:', err);
    return loadFallbackServices();
  }
});

export const getAllSiteData = cache(async (): Promise<SiteData> => {
  const [profile, locations, services] = await Promise.all([
    getProfile(),
    getLocations(),
    getServices(),
  ]);
  return { profile, locations, services };
});

async function getFallbackAuthorName(): Promise<string> {
  // Nama penulis cadangan diambil dari profil di DB, bukan di-hardcode.
  return (await getProfile()).full_name;
}

function mapToSummary(
  row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  readingTimeMinutes: number;
  viewCount: number;
  coverImageId: string | null;
  coverAlt: string;
  authorName: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  },
  fallbackAuthor: string,
): PublicArticleSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    categoryLabel: ARTICLE_CATEGORIES[row.category] ?? ARTICLE_CATEGORIES.umum,
    readingTimeMinutes: row.readingTimeMinutes,
    viewCount: row.viewCount,
    coverImageUrl: row.coverImageId ? `/media/${row.coverImageId}` : null,
    coverAlt: row.coverAlt,
    authorName: row.authorName ?? fallbackAuthor,
    publishedAt: row.publishedAt ?? row.updatedAt,
    updatedAt: row.updatedAt,
  };
}

export interface PaginatedArticlesResult {
  items: PublicArticleSummary[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export const getPaginatedArticles = cache(
  async (options?: {
    page?: number;
    limit?: number;
    category?: ArticleCategory;
    query?: string;
  }): Promise<PaginatedArticlesResult> => {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, options?.limit ?? PAGE_SIZE);
    const offset = (page - 1) * limit;

    try {
      const db = getDb();
      const conditions: SQL[] = [eq(articlesTable.status, 'published')];

      if (options?.category && isValidArticleCategory(options.category)) {
        conditions.push(eq(articlesTable.category, options.category));
      }

      const q = options?.query?.trim();
      if (q) {
        const searchCond = or(
          ilike(articlesTable.title, `%${escapeLike(q)}%`),
          ilike(articlesTable.excerpt, `%${escapeLike(q)}%`),
        );
        if (searchCond) conditions.push(searchCond);
      }

      const whereClause = and(...conditions);

      const [[totalRow], rows] = await Promise.all([
        db
          .select({ total: count() })
          .from(articlesTable)
          .where(whereClause),
        db
          .select({
            id: articlesTable.id,
            slug: articlesTable.slug,
            title: articlesTable.title,
            excerpt: articlesTable.excerpt,
            category: articlesTable.category,
            readingTimeMinutes: articlesTable.readingTimeMinutes,
            viewCount: articlesTable.viewCount,
            coverImageId: articlesTable.coverImageId,
            coverAlt: articlesTable.coverAlt,
            authorName: usersTable.name,
            publishedAt: articlesTable.publishedAt,
            updatedAt: articlesTable.updatedAt,
          })
          .from(articlesTable)
          .leftJoin(usersTable, eq(articlesTable.authorId, usersTable.id))
          .where(whereClause)
          .orderBy(desc(articlesTable.publishedAt), desc(articlesTable.updatedAt))
          .limit(limit)
          .offset(offset),
      ]);

      const total = Number(totalRow?.total ?? 0);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const fallbackAuthor = await getFallbackAuthorName();

      return {
        items: rows.map((r) => mapToSummary(r, fallbackAuthor)),
        total,
        totalPages,
        currentPage: page,
      };
    } catch {
      return {
        items: [],
        total: 0,
        totalPages: 1,
        currentPage: page,
      };
    }
  },
);

export const getPublishedArticles = cache(
  async (limit = 100): Promise<PublicArticleSummary[]> => {
    try {
      const rows = await getDb()
        .select({
          id: articlesTable.id,
          slug: articlesTable.slug,
          title: articlesTable.title,
          excerpt: articlesTable.excerpt,
          category: articlesTable.category,
          readingTimeMinutes: articlesTable.readingTimeMinutes,
          viewCount: articlesTable.viewCount,
          coverImageId: articlesTable.coverImageId,
          coverAlt: articlesTable.coverAlt,
          authorName: usersTable.name,
          publishedAt: articlesTable.publishedAt,
          updatedAt: articlesTable.updatedAt,
        })
        .from(articlesTable)
        .leftJoin(usersTable, eq(articlesTable.authorId, usersTable.id))
        .where(eq(articlesTable.status, 'published'))
        .orderBy(desc(articlesTable.publishedAt), desc(articlesTable.updatedAt))
        .limit(limit);

      const fallbackAuthor = await getFallbackAuthorName();
      return rows.map((r) => mapToSummary(r, fallbackAuthor));
    } catch {
      return [];
    }
  },
);

export const getArticleBySlug = cache(
  async (slug: string): Promise<PublicArticleDetail | null> => {
    try {
      const rows = await getDb()
        .select({
          id: articlesTable.id,
          slug: articlesTable.slug,
          title: articlesTable.title,
          excerpt: articlesTable.excerpt,
          category: articlesTable.category,
          readingTimeMinutes: articlesTable.readingTimeMinutes,
          viewCount: articlesTable.viewCount,
          coverImageId: articlesTable.coverImageId,
          coverAlt: articlesTable.coverAlt,
          content: articlesTable.content,
          authorName: usersTable.name,
          publishedAt: articlesTable.publishedAt,
          updatedAt: articlesTable.updatedAt,
        })
        .from(articlesTable)
        .leftJoin(usersTable, eq(articlesTable.authorId, usersTable.id))
        .where(
          and(
            eq(articlesTable.slug, slug),
            eq(articlesTable.status, 'published'),
          ),
        )
        .limit(1);

      const row = rows[0];
      if (!row) return null;

      const summary = mapToSummary(row, await getFallbackAuthorName());
      const { html, toc, wordCount } = renderArticleContentWithToc(
        row.content as JSONContent,
      );

      return {
        ...summary,
        contentHtml: html,
        toc,
        wordCount,
      };
    } catch {
      return null;
    }
  },
);

export const getRelatedArticles = cache(
  async (params: {
    currentId: string;
    category: ArticleCategory;
    limit?: number;
  }): Promise<PublicArticleSummary[]> => {
    try {
      const rows = await getDb()
        .select({
          id: articlesTable.id,
          slug: articlesTable.slug,
          title: articlesTable.title,
          excerpt: articlesTable.excerpt,
          category: articlesTable.category,
          readingTimeMinutes: articlesTable.readingTimeMinutes,
          viewCount: articlesTable.viewCount,
          coverImageId: articlesTable.coverImageId,
          coverAlt: articlesTable.coverAlt,
          authorName: usersTable.name,
          publishedAt: articlesTable.publishedAt,
          updatedAt: articlesTable.updatedAt,
        })
        .from(articlesTable)
        .leftJoin(usersTable, eq(articlesTable.authorId, usersTable.id))
        .where(
          and(
            eq(articlesTable.status, 'published'),
            ne(articlesTable.id, params.currentId),
          ),
        )
        .orderBy(
          sql`CASE WHEN ${articlesTable.category} = ${params.category} THEN 0 ELSE 1 END`,
          desc(articlesTable.publishedAt),
        )
        .limit(params.limit ?? 3);

      const fallbackAuthor = await getFallbackAuthorName();
      return rows.map((r) => mapToSummary(r, fallbackAuthor));
    } catch {
      return [];
    }
  },
);

export const getAllArticleSlugs = cache(async (): Promise<string[]> => {
  try {
    const rows = await getDb()
      .select({ slug: articlesTable.slug })
      .from(articlesTable)
      .where(eq(articlesTable.status, 'published'));

    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
});

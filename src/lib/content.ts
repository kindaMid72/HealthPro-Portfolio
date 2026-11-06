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
  articleTranslations as articleTranslationsTable,
  articles as articlesTable,
  locations as locationsTable,
  profile as profileTable,
  profileTranslations as profileTranslationsTable,
  serviceTranslations as serviceTranslationsTable,
  services as servicesTable,
  users as usersTable,
} from '@/db/schema';
import type { Locale } from '@/i18n/config';
import { getDictionaryFor } from '@/i18n/dictionary';
import {
  type ArticleListFilters,
  type ArticleOrder,
  type ArticleSort,
  DEFAULT_SORT,
  defaultOrderFor,
  READING_TIME_RANGES,
} from './article-filters';
import {
  buildAutoExcerpt,
  escapeLike,
  renderArticleContentWithToc,
} from './articles';
import { isProperServiceDescription } from './service-content';
import { uniqueSlugs } from './slug';
import { countWords, extractPlainText } from './tiptap';
import {
  type ArticleCategory,
  isValidArticleCategory,
  type Location,
  LocationsListSchema,
  type Profile,
  ProfileSchema,
  type PublicArticleDetail,
  type PublicArticleSummary,
  type PublicService,
  type PublicServiceDetail,
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

function loadFallbackServices(): PublicService[] {
  try {
    const parsed = ServicesListSchema.parse(fallbackServicesJson);
    const slugs = uniqueSlugs(parsed.map((p) => p.service_name));
    return parsed.map((p, i) => ({
      service_name: p.service_name,
      nameId: p.service_name,
      service_description: isProperServiceDescription(p.service_description)
        ? p.service_description.trim()
        : '',
      slug: slugs[i],
      category: null,
      hasDetail: false,
      translated: false,
    }));
  } catch {
    return [];
  }
}

export const getProfile = cache(async (locale: Locale = 'id'): Promise<Profile> => {
  try {
    const db = getDb();
    const rows = await db
      .select({
        profile: profileTable,
        trans: profileTranslationsTable,
      })
      .from(profileTable)
      .leftJoin(
        profileTranslationsTable,
        and(
          eq(profileTranslationsTable.locale, 'en'),
          sql`${locale} = 'en'`,
        ),
      )
      .where(eq(profileTable.id, 1))
      .limit(1);

    const row = rows[0]?.profile;
    const trans = rows[0]?.trans;

    if (!row || !row.fullName.trim()) {
      return loadFallbackProfile();
    }

    const isEn = locale === 'en' && trans;

    return ProfileSchema.parse({
      full_name: row.fullName,
      specialty: (isEn && trans.specialty.trim()) || row.specialty,
      sub_specialty:
        (isEn && trans.subSpecialty.trim()) ||
        row.subSpecialty ||
        undefined,
      str_sip_display: row.strSipDisplay || undefined,
      photo_url: row.photoImageId
        ? `/media/${row.photoImageId}`
        : '/images/dokter-profile.webp',
      education: (isEn && trans.education.trim()) || row.education,
      certifications:
        (isEn && trans.certifications.trim()) ||
        row.certifications ||
        undefined,
      experience_history:
        (isEn && trans.experienceHistory.trim()) || row.experienceHistory,
      organizations:
        (isEn && trans.organizations.trim()) ||
        row.organizations ||
        undefined,
      booking_url: row.bookingUrl || undefined,
      email: row.email || undefined,
      social_links: row.socialLinks || undefined,
      personal_story:
        (isEn && trans.personalStory.trim()) ||
        row.personalStory ||
        undefined,
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

export const getServices = cache(async (locale: Locale = 'id'): Promise<PublicService[]> => {
  try {
    const rows = await getDb()
      .select({
        serviceName: servicesTable.serviceName,
        serviceDescription: servicesTable.serviceDescription,
        slug: servicesTable.slug,
        category: servicesTable.category,
        content: servicesTable.content,
        transServiceName: serviceTranslationsTable.serviceName,
        transServiceDescription: serviceTranslationsTable.serviceDescription,
        transContent: serviceTranslationsTable.content,
      })
      .from(servicesTable)
      .leftJoin(
        serviceTranslationsTable,
        and(
          eq(serviceTranslationsTable.serviceId, servicesTable.id),
          eq(serviceTranslationsTable.locale, 'en'),
          sql`${locale} = 'en'`,
        ),
      )
      .orderBy(asc(servicesTable.sortOrder));

    if (rows.length === 0) {
      return loadFallbackServices();
    }

    return rows.map((r) => {
      const isEn = locale === 'en';
      const isTranslated =
        isEn &&
        Boolean(
          r.transServiceName?.trim() &&
            countWords(r.transContent as JSONContent) > 0,
        );

      let serviceName = r.serviceName;
      if (isEn && r.transServiceName?.trim()) {
        serviceName = r.transServiceName.trim();
      }

      let serviceDescription = isProperServiceDescription(r.serviceDescription)
        ? r.serviceDescription.trim()
        : '';
      if (isEn && r.transServiceDescription?.trim()) {
        serviceDescription = r.transServiceDescription.trim();
      }

      return {
        service_name: serviceName,
        nameId: r.serviceName,
        service_description: serviceDescription,
        slug: r.slug,
        category: r.category ?? null,
        hasDetail: countWords(r.content as JSONContent) > 0,
        translated: isEn ? isTranslated : true,
      };
    });
  } catch (err) {
    console.error('[content] getServices gagal, memakai data fallback:', err);
    return loadFallbackServices();
  }
});

/** Detail layanan untuk /layanan/[slug]; null bila tak ada atau kontennya kosong. */
export const getServiceBySlug = cache(
  async (slug: string, locale: Locale = 'id'): Promise<PublicServiceDetail | null> => {
    try {
      const rows = await getDb()
        .select({
          service: servicesTable,
          trans: serviceTranslationsTable,
        })
        .from(servicesTable)
        .leftJoin(
          serviceTranslationsTable,
          and(
            eq(serviceTranslationsTable.serviceId, servicesTable.id),
            eq(serviceTranslationsTable.locale, 'en'),
            sql`${locale} = 'en'`,
          ),
        )
        .where(eq(servicesTable.slug, slug))
        .limit(1);

      const row = rows[0]?.service;
      const trans = rows[0]?.trans;

      if (!row || countWords(row.content as JSONContent) === 0) return null;

      const isEn = locale === 'en';
      const isTranslated =
        isEn &&
        Boolean(
          trans?.serviceName?.trim() &&
            countWords(trans?.content as JSONContent) > 0,
        );

      let serviceName = row.serviceName;
      let serviceDescription = isProperServiceDescription(row.serviceDescription)
        ? row.serviceDescription.trim()
        : '';
      let content = row.content as JSONContent;
      let updatedAt = row.updatedAt;

      if (isTranslated && trans) {
        serviceName = trans.serviceName.trim();
        serviceDescription =
          trans.serviceDescription.trim() || serviceDescription;
        content = trans.content as JSONContent;
        if (trans.updatedAt > updatedAt) {
          updatedAt = trans.updatedAt;
        }
      }

      const { html, toc } = renderArticleContentWithToc(content);

      return {
        service_name: serviceName,
        nameId: row.serviceName,
        service_description: serviceDescription,
        slug: row.slug,
        category: row.category ?? null,
        hasDetail: true,
        contentHtml: html,
        toc,
        updatedAt,
        translated: isEn ? isTranslated : true,
      };
    } catch (err) {
      console.error('[content] getServiceBySlug gagal:', err);
      return null;
    }
  },
);

export const getServiceSlugsWithDetail = cache(
  async (): Promise<{ slug: string; updatedAt: Date }[]> => {
    try {
      const rows = await getDb()
        .select({
          slug: servicesTable.slug,
          content: servicesTable.content,
          updatedAt: servicesTable.updatedAt,
        })
        .from(servicesTable);
      return rows
        .filter((r) => countWords(r.content as JSONContent) > 0)
        .map((r) => ({ slug: r.slug, updatedAt: r.updatedAt }));
    } catch {
      return [];
    }
  },
);

export const getAllSiteData = cache(async (locale: Locale = 'id'): Promise<SiteData> => {
  const [profile, locations, services] = await Promise.all([
    getProfile(locale),
    getLocations(),
    getServices(locale),
  ]);
  return { profile, locations, services };
});

async function getFallbackAuthorName(locale: Locale = 'id'): Promise<string> {
  return (await getProfile(locale)).full_name;
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
    transTitle?: string | null;
    transExcerpt?: string | null;
    transCoverAlt?: string | null;
    transReadingTimeMinutes?: number | null;
    transContent?: JSONContent | null;
  },
  fallbackAuthor: string,
  locale: Locale,
  categoryLabel: string,
): PublicArticleSummary {
  const isEn = locale === 'en';
  const isTranslated =
    isEn &&
    Boolean(
      row.transTitle?.trim() &&
        countWords(row.transContent as JSONContent) > 0,
    );

  let title = row.title;
  let excerpt = row.excerpt;
  let coverAlt = row.coverAlt;
  let readingTimeMinutes = row.readingTimeMinutes;

  if (isEn) {
    if (row.transTitle?.trim()) {
      title = row.transTitle.trim();
    }
    if (row.transExcerpt?.trim()) {
      excerpt = row.transExcerpt.trim();
    } else if (isTranslated && row.transContent) {
      excerpt = buildAutoExcerpt(extractPlainText(row.transContent), 155);
    }
    if (row.transCoverAlt?.trim()) {
      coverAlt = row.transCoverAlt.trim();
    }
    if (isTranslated && row.transReadingTimeMinutes) {
      readingTimeMinutes = row.transReadingTimeMinutes;
    }
  }

  return {
    id: row.id,
    slug: row.slug,
    title,
    excerpt,
    category: row.category,
    categoryLabel,
    readingTimeMinutes,
    viewCount: row.viewCount,
    coverImageUrl: row.coverImageId ? `/media/${row.coverImageId}` : null,
    coverAlt,
    authorName: row.authorName ?? fallbackAuthor,
    publishedAt: row.publishedAt ?? row.updatedAt,
    updatedAt: row.updatedAt,
    translated: isEn ? isTranslated : true,
  };
}

export interface PaginatedArticlesResult {
  items: PublicArticleSummary[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const publishedAtExpr = sql`COALESCE(${articlesTable.publishedAt}, ${articlesTable.updatedAt})`;

function effectiveTitleExpr(isEn: boolean): SQL {
  return isEn
    ? sql`CASE WHEN btrim(${articleTranslationsTable.title}) <> '' THEN ${articleTranslationsTable.title} ELSE ${articlesTable.title} END`
    : sql`${articlesTable.title}`;
}

function effectiveReadingExpr(isEn: boolean): SQL {
  return isEn
    ? sql`CASE WHEN btrim(${articleTranslationsTable.title}) <> '' THEN ${articleTranslationsTable.readingTimeMinutes} ELSE ${articlesTable.readingTimeMinutes} END`
    : sql`${articlesTable.readingTimeMinutes}`;
}

function buildArticleOrderBy(sort: ArticleSort, order: ArticleOrder, isEn: boolean): SQL[] {
  const dir = order === 'asc' ? asc : desc;
  switch (sort) {
    case 'populer':
      return [dir(articlesTable.viewCount), desc(publishedAtExpr), asc(articlesTable.id)];
    case 'judul':
      return [dir(sql`lower(${effectiveTitleExpr(isEn)})`), asc(articlesTable.id)];
    case 'baca':
      return [dir(effectiveReadingExpr(isEn)), desc(publishedAtExpr), asc(articlesTable.id)];
    default:
      return [dir(publishedAtExpr), asc(articlesTable.id)];
  }
}

export const getPaginatedArticles = cache(
  async (
    options?: {
      page?: number;
      limit?: number;
      locale?: Locale;
    } & Partial<Pick<ArticleListFilters, 'category' | 'query' | 'sort' | 'order' | 'reading' | 'from' | 'to'>>,
  ): Promise<PaginatedArticlesResult> => {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, options?.limit ?? PAGE_SIZE);
    const offset = (page - 1) * limit;
    const locale: Locale = options?.locale ?? 'id';

    try {
      const db = getDb();
      const dict = await getDictionaryFor(locale);
      const isEn = locale === 'en';
      const sort = options?.sort ?? DEFAULT_SORT;
      const order = options?.order ?? defaultOrderFor(sort);
      const conditions: SQL[] = [eq(articlesTable.status, 'published')];

      if (options?.category && isValidArticleCategory(options.category)) {
        conditions.push(eq(articlesTable.category, options.category));
      }

      const q = options?.query?.trim();
      if (q) {
        const escaped = escapeLike(q);
        if (isEn) {
          const effectiveTitle = effectiveTitleExpr(isEn);
          const effectiveExcerpt = sql`COALESCE(NULLIF(${articleTranslationsTable.excerpt}, ''), ${articlesTable.excerpt})`;
          const searchCond = or(
            ilike(effectiveTitle, `%${escaped}%`),
            ilike(effectiveExcerpt, `%${escaped}%`),
          );
          if (searchCond) conditions.push(searchCond);
        } else {
          const searchCond = or(
            ilike(articlesTable.title, `%${escaped}%`),
            ilike(articlesTable.excerpt, `%${escaped}%`),
          );
          if (searchCond) conditions.push(searchCond);
        }
      }

      if (options?.reading) {
        const range = READING_TIME_RANGES[options.reading];
        const readingExpr = effectiveReadingExpr(isEn);
        if (range.min !== undefined) conditions.push(sql<boolean>`${readingExpr} >= ${range.min}`);
        if (range.max !== undefined) conditions.push(sql<boolean>`${readingExpr} <= ${range.max}`);
      }

      if (options?.from) {
        conditions.push(
          sql<boolean>`${publishedAtExpr} >= ${`${options.from}T00:00:00+08:00`}::timestamptz`,
        );
      }

      if (options?.to) {
        const endIso = new Date(
          Date.parse(`${options.to}T00:00:00+08:00`) + 86_400_000,
        ).toISOString();
        conditions.push(sql<boolean>`${publishedAtExpr} < ${endIso}::timestamptz`);
      }

      const whereClause = and(...conditions);

      const [[totalRow], rows] = await Promise.all([
        db
          .select({ total: count() })
          .from(articlesTable)
          .leftJoin(
            articleTranslationsTable,
            and(
              eq(articleTranslationsTable.articleId, articlesTable.id),
              eq(articleTranslationsTable.locale, 'en'),
            ),
          )
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
            transTitle: articleTranslationsTable.title,
            transExcerpt: articleTranslationsTable.excerpt,
            transCoverAlt: articleTranslationsTable.coverAlt,
            transReadingTimeMinutes: articleTranslationsTable.readingTimeMinutes,
            transContent: articleTranslationsTable.content,
          })
          .from(articlesTable)
          .leftJoin(usersTable, eq(articlesTable.authorId, usersTable.id))
          .leftJoin(
            articleTranslationsTable,
            and(
              eq(articleTranslationsTable.articleId, articlesTable.id),
              eq(articleTranslationsTable.locale, 'en'),
            ),
          )
          .where(whereClause)
          .orderBy(...buildArticleOrderBy(sort, order, isEn))
          .limit(limit)
          .offset(offset),
      ]);

      const total = Number(totalRow?.total ?? 0);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const fallbackAuthor = await getFallbackAuthorName(locale);

      return {
        items: rows.map((r) =>
          mapToSummary(
            r,
            fallbackAuthor,
            locale,
            dict.categories[r.category] ?? dict.categories.umum,
          ),
        ),
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
  async (limit = 100, locale: Locale = 'id'): Promise<PublicArticleSummary[]> => {
    try {
      const dict = await getDictionaryFor(locale);
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
          transTitle: articleTranslationsTable.title,
          transExcerpt: articleTranslationsTable.excerpt,
          transCoverAlt: articleTranslationsTable.coverAlt,
          transReadingTimeMinutes: articleTranslationsTable.readingTimeMinutes,
          transContent: articleTranslationsTable.content,
        })
        .from(articlesTable)
        .leftJoin(usersTable, eq(articlesTable.authorId, usersTable.id))
        .leftJoin(
          articleTranslationsTable,
          and(
            eq(articleTranslationsTable.articleId, articlesTable.id),
            eq(articleTranslationsTable.locale, 'en'),
            sql`${locale} = 'en'`,
          ),
        )
        .where(eq(articlesTable.status, 'published'))
        .orderBy(desc(articlesTable.publishedAt), desc(articlesTable.updatedAt))
        .limit(limit);

      const fallbackAuthor = await getFallbackAuthorName(locale);
      return rows.map((r) =>
        mapToSummary(
          r,
          fallbackAuthor,
          locale,
          dict.categories[r.category] ?? dict.categories.umum,
        ),
      );
    } catch {
      return [];
    }
  },
);

export const getArticleBySlug = cache(
  async (slug: string, locale: Locale = 'id'): Promise<PublicArticleDetail | null> => {
    try {
      const dict = await getDictionaryFor(locale);
      const rows = await getDb()
        .select({
          article: articlesTable,
          trans: articleTranslationsTable,
          authorName: usersTable.name,
        })
        .from(articlesTable)
        .leftJoin(usersTable, eq(articlesTable.authorId, usersTable.id))
        .leftJoin(
          articleTranslationsTable,
          and(
            eq(articleTranslationsTable.articleId, articlesTable.id),
            eq(articleTranslationsTable.locale, 'en'),
            sql`${locale} = 'en'`,
          ),
        )
        .where(
          and(
            eq(articlesTable.slug, slug),
            eq(articlesTable.status, 'published'),
          ),
        )
        .limit(1);

      const row = rows[0]?.article;
      const trans = rows[0]?.trans;
      const authorName = rows[0]?.authorName;

      if (!row) return null;

      const isEn = locale === 'en';
      const isTranslated =
        isEn &&
        Boolean(
          trans?.title?.trim() &&
            countWords(trans?.content as JSONContent) > 0,
        );

      let title = row.title;
      let excerpt = row.excerpt;
      let coverAlt = row.coverAlt;
      let content = row.content as JSONContent;
      let readingTimeMinutes = row.readingTimeMinutes;
      let updatedAt = row.updatedAt;

      if (isEn) {
        if (trans?.title?.trim()) {
          title = trans.title.trim();
        }
        if (trans?.excerpt?.trim()) {
          excerpt = trans.excerpt.trim();
        } else if (isTranslated && trans?.content) {
          excerpt = buildAutoExcerpt(extractPlainText(trans.content as JSONContent), 155);
        }
        if (trans?.coverAlt?.trim()) {
          coverAlt = trans.coverAlt.trim();
        }
        if (isTranslated && trans?.content) {
          content = trans.content as JSONContent;
          readingTimeMinutes = trans.readingTimeMinutes;
          if (trans.updatedAt > updatedAt) {
            updatedAt = trans.updatedAt;
          }
        }
      }

      const fallbackAuthor = await getFallbackAuthorName(locale);
      const { html, toc, wordCount } = renderArticleContentWithToc(content);

      return {
        id: row.id,
        slug: row.slug,
        title,
        excerpt,
        category: row.category,
        categoryLabel: dict.categories[row.category] ?? dict.categories.umum,
        readingTimeMinutes,
        viewCount: row.viewCount,
        coverImageUrl: row.coverImageId ? `/media/${row.coverImageId}` : null,
        coverAlt,
        authorName: authorName ?? fallbackAuthor,
        publishedAt: row.publishedAt ?? row.updatedAt,
        updatedAt,
        translated: isEn ? isTranslated : true,
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
    locale?: Locale;
  }): Promise<PublicArticleSummary[]> => {
    const locale: Locale = params.locale ?? 'id';
    try {
      const dict = await getDictionaryFor(locale);
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
          transTitle: articleTranslationsTable.title,
          transExcerpt: articleTranslationsTable.excerpt,
          transCoverAlt: articleTranslationsTable.coverAlt,
          transReadingTimeMinutes: articleTranslationsTable.readingTimeMinutes,
          transContent: articleTranslationsTable.content,
        })
        .from(articlesTable)
        .leftJoin(usersTable, eq(articlesTable.authorId, usersTable.id))
        .leftJoin(
          articleTranslationsTable,
          and(
            eq(articleTranslationsTable.articleId, articlesTable.id),
            eq(articleTranslationsTable.locale, 'en'),
            sql`${locale} = 'en'`,
          ),
        )
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

      const fallbackAuthor = await getFallbackAuthorName(locale);
      return rows.map((r) =>
        mapToSummary(
          r,
          fallbackAuthor,
          locale,
          dict.categories[r.category] ?? dict.categories.umum,
        ),
      );
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

/**
 * Kembalikan slug artikel terpublikasi dan layanan dengan detail
 * yang memiliki baris terjemahan EN yang memenuhi syarat "translated":
 * - non-empty title/serviceName
 * - countWords(content) > 0
 */
export const getTranslatedSlugs = cache(
  async (): Promise<{ articles: Set<string>; services: Set<string> }> => {
    try {
      const db = getDb();
      const [articleRows, serviceRows] = await Promise.all([
        db
          .select({
            slug: articlesTable.slug,
            title: articleTranslationsTable.title,
            content: articleTranslationsTable.content,
          })
          .from(articlesTable)
          .innerJoin(
            articleTranslationsTable,
            and(
              eq(articleTranslationsTable.articleId, articlesTable.id),
              eq(articleTranslationsTable.locale, 'en'),
            ),
          )
          .where(eq(articlesTable.status, 'published')),
        db
          .select({
            slug: servicesTable.slug,
            baseContent: servicesTable.content,
            serviceName: serviceTranslationsTable.serviceName,
            transContent: serviceTranslationsTable.content,
          })
          .from(servicesTable)
          .innerJoin(
            serviceTranslationsTable,
            and(
              eq(serviceTranslationsTable.serviceId, servicesTable.id),
              eq(serviceTranslationsTable.locale, 'en'),
            ),
          ),
      ]);

      const articles = new Set<string>();
      for (const row of articleRows) {
        if (
          row.title.trim() &&
          countWords(row.content as JSONContent) > 0
        ) {
          articles.add(row.slug);
        }
      }

      const services = new Set<string>();
      for (const row of serviceRows) {
        if (
          countWords(row.baseContent as JSONContent) > 0 &&
          row.serviceName.trim() &&
          countWords(row.transContent as JSONContent) > 0
        ) {
          services.add(row.slug);
        }
      }

      return { articles, services };
    } catch (err) {
      console.error('[content] getTranslatedSlugs gagal:', err);
      return { articles: new Set(), services: new Set() };
    }
  },
);

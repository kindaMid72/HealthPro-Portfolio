import { randomBytes } from 'node:crypto';
import type { JSONContent } from '@tiptap/core';
import {
  type ArticleStatus,
  calculateReadingTimeMinutes,
  countWords,
  EMPTY_TIPTAP_DOC,
  extractPlainText,
  getArticleTiptapExtensions,
} from './tiptap';
import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string';
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  lt,
  ne,
  notInArray,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { getDb } from '@/db/client';
import { UserFacingError } from '@/lib/action-error';
import {
  articleTranslations,
  articles,
  images,
  locations,
  profile,
  services,
  users,
} from '@/db/schema';
import { revalidatePublicSite } from './revalidate';
import { isProperServiceDescription } from './service-content';
import { toSlug } from './slug';
import type { ArticleCategory, TocItem } from './types';

export {
  type ArticleStatus,
  calculateReadingTimeMinutes,
  countWords,
  EMPTY_TIPTAP_DOC,
  extractPlainText,
  getArticleTiptapExtensions,
};

export function slugify(text: string): string {
  return toSlug(text) || `artikel-${randomBytes(3).toString('hex')}`;
}

/** Cari slug bebas: dasar, lalu `-2`…`-50`, terakhir akhiran acak. `isTaken` menentukan bentrok. */
export async function findAvailableSlug(
  baseSlug: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  for (let attempt = 1; attempt <= 50; attempt++) {
    const candidate = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;
    if (!(await isTaken(candidate))) return candidate;
  }
  return `${baseSlug}-${randomBytes(3).toString('hex')}`;
}

export async function makeUniqueSlug(
  baseText: string,
  currentId?: string,
): Promise<string> {
  const db = getDb();
  return findAvailableSlug(slugify(baseText), async (candidate) => {
    const existing = await db
      .select({ id: articles.id })
      .from(articles)
      .where(
        currentId
          ? and(eq(articles.slug, candidate), ne(articles.id, currentId))
          : eq(articles.slug, candidate),
      )
      .limit(1);
    return existing.length > 0;
  });
}

/** Escape wildcard LIKE (%, _, \\) agar pencarian pengguna dibaca harfiah. */
export function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export function collectImageIds(content: JSONContent | null | undefined): string[] {
  if (!content) return [];
  const ids = new Set<string>();
  const mediaRegex = /\/media\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

  function walk(node: JSONContent) {
    if (node.type === 'image' && typeof node.attrs?.src === 'string') {
      const match = mediaRegex.exec(node.attrs.src);
      if (match?.[1]) {
        ids.add(match[1]);
      }
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        walk(child);
      }
    }
  }

  walk(content);
  return Array.from(ids);
}

export function renderArticleContentWithToc(
  content: JSONContent | null | undefined,
): { html: string; toc: TocItem[]; wordCount: number } {
  const safeContent =
    content && content.type === 'doc' ? content : EMPTY_TIPTAP_DOC;

  let rawHtml = '';
  try {
    rawHtml = renderToHTMLString({
      content: safeContent,
      extensions: getArticleTiptapExtensions(),
    });
  } catch {
    rawHtml = '';
  }

  const seenIds = new Map<string, number>();
  const toc: TocItem[] = [];

  const withHeadings = rawHtml.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_full, levelStr: string, attrs: string, innerHtml: string) => {
      const plainText = innerHtml
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (!plainText) return _full;
      const baseId = slugify(plainText);
      const count = (seenIds.get(baseId) ?? 0) + 1;
      seenIds.set(baseId, count);
      const id = count === 1 ? baseId : `${baseId}-${count}`;
      toc.push({ id, text: plainText, level: Number(levelStr) as 2 | 3 });
      const cleanAttrs = attrs.replace(/\s+id="[^"]*"/gi, '');
      return `<h${levelStr}${cleanAttrs} id="${id}">${innerHtml}</h${levelStr}>`;
    },
  );

  const html = withHeadings.replace(
    /<img\b([^>]*?)\btitle="([^"]+)"([^>]*?)\/?>/gi,
    (fullImg, beforeTitle: string, titleText: string, afterTitle: string) => {
      const caption = titleText.trim();
      if (!caption) return fullImg;
      return `<figure class="my-6"><img${beforeTitle}title="${titleText}"${afterTitle} /><figcaption class="mt-2 text-center text-xs text-text-muted">${caption}</figcaption></figure>`;
    },
  );

  return {
    html,
    toc,
    wordCount: countWords(safeContent),
  };
}

export function validatePublishable(article: {
  title: string;
  slug: string;
  content: JSONContent;
}): { ok: boolean; reason?: string } {
  if (!article.title.trim()) {
    return { ok: false, reason: 'Judul artikel tidak boleh kosong.' };
  }
  if (!article.slug.trim()) {
    return { ok: false, reason: 'Slug artikel tidak boleh kosong.' };
  }
  const plain = extractPlainText(article.content);
  if (plain.length < 20) {
    return {
      ok: false,
      reason: 'Isi artikel terlalu pendek untuk diterbitkan (minimal 20 karakter).',
    };
  }
  return { ok: true };
}

export function buildAutoExcerpt(text: string, maxLen = 155): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  const sliced = cleaned.slice(0, maxLen);
  const lastSpace = sliced.lastIndexOf(' ');
  const cutoff = lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced;
  return `${cutoff.replace(/[.,;:\-–—]+$/, '')}…`;
}

export interface AdminArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  status: ArticleStatus;
  reviewNote: string;
  readingTimeMinutes: number;
  viewCount: number;
  authorName: string;
  updatedAt: Date;
  publishedAt: Date | null;
}

export async function listArticlesAdmin(filter?: {
  status?: ArticleStatus;
  category?: ArticleCategory;
  query?: string;
}): Promise<AdminArticleListItem[]> {
  const db = getDb();
  const conditions: SQL[] = [];

  if (filter?.status) {
    conditions.push(eq(articles.status, filter.status));
  }
  if (filter?.category) {
    conditions.push(eq(articles.category, filter.category));
  }
  const q = filter?.query?.trim();
  if (q) {
    const cond = or(
      ilike(articles.title, `%${escapeLike(q)}%`),
      ilike(articles.excerpt, `%${escapeLike(q)}%`),
    );
    if (cond) conditions.push(cond);
  }

  const rows = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      category: articles.category,
      status: articles.status,
      reviewNote: articles.reviewNote,
      readingTimeMinutes: articles.readingTimeMinutes,
      viewCount: articles.viewCount,
      authorName: users.name,
      updatedAt: articles.updatedAt,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(articles.updatedAt));

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    category: r.category,
    status: r.status,
    reviewNote: r.reviewNote,
    readingTimeMinutes: r.readingTimeMinutes,
    viewCount: r.viewCount,
    authorName: r.authorName ?? 'Tim Medis',
    updatedAt: r.updatedAt,
    publishedAt: r.publishedAt,
  }));
}

export async function getArticleAdminById(id: string) {
  const rows = await getDb()
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      category: articles.category,
      coverImageId: articles.coverImageId,
      coverAlt: articles.coverAlt,
      content: articles.content,
      status: articles.status,
      reviewNote: articles.reviewNote,
      readingTimeMinutes: articles.readingTimeMinutes,
      viewCount: articles.viewCount,
      authorId: articles.authorId,
      authorName: users.name,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      publishedAt: articles.publishedAt,
      enTitle: articleTranslations.title,
      enExcerpt: articleTranslations.excerpt,
      enCoverAlt: articleTranslations.coverAlt,
      enContent: articleTranslations.content,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .leftJoin(
      articleTranslations,
      and(
        eq(articleTranslations.articleId, articles.id),
        eq(articleTranslations.locale, 'en'),
      ),
    )
    .where(eq(articles.id, id))
    .limit(1);

  const r = rows[0];
  if (!r) return null;

  return {
    ...r,
    en: {
      title: r.enTitle ?? '',
      excerpt: r.enExcerpt ?? '',
      coverAlt: r.enCoverAlt ?? '',
      content: (r.enContent as JSONContent) ?? EMPTY_TIPTAP_DOC,
    },
  };
}

export async function createArticle(params: {
  authorId: string;
  title?: string;
  category?: ArticleCategory;
}) {
  const title = params.title?.trim() ?? '';
  const slug = await makeUniqueSlug(
    title || `draft-${randomBytes(3).toString('hex')}`,
  );

  const [created] = await getDb()
    .insert(articles)
    .values({
      slug,
      title,
      excerpt: '',
      category: params.category ?? 'umum',
      content: EMPTY_TIPTAP_DOC,
      status: 'draft',
      readingTimeMinutes: 1,
      authorId: params.authorId,
      updatedBy: params.authorId,
    })
    .returning();

  return created;
}

export interface UpdateArticleParams {
  title?: string;
  slug?: string;
  excerpt?: string;
  category?: ArticleCategory;
  coverImageId?: string | null;
  coverAlt?: string;
  content?: JSONContent;
  status?: ArticleStatus;
  reviewNote?: string;
  updatedBy: string;
  expectedUpdatedAt?: string | Date;
  en?: {
    title: string;
    excerpt: string;
    coverAlt: string;
    content: JSONContent;
  };
}

export async function updateArticle(id: string, params: UpdateArticleParams) {
  const db = getDb();
  const [current] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  if (!current) {
    throw new UserFacingError('Artikel tidak ditemukan.');
  }

  if (params.expectedUpdatedAt) {
    const expectedMs = new Date(params.expectedUpdatedAt).getTime();
    if (
      !Number.isNaN(expectedMs) &&
      Math.abs(current.updatedAt.getTime() - expectedMs) > 1000
    ) {
      throw new UserFacingError(
        'Artikel sudah diubah di tab/akun lain. Muat ulang halaman sebelum menyimpan.',
      );
    }
  }

  const activeTitle =
    params.title !== undefined ? params.title.trim() : current.title;
  const activeContent = params.content ?? current.content;
  const activeStatus = params.status ?? current.status;
  let activeSlug = current.slug;

  if (params.slug !== undefined && params.slug.trim() !== '') {
    const desiredSlug = slugify(params.slug.trim());
    if (desiredSlug !== current.slug) {
      activeSlug = await makeUniqueSlug(desiredSlug, id);
    }
  } else if (activeTitle && current.slug.startsWith('draft-')) {
    activeSlug = await makeUniqueSlug(activeTitle, id);
  }

  if (activeStatus === 'published') {
    const check = validatePublishable({
      title: activeTitle,
      slug: activeSlug,
      content: activeContent,
    });
    if (!check.ok) {
      throw new UserFacingError(check.reason ?? 'Artikel belum memenuhi syarat terbit.');
    }
  }

  let activeExcerpt =
    params.excerpt !== undefined ? params.excerpt.trim() : current.excerpt;
  if (!activeExcerpt && activeStatus === 'published') {
    const plain = extractPlainText(activeContent);
    if (plain) {
      activeExcerpt = buildAutoExcerpt(plain);
    }
  }

  const activeCover =
    params.coverImageId !== undefined
      ? params.coverImageId
      : current.coverImageId;
  const [existingEn] = await db
    .select({ content: articleTranslations.content })
    .from(articleTranslations)
    .where(
      and(
        eq(articleTranslations.articleId, id),
        eq(articleTranslations.locale, 'en'),
      ),
    )
    .limit(1);

  const enContentForGc = params.en
    ? params.en.content
    : (existingEn?.content as JSONContent | undefined);

  // Hitung gambar yang dipakai SEBELUM menulis, mencakup konten ID dan EN (GC fix)
  const retainedImageIds = new Set<string>(collectImageIds(activeContent));
  if (activeCover) {
    retainedImageIds.add(activeCover);
  }
  for (const enImgId of collectImageIds(enContentForGc)) {
    retainedImageIds.add(enImgId);
  }
  const retainedArray = Array.from(retainedImageIds);

  const readingTimeMinutes = calculateReadingTimeMinutes(activeContent);
  const now = new Date();
  const publishedAt =
    activeStatus === 'published'
      ? (current.publishedAt ?? now)
      : current.publishedAt;

  const [updated] = await db
    .update(articles)
    .set({
      title: activeTitle,
      slug: activeSlug,
      excerpt: activeExcerpt,
      category: params.category ?? current.category,
      coverImageId: activeCover,
      coverAlt:
        params.coverAlt !== undefined ? params.coverAlt.trim() : current.coverAlt,
      content: activeContent,
      status: activeStatus,
      reviewNote:
        params.reviewNote !== undefined
          ? params.reviewNote.trim()
          : current.reviewNote,
      readingTimeMinutes,
      updatedBy: params.updatedBy,
      updatedAt: now,
      publishedAt,
    })
    .where(eq(articles.id, id))
    .returning();

  if (params.en !== undefined) {
    const enTitle = params.en.title.trim();
    const enExcerpt = params.en.excerpt.trim();
    const enCoverAlt = params.en.coverAlt.trim();
    const enContent = params.en.content;
    const hasEn = Boolean(
      enTitle || enExcerpt || enCoverAlt || countWords(enContent) > 0,
    );

    if (hasEn) {
      const enReadingTime = calculateReadingTimeMinutes(enContent);
      await db
        .insert(articleTranslations)
        .values({
          articleId: id,
          locale: 'en',
          title: enTitle,
          excerpt: enExcerpt,
          coverAlt: enCoverAlt,
          content: enContent,
          readingTimeMinutes: enReadingTime,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [articleTranslations.articleId, articleTranslations.locale],
          set: {
            title: enTitle,
            excerpt: enExcerpt,
            coverAlt: enCoverAlt,
            content: enContent,
            readingTimeMinutes: enReadingTime,
            updatedAt: now,
          },
        });
    } else {
      await db
        .delete(articleTranslations)
        .where(
          and(
            eq(articleTranslations.articleId, id),
            eq(articleTranslations.locale, 'en'),
          ),
        );
    }
  }

  // Revalidasi dulu: tulisan sudah commit, cache publik tidak boleh basi
  // hanya karena langkah pembersihan di bawah gagal.
  revalidatePublicSite(updated.slug);
  if (current.slug !== updated.slug) {
    revalidatePublicSite(current.slug);
  }

  // Garbage collection gambar artikel yang sudah tidak dipakai di cover maupun isi.
  // Hanya gambar yang sudah > 10 menit yang dihapus, agar gambar yang baru
  // diunggah saat autosave berjalan tidak ikut terhapus.
  try {
    const gcCutoff = new Date(now.getTime() - 10 * 60 * 1000);
    const notRetained =
      retainedArray.length > 0
        ? notInArray(images.id, retainedArray)
        : undefined;
    await db
      .delete(images)
      .where(
        and(
          eq(images.articleId, id),
          lt(images.createdAt, gcCutoff),
          notRetained,
        ),
      );
  } catch (err) {
    console.error('[updateArticle] Gagal membersihkan gambar yatim:', err);
  }

  return updated;
}

export async function deleteArticle(id: string): Promise<void> {
  const db = getDb();
  const [existing] = await db
    .select({ slug: articles.slug })
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  await db.delete(articles).where(eq(articles.id, id));
  revalidatePublicSite(existing?.slug);
}

export async function incrementArticleViewCount(
  slug: string,
): Promise<number | null> {
  const [updated] = await getDb()
    .update(articles)
    .set({ viewCount: sql`${articles.viewCount} + 1` })
    .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
    .returning({ viewCount: articles.viewCount });

  return updated?.viewCount ?? null;
}

export async function getArticleViewCount(slug: string): Promise<number | null> {
  const [row] = await getDb()
    .select({ viewCount: articles.viewCount })
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
    .limit(1);

  return row?.viewCount ?? null;
}

export interface CompletenessItem {
  id: string;
  label: string;
  completed: boolean;
  href: string;
  hint: string;
}

export interface AdminDashboardStats {
  publishedCount: number;
  inReviewCount: number;
  draftCount: number;
  totalViews: number;
  recentArticles: AdminArticleListItem[];
  completeness: CompletenessItem[];
}

function isFilledField(val: string | null | undefined): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  return trimmed.length > 0 && !trimmed.includes('[BELUM DIISI]');
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const db = getDb();

  const [
    articleAllRows,
    recentArticles,
    profileRows,
    locationRows,
    serviceRows,
  ] = await Promise.all([
    db
      .select({
        status: articles.status,
        viewCount: articles.viewCount,
      })
      .from(articles),
    listArticlesAdmin(),
    db.select().from(profile).where(eq(profile.id, 1)).limit(1),
    db.select().from(locations).orderBy(asc(locations.sortOrder)),
    db.select().from(services).orderBy(asc(services.sortOrder)),
  ]);

  let publishedCount = 0;
  let inReviewCount = 0;
  let draftCount = 0;
  let totalViews = 0;

  for (const row of articleAllRows) {
    totalViews += row.viewCount ?? 0;
    if (row.status === 'published') publishedCount++;
    else if (row.status === 'in_review') inReviewCount++;
    else draftCount++;
  }

  const prof = profileRows[0];

  const hasNameAndSpecialty =
    isFilledField(prof?.fullName) && isFilledField(prof?.specialty);
  const hasStrSip = isFilledField(prof?.strSipDisplay);
  const hasPersonalStory = isFilledField(prof?.personalStory);
  const hasBookingOrWa =
    isFilledField(prof?.bookingUrl) ||
    locationRows.some((l) => isFilledField(l.whatsapp));
  const allLocationsHaveContact =
    locationRows.length > 0 &&
    locationRows.every(
      (l) => isFilledField(l.whatsapp) || isFilledField(l.phone),
    );
  const allServicesHaveProperDesc =
    serviceRows.length > 0 &&
    serviceRows.every((s) => isProperServiceDescription(s.serviceDescription ?? ''));

  const completeness: CompletenessItem[] = [
    {
      id: 'name_specialty',
      label: 'Nama & Spesialisasi Dokter',
      completed: hasNameAndSpecialty,
      href: '/admin/profile',
      hint: 'Pastikan nama lengkap bergelar dan spesialisasi utama terisi.',
    },
    {
      id: 'str_sip',
      label: 'Nomor STR / SIP Ditampilkan',
      completed: hasStrSip,
      href: '/admin/profile',
      hint: 'Nomor STR/SIP meningkatkan kredibilitas klinis dan E-E-A-T medis.',
    },
    {
      id: 'personal_story',
      label: 'Biografi Singkat (Personal Story)',
      completed: hasPersonalStory,
      href: '/admin/profile',
      hint: 'Tambahkan pengantar singkat tentang pendekatan pelayanan dokter.',
    },
    {
      id: 'booking_cta',
      label: 'Tautan Booking Global atau WhatsApp Lokasi',
      completed: hasBookingOrWa,
      href: '/admin/profile',
      hint: 'Diperlukan agar tombol CTA utama di website berfungsi.',
    },
    {
      id: 'locations_contact',
      label: 'Kontak WhatsApp / Telepon di Semua Lokasi',
      completed: allLocationsHaveContact,
      href: '/admin/locations',
      hint: 'Setiap lokasi praktik sebaiknya memiliki nomor WA atau telepon pendaftaran.',
    },
    {
      id: 'services_desc',
      label: 'Deskripsi Layanan Medis Lengkap',
      completed: allServicesHaveProperDesc,
      href: '/admin/services',
      hint: 'Ganti deskripsi placeholder singkat dengan penjelasan layanan yang informatif.',
    },
  ];

  return {
    publishedCount,
    inReviewCount,
    draftCount,
    totalViews,
    recentArticles: recentArticles.slice(0, 5),
    completeness,
  };
}

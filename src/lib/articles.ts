/**
 * lib/articles.ts — domain logic artikel: status, slug, validasi, dan rendering HTML.
 */

import { and, desc, eq, ne, notInArray } from 'drizzle-orm';
import type { JSONContent } from '@tiptap/core';
import { renderToHTMLString } from '@tiptap/static-renderer';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { getDb } from '@/db/client';
import { articles, images, users } from '@/db/schema';
import { revalidatePublicSite } from './revalidate';

export type ArticleStatus = 'draft' | 'in_review' | 'published';

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: 'Draft',
  in_review: 'Menunggu Review',
  published: 'Dipublikasikan',
};

export const EMPTY_ARTICLE_CONTENT: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

export function slugify(text: string): string {
  const clean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || 'artikel';
}

export async function makeUniqueSlug(baseText: string, currentId?: string): Promise<string> {
  const baseSlug = slugify(baseText);
  const db = getDb();

  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const whereClause = currentId
      ? and(eq(articles.slug, candidate), ne(articles.id, currentId))
      : eq(articles.slug, candidate);

    const [existing] = await db.select({ id: articles.id }).from(articles).where(whereClause).limit(1);
    if (!existing) return candidate;

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

export function renderArticleContentHtml(content: JSONContent): string {
  try {
    return renderToHTMLString({
      content,
      extensions: [StarterKit, Image],
    });
  } catch (err) {
    console.error('[articles] Gagal me-render content JSON ke HTML:', err);
    return '';
  }
}

export function collectImageIds(content: JSONContent): string[] {
  const ids: string[] = [];
  function walk(node: JSONContent) {
    if (node.type === 'image' && node.attrs?.src) {
      const src = String(node.attrs.src);
      const match = src.match(/\/media\/([0-9a-f-]{36})/i);
      if (match) ids.push(match[1]);
    }
    if (Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
  }
  walk(content);
  return ids;
}

function hasArticleBodyText(content: JSONContent): boolean {
  if (!content || !Array.isArray(content.content)) return false;
  for (const block of content.content) {
    if (block.type === 'paragraph' && block.content && block.content.length > 0) {
      for (const inline of block.content) {
        if (inline.text && inline.text.trim().length > 0) return true;
      }
    } else if (block.type === 'heading' || block.type === 'image' || block.type === 'blockquote') {
      return true;
    }
  }
  return false;
}

export function validatePublishable(article: {
  title: string;
  slug: string;
  content: JSONContent;
}): { ok: boolean; reason?: string } {
  if (!article.title || article.title.trim().length === 0) {
    return { ok: false, reason: 'Judul artikel wajib diisi sebelum publikasi.' };
  }
  if (!article.slug || article.slug.trim().length === 0) {
    return { ok: false, reason: 'Slug artikel tidak boleh kosong.' };
  }
  if (!hasArticleBodyText(article.content)) {
    return { ok: false, reason: 'Konten artikel belum memiliki isi teks.' };
  }
  return { ok: true };
}

export async function listArticlesAdmin(filter?: { status?: ArticleStatus }) {
  const db = getDb();
  const query = db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      status: articles.status,
      excerpt: articles.excerpt,
      coverImageId: articles.coverImageId,
      reviewNote: articles.reviewNote,
      authorName: users.name,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .leftJoin(users, eq(users.id, articles.authorId))
    .orderBy(desc(articles.updatedAt));

  if (filter?.status) {
    return query.where(eq(articles.status, filter.status));
  }
  return query;
}

export async function getArticleAdminById(id: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImageId: articles.coverImageId,
      coverAlt: articles.coverAlt,
      content: articles.content,
      status: articles.status,
      reviewNote: articles.reviewNote,
      authorId: articles.authorId,
      authorName: users.name,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .leftJoin(users, eq(users.id, articles.authorId))
    .where(eq(articles.id, id))
    .limit(1);

  return row ?? null;
}

export async function createArticle(params: {
  authorId: string;
  title?: string;
}) {
  const title = (params.title ?? '').trim() || 'Artikel Tanpa Judul';
  const slug = await makeUniqueSlug(title);

  const db = getDb();
  const [created] = await db
    .insert(articles)
    .values({
      slug,
      title,
      excerpt: '',
      content: EMPTY_ARTICLE_CONTENT,
      status: 'draft',
      authorId: params.authorId,
      updatedBy: params.authorId,
    })
    .returning({ id: articles.id, slug: articles.slug });

  return created;
}

export async function updateArticle(
  id: string,
  params: {
    userId: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    coverImageId?: string | null;
    coverAlt?: string;
    content?: JSONContent;
    status?: ArticleStatus;
    reviewNote?: string;
    expectedUpdatedAt?: string | Date;
  }
) {
  const db = getDb();
  const current = await getArticleAdminById(id);
  if (!current) throw new Error('Artikel tidak ditemukan');

  if (params.expectedUpdatedAt && current.updatedAt) {
    const exp = new Date(params.expectedUpdatedAt).getTime();
    const act = new Date(current.updatedAt).getTime();
    if (Math.abs(act - exp) > 1000) {
      throw new Error('Artikel sudah diubah di tab/akun lain. Muat ulang halaman sebelum menyimpan.');
    }
  }
  const updates: Partial<typeof articles.$inferInsert> = {
    updatedBy: params.userId,
    updatedAt: new Date(),
  };

  if (params.title !== undefined) {
    updates.title = params.title.trim();
  }

  if (params.slug !== undefined) {
    const raw = params.slug.trim() || params.title || current.title || 'artikel';
    updates.slug = await makeUniqueSlug(raw, id);
  }

  if (params.excerpt !== undefined) {
    updates.excerpt = params.excerpt.trim();
  }

  if (params.coverImageId !== undefined) {
    updates.coverImageId = params.coverImageId;
  }

  if (params.coverAlt !== undefined) {
    updates.coverAlt = params.coverAlt.trim();
  }

  if (params.content !== undefined) {
    updates.content = params.content;
  }

  if (params.reviewNote !== undefined) {
    updates.reviewNote = params.reviewNote.trim();
  }

  if (params.status !== undefined) {
    const nextStatus = params.status;
    if (nextStatus === 'published') {
      const check = validatePublishable({
        title: updates.title ?? current.title,
        slug: updates.slug ?? current.slug,
        content: updates.content ?? (current.content as JSONContent),
      });
      if (!check.ok) {
        throw new Error(check.reason);
      }
      updates.status = 'published';
      updates.publishedAt = current.publishedAt ?? new Date();
    } else {
      updates.status = nextStatus;
    }
  }

  await db.update(articles).set(updates).where(eq(articles.id, id));

  // Garbage Collection gambar yang tidak lagi direferensikan
  try {
    const activeContent = (updates.content ?? current.content) as JSONContent;
    const activeCover =
      updates.coverImageId !== undefined ? updates.coverImageId : current.coverImageId;
    const keepIds = new Set(collectImageIds(activeContent));
    if (activeCover) keepIds.add(activeCover);

    const keepArray = Array.from(keepIds);
    if (keepArray.length > 0) {
      await db
        .delete(images)
        .where(and(eq(images.articleId, id), notInArray(images.id, keepArray)));
    } else {
      await db.delete(images).where(eq(images.articleId, id));
    }
  } catch (gcErr) {
    console.error('[articles] Gagal membersihkan gambar orphaned:', gcErr);
  }
  // Revalidate publik
  revalidatePublicSite();

  return getArticleAdminById(id);
}

export async function deleteArticle(id: string) {
  const db = getDb();
  await db.delete(articles).where(eq(articles.id, id));
  revalidatePublicSite();
}

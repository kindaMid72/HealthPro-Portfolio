'use server';

import { and, asc, eq, ne } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import { getDb } from '@/db/client';
import { services } from '@/db/schema';
import { findAvailableSlug } from '@/lib/articles';
import { revalidatePublicSite } from '@/lib/revalidate';
import { requireUser } from '@/lib/session';
import { toSlug } from '@/lib/slug';
import { countWords, EMPTY_TIPTAP_DOC } from '@/lib/tiptap';
import { type ArticleCategory, isValidArticleCategory } from '@/lib/types';

export interface ServiceItem {
  id: string;
  sortOrder: number;
  serviceName: string;
  serviceDescription: string;
  slug: string;
  hasDetail: boolean;
}

async function fetchServicesOrdered(): Promise<ServiceItem[]> {
  const rows = await getDb()
    .select({
      id: services.id,
      sortOrder: services.sortOrder,
      serviceName: services.serviceName,
      serviceDescription: services.serviceDescription,
      slug: services.slug,
      content: services.content,
    })
    .from(services)
    .orderBy(asc(services.sortOrder));

  return rows.map(({ content, ...rest }) => ({ ...rest, hasDetail: countWords(content) > 0 }));
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_FALLBACK = 'layanan';

/** Pesan aman untuk klien; detail galat (SQL/parameter) hanya masuk log server. */
function failure(err: unknown, fallback: string): string {
  console.error('[admin/services]', err);
  const code = (err as { cause?: { code?: string }; code?: string } | null);
  if ((code?.cause?.code ?? code?.code) === '23505') return 'Slug sudah dipakai layanan lain, coba lagi.';
  return fallback;
}

/** Layanan tidak membawa gambar: buang node image dari konten yang dikirim klien. */
function sanitizeServiceContent(node: JSONContent): JSONContent {
  const content = node.content?.filter((c) => c.type !== 'image').map(sanitizeServiceContent);
  return content ? { ...node, content } : node;
}

async function isServiceSlugTaken(candidate: string, excludeId?: string): Promise<boolean> {
  const rows = await getDb()
    .select({ id: services.id })
    .from(services)
    .where(
      excludeId
        ? and(eq(services.slug, candidate), ne(services.id, excludeId))
        : eq(services.slug, candidate),
    )
    .limit(1);
  return rows.length > 0;
}

/** Buat layanan baru (hanya nama) lalu arahkan ke editornya. Hanya mengembalikan nilai bila gagal. */
export async function createServiceAction(input: {
  serviceName: string;
}): Promise<{ success: false; error: string }> {
  await requireUser();

  const serviceName = input.serviceName.trim();
  if (!serviceName) {
    return { success: false, error: 'Nama layanan wajib diisi.' };
  }

  let id: string;
  try {
    const current = await fetchServicesOrdered();
    const nextSort = current.length > 0 ? Math.max(...current.map((c) => c.sortOrder)) + 1 : 0;
    const slug = await findAvailableSlug(toSlug(serviceName) || SLUG_FALLBACK, (c) => isServiceSlugTaken(c));
    const [row] = await getDb()
      .insert(services)
      .values({ sortOrder: nextSort, serviceName, slug })
      .returning({ id: services.id });
    id = row.id;
    revalidatePublicSite();
  } catch (err) {
    return { success: false, error: failure(err, 'Gagal membuat layanan.') };
  }

  redirect(`/admin/services/${id}`);
}

export async function saveServiceAction(input: {
  id: string;
  serviceName: string;
  slug: string;
  serviceDescription: string;
  category: ArticleCategory | null;
  content: JSONContent;
}): Promise<{ success: boolean; error?: string; slug?: string }> {
  await requireUser();

  const serviceName = input.serviceName.trim();
  if (!serviceName) {
    return { success: false, error: 'Nama layanan wajib diisi.' };
  }

  if (!UUID_RE.test(input.id)) {
    return { success: false, error: 'Layanan tidak ditemukan.' };
  }

  // Salin ke plain object (attrs ProseMirror berprototipe null) lalu buang node image.
  let parsed: JSONContent | null = null;
  try {
    parsed = JSON.parse(JSON.stringify(input.content)) as JSONContent;
  } catch {
    parsed = null;
  }
  const content = parsed && parsed.type === 'doc' ? sanitizeServiceContent(parsed) : EMPTY_TIPTAP_DOC;
  const category = isValidArticleCategory(input.category ?? undefined) ? input.category : null;

  try {
    const slug = await findAvailableSlug(
      toSlug(input.slug.trim()) || toSlug(serviceName) || SLUG_FALLBACK,
      (c) => isServiceSlugTaken(c, input.id),
    );
    const updated = await getDb()
      .update(services)
      .set({
        serviceName,
        slug,
        serviceDescription: input.serviceDescription.trim(),
        category,
        content,
        updatedAt: new Date(),
      })
      .where(eq(services.id, input.id))
      .returning({ id: services.id });

    if (updated.length === 0) {
      return { success: false, error: 'Layanan tidak ditemukan (mungkin sudah dihapus).' };
    }

    revalidatePublicSite();
    return { success: true, slug };
  } catch (err) {
    return { success: false, error: failure(err, 'Gagal menyimpan layanan.') };
  }
}

export async function deleteServiceAction(id: string): Promise<{
  success: boolean;
  error?: string;
  items?: ServiceItem[];
}> {
  await requireUser();
  if (!UUID_RE.test(id)) return { success: false, error: 'Layanan tidak ditemukan.' };
  try {
    await getDb().delete(services).where(eq(services.id, id));
    revalidatePublicSite();
    const items = await fetchServicesOrdered();
    return { success: true, items };
  } catch (err) {
    return { success: false, error: failure(err, 'Gagal menghapus layanan.') };
  }
}

export async function moveServiceAction(
  id: string,
  direction: 'up' | 'down',
): Promise<{
  success: boolean;
  error?: string;
  items?: ServiceItem[];
}> {
  await requireUser();
  try {
    const db = getDb();
    const current = await fetchServicesOrdered();
    const idx = current.findIndex((item) => item.id === id);
    if (idx === -1) return { success: false, error: 'Layanan tidak ditemukan.' };

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= current.length) {
      return { success: true, items: current };
    }

    const reordered = [...current];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(swapIdx, 0, moved);

    await db.transaction(async (tx) => {
      for (let i = 0; i < reordered.length; i++) {
        await tx
          .update(services)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(services.id, reordered[i].id));
      }
    });

    revalidatePublicSite();
    const items = await fetchServicesOrdered();
    return { success: true, items };
  } catch (err) {
    return { success: false, error: failure(err, 'Gagal mengubah urutan.') };
  }
}

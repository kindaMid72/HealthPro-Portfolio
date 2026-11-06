'use server';

import { and, asc, eq, ne } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import { getDb } from '@/db/client';
import { services, serviceTranslations } from '@/db/schema';
import { findAvailableSlug } from '@/lib/articles';
import { revalidatePublicSite } from '@/lib/revalidate';
import { requireUser } from '@/lib/session';
import { toSlug } from '@/lib/slug';
import { actionErrorMessage } from '@/lib/action-error';
import { countWords, EMPTY_TIPTAP_DOC } from '@/lib/tiptap';
import { type ArticleCategory, isValidArticleCategory } from '@/lib/types';
import { isUuid } from '@/lib/uuid';

export interface ServiceItem {
  id: string;
  sortOrder: number;
  serviceName: string;
  slug: string;
  serviceDescription: string;
  category: ArticleCategory | null;
  hasDetail: boolean;
  updatedAt: Date;
}

async function fetchServicesOrdered(): Promise<ServiceItem[]> {
  const rows = await getDb()
    .select({
      id: services.id,
      sortOrder: services.sortOrder,
      serviceName: services.serviceName,
      slug: services.slug,
      serviceDescription: services.serviceDescription,
      category: services.category,
      content: services.content,
      updatedAt: services.updatedAt,
    })
    .from(services)
    .orderBy(asc(services.sortOrder));

  return rows.map((r) => ({
    id: r.id,
    sortOrder: r.sortOrder,
    serviceName: r.serviceName,
    slug: r.slug,
    serviceDescription: r.serviceDescription,
    category: r.category,
    hasDetail: countWords(r.content as JSONContent) > 0,
    updatedAt: r.updatedAt,
  }));
}

const SLUG_FALLBACK = 'layanan';

/** Layanan tidak membawa gambar: buang node image dari konten yang dikirim klien. */
function sanitizeServiceContent(node: JSONContent): JSONContent {
  const content = (node.content ?? [])
    .filter((child) => child.type !== 'image')
    .map(sanitizeServiceContent);
  return { ...node, content };
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

  const name = input.serviceName.trim();
  if (!name) {
    return { success: false, error: 'Nama layanan wajib diisi.' };
  }

  let newId: string | null = null;
  try {
    const db = getDb();
    const existing = await fetchServicesOrdered();
    const nextOrder = existing.length > 0 ? Math.max(...existing.map((s) => s.sortOrder)) + 1 : 1;
    const slug = await findAvailableSlug(toSlug(name) || SLUG_FALLBACK, (c) => isServiceSlugTaken(c));

    const [created] = await db
      .insert(services)
      .values({
        serviceName: name,
        slug,
        serviceDescription: '',
        sortOrder: nextOrder,
        content: EMPTY_TIPTAP_DOC,
        category: null,
      })
      .returning({ id: services.id });

    newId = created.id;
    revalidatePublicSite();
  } catch (err) {
    return { success: false, error: actionErrorMessage(err, 'Gagal membuat layanan baru.', 'services/actions') };
  }

  redirect(`/admin/services/${newId}`);
}

export async function saveServiceAction(input: {
  id: string;
  serviceName: string;
  slug: string;
  serviceDescription: string;
  category: ArticleCategory | null;
  content: JSONContent;
  en?: {
    serviceName: string;
    serviceDescription: string;
    content: JSONContent;
  };
}): Promise<{ success: boolean; error?: string; slug?: string }> {
  await requireUser();

  const serviceName = input.serviceName.trim();
  if (!serviceName) {
    return { success: false, error: 'Nama layanan wajib diisi.' };
  }

  if (!isUuid(input.id)) {
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
    const db = getDb();
    const slug = await findAvailableSlug(
      toSlug(input.slug.trim()) || toSlug(serviceName) || SLUG_FALLBACK,
      (c) => isServiceSlugTaken(c, input.id),
    );
    const updated = await db
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

    // Row lifecycle rule untuk terjemahan EN
    if (input.en) {
      let parsedEn: JSONContent | null = null;
      try {
        parsedEn = JSON.parse(JSON.stringify(input.en.content)) as JSONContent;
      } catch {
        parsedEn = null;
      }
      const enContent =
        parsedEn && parsedEn.type === 'doc'
          ? sanitizeServiceContent(parsedEn)
          : EMPTY_TIPTAP_DOC;
      const enServiceName = input.en.serviceName.trim();
      const enServiceDescription = input.en.serviceDescription.trim();
      const hasEn = Boolean(
        enServiceName ||
        enServiceDescription ||
        countWords(enContent) > 0,
      );

      if (hasEn) {
        await db
          .insert(serviceTranslations)
          .values({
            serviceId: input.id,
            locale: 'en',
            serviceName: enServiceName,
            serviceDescription: enServiceDescription,
            content: enContent,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [serviceTranslations.serviceId, serviceTranslations.locale],
            set: {
              serviceName: enServiceName,
              serviceDescription: enServiceDescription,
              content: enContent,
              updatedAt: new Date(),
            },
          });
      } else {
        await db
          .delete(serviceTranslations)
          .where(
            and(
              eq(serviceTranslations.serviceId, input.id),
              eq(serviceTranslations.locale, 'en'),
            ),
          );
      }
    }

    revalidatePublicSite();
    return { success: true, slug };
  } catch (err) {
    return { success: false, error: actionErrorMessage(err, 'Gagal menyimpan layanan.', 'services/actions') };
  }
}

export async function deleteServiceAction(id: string): Promise<{
  success: boolean;
  error?: string;
  items?: ServiceItem[];
}> {
  await requireUser();
  if (!isUuid(id)) return { success: false, error: 'Layanan tidak ditemukan.' };

  try {
    const db = getDb();
    const deleted = await db.delete(services).where(eq(services.id, id)).returning({ id: services.id });
    if (deleted.length === 0) {
      return { success: false, error: 'Layanan tidak ditemukan (mungkin sudah dihapus).' };
    }

    const remaining = await fetchServicesOrdered();
    for (let i = 0; i < remaining.length; i++) {
      const targetOrder = i + 1;
      if (remaining[i].sortOrder !== targetOrder) {
        await db.update(services).set({ sortOrder: targetOrder }).where(eq(services.id, remaining[i].id));
        remaining[i].sortOrder = targetOrder;
      }
    }

    revalidatePublicSite();
    return { success: true, items: remaining };
  } catch (err) {
    return { success: false, error: actionErrorMessage(err, 'Gagal menghapus layanan.', 'services/actions') };
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
  if (!isUuid(id)) return { success: false, error: 'Layanan tidak ditemukan.' };

  try {
    const list = await fetchServicesOrdered();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return { success: false, error: 'Layanan tidak ditemukan.' };

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) {
      return { success: true, items: list };
    }

    const current = list[index];
    const target = list[targetIndex];

    const db = getDb();
    await db.update(services).set({ sortOrder: target.sortOrder }).where(eq(services.id, current.id));
    await db.update(services).set({ sortOrder: current.sortOrder }).where(eq(services.id, target.id));

    revalidatePublicSite();
    const refreshed = await fetchServicesOrdered();
    return { success: true, items: refreshed };
  } catch (err) {
    return { success: false, error: actionErrorMessage(err, 'Gagal mengubah urutan layanan.', 'services/actions') };
  }
}

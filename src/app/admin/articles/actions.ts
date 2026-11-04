'use server';

import type { JSONContent } from '@tiptap/core';
import { redirect } from 'next/navigation';
import {
  type ArticleStatus,
  createArticle,
  deleteArticle,
  updateArticle,
} from '@/lib/articles';
import { requireUser } from '@/lib/session';
import type { ArticleCategory } from '@/lib/types';

export async function createArticleAction(): Promise<void> {
  const user = await requireUser();
  const created = await createArticle({ authorId: user.id });
  redirect(`/admin/articles/${created.id}`);
}

export interface SaveArticleInput {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: ArticleCategory;
  coverImageId: string | null;
  coverAlt: string;
  content: JSONContent;
  status: ArticleStatus;
  reviewNote: string;
  expectedUpdatedAt?: string;
}

export async function saveArticleAction(input: SaveArticleInput): Promise<{
  success: boolean;
  error?: string;
  saved?: {
    slug: string;
    status: ArticleStatus;
    excerpt: string;
    readingTimeMinutes: number;
    updatedAt: string;
  };
}> {
  const user = await requireUser();

  // Pastikan konten berupa JSON polos sebelum menyentuh DB. Kalau klien
  // mengirim objek yang tidak bisa diserialisasi (mis. temporary reference),
  // tolak di sini, sebelum ada tulisan yang commit.
  let content: JSONContent;
  try {
    content = JSON.parse(JSON.stringify(input.content));
    if (!content || content.type !== 'doc') {
      throw new Error('invalid doc');
    }
  } catch {
    return {
      success: false,
      error: 'Isi artikel tidak valid. Muat ulang halaman lalu coba simpan lagi.',
    };
  }

  try {
    const updated = await updateArticle(input.id, {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      category: input.category,
      coverImageId: input.coverImageId,
      coverAlt: input.coverAlt,
      content,
      status: input.status,
      reviewNote: input.reviewNote,
      updatedBy: user.id,
      expectedUpdatedAt: input.expectedUpdatedAt,
    });

    return {
      success: true,
      saved: {
        slug: updated.slug,
        status: updated.status,
        excerpt: updated.excerpt,
        readingTimeMinutes: updated.readingTimeMinutes,
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menyimpan artikel.',
    };
  }
}

export async function updateArticleStatusAction(
  id: string,
  status: ArticleStatus,
  reviewNote?: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser();

  try {
    await updateArticle(id, {
      status,
      reviewNote,
      updatedBy: user.id,
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : 'Gagal memperbarui status artikel.',
    };
  }
}

export async function deleteArticleAction(id: string): Promise<void> {
  await requireUser();
  await deleteArticle(id);
  redirect('/admin/articles');
}

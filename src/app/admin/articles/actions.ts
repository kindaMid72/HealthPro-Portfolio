'use server';

/**
 * app/admin/articles/actions.ts — Server actions untuk manajemen artikel.
 */

import { redirect } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import { requireUser } from '@/lib/session';
import {
  createArticle,
  deleteArticle,
  updateArticle,
  type ArticleStatus,
} from '@/lib/articles';

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
  coverImageId: string | null;
  coverAlt: string;
  content: JSONContent;
  status?: ArticleStatus;
  reviewNote?: string;
  expectedUpdatedAt?: string;
}

export async function saveArticleAction(input: SaveArticleInput): Promise<{
  success: boolean;
  error?: string;
  saved?: Awaited<ReturnType<typeof updateArticle>>;
}> {
  const user = await requireUser();

  try {
    const updated = await updateArticle(input.id, {
      userId: user.id,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      coverImageId: input.coverImageId,
      coverAlt: input.coverAlt,
      content: input.content,
      status: input.status,
      reviewNote: input.reviewNote,
      expectedUpdatedAt: input.expectedUpdatedAt,
    });
    return { success: true, saved: updated };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan artikel';
    return { success: false, error: message };
  }
}

export async function updateArticleStatusAction(
  id: string,
  status: ArticleStatus,
  reviewNote?: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser();

  try {
    await updateArticle(id, {
      userId: user.id,
      status,
      reviewNote,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengubah status artikel';
    return { success: false, error: message };
  }
}

export async function deleteArticleAction(id: string): Promise<void> {
  await requireUser();
  await deleteArticle(id);
  redirect('/admin/articles');
}

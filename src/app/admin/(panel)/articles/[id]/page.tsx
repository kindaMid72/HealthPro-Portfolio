/**
 * app/admin/(panel)/articles/[id]/page.tsx — Halaman edit artikel admin.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import { getArticleAdminById, type ArticleStatus } from '@/lib/articles';
import { ArticleEditor } from './ArticleEditor';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleAdminById(id);
  return {
    title: article?.title ? `Edit: ${article.title}` : 'Edit Artikel',
  };
}

export default async function AdminEditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleAdminById(id);
  if (!article) notFound();

  return (
    <div>
      <ArticleEditor
        initialArticle={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          coverImageId: article.coverImageId,
          coverAlt: article.coverAlt,
          content: (article.content as JSONContent) ?? {
            type: 'doc',
            content: [{ type: 'paragraph' }],
          },
          status: article.status as ArticleStatus,
          reviewNote: article.reviewNote,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt,
        }}
      />
    </div>
  );
}

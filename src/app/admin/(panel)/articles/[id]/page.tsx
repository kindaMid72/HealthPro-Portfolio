import { notFound } from 'next/navigation';
import { getArticleAdminById } from '@/lib/articles';
import ArticleEditor from './ArticleEditor';
import { requireUser } from '@/lib/session';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditArticlePage({
  params,
}: EditArticlePageProps) {
  await requireUser();
  const { id } = await params;
  const article = await getArticleAdminById(id);

  if (!article) {
    notFound();
  }

  return (
    <ArticleEditor
      initialArticle={{
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        coverImageId: article.coverImageId,
        coverAlt: article.coverAlt,
        content: article.content,
        status: article.status,
        reviewNote: article.reviewNote,
        readingTimeMinutes: article.readingTimeMinutes,
        viewCount: article.viewCount,
        authorName: article.authorName ?? 'Tim Medis',
        updatedAt: article.updatedAt.toISOString(),
        publishedAt: article.publishedAt
          ? article.publishedAt.toISOString()
          : null,
        en: article.en,
      }}
    />
  );
}

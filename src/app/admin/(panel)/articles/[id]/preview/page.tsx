import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import MedicalReviewNote from '@/components/MedicalReviewNote';
import ProseContent from '@/components/ProseContent';
import TableOfContents from '@/components/TableOfContents';
import { buttonClassName } from '@/components/admin/Button';
import StatusBadge from '@/components/admin/StatusBadge';
import {
  getArticleAdminById,
  renderArticleContentWithToc,
} from '@/lib/articles';
import { getAllSiteData } from '@/lib/content';
import { formatDateId } from '@/lib/format';
import { requireUser } from '@/lib/session';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminArticlePreviewPage({ params }: PreviewPageProps) {
  await requireUser();
  const { id } = await params;
  const [{ profile }, article] = await Promise.all([getAllSiteData(), getArticleAdminById(id)]);

  if (!article) {
    notFound();
  }

  const { html, toc } = renderArticleContentWithToc(article.content as JSONContent);
  const strSip =
    profile.str_sip_display && !profile.str_sip_display.includes('[BELUM DIISI]')
      ? profile.str_sip_display
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3.5 text-sm text-amber-900 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="font-bold">Mode pratinjau admin</strong>
          <span>— status saat ini:</span>
          <StatusBadge status={article.status} />
        </div>
        <Link href={`/admin/articles/${article.id}`} className={buttonClassName('primary')}>
          ← Kembali ke editor
        </Link>
      </div>

      <article className="card-clinical p-5 md:p-10">
        <header className="max-w-3xl">
          <h1 className="font-display text-display font-semibold">{article.title || '(Belum Ada Judul)'}</h1>
          {article.excerpt && <p className="mt-4 text-xl text-text-body">{article.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-text-muted">
            <span>
              Ditulis oleh{' '}
              <strong className="font-semibold text-text-heading">
                {article.authorName ?? profile.full_name}
              </strong>
            </span>
            <time>{formatDateId(article.publishedAt ?? article.updatedAt)}</time>
            <span>{article.readingTimeMinutes} menit baca</span>
          </div>
          <MedicalReviewNote fullName={profile.full_name} specialty={profile.specialty} strSip={strSip} />
        </header>

        {article.coverImageId && (
          <figure className="mt-8 max-w-4xl overflow-hidden rounded-2xl border border-border bg-primary-tint">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/media/${article.coverImageId}`}
              alt={article.coverAlt || article.title}
              className="max-h-[420px] w-full object-cover"
            />
            {article.coverAlt && (
              <figcaption className="px-4 py-2.5 text-sm text-text-muted">{article.coverAlt}</figcaption>
            )}
          </figure>
        )}

        <div className="mt-10 lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            {toc.length >= 2 && (
              <div className="mb-8">
                <TableOfContents placement="inline" items={toc} />
              </div>
            )}
            <ProseContent html={html} />
          </div>
          {toc.length >= 2 && (
            <aside className="lg:col-span-4">
              <TableOfContents placement="aside" items={toc} />
            </aside>
          )}
        </div>
      </article>
    </div>
  );
}

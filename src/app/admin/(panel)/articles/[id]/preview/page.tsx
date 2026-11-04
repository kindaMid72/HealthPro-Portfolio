import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import { Clock, ListTree, ShieldCheck } from 'lucide-react';
import {
  getArticleAdminById,
  renderArticleContentWithToc,
} from '@/lib/articles';
import { getAllSiteData } from '@/lib/content';
import { formatDateId } from '@/lib/format';
import { ARTICLE_CATEGORIES } from '@/lib/types';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminArticlePreviewPage({
  params,
}: PreviewPageProps) {
  const { id } = await params;
  const [{ profile }, article] = await Promise.all([
    getAllSiteData(),
    getArticleAdminById(id),
  ]);

  if (!article) {
    notFound();
  }

  const { html, toc } = renderArticleContentWithToc(
    article.content as JSONContent,
  );
  const categoryLabel =
    ARTICLE_CATEGORIES[article.category] ?? ARTICLE_CATEGORIES.umum;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3.5 text-xs text-amber-900">
        <div>
          <strong className="font-heading font-bold">
            Mode Pratinjau Admin
          </strong>{' '}
          — Status saat ini:{' '}
          <span className="rounded-md bg-amber-200/70 px-2 py-0.5 font-semibold uppercase">
            {article.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/articles/${article.id}`}
            className="rounded-xl bg-primary px-4 py-2 font-heading font-semibold text-white hover:bg-primary-dark"
          >
            ← Kembali ke Editor
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-6 shadow-xs md:p-10">
        <header className="mb-8">
          <span className="mb-3 inline-flex rounded-full bg-primary/10 px-3.5 py-1 font-heading text-xs font-semibold text-primary">
            {categoryLabel}
          </span>
          <h1 className="font-heading text-2xl font-bold leading-tight text-primary-dark sm:text-3xl md:text-4xl">
            {article.title || '(Belum Ada Judul)'}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span>
              Ditulis oleh{' '}
              <strong className="font-semibold text-primary-dark">
                {article.authorName ?? profile.full_name}
              </strong>
            </span>
            <span>•</span>
            <span>
              {formatDateId(article.publishedAt ?? article.updatedAt)}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} />
              {article.readingTimeMinutes} menit baca
            </span>
          </div>
        </header>

        <div className="mb-8 flex items-start gap-3.5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-text-body">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-primary-dark">
              Ditinjau secara medis oleh{' '}
              <strong className="font-bold">{profile.full_name}</strong> (
              {profile.specialty})
            </p>
          </div>
        </div>

        {article.coverImageId && (
          <figure className="mb-8 overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/media/${article.coverImageId}`}
              alt={article.coverAlt || article.title}
              className="max-h-[420px] w-full object-cover"
            />
            {article.coverAlt && (
              <figcaption className="border-t border-border/60 px-4 py-2 text-center text-xs text-text-muted">
                {article.coverAlt}
              </figcaption>
            )}
          </figure>
        )}

        {toc.length >= 2 && (
          <nav
            aria-label="Daftar Isi"
            className="mb-8 rounded-2xl border border-border bg-bg/60 p-5"
          >
            <div className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-primary-dark">
              <ListTree size={16} className="text-primary" />
              <span>Daftar Isi Artikel</span>
            </div>
            <ol className="space-y-1.5 text-sm">
              {toc.map((item) => (
                <li
                  key={item.id}
                  className={item.level === 3 ? 'pl-4 text-xs' : 'font-medium'}
                >
                  <a
                    href={`#${item.id}`}
                    className="text-text-body hover:text-primary hover:underline"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div
          className="prose prose-slate article-prose max-w-none prose-headings:font-heading prose-headings:text-primary-dark prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  );
}

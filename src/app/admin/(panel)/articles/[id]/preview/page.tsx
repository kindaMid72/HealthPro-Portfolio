/**
 * app/admin/(panel)/articles/[id]/preview/page.tsx — Halaman pratinjau artikel khusus admin.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import {
  ARTICLE_STATUS_LABELS,
  getArticleAdminById,
  renderArticleContentHtml,
  type ArticleStatus,
} from '@/lib/articles';
import { getProfile, getLocations } from '@/lib/content';
import { getCtaLinks } from '@/lib/cta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleAdminById(id);
  return {
    title: article?.title ? `Preview: ${article.title}` : 'Pratinjau Artikel',
    robots: { index: false, follow: false },
  };
}

export default async function AdminArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, profile, locations] = await Promise.all([
    getArticleAdminById(id),
    getProfile(),
    getLocations(),
  ]);

  if (!article) notFound();

  const ctaLinks = getCtaLinks(profile, locations);
  const htmlContent = renderArticleContentHtml(article.content as JSONContent);

  return (
    <div>
      {/* Banner preview */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        <div>
          <span className="font-semibold uppercase tracking-wide">
            Mode Pratinjau Admin
          </span>
          <span className="mx-2 text-amber-400">•</span>
          <span>Status saat ini:</span>{' '}
          <strong className="rounded bg-amber-200 px-1.5 py-0.5 font-semibold text-amber-900">
            {ARTICLE_STATUS_LABELS[article.status as ArticleStatus]}
          </strong>
        </div>
        <Link
          href={`/admin/articles/${article.id}`}
          className="rounded bg-white px-3 py-1 font-medium text-gray-800 shadow-sm hover:bg-gray-100 border border-gray-300"
        >
          ← Kembali ke Editor
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-10 shadow-sm">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {article.title || '(Tanpa Judul)'}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span>Oleh {article.authorName || profile.full_name}</span>
            <span>•</span>
            <time>
              {new Date(article.publishedAt ?? article.updatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          </div>

          {article.excerpt && (
            <p className="mt-4 text-base italic text-gray-600 border-l-4 border-primary pl-4">
              {article.excerpt}
            </p>
          )}

          {article.coverImageId && (
            <div className="mt-6 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/media/${article.coverImageId}`}
                alt={article.coverAlt || article.title}
                className="max-h-[460px] w-full object-cover"
              />
            </div>
          )}
        </header>

        {/* Konten */}
        <article
          className="prose prose-primary max-w-none prose-headings:font-semibold prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Kotak CTA di bawah artikel */}
        <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
          <h2 className="text-lg font-bold text-gray-900">
            Punya Keluhan THT atau Ingin Konsultasi?
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Konsultasikan langsung dengan {profile.full_name} di lokasi praktik terdekat.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            {ctaLinks.bookingUrl && (
              <a
                href={ctaLinks.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
              >
                Jadwalkan Konsultasi
              </a>
            )}
            {ctaLinks.whatsappFallback && (
              <a
                href={ctaLinks.whatsappFallback}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-primary px-5 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white"
              >
                Chat via WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

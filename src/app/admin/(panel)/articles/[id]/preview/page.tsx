import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import MedicalReviewNote from '@/components/MedicalReviewNote';
import ProseContent from '@/components/ProseContent';
import TableOfContents from '@/components/TableOfContents';
import { buttonClassName } from '@/components/admin/Button';
import StatusBadge from '@/components/admin/StatusBadge';
import { id as idDictionary } from '@/i18n/dictionaries/id';
import { format, getDictionaryFor } from '@/i18n/dictionary';
import {
  buildAutoExcerpt,
  getArticleAdminById,
  renderArticleContentWithToc,
} from '@/lib/articles';
import { getAllSiteData } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { requireUser } from '@/lib/session';
import { calculateReadingTimeMinutes, countWords, extractPlainText } from '@/lib/tiptap';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function AdminArticlePreviewPage({
  params,
  searchParams,
}: PreviewPageProps) {
  await requireUser();
  const { id } = await params;
  const { lang: queryLang } = await searchParams;
  const isEn = queryLang === 'en';
  const locale = isEn ? 'en' : 'id';
  const dict = isEn ? await getDictionaryFor('en') : idDictionary;

  const [{ profile }, article] = await Promise.all([
    getAllSiteData(locale),
    getArticleAdminById(id),
  ]);

  if (!article) {
    notFound();
  }

  const isTranslated =
    isEn &&
    Boolean(
      article.en?.title?.trim() && countWords(article.en?.content) > 0,
    );

  const title = isTranslated ? article.en!.title.trim() : article.title;
  const excerpt = isTranslated
    ? article.en!.excerpt.trim() ||
      buildAutoExcerpt(extractPlainText(article.en!.content), 155)
    : article.excerpt;
  const content = isTranslated ? article.en!.content : (article.content as JSONContent);
  const coverAlt = isTranslated
    ? article.en!.coverAlt.trim() || article.coverAlt
    : article.coverAlt;
  const readingTime = isTranslated
    ? calculateReadingTimeMinutes(content)
    : article.readingTimeMinutes;

  const { html, toc } = renderArticleContentWithToc(content);
  const strSip =
    profile.str_sip_display && !profile.str_sip_display.includes('[BELUM DIISI]')
      ? profile.str_sip_display
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3.5 text-sm text-amber-900 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="font-bold">Mode pratinjau admin ({isEn ? 'English' : 'Indonesia'})</strong>
          <span>— status saat ini:</span>
          <StatusBadge status={article.status} />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/articles/${article.id}/preview${isEn ? '' : '?lang=en'}`}
            className={buttonClassName('secondary')}
          >
            {isEn ? 'Lihat versi Indonesia' : 'Lihat versi English'}
          </Link>
          <Link href={`/admin/articles/${article.id}`} className={buttonClassName('primary')}>
            ← Kembali ke editor
          </Link>
        </div>
      </div>

      {isEn && !isTranslated && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900 shadow-2xs"
        >
          {dict.translationNotice.banner}
        </div>
      )}

      <article className="card-clinical p-5 md:p-10" {...(!isTranslated && isEn ? { lang: 'id' } : {})}>
        <header className="max-w-3xl">
          <h1 className="font-display text-display font-semibold">{title || '(Belum Ada Judul)'}</h1>
          {excerpt && <p className="mt-4 text-xl text-text-body">{excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-text-muted">
            <span>
              {dict.articlePage.writtenBy}{' '}
              <strong className="font-semibold text-text-heading">
                {article.authorName ?? profile.full_name}
              </strong>
            </span>
            <time>{formatDate(article.publishedAt ?? article.updatedAt, locale)}</time>
            <span>
              {format(dict.articleCard.minuteRead, { minutes: readingTime })}
            </span>
          </div>
          <MedicalReviewNote
            fullName={profile.full_name}
            specialty={profile.specialty}
            strSip={strSip}
            dict={dict.medical}
          />
        </header>

        {article.coverImageId && (
          <figure className="mt-8 max-w-4xl overflow-hidden rounded-2xl border border-border bg-primary-tint">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/media/${article.coverImageId}`}
              alt={coverAlt || title}
              className="max-h-[420px] w-full object-cover"
            />
            {coverAlt && (
              <figcaption className="px-4 py-2.5 text-sm text-text-muted">{coverAlt}</figcaption>
            )}
          </figure>
        )}

        <div className="mt-10 lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            {toc.length >= 2 && (
              <div className="mb-8">
                <TableOfContents placement="inline" items={toc} dict={dict.toc} />
              </div>
            )}
            <ProseContent html={html} />
          </div>
          {toc.length >= 2 && (
            <aside className="lg:col-span-4">
              <TableOfContents placement="aside" items={toc} dict={dict.toc} />
            </aside>
          )}
        </div>
      </article>
    </div>
  );
}

import Link from 'next/link';
import { MessageSquareWarning, Plus, Search } from 'lucide-react';
import {
  type ArticleStatus,
  listArticlesAdmin,
} from '@/lib/articles';
import { formatDateShortId } from '@/lib/format';
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_VALUES,
  type ArticleCategory,
  isValidArticleCategory,
} from '@/lib/types';
import { createArticleAction } from '../../articles/actions';

const STATUS_TABS: { value?: ArticleStatus; label: string }[] = [
  { value: undefined, label: 'Semua' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'Menunggu Review' },
  { value: 'published', label: 'Dipublikasikan' },
];

const STATUS_BADGE: Record<
  ArticleStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  in_review: {
    label: 'Menunggu Review',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  published: {
    label: 'Dipublikasikan',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

interface AdminArticlesPageProps {
  searchParams: Promise<{
    status?: string;
    kategori?: string;
    q?: string;
  }>;
}

export default async function AdminArticlesPage({
  searchParams,
}: AdminArticlesPageProps) {
  const { status: rawStatus, kategori, q } = await searchParams;
  const activeStatus: ArticleStatus | undefined =
    rawStatus === 'draft' ||
    rawStatus === 'in_review' ||
    rawStatus === 'published'
      ? rawStatus
      : undefined;
  const activeCategory: ArticleCategory | undefined = isValidArticleCategory(
    kategori,
  )
    ? kategori
    : undefined;
  const searchQuery = q?.trim() || undefined;

  const articlesList = await listArticlesAdmin({
    status: activeStatus,
    category: activeCategory,
    query: searchQuery,
  });

  function buildFilterUrl(next: {
    status?: ArticleStatus;
    category?: ArticleCategory;
    q?: string;
  }) {
    const params = new URLSearchParams();
    if (next.status) params.set('status', next.status);
    if (next.category) params.set('kategori', next.category);
    if (next.q) params.set('q', next.q);
    const qs = params.toString();
    return qs ? `/admin/articles?${qs}` : '/admin/articles';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-dark">
            Manajemen Artikel Edukasi
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Tulis, tinjau bersama rekan/dokter, dan terbitkan artikel kesehatan
            THT.
          </p>
        </div>

        <form action={createArticleAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-heading text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary-dark"
          >
            <Plus size={16} aria-hidden="true" />
            Tulis Artikel Baru
          </button>
        </form>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_TABS.map((tab) => {
              const isActive = activeStatus === tab.value;
              return (
                <Link
                  key={tab.label}
                  href={buildFilterUrl({
                    status: tab.value,
                    category: activeCategory,
                    q: searchQuery,
                  })}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-bg text-text-body hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Search Form */}
          <form
            method="GET"
            action="/admin/articles"
            className="flex w-full items-center gap-2 sm:w-72"
          >
            {activeStatus && (
              <input type="hidden" name="status" value={activeStatus} />
            )}
            {activeCategory && (
              <input type="hidden" name="kategori" value={activeCategory} />
            )}
            <div className="relative flex-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="search"
                name="q"
                defaultValue={searchQuery ?? ''}
                placeholder="Cari judul artikel..."
                className="w-full rounded-xl border border-border bg-bg py-1.5 pl-8 pr-3 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl border border-border bg-bg px-3 py-1.5 text-xs font-semibold text-primary-dark hover:border-primary hover:text-primary"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-3">
          <span className="mr-1 text-[11px] font-semibold text-text-muted">
            Topik:
          </span>
          <Link
            href={buildFilterUrl({
              status: activeStatus,
              category: undefined,
              q: searchQuery,
            })}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              !activeCategory
                ? 'bg-primary-dark text-white'
                : 'bg-bg text-text-muted hover:text-primary'
            }`}
          >
            Semua
          </Link>
          {ARTICLE_CATEGORY_VALUES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <Link
                key={cat}
                href={buildFilterUrl({
                  status: activeStatus,
                  category: cat,
                  q: searchQuery,
                })}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  isActive
                    ? 'bg-primary-dark text-white'
                    : 'bg-bg text-text-muted hover:text-primary'
                }`}
              >
                {ARTICLE_CATEGORIES[cat]}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tabel Artikel */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        {articlesList.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-heading text-sm font-semibold text-primary-dark">
              Tidak ada artikel yang ditemukan
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Buat artikel baru atau ubah filter pencarian di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-bg/60 text-text-muted">
                  <th className="px-4 py-3 font-semibold">Judul Artikel</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Baca & Pembaca</th>
                  <th className="px-4 py-3 font-semibold">Penulis</th>
                  <th className="px-4 py-3 font-semibold">Diperbarui</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {articlesList.map((art) => {
                  const badge = STATUS_BADGE[art.status];
                  return (
                    <tr key={art.id} className="hover:bg-bg/40">
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/articles/${art.id}`}
                          className="font-heading text-sm font-semibold text-primary-dark hover:text-primary"
                        >
                          {art.title || '(Draft Tanpa Judul)'}
                        </Link>
                        <div className="mt-0.5 text-[11px] text-text-muted">
                          /artikel/{art.slug}
                        </div>
                        {art.reviewNote && (
                          <div className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">
                            <MessageSquareWarning size={12} />
                            <span className="line-clamp-1">
                              Catatan: {art.reviewNote}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                          {ARTICLE_CATEGORIES[art.category]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-text-muted">
                        {art.readingTimeMinutes} mnt •{' '}
                        {art.viewCount.toLocaleString('id-ID')} dibaca
                      </td>
                      <td className="px-4 py-3.5 text-text-body">
                        {art.authorName}
                      </td>
                      <td className="px-4 py-3.5 text-text-muted">
                        {formatDateShortId(art.updatedAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-3">
                          <Link
                            href={`/admin/articles/${art.id}/preview`}
                            className="font-medium text-text-muted hover:text-primary"
                          >
                            Preview
                          </Link>
                          <Link
                            href={`/admin/articles/${art.id}`}
                            className="rounded-lg bg-primary/10 px-3 py-1 font-heading font-semibold text-primary hover:bg-primary hover:text-white"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

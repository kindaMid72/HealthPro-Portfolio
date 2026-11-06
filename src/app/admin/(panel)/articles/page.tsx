import Link from 'next/link';
import { MessageSquareWarning, Plus, Search } from 'lucide-react';
import { Button, buttonClassName } from '@/components/admin/Button';
import EmptyState from '@/components/admin/EmptyState';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge, { ARTICLE_STATUS_META } from '@/components/admin/StatusBadge';
import {
  type ArticleStatus,
  listArticlesAdmin,
} from '@/lib/articles';
import { formatDateShort } from '@/lib/format';
import { id as idDictionary } from '@/i18n/dictionaries/id';
import {
  ARTICLE_CATEGORY_VALUES,
  type ArticleCategory,
  isValidArticleCategory,
} from '@/lib/types';
import { createArticleAction } from '../../articles/actions';
import { requireUser } from '@/lib/session';

const STATUS_TABS: { value?: ArticleStatus; label: string }[] = [
  { value: undefined, label: 'Semua' },
  ...(['draft', 'in_review', 'published'] as const).map((value) => ({
    value,
    label: ARTICLE_STATUS_META[value].label,
  })),
];

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
  await requireUser();
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

  const TAB_ACTIVE = 'bg-primary text-white';
  const TAB_IDLE = 'bg-bg text-text-body hover:bg-primary-tint hover:text-primary';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Artikel Edukasi"
        description="Tulis, tinjau bersama rekan/dokter, dan terbitkan artikel kesehatan THT."
        actions={
          <form action={createArticleAction}>
            <Button type="submit" icon={<Plus size={16} aria-hidden="true" />}>
              Tulis Artikel Baru
            </Button>
          </form>
        }
      />

      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Filter status" className="flex flex-wrap items-center gap-1.5">
            {STATUS_TABS.map((tab) => {
              const isActive = activeStatus === tab.value;
              return (
                <Link
                  key={tab.label}
                  href={buildFilterUrl({ status: tab.value, category: activeCategory, q: searchQuery })}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex min-h-9 items-center rounded-lg px-3.5 text-sm font-semibold ${
                    isActive ? TAB_ACTIVE : TAB_IDLE
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <form method="GET" action="/admin/articles" className="flex w-full items-center gap-2 sm:w-80">
            {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
            {activeCategory && <input type="hidden" name="kategori" value={activeCategory} />}
            <label htmlFor="admin-artikel-q" className="sr-only">
              Cari artikel
            </label>
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <input
                id="admin-artikel-q"
                type="search"
                name="q"
                defaultValue={searchQuery ?? ''}
                placeholder="Cari judul artikel..."
                className="min-h-10 w-full rounded-lg border border-border-strong bg-surface pl-9 pr-3 text-base text-text-heading placeholder:text-text-muted focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm"
              />
            </div>
            <Button type="submit" variant="secondary">
              Cari
            </Button>
          </form>
        </div>

        <nav
          aria-label="Filter topik"
          className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3"
        >
          <span className="mr-1 text-xs font-semibold text-text-muted">Topik:</span>
          <Link
            href={buildFilterUrl({ status: activeStatus, category: undefined, q: searchQuery })}
            aria-current={!activeCategory ? 'page' : undefined}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              !activeCategory ? 'bg-primary-dark text-white' : 'bg-bg-subtle text-text-body hover:bg-primary-tint hover:text-primary'
            }`}
          >
            Semua
          </Link>
          {ARTICLE_CATEGORY_VALUES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <Link
                key={cat}
                href={buildFilterUrl({ status: activeStatus, category: cat, q: searchQuery })}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isActive ? 'bg-primary-dark text-white' : 'bg-bg-subtle text-text-body hover:bg-primary-tint hover:text-primary'
                }`}
              >
                {idDictionary.categories[cat]}
              </Link>
            );
          })}
        </nav>
      </div>

      {articlesList.length === 0 ? (
        <EmptyState
          title="Tidak ada artikel yang ditemukan"
          description="Buat artikel baru atau ubah filter pencarian di atas."
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-subtle/60 text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-semibold">Judul Artikel</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Baca &amp; Pembaca</th>
                  <th className="px-4 py-3 font-semibold">Penulis</th>
                  <th className="px-4 py-3 font-semibold">Diperbarui</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articlesList.map((art) => (
                  <tr key={art.id} className="hover:bg-bg/40">
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/articles/${art.id}`}
                        className="font-semibold text-text-heading hover:text-primary"
                      >
                        {art.title || '(Draft Tanpa Judul)'}
                      </Link>
                      <div className="mt-0.5 text-xs text-text-muted">/artikel/{art.slug}</div>
                      {art.reviewNote && (
                        <div className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                          <MessageSquareWarning size={12} aria-hidden="true" />
                          <span className="line-clamp-1">Catatan: {art.reviewNote}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-primary-tint px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {idDictionary.categories[art.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={art.status} />
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">
                      {art.readingTimeMinutes} mnt • {art.viewCount.toLocaleString('id-ID')} dibaca
                    </td>
                    <td className="px-4 py-3.5">{art.authorName}</td>
                    <td className="px-4 py-3.5 text-text-muted">{formatDateShort(art.updatedAt, 'id')}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link href={`/admin/articles/${art.id}/preview`} className={buttonClassName('ghost', 'sm')}>
                          Preview
                        </Link>
                        <Link href={`/admin/articles/${art.id}`} className={buttonClassName('secondary', 'sm')}>
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {articlesList.map((art) => (
              <li key={art.id} className="card-clinical p-4">
                <Link href={`/admin/articles/${art.id}`} className="font-semibold text-text-heading hover:text-primary">
                  {art.title || '(Draft Tanpa Judul)'}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <StatusBadge status={art.status} />
                  <span>{idDictionary.categories[art.category]}</span>
                  <span>{formatDateShort(art.updatedAt, 'id')}</span>
                </div>
                {art.reviewNote && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                    <MessageSquareWarning size={12} aria-hidden="true" />
                    <span className="line-clamp-1">Catatan: {art.reviewNote}</span>
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Link href={`/admin/articles/${art.id}`} className={buttonClassName('secondary', 'sm')}>
                    Edit
                  </Link>
                  <Link href={`/admin/articles/${art.id}/preview`} className={buttonClassName('ghost', 'sm')}>
                    Preview
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

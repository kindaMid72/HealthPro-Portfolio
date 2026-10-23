/**
 * app/admin/(panel)/articles/page.tsx — daftar artikel di panel admin.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ARTICLE_STATUS_LABELS,
  listArticlesAdmin,
  type ArticleStatus,
} from '@/lib/articles';
import { createArticleAction } from '@/app/admin/articles/actions';

export const metadata: Metadata = {
  title: 'Kelola Artikel',
};

const STATUS_BADGE_CLASSES: Record<ArticleStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  in_review: 'bg-amber-100 text-amber-800 border-amber-300',
  published: 'bg-green-100 text-green-800 border-green-300',
};

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = status as ArticleStatus | undefined;
  const articlesList = await listArticlesAdmin(
    activeStatus ? { status: activeStatus } : undefined
  );

  const tabs: Array<{ label: string; value?: ArticleStatus }> = [
    { label: 'Semua' },
    { label: 'Draft', value: 'draft' },
    { label: 'Menunggu Review', value: 'in_review' },
    { label: 'Dipublikasikan', value: 'published' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Artikel</h1>
          <p className="mt-1 text-sm text-gray-600">
            Tulis, tinjau, dan publikasikan artikel edukasi kesehatan THT.
          </p>
        </div>
        <form action={createArticleAction}>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors"
          >
            + Tulis Artikel Baru
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {tabs.map((tab) => {
          const isActive = (!tab.value && !activeStatus) || tab.value === activeStatus;
          const href = tab.value ? `/admin/articles?status=${tab.value}` : '/admin/articles';
          return (
            <Link
              key={tab.label}
              href={href}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6">
        {articlesList.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">Belum ada artikel pada filter ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3">Judul</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Penulis</th>
                  <th className="px-4 py-3">Diperbarui</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articlesList.map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link
                        href={`/admin/articles/${art.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {art.title || '(Tanpa Judul)'}
                      </Link>
                      {art.reviewNote && (
                        <p className="mt-1 text-xs text-amber-700">
                          Catatan: {art.reviewNote}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_BADGE_CLASSES[art.status as ArticleStatus]
                        }`}
                      >
                        {ARTICLE_STATUS_LABELS[art.status as ArticleStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {art.authorName ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(art.updatedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 text-xs">
                        <Link
                          href={`/admin/articles/${art.id}/preview`}
                          target="_blank"
                          className="rounded border border-gray-300 px-2.5 py-1 text-gray-700 hover:bg-gray-50"
                        >
                          Preview
                        </Link>
                        <Link
                          href={`/admin/articles/${art.id}`}
                          className="rounded bg-primary px-2.5 py-1 font-medium text-white hover:bg-primary-dark"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

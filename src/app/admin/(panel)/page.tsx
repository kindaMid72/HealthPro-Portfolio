import Link from 'next/link';
import {
  CheckCircle2,
  CircleAlert,
  Eye,
  FileCheck2,
  FileClock,
  FileEdit,
  Plus,
} from 'lucide-react';
import { getAdminDashboardStats } from '@/lib/articles';
import { formatDateShortId } from '@/lib/format';
import { ARTICLE_CATEGORIES } from '@/lib/types';
import { createArticleAction } from '../articles/actions';

const STATUS_BADGE: Record<
  'draft' | 'in_review' | 'published',
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

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
  const completedCount = stats.completeness.filter((c) => c.completed).length;
  const totalChecklist = stats.completeness.length;
  const progressPercent = Math.round((completedCount / totalChecklist) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-dark">
            Ringkasan Dashboard
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Pantau publikasi artikel edukasi, pembaca, serta kelengkapan data
            klinis website.
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

      {/* 4 Kartu Statistik Utama */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Artikel Terbit</span>
            <FileCheck2 size={18} className="text-emerald-600" />
          </div>
          <p className="mt-3 font-heading text-3xl font-bold text-primary-dark">
            {stats.publishedCount}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Tayang di halaman publik
          </p>
        </div>

        <div
          className={`rounded-2xl border p-5 shadow-xs ${
            stats.inReviewCount > 0
              ? 'border-amber-300 bg-amber-50/60'
              : 'border-border bg-surface'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Menunggu Review</span>
            <FileClock size={18} className="text-amber-600" />
          </div>
          <p className="mt-3 font-heading text-3xl font-bold text-primary-dark">
            {stats.inReviewCount}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Siap ditinjau sebelum terbit
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Draft Artikel</span>
            <FileEdit size={18} className="text-primary" />
          </div>
          <p className="mt-3 font-heading text-3xl font-bold text-primary-dark">
            {stats.draftCount}
          </p>
          <p className="mt-1 text-xs text-text-muted">Dalam proses penulisan</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Total Pembaca</span>
            <Eye size={18} className="text-primary" />
          </div>
          <p className="mt-3 font-heading text-3xl font-bold text-primary-dark">
            {stats.totalViews.toLocaleString('id-ID')}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Akumulasi kunjungan artikel
          </p>
        </div>
      </div>

      {/* Indikator Kelengkapan Data Website & Tabel Artikel Terbaru */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Panel Checklist Kelengkapan */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-primary-dark">
              Kelengkapan Data Website
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {completedCount} dari {totalChecklist} lengkap
            </span>
          </div>

          <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <ul className="space-y-3">
            {stats.completeness.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-bg/50 p-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  {item.completed ? (
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                  ) : (
                    <CircleAlert
                      size={16}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-primary-dark">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-text-muted">{item.hint}</p>
                  </div>
                </div>
                {!item.completed && (
                  <Link
                    href={item.href}
                    className="shrink-0 font-heading font-semibold text-primary hover:underline"
                  >
                    Lengkapi →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* 5 Artikel Terakhir Diperbarui */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-primary-dark">
              Artikel Terakhir Diperbarui
            </h2>
            <Link
              href="/admin/articles"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Kelola Semua →
            </Link>
          </div>

          {stats.recentArticles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm font-medium text-primary-dark">
                Belum ada artikel edukasi
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Klik tombol &ldquo;Tulis Artikel Baru&rdquo; untuk mulai menulis
                edukasi pasien.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="pb-2.5 font-semibold">Judul & Topik</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                    <th className="pb-2.5 font-semibold">Statistik</th>
                    <th className="pb-2.5 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {stats.recentArticles.map((art) => {
                    const badge = STATUS_BADGE[art.status];
                    return (
                      <tr key={art.id} className="hover:bg-bg/50">
                        <td className="py-3 pr-3">
                          <Link
                            href={`/admin/articles/${art.id}`}
                            className="font-heading font-semibold text-primary-dark hover:text-primary"
                          >
                            {art.title || '(Tanpa Judul)'}
                          </Link>
                          <div className="mt-0.5 text-[11px] text-text-muted">
                            {ARTICLE_CATEGORIES[art.category]} • Diperbarui{' '}
                            {formatDateShortId(art.updatedAt)}
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-text-muted">
                          {art.readingTimeMinutes} mnt •{' '}
                          {art.viewCount.toLocaleString('id-ID')} dibaca
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/admin/articles/${art.id}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

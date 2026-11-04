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
import type { ReactNode } from 'react';
import Card from '@/components/admin/Card';
import EmptyState from '@/components/admin/EmptyState';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/admin/Button';
import { getAdminDashboardStats } from '@/lib/articles';
import { formatDateShortId } from '@/lib/format';
import { ARTICLE_CATEGORIES } from '@/lib/types';
import { createArticleAction } from '../articles/actions';

function StatCard({
  label,
  value,
  note,
  icon,
  highlight = false,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight ? 'border-amber-300 bg-amber-50/60' : 'border-border bg-surface'
      }`}
    >
      <div className="flex items-center justify-between text-sm font-semibold text-text-muted">
        <span>{label}</span>
        <span aria-hidden="true">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-text-heading">{value}</p>
      <p className="mt-1 text-sm text-text-muted">{note}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
  const completedCount = stats.completeness.filter((c) => c.completed).length;
  const totalChecklist = stats.completeness.length;
  const progressPercent = Math.round((completedCount / totalChecklist) * 100);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ringkasan Dashboard"
        description="Pantau publikasi artikel edukasi, pembaca, serta kelengkapan data klinis website."
        actions={
          <form action={createArticleAction}>
            <Button type="submit" icon={<Plus size={16} aria-hidden="true" />}>
              Tulis Artikel Baru
            </Button>
          </form>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Artikel Terbit"
          value={stats.publishedCount}
          note="Tayang di halaman publik"
          icon={<FileCheck2 size={18} className="text-emerald-600" />}
        />
        <StatCard
          label="Menunggu Review"
          value={stats.inReviewCount}
          note="Siap ditinjau sebelum terbit"
          icon={<FileClock size={18} className="text-amber-600" />}
          highlight={stats.inReviewCount > 0}
        />
        <StatCard
          label="Draft Artikel"
          value={stats.draftCount}
          note="Dalam proses penulisan"
          icon={<FileEdit size={18} className="text-primary" />}
        />
        <StatCard
          label="Total Pembaca"
          value={stats.totalViews.toLocaleString('id-ID')}
          note="Akumulasi kunjungan artikel"
          icon={<Eye size={18} className="text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card
          title="Kelengkapan Data Website"
          className="lg:col-span-5"
          actions={
            <span className="rounded-full bg-primary-tint px-2.5 py-0.5 text-xs font-semibold text-primary">
              {completedCount} dari {totalChecklist} lengkap
            </span>
          }
        >
          <div
            role="progressbar"
            aria-label="Kelengkapan data website"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
            className="mb-5 h-2 w-full overflow-hidden rounded-full bg-bg"
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <ul className="space-y-3">
            {stats.completeness.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border bg-bg/50 p-3 text-sm"
              >
                <div className="flex items-start gap-2.5">
                  {item.completed ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-label="Lengkap" />
                  ) : (
                    <CircleAlert size={16} className="mt-0.5 shrink-0 text-amber-600" aria-label="Belum lengkap" />
                  )}
                  <div>
                    <p className="font-semibold text-text-heading">{item.label}</p>
                    <p className="mt-0.5 text-text-muted">{item.hint}</p>
                  </div>
                </div>
                {!item.completed && (
                  <Link href={item.href} className="shrink-0 font-semibold text-primary hover:underline">
                    Lengkapi →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Artikel Terakhir Diperbarui"
          className="lg:col-span-7"
          actions={
            <Link href="/admin/articles" className="text-sm font-semibold text-primary hover:underline">
              Kelola semua →
            </Link>
          }
        >
          {stats.recentArticles.length === 0 ? (
            <EmptyState
              title="Belum ada artikel edukasi"
              description="Klik tombol “Tulis Artikel Baru” untuk mulai menulis edukasi pasien."
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-text-muted">
                      <th className="pb-2.5 font-semibold">Judul &amp; topik</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                      <th className="pb-2.5 font-semibold">Statistik</th>
                      <th className="pb-2.5 text-right font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.recentArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-bg/50">
                        <td className="py-3 pr-3">
                          <Link
                            href={`/admin/articles/${art.id}`}
                            className="font-semibold text-text-heading hover:text-primary"
                          >
                            {art.title || '(Tanpa Judul)'}
                          </Link>
                          <div className="mt-0.5 text-xs text-text-muted">
                            {ARTICLE_CATEGORIES[art.category]} • Diperbarui {formatDateShortId(art.updatedAt)}
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <StatusBadge status={art.status} />
                        </td>
                        <td className="py-3 pr-3 text-text-muted">
                          {art.readingTimeMinutes} mnt • {art.viewCount.toLocaleString('id-ID')} dibaca
                        </td>
                        <td className="py-3 text-right">
                          <Link href={`/admin/articles/${art.id}`} className="font-semibold text-primary hover:underline">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="divide-y divide-border md:hidden">
                {stats.recentArticles.map((art) => (
                  <li key={art.id} className="py-3">
                    <Link
                      href={`/admin/articles/${art.id}`}
                      className="font-semibold text-text-heading hover:text-primary"
                    >
                      {art.title || '(Tanpa Judul)'}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      <StatusBadge status={art.status} />
                      <span>{formatDateShortId(art.updatedAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

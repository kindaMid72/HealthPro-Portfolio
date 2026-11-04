import type { ArticleStatus } from '@/lib/tiptap';

export const ARTICLE_STATUS_META: Record<ArticleStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  in_review: { label: 'Menunggu Review', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  published: { label: 'Dipublikasikan', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function StatusBadge({ status }: { status: ArticleStatus }) {
  const meta = ARTICLE_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

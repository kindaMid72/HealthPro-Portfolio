import type { ArticleStatus } from '@/lib/tiptap';

export const ARTICLE_STATUS_META: Record<ArticleStatus, { label: string; className: string; dotClassName: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200', dotClassName: 'bg-slate-400' },
  in_review: {
    label: 'Menunggu Review',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClassName: 'bg-amber-500',
  },
  published: {
    label: 'Dipublikasikan',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClassName: 'bg-emerald-500',
  },
};

export default function StatusBadge({ status }: { status: ArticleStatus }) {
  const meta = ARTICLE_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} />
      {meta.label}
    </span>
  );
}

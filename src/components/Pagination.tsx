/**
 * components/Pagination.tsx — Navigasi paginasi artikel edukasi.
 */

import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = '/artikel',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevHref =
    currentPage <= 2 ? basePath : `${basePath}/halaman/${currentPage - 1}`;
  const nextHref = `${basePath}/halaman/${currentPage + 1}`;

  return (
    <nav
      aria-label="Paginasi Artikel"
      className="mt-12 flex items-center justify-between border-t border-border pt-6 text-sm"
    >
      <div>
        {currentPage > 1 ? (
          <Link
            href={prevHref}
            className="inline-flex items-center rounded-lg border border-border bg-white px-4 py-2 font-medium text-text-heading hover:bg-surface transition-colors"
          >
            ← Sebelumnya
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-lg border border-border/50 px-4 py-2 text-text-muted opacity-50 cursor-not-allowed">
            ← Sebelumnya
          </span>
        )}
      </div>

      <span className="text-xs text-text-muted">
        Halaman <strong className="text-text-heading">{currentPage}</strong> dari{' '}
        <strong className="text-text-heading">{totalPages}</strong>
      </span>

      <div>
        {currentPage < totalPages ? (
          <Link
            href={nextHref}
            className="inline-flex items-center rounded-lg border border-border bg-white px-4 py-2 font-medium text-text-heading hover:bg-surface transition-colors"
          >
            Berikutnya →
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-lg border border-border/50 px-4 py-2 text-text-muted opacity-50 cursor-not-allowed">
            Berikutnya →
          </span>
        )}
      </div>
    </nav>
  );
}

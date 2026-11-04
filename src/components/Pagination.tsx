import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  queryParams?: {
    kategori?: string;
    q?: string;
  };
}

function buildHref(
  page: number,
  basePath: string,
  queryParams?: { kategori?: string; q?: string },
): string {
  const path = page <= 1 ? basePath : `${basePath}/halaman/${page}`;
  const params = new URLSearchParams();
  if (queryParams?.kategori) params.set('kategori', queryParams.kategori);
  if (queryParams?.q) params.set('q', queryParams.q);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath = '/artikel',
  queryParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <nav
      aria-label="Navigasi halaman artikel"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1, basePath, queryParams)}
          className="rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-body transition-colors hover:border-primary hover:text-primary"
        >
          ← Sebelumnya
        </Link>
      )}

      {pages.map((page) => {
        const active = page === currentPage;
        return (
          <Link
            key={page}
            href={buildHref(page, basePath, queryParams)}
            aria-current={active ? 'page' : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
              active
                ? 'bg-primary text-white shadow-xs'
                : 'border border-border bg-surface text-text-body hover:border-primary hover:text-primary'
            }`}
          >
            {page}
          </Link>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1, basePath, queryParams)}
          className="rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-body transition-colors hover:border-primary hover:text-primary"
        >
          Berikutnya →
        </Link>
      )}
    </nav>
  );
}

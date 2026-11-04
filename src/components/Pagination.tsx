import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

/** Jendela halaman: pertama, terakhir, dan tetangga halaman aktif; celah ditandai "…". */
function pageWindow(current: number, total: number): (number | 'gap')[] {
  const set = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

const NAV_CLASS =
  'inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-text-body hover:border-primary hover:text-primary';

export default function Pagination({
  currentPage,
  totalPages,
  basePath = '/artikel',
  queryParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Navigasi halaman artikel" className="mt-14 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1, basePath, queryParams)}
          aria-label="Halaman sebelumnya"
          className={NAV_CLASS}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Sebelumnya
        </Link>
      )}

      {pageWindow(currentPage, totalPages).map((item, i) => {
        if (item === 'gap') {
          return (
            <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-text-muted">
              …
            </span>
          );
        }
        const active = item === currentPage;
        return (
          <Link
            key={item}
            href={buildHref(item, basePath, queryParams)}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-full text-sm font-semibold ${
              active
                ? 'bg-primary text-white'
                : 'border border-border bg-surface text-text-body hover:border-primary hover:text-primary'
            }`}
          >
            {item}
          </Link>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1, basePath, queryParams)}
          aria-label="Halaman berikutnya"
          className={NAV_CLASS}
        >
          Berikutnya
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}

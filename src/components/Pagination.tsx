import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { id as idDictionary } from '@/i18n/dictionaries/id';
import { format } from '@/i18n/dictionary';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  dict?: Dictionary['pagination'];
}

/** Jendela halaman: pertama, terakhir, dan tetangga halaman aktif; celah ditandai "…". */
function pageWindow(current: number, total: number): (number | 'gap')[] {
  const set = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) {
      out.push('gap');
    }
    out.push(p);
  });
  return out;
}

const NAV_CLASS =
  'card-clinical inline-flex min-h-11 items-center gap-1 rounded-full! px-4 text-sm font-semibold text-text-body hover:border-primary hover:text-primary';

export default function Pagination({
  currentPage,
  totalPages,
  hrefFor,
  dict = idDictionary.pagination,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={dict.navAria} className="mt-14 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={hrefFor(currentPage - 1)}
          aria-label={dict.prev}
          className={NAV_CLASS}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          {dict.prev}
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
            href={hrefFor(item)}
            aria-current={active ? 'page' : undefined}
            aria-label={format(dict.page, { page: item })}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
              active
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-text-body shadow-card hover:border-primary hover:text-primary'
            }`}
          >
            {item}
          </Link>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={hrefFor(currentPage + 1)}
          aria-label={dict.next}
          className={NAV_CLASS}
        >
          {dict.next}
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}

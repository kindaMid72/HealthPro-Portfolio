import Link from 'next/link';
import { Search } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import type { PaginatedArticlesResult } from '@/lib/content';
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_VALUES, type ArticleCategory } from '@/lib/types';

interface ArticleIndexViewProps {
  doctorName: string;
  paginated: PaginatedArticlesResult;
  activeCategory?: ArticleCategory;
  searchQuery?: string;
}

const CHIP_ACTIVE = 'bg-primary text-white';
const CHIP_IDLE = 'border border-border bg-surface text-text-body hover:border-primary hover:text-primary';

export default function ArticleIndexView({
  doctorName,
  paginated,
  activeCategory,
  searchQuery,
}: ArticleIndexViewProps) {
  const allHref = searchQuery ? `/artikel?q=${encodeURIComponent(searchQuery)}` : '/artikel';

  return (
    <section className="bg-bg px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 max-w-3xl">
          <h1 className="text-display font-bold">Artikel kesehatan THT-BKL</h1>
          {paginated.currentPage > 1 && (
            <p className="mt-2 text-text-muted">
              Halaman {paginated.currentPage} dari {paginated.totalPages}
            </p>
          )}
          <p className="mt-4 text-lg">
            Artikel informasi medis seputar kesehatan telinga, hidung, tenggorok, serta kepala dan leher
            yang ditulis dan ditinjau oleh <strong className="font-semibold text-text-heading">{doctorName}</strong>.
          </p>
        </header>

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
            <Link
              href={allHref}
              aria-current={!activeCategory ? 'page' : undefined}
              className={`chip shrink-0 ${!activeCategory ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              Semua topik
            </Link>
            {ARTICLE_CATEGORY_VALUES.map((cat) => {
              const params = new URLSearchParams();
              params.set('kategori', cat);
              if (searchQuery) params.set('q', searchQuery);
              const isActive = activeCategory === cat;
              return (
                <Link
                  key={cat}
                  href={`/artikel?${params.toString()}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`chip shrink-0 ${isActive ? CHIP_ACTIVE : CHIP_IDLE}`}
                >
                  {ARTICLE_CATEGORIES[cat]}
                </Link>
              );
            })}
          </div>

          <form method="GET" action="/artikel" className="flex w-full items-center gap-2 md:w-80">
            {activeCategory && <input type="hidden" name="kategori" value={activeCategory} />}
            <label htmlFor="artikel-q" className="sr-only">
              Cari artikel
            </label>
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <input
                id="artikel-q"
                type="search"
                name="q"
                defaultValue={searchQuery ?? ''}
                placeholder="Cari topik atau gejala..."
                className="min-h-12 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-base text-text-heading placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Cari
            </button>
          </form>
        </div>

        {(activeCategory || searchQuery) && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-text-muted">
            <span>
              Menampilkan {paginated.total} artikel
              {activeCategory ? ` dalam topik "${ARTICLE_CATEGORIES[activeCategory]}"` : ''}
              {searchQuery ? ` untuk pencarian "${searchQuery}"` : ''}.
            </span>
            <Link href="/artikel" className="link">
              Hapus filter
            </Link>
          </div>
        )}

        {paginated.items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold text-text-heading">Belum ada artikel yang sesuai</p>
            <p className="mt-1 text-text-muted">Silakan pilih kategori lain atau hapus kata kunci pencarian.</p>
            {(activeCategory || searchQuery) && (
              <Link href="/artikel" className="btn btn-primary mt-6">
                Lihat semua artikel
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.items.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            <Pagination
              currentPage={paginated.currentPage}
              totalPages={paginated.totalPages}
              basePath="/artikel"
              queryParams={{ kategori: activeCategory, q: searchQuery }}
            />
          </>
        )}
      </div>
    </section>
  );
}

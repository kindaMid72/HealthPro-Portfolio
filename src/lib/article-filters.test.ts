import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  type ArticleListFilters,
  buildArticleListHref,
  DEFAULT_PER_PAGE,
  hasActiveFilters,
  needsCanonicalRedirect,
  parseArticleFilters,
  parseArticlePageParam,
  toSearchParams,
} from './article-filters';

const defaults: ArticleListFilters = {
  sort: 'tanggal',
  order: 'desc',
  perPage: DEFAULT_PER_PAGE,
};

/** Drops undefined-valued keys so parsed objects compare equal to literal expectations. */
function compact(f: ArticleListFilters): ArticleListFilters {
  return Object.fromEntries(
    Object.entries(f).filter(([, v]) => v !== undefined),
  ) as ArticleListFilters;
}

describe('parseArticleFilters', () => {
  it('returns defaults for empty input', () => {
    assert.deepEqual(compact(parseArticleFilters({})), defaults);
  });

  it('falls back to defaults for invalid values', () => {
    const f = parseArticleFilters({
      kategori: 'nope',
      urut: 'zzz',
      waktu: 'lama',
      per: '7',
      dari: '2026/05/01',
    });
    assert.deepEqual(compact(f), defaults);
  });

  it('takes the first element of array values', () => {
    const f = parseArticleFilters({ kategori: ['hidung', 'telinga'], q: ['a', 'b'] });
    assert.equal(f.category, 'hidung');
    assert.equal(f.query, 'a');
  });

  it('trims and caps the query at 100 characters', () => {
    assert.equal(parseArticleFilters({ q: '   halo   ' }).query, 'halo');
    assert.equal(parseArticleFilters({ q: '   ' }).query, undefined);
    assert.equal(parseArticleFilters({ q: 'x'.repeat(150) }).query?.length, 100);
  });

  it('derives the order from the sort when arah is missing or invalid', () => {
    assert.equal(parseArticleFilters({ urut: 'judul' }).order, 'asc');
    assert.equal(parseArticleFilters({ urut: 'judul', arah: 'desc' }).order, 'desc');
    assert.equal(parseArticleFilters({ urut: 'tanggal', arah: 'random' }).order, 'desc');
  });

  it('drops impossible calendar dates', () => {
    assert.equal(parseArticleFilters({ dari: '2026-02-30' }).from, undefined);
    assert.equal(parseArticleFilters({ dari: '9999-99-99' }).from, undefined);
    assert.equal(parseArticleFilters({ dari: '2026-02-28' }).from, '2026-02-28');
  });

  it('swaps from and to when from is after to', () => {
    const f = parseArticleFilters({ dari: '2026-05-10', sampai: '2026-05-01' });
    assert.equal(f.from, '2026-05-01');
    assert.equal(f.to, '2026-05-10');
  });

  it('round-trips a fully populated filter set through the URL', () => {
    const full: ArticleListFilters = {
      category: 'tenggorok',
      query: 'a&b c',
      sort: 'baca',
      order: 'desc',
      reading: 'sedang',
      from: '2026-01-01',
      to: '2026-03-31',
      perPage: 36,
    };
    const parsed = parseArticleFilters(Object.fromEntries(toSearchParams(full)));
    assert.deepEqual(compact(parsed), full);
  });
});

describe('buildArticleListHref', () => {
  it('omits /halaman for page 1', () => {
    assert.equal(buildArticleListHref('/artikel', defaults, 1), '/artikel');
  });

  it('builds a paginated href with the non-default filters', () => {
    const f: ArticleListFilters = { ...defaults, category: 'hidung', sort: 'populer' };
    assert.equal(
      buildArticleListHref('/artikel', f, 3),
      '/artikel/halaman/3?kategori=hidung&urut=populer',
    );
  });

  it('keeps the locale-prefixed base path', () => {
    assert.equal(buildArticleListHref('/en/artikel', defaults, 2), '/en/artikel/halaman/2');
  });

  it('encodes the query so it round-trips', () => {
    const href = buildArticleListHref('/artikel', { ...defaults, query: 'a&b c' });
    assert.equal(href, '/artikel?q=a%26b+c');
    const search = new URL(href, 'http://x').search;
    assert.equal(new URLSearchParams(search).get('q'), 'a&b c');
  });
});

describe('toSearchParams', () => {
  it('omits default-valued keys', () => {
    assert.equal(toSearchParams(defaults).size, 0);
    assert.equal(hasActiveFilters(defaults), false);
  });

  it('omits arah when it equals the sort default', () => {
    const f: ArticleListFilters = { ...defaults, sort: 'judul', order: 'asc' };
    assert.equal(toSearchParams(f).has('arah'), false);
    assert.equal(hasActiveFilters(f), true);
  });
});

describe('parseArticlePageParam', () => {
  it('accepts canonical positive integers', () => {
    assert.equal(parseArticlePageParam('1'), 1);
    assert.equal(parseArticlePageParam('12'), 12);
  });

  it('rejects non-canonical or out-of-range values', () => {
    for (const raw of ['0', '01', '1.5', 'abc', '-1', '1e3', '1000000', '']) {
      assert.equal(parseArticlePageParam(raw), null, `expected null for "${raw}"`);
    }
  });
});

describe('needsCanonicalRedirect', () => {
  it('is false when the URL is already canonical', () => {
    assert.equal(needsCanonicalRedirect({}, defaults), false);
    assert.equal(
      needsCanonicalRedirect({ kategori: 'hidung' }, parseArticleFilters({ kategori: 'hidung' })),
      false,
    );
  });

  it('ignores unknown keys', () => {
    assert.equal(needsCanonicalRedirect({ utm_source: 'x' }, defaults), false);
  });

  it('is true for redundant default values', () => {
    const cases: Record<string, string>[] = [
      { urut: 'tanggal' },
      { q: '' },
      { per: '7' },
      { arah: 'desc' },
      { waktu: '' },
      { dari: '' },
    ];
    for (const raw of cases) {
      assert.equal(needsCanonicalRedirect(raw, parseArticleFilters(raw)), true, JSON.stringify(raw));
    }
  });

  it('is true for repeated keys', () => {
    const raw = { kategori: ['a', 'b'] };
    assert.equal(needsCanonicalRedirect(raw, parseArticleFilters(raw)), true);
  });
});

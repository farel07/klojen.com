'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getArticles } from '@/lib/api/articles';
import type { Article, Pagination } from '@/app/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_BADGE: Record<string, string> = {
  kuliner:    'bg-orange-500',
  wisata:     'bg-emerald-500',
  pendidikan: 'bg-blue-500',
  hotel:      'bg-violet-500',
  olahraga:   'bg-green-500',
  teknologi:  'bg-sky-500',
  hiburan:    'bg-pink-500',
};

function getBadge(slug: string) {
  return CATEGORY_BADGE[slug] ?? 'bg-slate-500';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="flex gap-5 animate-pulse py-5 border-b border-gray-100 last:border-0">
      <div className="w-36 h-24 rounded-2xl bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function PaginationBar({
  current,
  last,
  onChange,
}: {
  current: number;
  last: number;
  onChange: (p: number) => void;
}) {
  if (last <= 1) return null;

  const pages: (number | '...')[] = [];
  if (last <= 7) {
    for (let i = 1; i <= last; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) pages.push(i);
    if (current < last - 2) pages.push('...');
    pages.push(last);
  }

  return (
    <div className="mt-10 flex justify-center">
      <div className="flex items-center bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className="px-4 py-3 border-r border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="px-4 py-3 border-r border-gray-200 text-gray-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`px-5 py-3 border-r border-gray-200 text-sm font-semibold transition-colors ${
                p === current
                  ? 'bg-black text-white font-bold'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(current + 1)}
          disabled={current === last}
          className="px-4 py-3 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CariPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';

  const [inputValue, setInputValue] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (!initialQuery) inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q: string, p: number) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await getArticles({ search: q.trim(), page: p, limit: 10 });
      setArticles(res.data.data.articles);
      setPagination(res.data.data.pagination);
    } catch {
      setArticles([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run search when URL query changes
  useEffect(() => {
    if (initialQuery) {
      setInputValue(initialQuery);
      setQuery(initialQuery);
      setPage(1);
      doSearch(initialQuery, 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    setQuery(q);
    setPage(1);
    // Update URL
    router.replace(`/cari?q=${encodeURIComponent(q)}`);
    doSearch(q, 1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    doSearch(query, p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-700 transition-colors font-medium">Beranda</Link>
          <span>/</span>
          <span className="text-gray-700 font-semibold">Pencarian</span>
        </nav>

        {/* Header & Search Bar */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Cari Berita</h1>
          <p className="text-gray-400 text-sm mb-8">Temukan artikel terbaru dari seluruh kategori</p>

          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm focus-within:border-black transition-colors duration-200">
              {/* Search icon */}
              <div className="pl-5 pr-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={inputRef}
                id="search-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ketik kata kunci berita..."
                className="flex-1 px-2 py-4 text-base text-gray-900 bg-transparent outline-none placeholder-gray-300"
                autoComplete="off"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => { setInputValue(''); inputRef.current?.focus(); }}
                  className="px-3 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                id="search-submit"
                className="m-1.5 bg-black text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-colors shrink-0"
              >
                Cari
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : !searched ? (
          /* Idle state — belum ada pencarian */
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-9 h-9 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">Mulai ketik untuk mencari berita</p>
          </div>
        ) : articles.length === 0 ? (
          /* Empty result */
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Tidak ada hasil untuk &ldquo;{query}&rdquo;
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Coba gunakan kata kunci yang berbeda atau lebih umum.
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        ) : (
          <>
            {/* Result count */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                Menampilkan <span className="font-bold text-gray-900">{pagination?.total ?? articles.length}</span> hasil
                {query && <> untuk <span className="font-bold text-gray-900">&ldquo;{query}&rdquo;</span></>}
              </p>
              {pagination && pagination.total_pages > 1 && (
                <span className="text-xs text-gray-400">
                  Halaman {page} dari {pagination.total_pages}
                </span>
              )}
            </div>

            {/* Article list */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/${article.slug}`}
                  className="flex gap-5 p-5 group hover:bg-gray-50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-36 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                    {article.featured_image_url ? (
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`${getBadge(article.category.slug)} text-white text-[10px] tracking-wider font-bold px-2.5 py-1 rounded-full uppercase`}>
                        {article.category.name}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(article.published_at)}</span>
                    </div>
                    <h2 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-black transition-colors">
                      {article.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      {article.author.avatar_url ? (
                        <img src={article.author.avatar_url} alt={article.author.name} className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 bg-gray-200 rounded-full" />
                      )}
                      <span className="font-semibold text-gray-600">{article.author.name}</span>
                      <span className="text-gray-300">·</span>
                      <span>{article.view_count.toLocaleString('id-ID')} views</span>
                    </div>
                  </div>

                  {/* Arrow icon */}
                  <div className="shrink-0 flex items-center text-gray-200 group-hover:text-gray-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            <PaginationBar
              current={page}
              last={pagination?.total_pages ?? 1}
              onChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

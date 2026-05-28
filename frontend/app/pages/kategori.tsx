'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { getArticles } from '@/lib/api/articles';
import { getCategories, CategoryWithChildren } from '@/lib/api/categories';
import type { Article, Category, Pagination } from '@/app/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_GRADIENTS: Record<string, string> = {
  kuliner:    'from-orange-500 to-red-500',
  wisata:     'from-emerald-500 to-teal-600',
  pendidikan: 'from-blue-500 to-indigo-600',
  hotel:      'from-violet-500 to-purple-700',
  olahraga:   'from-green-500 to-emerald-600',
  teknologi:  'from-sky-500 to-blue-600',
  hiburan:    'from-pink-500 to-rose-600',
};

const CATEGORY_ACCENT: Record<string, { text: string; bg: string; border: string }> = {
  kuliner:    { text: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-200' },
  wisata:     { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  pendidikan: { text: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200' },
  hotel:      { text: 'text-violet-600', bg: 'bg-violet-50',  border: 'border-violet-200' },
  olahraga:   { text: 'text-green-600',  bg: 'bg-green-50',   border: 'border-green-200' },
  teknologi:  { text: 'text-sky-600',    bg: 'bg-sky-50',     border: 'border-sky-200' },
  hiburan:    { text: 'text-pink-600',   bg: 'bg-pink-50',    border: 'border-pink-200' },
};

const CATEGORY_BADGE: Record<string, string> = {
  kuliner:    'bg-orange-500',
  wisata:     'bg-emerald-500',
  pendidikan: 'bg-blue-500',
  hotel:      'bg-violet-500',
  olahraga:   'bg-green-500',
  teknologi:  'bg-sky-500',
  hiburan:    'bg-pink-500',
};

function getGradient(slug: string) {
  return CATEGORY_GRADIENTS[slug] ?? 'from-slate-500 to-slate-700';
}
function getAccent(slug: string) {
  return CATEGORY_ACCENT[slug] ?? { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
}
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

function HeroSkeleton() {
  return (
    <div className="relative rounded-[2rem] overflow-hidden h-[500px] bg-gray-200 animate-pulse">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl bg-white rounded-t-[2rem] p-10">
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-1/2 mt-4" />
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
          <div className="w-28 h-20 rounded-xl bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-gray-100 rounded w-1/2 mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  current,
  last,
  onChange,
  categorySlug,
}: {
  current: number;
  last: number;
  onChange: (page: number) => void;
  categorySlug: string;
}) {
  if (last <= 1) return null;
  const accent = getAccent(categorySlug);

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
    <div className="mt-12 flex justify-center">
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
                  ? `${accent.text} ${accent.bg} font-bold`
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

interface KategoriProps {
  slug: string;
}

export default function Kategori({ slug }: KategoriProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featured, setFeatured] = useState<Article | null>(null);
  const [popular, setPopular] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [allCategories, setAllCategories] = useState<CategoryWithChildren[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch article list + popular
  const fetchArticles = useCallback(async (p: number) => {
    try {
      setLoading(true);
      setError(false);

      const [listRes, popularRes] = await Promise.all([
        getArticles({ category: slug, page: p, limit: 6 }),
        getArticles({ category: slug, page: 1, limit: 5 }),
      ]);

      const listData = listRes.data.data;
      setArticles(listData.articles);
      setPagination(listData.pagination);

      // Popular: sorted by view_count desc
      const popularSorted = [...popularRes.data.data.articles]
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5);
      setPopular(popularSorted);

      // Featured: ambil artikel is_featured dari kategori ini
      if (p === 1) {
        const featuredRes = await getArticles({ category: slug, featured: true, page: 1, limit: 1 });
        const featuredList = featuredRes.data.data.articles;
        setFeatured(featuredList[0] ?? listData.articles[0] ?? null);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Fetch all categories for sidebar & resolve current category name
  useEffect(() => {
    getCategories().then((res) => {
      const cats = res.data.data;
      setAllCategories(cats);
      for (const cat of cats) {
        if (cat.slug === slug) { setCurrentCategory(cat); return; }
        const child = cat.children?.find(c => c.slug === slug);
        if (child) { setCurrentCategory(child); return; }
      }
    }).catch(() => {});
  }, [slug]);

  useEffect(() => {
    setPage(1);
    setFeatured(null);
    fetchArticles(1);
  }, [slug, fetchArticles]);

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchArticles(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoryName = currentCategory?.name ?? slug;
  const gradient = getGradient(slug);
  const accent = getAccent(slug);
  const badge = getBadge(slug);

  // Kategori lain untuk eksplorasi (parent categories kecuali yang sedang aktif)
  const otherCategories = allCategories
    .filter(c => c.slug !== slug && c.parent_id === null)
    .slice(0, 6);

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Kategori tidak ditemukan</h2>
          <p className="text-gray-500 mb-6 text-sm">Halaman ini tidak tersedia atau terjadi kesalahan.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => fetchArticles(page)}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              Coba Lagi
            </button>
            <Link href="/" className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white pb-16 pt-6">

      {/* ── HEADER KATEGORI ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-700 transition-colors font-medium">Beranda</Link>
          <span>/</span>
          <span className={`font-bold uppercase tracking-wide ${accent.text}`}>{categoryName}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`w-1.5 h-10 rounded-full bg-gradient-to-b ${gradient} flex-shrink-0`} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight capitalize">
            {categoryName}
          </h1>
        </div>
      </div>

      {/* ── HERO / FEATURED ARTICLE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-14">
        {loading ? (
          <HeroSkeleton />
        ) : featured ? (
          <Link
            href={`/${featured.slug}`}
            className="relative rounded-[2rem] overflow-hidden h-[450px] md:h-[550px] shadow-lg group cursor-pointer block bg-gray-200"
          >
            {/* Background Image — no overlay */}
            {featured.featured_image_url ? (
              <img
                src={featured.featured_image_url}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
            )}

            {/* Content Card — plain white, slides up on hover */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl bg-white rounded-t-[2rem] p-6 md:p-10 shadow-2xl transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0">
              <p className="text-sm text-gray-400 mb-3 font-medium">
                {formatDate(featured.published_at)}
              </p>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                {featured.title}
              </h2>
              {/* Show category as excerpt substitute since Article type has no excerpt */}
              <p className="text-gray-500 mb-6 text-base md:text-lg">
                {featured.category.name}
              </p>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} overflow-hidden flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold`}>
                  {featured.author.name.charAt(0)}
                </div>
                <span className="font-bold text-sm text-gray-900">{featured.author.name}</span>
              </div>
            </div>
          </Link>
        ) : null}
      </section>

      {/* ── CONTENT + SIDEBAR ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-12">

        {/* Left: Article Grid */}
        <div className="lg:w-2/3">
          <div className="flex items-center gap-3 mb-8">
            <span className={`text-xs font-bold uppercase tracking-widest ${accent.text}`}>Artikel Terbaru</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {!loading && articles.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">📰</div>
              <p className="font-semibold text-gray-600 mb-1">Belum ada artikel</p>
              <p className="text-sm">Tidak ada artikel untuk kategori ini saat ini.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading
              ? [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
              : articles.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${item.slug}`}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm"
                  >
                    <div className="overflow-hidden h-48 bg-gray-100 relative">
                      {item.featured_image_url ? (
                        <img
                          src={item.featured_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} opacity-20`} />
                      )}
                      <div className={`absolute top-3 left-3 ${badge} text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full`}>
                        {item.category.name}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-[15px] text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-gray-600 transition-colors">
                        {item.title}
                      </h3>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[8px] font-bold`}>
                            {item.author.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-[11px] text-gray-700">{item.author.name}</span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">{formatDate(item.published_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>

          {!loading && pagination && (
            <Pagination
              current={page}
              last={pagination.total_pages}
              onChange={handlePageChange}
              categorySlug={slug}
            />
          )}
        </div>

        {/* Right: Sidebar */}
        <aside className="lg:w-1/3">
          <div className="sticky top-24 space-y-6">

            {/* Terpopuler */}
            <div className="border border-gray-100 rounded-3xl p-6 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${gradient}`} />
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                  Terpopuler di {categoryName}
                </h3>
              </div>

              {loading ? (
                <SidebarSkeleton />
              ) : popular.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">Belum ada artikel populer</p>
              ) : (
                <div className="flex flex-col divide-y divide-gray-50">
                  {popular.map((item, index) => (
                    <Link href={`/${item.slug}`} key={item.id} className="flex gap-4 py-4 group">
                      <div className="flex-shrink-0 pt-1">
                        <span className={`text-2xl font-black leading-none ${index < 3 ? accent.text : 'text-gray-200'}`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="overflow-hidden rounded-xl flex-shrink-0 w-24 h-16 bg-gray-100">
                        {item.featured_image_url ? (
                          <img
                            src={item.featured_image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${gradient} opacity-30`} />
                        )}
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="font-bold text-[13px] text-gray-900 mb-1.5 line-clamp-2 leading-snug group-hover:text-gray-600 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-gray-400 font-medium">{formatDate(item.published_at)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Eksplorasi Kategori */}
            {otherCategories.length > 0 && (
              <div className="border border-gray-100 rounded-3xl p-6 bg-white shadow-sm">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-4">Eksplorasi Kategori</h3>
                <div className="flex flex-wrap gap-2">
                  {otherCategories.map((cat) => {
                    const a = getAccent(cat.slug);
                    return (
                      <Link
                        key={cat.slug}
                        href={`/kategori/${cat.slug}`}
                        className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 hover:shadow-sm ${a.text} ${a.bg} ${a.border}`}
                      >
                        {cat.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </aside>

      </section>
    </div>
  );
}

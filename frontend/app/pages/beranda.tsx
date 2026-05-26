'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/lib/axios';

// ── Types ─────────────────────────────────────────────────────────────────────
interface BerandaArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image_url: string | null;
  view_count: number;
  published_at: string | null;
  category: { id: string; name: string; slug: string; parent_id: string | null };
  author: { id: string; name: string; avatar_url?: string };
  tags?: { id: string; name: string; slug: string }[];
  is_featured?: boolean;
}

interface BerandaCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  children: { id: string; name: string; slug: string }[];
}

interface BerandaData {
  featured: BerandaArticle[];
  latest: BerandaArticle[];
  popular: BerandaArticle[];
  categories: BerandaCategory[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  politik: 'bg-red-500',
  pemerintahan: 'bg-red-400',
  'dpr-legislatif': 'bg-rose-500',
  ekonomi: 'bg-yellow-500',
  'pasar-modal': 'bg-amber-500',
  umkm: 'bg-orange-500',
  olahraga: 'bg-emerald-500',
  'sepak-bola': 'bg-green-500',
  badminton: 'bg-teal-500',
  teknologi: 'bg-blue-500',
  startup: 'bg-sky-500',
  'ai-machine-learning': 'bg-indigo-500',
  hiburan: 'bg-violet-500',
};

function getCategoryColor(slug: string): string {
  return CATEGORY_COLORS[slug] ?? 'bg-slate-500';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Skeleton Components ───────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
      <div className="lg:col-span-2 rounded-2xl bg-gray-200 h-[400px] lg:h-[500px]" />
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-28 h-20 rounded-xl bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
              <div className="h-2 bg-gray-100 rounded w-1/2 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col">
      <div className="rounded-2xl bg-gray-200 h-48 mb-4" />
      <div className="h-3 bg-gray-200 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-2 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Beranda() {
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<BerandaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBeranda = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get<{
          status: string;
          data: BerandaData;
        }>('/beranda');
        setData(res.data.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBeranda();
  }, []);

  // Ambil artikel featured utama (hero) dan sisanya untuk section featured lainnya
  const heroArticle = data?.featured?.[0] ?? null;
  const popularArticles = data?.popular ?? [];
  const latestArticles = data?.latest ?? [];
  const categories = data?.categories ?? [];
  // Gunakan featured[1..] + latest untuk "Baca Sekarang"
  const readNowArticles = [...(data?.featured?.slice(1) ?? []), ...latestArticles].slice(0, 6);

  return (
    <div className="w-full">

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <HeroSkeleton />
        ) : error ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-semibold mb-2">Gagal memuat artikel</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 hover:underline"
            >
              Coba refresh halaman
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Featured */}
            {heroArticle && (
              <Link
                href={`/${heroArticle.slug}`}
                className="lg:col-span-2 relative rounded-2xl overflow-hidden h-[400px] lg:h-[500px] group cursor-pointer bg-gray-200 block"
              >
                {heroArticle.featured_image_url ? (
                  <img
                    src={heroArticle.featured_image_url}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={heroArticle.title}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 text-white w-full md:w-4/5">
                  <span
                    className={`${getCategoryColor(heroArticle.category.slug)} text-white text-[10px] tracking-wider font-bold px-3 py-1.5 rounded-full mb-4 inline-block uppercase`}
                  >
                    {heroArticle.category.name}
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                    {heroArticle.title}
                  </h2>
                  {heroArticle.excerpt && (
                    <p className="text-gray-200 text-sm md:text-base line-clamp-2">
                      {heroArticle.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            )}

            {/* Popular List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
              <h3 className="font-bold text-lg text-gray-900 mb-6">TERPOPULER MINGGU INI</h3>
              <div className="space-y-6 flex-1">
                {popularArticles.map((news) => (
                  <Link key={news.id} href={`/${news.slug}`} className="flex gap-4 group cursor-pointer">
                    <div className="w-28 h-20 shrink-0 overflow-hidden rounded-xl bg-gray-200">
                      {news.featured_image_url && (
                        <img
                          src={news.featured_image_url}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          alt={news.title}
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {news.title}
                      </h4>
                      <div className="text-[11px] text-gray-400 flex items-center gap-3">
                        <span>{formatDate(news.published_at)}</span>
                        <span>{formatTime(news.published_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* LATEST NEWS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-10 border-t border-gray-100 mt-4">
        <h3 className="font-bold text-xl text-gray-900 mb-8">BERITA TERBARU</h3>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
              : latestArticles.slice(0, 4).map((news) => (
                  <Link key={news.id} href={`/${news.slug}`} className="group cursor-pointer flex flex-col">
                    <div className="relative rounded-2xl overflow-hidden mb-4 h-48 shadow-sm bg-gray-200">
                      {news.featured_image_url && (
                        <img
                          src={news.featured_image_url}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt={news.title}
                        />
                      )}
                      <Link
                        href={`/kategori/${news.category.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute top-3 left-3 ${getCategoryColor(news.category.slug)} text-white text-[10px] tracking-wider font-bold px-3 py-1 rounded-full hover:opacity-80 transition-opacity uppercase`}
                      >
                        {news.category.name}
                      </Link>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                      {news.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-auto">
                      <div className="flex items-center gap-2">
                        {news.author.avatar_url ? (
                          <img
                            src={news.author.avatar_url}
                            alt={news.author.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-4 h-4 bg-gray-300 rounded-full" />
                        )}
                        <span className="font-semibold text-gray-900">{news.author.name}</span>
                      </div>
                      <span>{formatDate(news.published_at)}</span>
                    </div>
                  </Link>
                ))}
          </div>

          {/* Weather Widget (tetap statis) */}
          <div className="lg:col-span-1 bg-blue-500/80 rounded-2xl p-6 text-center text-gray-900 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="relative z-10 h-full flex flex-col">
              <h4 className="font-semibold text-sm mb-6 text-white">Cuaca Malang Hari ini</h4>
              <div className="flex items-center justify-center gap-4 mb-8 flex-1 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                  ⛅
                </div>
                <div className="text-left">
                  <div className="text-4xl font-bold tracking-tighter">24° C</div>
                  <div className="text-sm font-medium mt-1">Cerah Berawan</div>
                </div>
              </div>
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center text-[10px] font-medium text-white">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="opacity-80">Kelembapan</span>
                  <span className="font-bold">60%</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="opacity-80">Angin</span>
                  <span className="font-bold">12 km/j</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-10 border-t border-gray-100 mt-4">
        <h3 className="font-bold text-xl text-gray-900 mb-8">KATEGORI BERITA</h3>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-200 h-[280px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.slice(0, 4).map((cat) => (
              <div
                key={cat.id}
                className={`relative rounded-2xl overflow-hidden h-[280px] group cursor-pointer shadow-sm ${getCategoryColor(cat.slug)}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-300" />
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <Link
                      href={`/kategori/${cat.slug}`}
                      className="border border-white/60 text-white text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/20 backdrop-blur-sm transition-all"
                    >
                      Lihat Semua &rarr;
                    </Link>
                  </div>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="text-white transform transition-transform duration-300 group-hover:-translate-y-2"
                  >
                    <h4 className="text-3xl font-bold mb-3">{cat.name}</h4>
                    {cat.children.length > 0 && (
                      <p className="text-sm text-gray-200 max-w-md">
                        {cat.children.map((c) => c.name).join(' · ')}
                      </p>
                    )}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>



      {/* BACA SEKARANG SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-10 border-t border-gray-100 mt-8 mb-12">
        <h3 className="font-bold text-xl text-gray-900 mb-8">BACA SEKARANG</h3>
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-6 items-center">
                <div className="w-40 h-28 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                  <div className="h-2 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
            {readNowArticles.map((item) => (
              <Link
                key={item.id}
                href={`/${item.slug}`}
                className="flex gap-6 group cursor-pointer items-center"
              >
                <div className="w-40 h-28 shrink-0 overflow-hidden rounded-xl shadow-sm bg-gray-200">
                  {item.featured_image_url && (
                    <img
                      src={item.featured_image_url}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={item.title}
                    />
                  )}
                </div>
                <div>
                  <span
                    className={`${getCategoryColor(item.category.slug)} text-white text-[9px] tracking-wider font-bold px-2 py-1 rounded-full mb-2 inline-block uppercase`}
                  >
                    {item.category.name}
                  </span>
                  <h4 className="font-bold text-[15px] text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-gray-400">{formatDate(item.published_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
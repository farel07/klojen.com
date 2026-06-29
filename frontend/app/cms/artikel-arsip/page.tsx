'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  Search,
  Archive,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Tag,
} from 'lucide-react';
import { getCmsArticles } from '@/lib/api/articles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArchivedArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  author: string;
  archivedAt?: string;
  tags?: string[];
}

const CATEGORY_BADGE: Record<string, string> = {
  Wisata:     'bg-blue-100 text-blue-500',
  Pendidikan: 'bg-yellow-100/80 text-yellow-600',
  Hotel:      'bg-purple-100/80 text-purple-400',
  Kuliner:    'bg-green-100/80 text-green-500',
};

const ITEMS_PER_PAGE = 5;

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ArtikelArsipPage() {
  const { user } = useAuthStore();

  const [articles, setArticles] = useState<ArchivedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const res = await getCmsArticles();
        const apiData = res.data.data;

        // Filter only archived articles
        const archivedArticles: ArchivedArticle[] = apiData
          .filter((item: any) => item.status === 'archived')
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            excerpt: item.excerpt || (item.content ? item.content.replace(/<[^>]+>/g, '').substring(0, 80) + '...' : 'Tidak ada ringkasan'),
            category: item.category_name || 'Belum Ditentukan',
            image: item.featured_image_url || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80',
            author: item.author_name || 'Jurnalis',
            archivedAt: item.updated_at,
            tags: item.tags || [],
          }));

        setArticles(archivedArticles);
      } catch (err) {
        console.error('Gagal mengambil data artikel arsip:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => { setPage(1); }, [search]);

  const filtered = useMemo(() => {
    return articles.filter((a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase())
    );
  }, [articles, search]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const startItem = totalItems === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, totalItems);

  const changePage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <div className="min-h-full pb-16 bg-white rounded-tl-3xl p-6 sm:p-8">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
          <RefreshCw className="animate-spin text-blue-500 w-10 h-10" />
        </div>
      )}

      {/* ─── Header ─── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-orange-100 rounded-xl">
            <Archive size={22} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800">Artikel Terarsipkan</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Daftar artikel yang telah diarsipkan. Artikel arsip tidak tampil di portal berita publik.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Search ─── */}
      <div className="border border-gray-200 rounded-xl p-4 sm:p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-2xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari artikel arsip berdasarkan judul, ringkasan, atau penulis..."
              className="w-full pl-6 pr-12 py-3 rounded-full border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none text-sm text-gray-600 placeholder-gray-400"
            />
            <Search size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-orange-500" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 rounded-full">
            <Archive size={16} className="text-orange-500" />
            <span className="text-xs font-bold text-orange-600">{totalItems} artikel</span>
          </div>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="pb-4 text-left text-xs font-bold text-gray-400 w-[45%]">Judul Berita</th>
                <th className="pb-4 text-center text-xs font-bold text-gray-400 w-[15%]">Kategori</th>
                <th className="pb-4 text-center text-xs font-bold text-gray-400 w-[20%]">Penulis</th>
                <th className="pb-4 text-center text-xs font-bold text-gray-400 w-[20%]">Diarsipkan</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <Archive size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm font-semibold text-gray-400">
                      {search ? 'Tidak ada artikel arsip yang sesuai pencarian' : 'Belum ada artikel yang diarsipkan'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {search ? 'Coba kata kunci lain' : 'Artikel akan diarsipkan secara otomatis saat pengguna dihapus'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((article, idx) => (
                  <tr key={article.id} className={idx !== paginated.length - 1 ? 'border-b border-gray-100' : ''}>
                    {/* Judul */}
                    <td className="py-5">
                      <div className="flex items-start gap-4 pr-4">
                        <img
                          src={article.image}
                          alt="Thumbnail"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80'; }}
                          className="w-28 h-20 object-cover rounded-md border border-gray-100 shrink-0 opacity-70"
                        />
                        <div className="flex flex-col pt-1">
                          <span className="text-sm font-extrabold text-gray-700 leading-snug">
                            {article.title}
                          </span>
                          <span className="text-[11px] font-semibold text-gray-400 mt-1 line-clamp-2">
                            {article.excerpt}
                          </span>
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {article.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                              {article.tags.length > 3 && (
                                <span className="text-[10px] font-semibold text-gray-400">
                                  +{article.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="py-5 text-center">
                      <span className={`inline-flex px-4 py-1.5 rounded-full text-[11px] font-extrabold ${CATEGORY_BADGE[article.category] || 'bg-gray-100 text-gray-500'}`}>
                        {article.category}
                      </span>
                    </td>

                    {/* Penulis */}
                    <td className="py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <User size={14} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-600">{article.author}</span>
                      </div>
                    </td>

                    {/* Diarsipkan */}
                    <td className="py-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600">
                          <Archive size={14} className="text-orange-500" />
                          Arsip
                        </span>
                        {article.archivedAt && (
                          <span className="text-[10px] font-medium text-gray-500">
                            {new Date(article.archivedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">
            <span className="text-xs font-semibold text-gray-500">
              Menampilkan {startItem}–{endItem} dari {totalItems} artikel
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                    p === page
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-md text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

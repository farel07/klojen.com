'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  CheckCircle2,
  Clock,
  CloudUpload,
  XCircle,
  Tag
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

type ArticleStatus = 'published' | 'draft' | 'scheduled' | 'rejected';

interface MockArticleItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  status: ArticleStatus;
  image: string;
  caption?: string;
  content?: string;
  tags?: string[];
  rejectionReason?: string;
}

const MOCK_ARTICLES: MockArticleItem[] = [
  {
    id: '1',
    title: 'Wisata Gunung Bromo Via Malang Semakin Diminati Wisatawan',
    excerpt: 'Jumlah kunjungan wisatawa...',
    category: 'Wisata',
    status: 'published' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=200&q=80',
  },
  {
    id: '2',
    title: 'SMA di Malang Terapkan Kelas Digital Mulai Semester Ini',
    excerpt: 'Sekolah mulai menerapkan...',
    category: 'Pendidikan',
    status: 'published' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200&q=80',
  },
  {
    id: '3',
    title: 'Hotel Baru Dekat Alun-Alun Malang Resmi Dibuka',
    excerpt: 'Hotel dengan konsep modern ini menawarkan lokasi dipusat...',
    category: 'Hotel',
    status: 'draft' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80',
  },
  {
    id: '4',
    title: 'Bakso President Malang Jadi Favorit Wisatawan',
    excerpt: 'Cita rasa khas dan porsi jumbo membuat Bakso...',
    category: 'Kuliner',
    status: 'scheduled' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&q=80',
  },
  {
    id: '5',
    title: 'Jatim Park 3 Dipadati Pengunjung Saat Libur Panjang',
    excerpt: 'Wahana wisata keluarga ...',
    category: 'Wisata',
    status: 'rejected' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80',
    caption: 'Ribuan pengunjung memadati kawasan Jatim Park 3 di Kota Batu saat libur panjang akhir Mei 2026. (Foto: Dokumentasi Jatim Park Group)',
    content: `Jatim Park 3 yang berlokasi di Kota Batu, Jawa Timur, kembali dipadati ribuan pengunjung selama libur panjang akhir Mei 2026. Wahana wisata keluarga ini menjadi salah satu destinasi favorit warga Jawa Timur dan sekitarnya untuk menghabiskan waktu liburan bersama keluarga.

Pada hari puncak libur, Sabtu (24/5/2026), manajemen Jatim Park 3 mencatat lebih dari 8.000 pengunjung yang memasuki kawasan wisata. Angka ini merupakan salah satu rekor kunjungan tertinggi sepanjang tahun 2026.

"Kami menyiapkan operasional ekstra dengan menambah staf dan memperpanjang jam operasional hingga pukul 20.00 WIB selama periode libur," ujar Humas Jatim Park Group, Arini Setyawati, Sabtu (24/5/2026).

Berbagai wahana baru yang diluncurkan awal tahun ini turut menjadi daya tarik tambahan, termasuk roller coaster tipe baru dan area bermain air untuk anak-anak. Pengunjung juga dapat menikmati pertunjukan seni budaya Jawa Timur yang digelar setiap hari pukul 16.00 WIB.

Untuk menghindari kepadatan, manajemen mengimbau pengunjung untuk memesan tiket secara online dan memilih jadwal kunjungan pada hari kerja. Harga tiket masuk berkisar antara Rp 60.000 hingga Rp 120.000 tergantung jenis wahana yang dipilih.`,
    tags: ['#JatimPark', '#WisataBatu', '#LiburPanjang', '#Keluarga'],
    rejectionReason: 'Konten tidak sesuai dengan pedoman editorial. Judul kurang informatif dan isi berita perlu dilengkapi dengan data pendukung yang valid.',
  },
];

const CATEGORIES = ['Semua Kategori', 'Wisata', 'Pendidikan', 'Kuliner', 'Hotel'];

type StatusKey = ArticleStatus | 'semua';

const STATUS_TABS: { label: string; value: StatusKey; countKey: string }[] = [
  { label: 'Semua', value: 'semua', countKey: 'semua' },
  { label: 'Dipublikasi', value: 'published', countKey: 'published' },
  { label: 'Draft', value: 'draft', countKey: 'draft' },
  { label: 'Publish Terjadwal', value: 'scheduled', countKey: 'scheduled' },
  { label: 'Ditolak', value: 'rejected', countKey: 'rejected' },
];

const CATEGORY_BADGE: Record<string, string> = {
  Wisata:     'bg-blue-100 text-blue-500',
  Pendidikan: 'bg-yellow-100/80 text-yellow-600',
  Hotel:      'bg-purple-100/80 text-purple-400',
  Kuliner:    'bg-green-100/80 text-green-500',
};

function StatusBadge({ status }: { status: ArticleStatus }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A85A32]">
        Dipublikasi
        <CheckCircle2 size={14} className="text-[#A85A32]" />
      </span>
    );
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#20B2AA]">
        Draft
        <Clock size={14} className="text-[#20B2AA]" />
      </span>
    );
  }
  if (status === 'scheduled') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6A5ACD]">
        Publish Terjadwal
        <CloudUpload size={14} className="text-[#6A5ACD]" />
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DC143C]">
        Ditolak
        <XCircle size={14} className="text-[#DC143C]" />
      </span>
    );
  }
  return null;
}

const ITEMS_PER_PAGE = 3;

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BankBeritaPage() {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusKey>('semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Reset halaman ke 1 setiap kali filter berubah agar pencarian berlaku di semua data
  useEffect(() => { setPage(1); }, [search, activeStatus, selectedCategory]);

  // Hitung jumlah dinamis dari data yang ada (tanpa filter search/kategori, hanya per status)
  const dynamicCounts = useMemo(() => {
    const counts: Record<string, number> = {
      semua: MOCK_ARTICLES.length,
      published: 0,
      draft: 0,
      scheduled: 0,
      rejected: 0,
    };
    MOCK_ARTICLES.forEach((a) => {
      if (a.status in counts) counts[a.status]++;
    });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    return MOCK_ARTICLES.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchStatus = activeStatus === 'semua' || a.status === activeStatus;
      const matchCat =
        selectedCategory === 'Semua Kategori' || a.category === selectedCategory;
      return matchSearch && matchStatus && matchCat;
    });
  }, [search, activeStatus, selectedCategory]);

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
      
      {/* ─── Filter Section ─── */}
      <div className="border border-gray-200 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative flex-1 max-w-2xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Berdasarkan Caption atau Kategori.."
              className="w-full pl-6 pr-12 py-3 rounded-full border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none text-sm text-gray-600 placeholder-gray-400"
            />
            <Search size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500" />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-2 px-4 py-3 rounded-full border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Tag size={14} className="text-blue-500" />
                <span>{selectedCategory}</span>
                <ChevronDown size={14} className="text-blue-500 ml-1" />
              </button>
              {categoryOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setCategoryOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tambah Berita */}
            <Link
              href="/cms/tulis-berita"
              className="flex items-center gap-1.5 px-5 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Plus size={14} />
              Tambah Berita
            </Link>
          </div>

        </div>
      </div>

      {/* ─── Table Section ─── */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
        
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-4 sm:p-5 border-b border-gray-200">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.value;
            const count = dynamicCounts[tab.countKey] ?? 0;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-bold transition-all
                  ${isActive ? 'bg-gray-200 text-gray-800' : 'bg-transparent text-gray-500 hover:bg-gray-100'}
                `}
              >
                {tab.label}
                <span className={isActive ? 'text-blue-600' : 'text-blue-500'}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="pb-4 text-center text-xs font-bold text-gray-400 w-1/2">Judul Berita</th>
                <th className="pb-4 text-center text-xs font-bold text-gray-400 w-[15%]">Kategori</th>
                <th className="pb-4 text-center text-xs font-bold text-gray-400 w-[20%]">Status</th>
                <th className="pb-4 text-center text-xs font-bold text-gray-400 w-[15%]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((article, idx) => (
                <tr key={article.id} className={idx !== paginated.length - 1 ? "border-b border-gray-100" : ""}>
                  {/* Judul Berita */}
                  <td className="py-5">
                    <div className="flex items-start gap-4 pr-4">
                      <img
                        src={article.image}
                        alt="Thumbnail"
                        className="w-28 h-20 object-cover rounded-md border border-gray-100 shrink-0"
                      />
                      <div className="flex flex-col pt-1">
                        <span className="text-sm font-extrabold text-gray-800 leading-snug">
                          {article.title}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-400 mt-1">
                          {article.excerpt}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Kategori */}
                  <td className="py-5 text-center">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-[11px] font-extrabold ${CATEGORY_BADGE[article.category] || 'bg-gray-100 text-gray-500'}`}>
                      {article.category}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-5 text-center">
                    <StatusBadge status={article.status} />
                  </td>

                  {/* Aksi */}
                  <td className="py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {article.status === 'rejected' ? (
                        <Link
                          href={`/cms/tulis-berita?id=${article.id}&rejected=true&reason=${encodeURIComponent(article.rejectionReason ?? '')}&title=${encodeURIComponent(article.title)}&image=${encodeURIComponent(article.image)}&caption=${encodeURIComponent(article.caption ?? '')}&category=${encodeURIComponent(article.category)}&content=${encodeURIComponent(article.content ?? '')}&tags=${encodeURIComponent(JSON.stringify(article.tags ?? []))}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit3 size={20} strokeWidth={2.5} />
                        </Link>
                      ) : (
                        <button className="text-blue-600 hover:text-blue-800 transition-colors">
                          <Eye size={22} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] font-bold text-gray-400">
            Menampilkan {startItem}–{endItem} dari {totalItems} slide
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-blue-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => changePage(p)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  p === page
                    ? 'bg-gray-200 text-gray-600'
                    : 'border border-gray-200 text-blue-500 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-blue-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

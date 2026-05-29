'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  CheckCircle,
  Archive,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { canPublish } from '@/app/constants/roles';
import { ArticleStatus, Role } from '@/app/types';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_ARTICLES = [
  {
    id: '1',
    title: 'Festival Kuliner Malang 2025 Resmi Dibuka di Alun-Alun Kota',
    category: 'Kuliner',
    status: 'published' as ArticleStatus,
    author: 'Paulenta',
    date: '29 Mei 2025',
  },
  {
    id: '2',
    title: 'Kampus Brawijaya Luncurkan Program Beasiswa Internasional Baru',
    category: 'Pendidikan',
    status: 'review' as ArticleStatus,
    author: 'Budi Santoso',
    date: '28 Mei 2025',
  },
  {
    id: '3',
    title: 'Taman Sengkaling Hadirkan Wahana Baru Musim Panas 2025',
    category: 'Wisata',
    status: 'draft' as ArticleStatus,
    author: 'Paulenta',
    date: '27 Mei 2025',
  },
  {
    id: '4',
    title: 'Hotel Bintang Lima Pertama di Malang Siap Beroperasi Juli Ini',
    category: 'Hotel',
    status: 'published' as ArticleStatus,
    author: 'Rina Dewi',
    date: '26 Mei 2025',
  },
  {
    id: '5',
    title: 'Pemerintah Kota Malang Resmikan Jalur Sepeda Baru Sepanjang 12 Km',
    category: 'Pendidikan',
    status: 'scheduled' as ArticleStatus,
    author: 'Ahmad Fauzi',
    date: '25 Mei 2025',
  },
  {
    id: '6',
    title: 'Warung Cak Sholeh Raih Penghargaan Kuliner Terbaik Jawa Timur',
    category: 'Kuliner',
    status: 'archived' as ArticleStatus,
    author: 'Paulenta',
    date: '20 Mei 2025',
  },
];

const STATUS_CONFIG: Record<ArticleStatus, { label: string; className: string }> = {
  published: { label: 'Tayang', className: 'bg-green-100 text-green-700' },
  review: { label: 'Review', className: 'bg-yellow-100 text-yellow-700' },
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  scheduled: { label: 'Terjadwal', className: 'bg-blue-100 text-blue-700' },
  archived: { label: 'Arsip', className: 'bg-red-100 text-red-600' },
};

const STATUS_FILTERS: { label: string; value: ArticleStatus | 'semua' }[] = [
  { label: 'Semua', value: 'semua' },
  { label: 'Draft', value: 'draft' },
  { label: 'Review', value: 'review' },
  { label: 'Terjadwal', value: 'scheduled' },
  { label: 'Tayang', value: 'published' },
  { label: 'Arsip', value: 'archived' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ArtikelPage() {
  const { user } = useAuthStore();
  const role = user?.role as Role | undefined;
  const isEditorOrAbove = role ? canPublish(role) : false;

  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<ArticleStatus | 'semua'>('semua');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filtered = MOCK_ARTICLES.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = activeStatus === 'semua' || a.status === activeStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Artikel</h1>
          <p className="text-sm text-gray-400 mt-0.5">Kelola semua artikel redaksi Klojen.</p>
        </div>
        <Link
          href="/cms/artikel/baru"
          id="btn-tambah-artikel"
          className="
            inline-flex items-center gap-2 px-5 py-2.5
            bg-gradient-to-r from-blue-500 to-blue-700
            text-white text-sm font-semibold rounded-xl shadow-md
            hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
          "
        >
          <Plus size={16} />
          Tulis Artikel Baru
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="artikel-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul artikel..."
              className="
                w-full pl-10 pr-4 py-2.5 rounded-xl
                border border-gray-200 focus:border-blue-300
                focus:ring-2 focus:ring-blue-100 outline-none
                text-sm text-gray-700 placeholder-gray-400
                transition-all duration-200
              "
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveStatus(f.value)}
                className={`
                  px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                  ${activeStatus === f.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Judul
                </th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">
                  Kategori
                </th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">
                  Penulis
                </th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">
                  Tanggal
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                    Tidak ada artikel yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((article) => {
                  const st = STATUS_CONFIG[article.status];
                  return (
                    <tr
                      key={article.id}
                      className="hover:bg-blue-50/20 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 max-w-xs">
                        <span className="font-medium text-gray-800 line-clamp-1 group-hover:text-blue-700 transition-colors">
                          {article.title}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-gray-500">{article.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${st.className}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-gray-500 text-xs">{article.author}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-gray-400 text-xs">{article.date}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit */}
                          <Link
                            href={`/cms/artikel/${article.id}`}
                            className="
                              inline-flex items-center gap-1.5 px-3 py-1.5
                              text-xs font-semibold text-blue-600
                              bg-blue-50 rounded-lg hover:bg-blue-100
                              transition-colors duration-200
                            "
                          >
                            <Edit3 size={12} />
                            Edit
                          </Link>

                          {/* Publish (editor+) */}
                          {isEditorOrAbove && article.status === 'review' && (
                            <button
                              className="
                                inline-flex items-center gap-1.5 px-3 py-1.5
                                text-xs font-semibold text-green-600
                                bg-green-50 rounded-lg hover:bg-green-100
                                transition-colors duration-200
                              "
                            >
                              <CheckCircle size={12} />
                              Publish
                            </button>
                          )}

                          {/* Archive (editor+) */}
                          {isEditorOrAbove && article.status === 'published' && (
                            <button
                              className="
                                inline-flex items-center gap-1.5 px-3 py-1.5
                                text-xs font-semibold text-red-500
                                bg-red-50 rounded-lg hover:bg-red-100
                                transition-colors duration-200
                              "
                            >
                              <Archive size={12} />
                              Arsip
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
          <span className="text-xs text-gray-400">
            Menampilkan {filtered.length} dari {MOCK_ARTICLES.length} artikel
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="p-2 rounded-lg text-gray-300 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold">
              1
            </button>
            <button className="w-8 h-8 rounded-lg text-gray-500 text-xs font-semibold hover:bg-gray-100">
              2
            </button>
            <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Filter,
  Calendar,
  User,
  Tag,
  RefreshCw,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

type ReviewStatus = 'review' | 'approved' | 'rejected';

interface ReviewArticle {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  submittedAt: string;
  status: ReviewStatus;
  rejectionReason?: string;
}

const MOCK_REVIEW_ARTICLES: ReviewArticle[] = [
  {
    id: '3',
    title: 'Kampus Brawijaya Luncurkan Program Beasiswa Internasional',
    excerpt: 'Universitas Brawijaya secara resmi meluncurkan program beasiswa internasional yang ditujukan bagi mahasiswa berprestasi di seluruh Indonesia...',
    author: 'Siti Nurhaliza',
    category: 'Pendidikan',
    tags: ['#Brawijaya', '#Beasiswa', '#Pendidikan'],
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
    submittedAt: '2026-06-04 09:30',
    status: 'review',
  },
  {
    id: '7',
    title: 'Cafe Baru di Kayutangan Tawarkan Sensasi Kopi Vintage',
    excerpt: 'Kawasan Kayutangan Heritage kembali diramaikan dengan hadirnya cafe baru bernuansa tempo dulu yang menyajikan kopi lokal pilihan...',
    author: 'Rina Wijaya',
    category: 'Kuliner',
    tags: ['#Kayutangan', '#KopiMalang', '#CafeMalang'],
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    submittedAt: '2026-06-04 08:15',
    status: 'review',
  },
  {
    id: '8',
    title: 'Pasar Ramadan Malang 2026 Resmi Dibuka di Alun-Alun Tugu',
    excerpt: 'Ribuan warga Malang memadati kawasan Alun-Alun Tugu pada malam pembukaan Pasar Ramadan yang menampilkan ratusan tenant kuliner dan produk UMKM...',
    author: 'Budi Prasetyo',
    category: 'Wisata',
    tags: ['#PasarRamadan', '#Malang', '#UMKM'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    submittedAt: '2026-06-03 18:00',
    status: 'review',
  },
];

const ITEMS_PER_PAGE = 5;

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReviewStatus }) {
  if (status === 'review') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
      <Clock size={11} /> Menunggu Review
    </span>
  );
  if (status === 'approved') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
      <CheckCircle2 size={11} /> Disetujui
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
      <XCircle size={11} /> Ditolak
    </span>
  );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({
  article,
  onConfirm,
  onCancel,
}: {
  article: ReviewArticle;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <XCircle size={22} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Tolak Artikel</h3>
            <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{article.title}</p>
          </div>
        </div>
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Alasan Penolakan <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tuliskan alasan penolakan secara jelas agar jurnalis dapat memperbaiki artikel..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{reason.length} karakter</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) { alert('Mohon isi alasan penolakan'); return; }
              onConfirm(reason);
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
          >
            Tolak Artikel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TinjauanArtikelPage() {
  const [articles, setArticles] = useState<ReviewArticle[]>(MOCK_REVIEW_ARTICLES);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | 'semua'>('semua');
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<ReviewArticle | null>(null);
  const [approveTarget, setApproveTarget] = useState<string | null>(null);

  // Load overrides from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('mock_review_overrides');
    if (raw) {
      try {
        const overrides = JSON.parse(raw);
        setArticles(prev => prev.map(a => overrides[a.id] ? { ...a, ...overrides[a.id] } : a));
      } catch { /* ignore */ }
    }
  }, []);

  const saveOverride = (id: string, data: Partial<ReviewArticle>) => {
    const raw = localStorage.getItem('mock_review_overrides');
    const overrides = raw ? JSON.parse(raw) : {};
    overrides[id] = { ...(overrides[id] || {}), ...data };
    localStorage.setItem('mock_review_overrides', JSON.stringify(overrides));

    // Also update status overrides for Bank Berita
    const statusRaw = localStorage.getItem('mock_status_overrides');
    const statusOverrides = statusRaw ? JSON.parse(statusRaw) : {};
    statusOverrides[id] = { status: data.status, reason: data.rejectionReason };
    localStorage.setItem('mock_status_overrides', JSON.stringify(statusOverrides));
  };

  const handleApprove = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    saveOverride(id, { status: 'approved' });
    setApproveTarget(null);
  };

  const handleReject = (id: string, reason: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected', rejectionReason: reason } : a));
    saveOverride(id, { status: 'rejected', rejectionReason: reason });
    setRejectTarget(null);
  };

  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'semua' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const counts = {
    semua: articles.length,
    review: articles.filter(a => a.status === 'review').length,
    approved: articles.filter(a => a.status === 'approved').length,
    rejected: articles.filter(a => a.status === 'rejected').length,
  };

  const tabs = [
    { label: 'Semua', value: 'semua' as const, count: counts.semua },
    { label: 'Menunggu', value: 'review' as const, count: counts.review },
    { label: 'Disetujui', value: 'approved' as const, count: counts.approved },
    { label: 'Ditolak', value: 'rejected' as const, count: counts.rejected },
  ];

  const tabColors: Record<string, string> = {
    semua: 'bg-blue-100 text-blue-700',
    review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <>
      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          article={rejectTarget}
          onConfirm={(reason) => handleReject(rejectTarget.id, reason)}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {/* Approve confirmation overlay */}
      {approveTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} className="text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Setujui Artikel?</h3>
                <p className="text-sm text-gray-400">Artikel akan dipindahkan ke Bank Berita sebagai Dipublikasi.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setApproveTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleApprove(approveTarget)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
              >
                Ya, Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-full pb-16 bg-white rounded-tl-3xl p-6 sm:p-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck size={24} className="text-blue-500" />
              Tinjauan Artikel
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Tinjau dan setujui artikel dari jurnalis sebelum dipublikasikan.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
            <RefreshCw size={14} className="text-blue-500" />
            <span className="text-sm text-blue-700 font-semibold">{counts.review} artikel menunggu</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setFilterStatus(tab.value); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                filterStatus === tab.value
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                filterStatus === tab.value ? 'bg-white/20 text-white' : tabColors[tab.value]
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari judul, penulis, atau kategori..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all"
          />
        </div>

        {/* Article List */}
        <div className="space-y-4">
          {paginated.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
              <ClipboardCheck size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 font-medium">Tidak ada artikel ditemukan</p>
              <p className="text-sm text-gray-300 mt-1">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : (
            paginated.map((article) => (
              <div key={article.id} className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-blue-200 transition-all duration-200 shadow-sm">
                <div className="flex gap-5">
                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-28 h-20 object-cover rounded-xl border border-gray-100 shrink-0 hidden sm:block"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 flex-1">
                        {article.title}
                      </h3>
                      <StatusBadge status={article.status} />
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{article.excerpt}</p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1.5">
                        <User size={12} /> {article.author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Filter size={12} /> {article.category}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} /> {article.submittedAt}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {article.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-lg">
                          <Tag size={9} />{tag}
                        </span>
                      ))}
                    </div>

                    {/* Rejection reason */}
                    {article.status === 'rejected' && article.rejectionReason && (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-3">
                        <p className="text-xs font-semibold text-red-600 mb-1">Alasan Penolakan:</p>
                        <p className="text-sm text-red-700">{article.rejectionReason}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/cms/artikel/${article.id}/preview`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-colors"
                      >
                        <Eye size={13} /> Lihat Artikel
                      </Link>

                      {article.status === 'review' && (
                        <>
                          <Link
                            href={`/cms/tulis-berita?id=${article.id}&status=review&title=${encodeURIComponent(article.title)}&image=${encodeURIComponent(article.image)}&category=${encodeURIComponent(article.category)}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
                          >
                            <ClipboardCheck size={13} /> Review & Edit
                          </Link>
                          <button
                            onClick={() => setApproveTarget(article.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors"
                          >
                            <CheckCircle2 size={13} /> Setujui
                          </button>
                          <button
                            onClick={() => setRejectTarget(article)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors"
                          >
                            <XCircle size={13} /> Tolak
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-400">
              Menampilkan {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                    page === p ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

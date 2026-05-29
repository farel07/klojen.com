'use client';

import { useState } from 'react';
import { Trash2, Search, MessageSquare, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_COMMENTS = [
  {
    id: 'c1',
    content: 'Wah, festival ini seru banget! Saya dan keluarga sudah nantikan dari bulan lalu.',
    article: 'Festival Kuliner Malang 2025',
    user: 'Budi Santoso',
    date: '29 Mei 2025, 10:23',
  },
  {
    id: 'c2',
    content: 'Semoga program beasiswa ini bisa diakses oleh semua kalangan ya, bukan hanya yang akademis saja.',
    article: 'Kampus Brawijaya Luncurkan Program Beasiswa',
    user: 'Rina Dewi',
    date: '28 Mei 2025, 14:05',
  },
  {
    id: 'c3',
    content: 'Saya sudah ke sana kemarin, wahana barunya memang keren sekali, anak-anak pasti suka!',
    article: 'Taman Sengkaling Hadirkan Wahana Baru',
    user: 'Siti Aminah',
    date: '28 Mei 2025, 09:17',
  },
  {
    id: 'c4',
    content: 'Info harga per malamnya berapa ya? Pengen nyoba staycation di sana.',
    article: 'Hotel Bintang Lima Pertama di Malang',
    user: 'Ahmad Fauzi',
    date: '27 Mei 2025, 20:44',
  },
  {
    id: 'c5',
    content: 'Kenapa jalur sepedanya tidak melewati daerah Dinoyo juga? Sayang sekali.',
    article: 'Pemerintah Kota Malang Resmikan Jalur Sepeda Baru',
    user: 'Doni Pratama',
    date: '26 Mei 2025, 16:30',
  },
  {
    id: 'c6',
    content: 'Warung Cak Sholeh memang legendaris, layak banget dapat penghargaan ini!',
    article: 'Warung Cak Sholeh Raih Penghargaan',
    user: 'Mega Sari',
    date: '25 Mei 2025, 11:55',
  },
];

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({
  comment,
  onConfirm,
  onCancel,
}: {
  comment: (typeof MOCK_COMMENTS)[0];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Hapus Komentar?</h3>
            <p className="text-sm text-gray-400">Aksi ini tidak dapat dibatalkan.</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-sm text-gray-600 line-clamp-3 italic">"{comment.content}"</p>
          <p className="text-xs text-gray-400 mt-1.5">— {comment.user}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            id="btn-confirm-delete-comment"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KomentarPage() {
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState<(typeof MOCK_COMMENTS)[0] | null>(null);

  const filtered = comments.filter(
    (c) =>
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.user.toLowerCase().includes(search.toLowerCase()) ||
      c.article.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    setToDelete(null);
  };

  return (
    <>
      {/* Delete Dialog */}
      {toDelete && (
        <DeleteDialog
          comment={toDelete}
          onConfirm={() => handleDelete(toDelete.id)}
          onCancel={() => setToDelete(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Moderasi Komentar</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {comments.length} komentar dari pembaca di semua artikel.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5">
            <AlertTriangle size={16} className="text-yellow-500" />
            <span className="text-sm text-yellow-700 font-semibold">Akses Editor & Admin</span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-5">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="komentar-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari komentar, pengguna, atau artikel..."
              className="
                w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200
                focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none
                text-sm text-gray-700 placeholder-gray-400
                transition-all duration-200
              "
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-2/5">
                    Komentar
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">
                    Artikel
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">
                    Pengguna
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
                    <td colSpan={5} className="text-center py-16">
                      <MessageSquare size={36} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-gray-400 text-sm">Tidak ada komentar ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((comment) => (
                    <tr
                      key={comment.id}
                      className="hover:bg-red-50/10 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4">
                        <p className="text-gray-700 line-clamp-2 text-sm leading-relaxed">
                          "{comment.content}"
                        </p>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-gray-500 text-xs line-clamp-2">
                          {comment.article}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-bold">
                              {comment.user[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-gray-600 text-xs font-medium">{comment.user}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-gray-400 text-xs">{comment.date}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          id={`btn-delete-comment-${comment.id}`}
                          onClick={() => setToDelete(comment)}
                          className="
                            inline-flex items-center gap-1.5 px-3 py-1.5
                            text-xs font-semibold text-red-500
                            bg-red-50 rounded-lg hover:bg-red-100
                            transition-colors duration-200
                          "
                        >
                          <Trash2 size={12} />
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
            <span className="text-xs text-gray-400">
              Menampilkan {filtered.length} dari {comments.length} komentar
            </span>
            <div className="flex items-center gap-1">
              <button disabled className="p-2 rounded-lg text-gray-300 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold">1</button>
              <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

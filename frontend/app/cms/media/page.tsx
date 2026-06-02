'use client';

import { useState, useCallback, useRef } from 'react';
import { Search, Plus, MoreVertical, ChevronLeft, ChevronRight, LayoutGrid, Utensils, MapPin, BookOpen, Building2, Pencil, Trash2, CloudUpload, ChevronRight as Chevron, X, Camera } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaItem {
  id: string;
  file_url: string;
  caption: string;
  category: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Semua', 'Kuliner', 'Wisata', 'Pendidikan', 'Hotel'];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Semua: LayoutGrid,
  Kuliner: Utensils,
  Wisata: MapPin,
  Pendidikan: BookOpen,
  Hotel: Building2,
};

const MOCK_MEDIA: MediaItem[] = [
  { id: '1',  file_url: 'https://picsum.photos/id/28/600/400',  caption: 'Kegiatan Belajar Mengajar di SMA 4 Malang',        category: 'Pendidikan' },
  { id: '2',  file_url: 'https://picsum.photos/id/29/600/400',    caption: 'Nikmati Kelezatan Bakso Malang Legendaris',          category: 'Kuliner'   },
  { id: '3',  file_url: 'https://picsum.photos/id/164/600/400',   caption: 'Hotel Nyaman dengan Pemandangan Kota Malang',        category: 'Hotel'     },
  { id: '4',  file_url: 'https://picsum.photos/id/42/600/400',    caption: 'Wisata Kuliner Sego Sambel Favorit Malang',          category: 'Kuliner'   },
  { id: '5',  file_url: 'https://picsum.photos/id/152/600/400',  caption: 'Pesona Alun-Alun Batu untuk Liburan Keluarga',       category: 'Wisata'    },
  { id: '6',  file_url: 'https://picsum.photos/id/192/600/400',   caption: 'Classic Hotel Malang',                              category: 'Hotel'     },
  { id: '7',  file_url: 'https://picsum.photos/id/201/600/400',  caption: 'Lomba Sains Tingkat Kota Malang 2025',              category: 'Pendidikan' },
  { id: '8',  file_url: 'https://picsum.photos/id/225/600/400',    caption: 'Bakso Bakar Khas Malang yang Menggugah Selera',      category: 'Kuliner'   },
  { id: '9',  file_url: 'https://picsum.photos/id/237/600/400',  caption: 'Air Terjun Coban Rondo Menawan',                    category: 'Wisata'    },
  { id: '10', file_url: 'https://picsum.photos/id/244/600/400',  caption: 'Hotel Bintang 5 Terbaik di Malang',                 category: 'Hotel'     },
  { id: '11', file_url: 'https://picsum.photos/id/250/600/400', caption: 'Wisuda Akbar Universitas Brawijaya',                category: 'Pendidikan' },
  { id: '12', file_url: 'https://picsum.photos/id/292/600/400',   caption: 'Rawon Hitam Pekat Khas Malang',                     category: 'Kuliner'   },
];

const PAGE_SIZE = 6;

// ─── Dropdown Menu ────────────────────────────────────────────────────────────

function MediaMenu({ onDelete, onEdit }: { onDelete: () => void; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <MoreVertical size={14} className="text-gray-600" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-9 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 min-w-[150px]"
          onMouseLeave={() => setOpen(false)}
        >
          {/* Edit */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-blue-50 transition-colors group"
          >
            <span className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Pencil size={15} className="text-blue-500" />
            </span>
            Edit
          </button>
          {/* Hapus */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-blue-50 transition-colors group"
          >
            <span className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Trash2 size={15} className="text-blue-500" />
            </span>
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Add View ─────────────────────────────────────────────────────────────────

function AddView({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (file: File, caption: string) => void;
}) {
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <div className="flex flex-col w-full max-w-[1000px]">
      {/* Header outside the card */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-semibold">
          <span className="hover:text-blue-500 cursor-pointer transition-colors" onClick={onClose}>Media Tersimpan</span>
          <Chevron size={14} className="text-blue-600 font-bold" />
          <span className="text-gray-700">Tambah Gambar</span>
        </div>
        <h1 className="text-[32px] font-extrabold text-gray-700">Tambah Gambar</h1>
        <p className="text-sm font-semibold text-gray-400 mt-2">Unggah gambar dan tambahkan informasi media</p>
      </div>

      {/* Card Body */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 flex flex-col md:flex-row gap-0 p-8">
        
        {/* Left: Preview */}
        <div className="w-full md:w-[350px] shrink-0 md:border-r border-gray-400 md:pr-10 mb-6 md:mb-0">
          <h2 className="text-[17px] font-bold text-gray-700 mb-4">Preview Media</h2>
          {/* Image preview */}
          <div className="rounded-xl overflow-hidden aspect-video bg-white mb-4 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="w-full h-full object-cover rounded-xl border border-gray-100 shadow-sm" />
            ) : (
              <div className="w-[120px] h-[90px] bg-[#6387a3] rounded-[16px] flex items-center justify-center shadow-sm">
                <Camera size={44} className="text-white" strokeWidth={2.5} />
              </div>
            )}
          </div>
          {/* Upload area */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            className={`
              border border-dashed rounded-xl px-4 py-4 flex items-center justify-center gap-3
              cursor-pointer transition-colors text-sm
              ${drag ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50/50'}
            `}
          >
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <CloudUpload size={16} className="text-blue-600" />
            </div>
            <div className="text-left leading-tight">
              <p className="font-bold text-gray-800 text-[11px]">Ganti Gambar</p>
              <p className="text-[9px] font-semibold text-gray-400 mt-0.5">PNG, JPG, JPEG (maks. 5MB)</p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
        </div>

        {/* Right: Caption */}
        <div className="flex-1 md:pl-10 flex flex-col">
          <label className="text-[17px] font-bold text-gray-700 mb-4">Keterangan</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="
              flex-1 min-h-[220px] w-full border border-gray-400 rounded-2xl px-5 py-4 text-xs text-gray-900 font-semibold
              focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600
              resize-none transition-all mb-6 leading-relaxed
            "
            placeholder="Tuliskan keterangan gambar...."
          />
          {/* Footer Buttons */}
          <div className="flex items-center justify-center sm:justify-end gap-6 pt-4">
            <button
              onClick={onClose}
              className="px-10 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              disabled={!file}
              onClick={() => { if (file) onUpload(file, caption); onClose(); }}
              className="px-6 py-2 rounded-lg bg-[#0055d4] text-white text-xs font-bold hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({
  onClose,
  onConfirm
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] shadow-2xl w-full max-w-[320px] overflow-hidden relative pb-6 pt-10 px-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full p-2 transition-colors"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <h2 className="text-[16px] font-medium text-gray-800 leading-snug mb-5 max-w-[200px] mx-auto">
          Apakah Anda Yakin Ingin Menghapus?
        </h2>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onConfirm}
            className="w-[80px] py-1.5 rounded-lg bg-[#63da6f] text-white text-[13px] font-medium hover:bg-[#52c55e] shadow-sm transition-all"
          >
            Ya
          </button>
          <button
            onClick={onClose}
            className="w-[80px] py-1.5 rounded-lg bg-[#df6c6c] text-white text-[13px] font-medium hover:bg-[#c95959] shadow-sm transition-all"
          >
            Tidak
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit View ───────────────────────────────────────────────────────────────

function EditView({
  item,
  onClose,
  onSave,
}: {
  item: MediaItem;
  onClose: () => void;
  onSave: (id: string, caption: string, newUrl?: string) => void;
}) {
  const [caption, setCaption] = useState(item.caption);
  const [previewUrl, setPreviewUrl] = useState(item.file_url);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col w-full max-w-[1000px]">
      {/* Header outside the card */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-semibold">
          <span className="hover:text-blue-500 cursor-pointer transition-colors" onClick={onClose}>Media Tersimpan</span>
          <Chevron size={14} className="text-blue-600 font-bold" />
          <span className="text-gray-700">Edit Media</span>
        </div>
        <h1 className="text-[32px] font-extrabold text-gray-700">Edit Media</h1>
        <p className="text-sm font-semibold text-gray-400 mt-2">Perbarui gambar dan media tersimpan.</p>
      </div>

      {/* Card Body */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 flex flex-col md:flex-row gap-0 p-8">
        
        {/* Left: Preview */}
        <div className="w-full md:w-[350px] shrink-0 md:border-r border-gray-400 md:pr-10 mb-6 md:mb-0">
          <h2 className="text-[17px] font-bold text-gray-700 mb-4">Preview Media</h2>
          {/* Image preview */}
          <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 mb-4 border border-gray-100 shadow-sm">
            <img
              src={previewUrl}
              alt={caption}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Upload area */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            className={`
              border border-dashed rounded-xl px-4 py-4 flex items-center justify-center gap-3
              cursor-pointer transition-colors text-sm
              ${drag ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50/50'}
            `}
          >
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <CloudUpload size={16} className="text-blue-600" />
            </div>
            <div className="text-left leading-tight">
              <p className="font-bold text-gray-800 text-[11px]">Ganti Gambar</p>
              <p className="text-[9px] font-semibold text-gray-400 mt-0.5">PNG, JPG, JPEG (maks. 5MB)</p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
        </div>

        {/* Right: Caption */}
        <div className="flex-1 md:pl-10 flex flex-col">
          <label className="text-[17px] font-bold text-gray-700 mb-4">Keterangan</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="
              flex-1 min-h-[220px] w-full border border-gray-400 rounded-2xl px-5 py-4 text-xs text-gray-900 font-semibold
              focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600
              resize-none transition-all mb-6 leading-relaxed
            "
            placeholder="Tulis keterangan gambar..."
          />
          {/* Footer Buttons */}
          <div className="flex items-center justify-center sm:justify-end gap-6 pt-4">
            <button
              onClick={onClose}
              className="px-10 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => { onSave(item.id, caption, previewUrl !== item.file_url ? previewUrl : undefined); onClose(); }}
              className="px-6 py-2 rounded-lg bg-[#0055d4] text-white text-xs font-bold hover:bg-blue-700 shadow-sm transition-all"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MediaPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [mediaList, setMediaList] = useState<MediaItem[]>(MOCK_MEDIA);
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<string | null>(null);

  // Filter
  const filtered = mediaList.filter((m) => {
    const matchSearch =
      m.caption.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Semua' || m.category === activeCategory;
    return matchSearch && matchCat;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleUpload = useCallback((file: File, caption: string) => {
    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      file_url: URL.createObjectURL(file),
      caption: caption || file.name.replace(/\.[^.]+$/, ''),
      category: activeCategory === 'Semua' ? 'Kuliner' : activeCategory,
    };
    setMediaList((prev) => [newItem, ...prev]);
    setPage(1);
  }, [activeCategory]);

  const handleDelete = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveEdit = (id: string, caption: string, newUrl?: string) => {
    setMediaList((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, caption, ...(newUrl ? { file_url: newUrl } : {}) }
          : m
      )
    );
  };


  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  // Page numbers array
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (showUpload) {
    return (
      <div className="w-full flex justify-start p-1 sm:p-2">
        <AddView
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
        />
      </div>
    );
  }

  if (editItem) {
    return (
      <div className="w-full flex justify-start p-1 sm:p-2">
        <EditView
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSaveEdit}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[560px] flex flex-col gap-5">

      {/* Search + Tambah */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="media-search"
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari Berdasarkan Caption atau Kategori..."
            className="
              w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200
              focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none
              text-sm text-gray-700 placeholder-gray-400 bg-white transition-all
            "
          />
        </div>

        {/* Tambah Gambar */}
        <button
          id="btn-tambah-gambar"
          onClick={() => setShowUpload(true)}
          className="
            inline-flex items-center gap-2 px-5 py-2.5 shrink-0
            bg-gradient-to-r from-blue-500 to-blue-700
            text-white text-sm font-semibold rounded-xl shadow
            hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
          "
        >
          <Plus size={16} />
          Tambah Gambar
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <button
              key={cat}
              id={`filter-${cat.toLowerCase()}`}
              onClick={() => { setActiveCategory(cat); setPage(1); }}
              className={`
                inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200
                ${activeCategory === cat
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600'
                }
              `}
            >
              <Icon size={15} className="shrink-0" />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {paged.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 flex-1">
          {paged.map((media) => (
            <div key={media.id} className="group relative flex flex-col gap-2">
              {/* Image */}
              <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                <img
                  src={media.file_url}
                  alt={media.caption}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
                {/* Menu dot */}
                <div className="absolute top-2 right-2">
                  <MediaMenu
                    onDelete={() => setDeleteItem(media.id)}
                    onEdit={() => setEditItem(media)}
                  />
                </div>

              </div>
              {/* Caption */}
              <p className="text-sm text-gray-700 font-medium leading-snug line-clamp-2 px-0.5">
                {media.caption}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400">
          <span className="text-5xl mb-3">🖼️</span>
          <p className="text-sm font-medium">Tidak ada gambar ditemukan</p>
        </div>
      )}

      {/* Footer: count + pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-gray-100">
        {/* Count */}
        <p className="text-sm font-medium text-gray-500">
          Menampilkan {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} dari {filtered.length} gambar
        </p>

        {/* Pagination — always visible */}
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => goToPage(n)}
              className={`
                w-8 h-8 rounded-full text-sm font-semibold transition-all duration-150
                ${safePage === n
                  ? 'bg-gray-200 text-gray-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }
              `}
            >
              {n}
            </button>
          ))}

          {/* Next */}
          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteItem && (
        <DeleteConfirmModal
          onClose={() => setDeleteItem(null)}
          onConfirm={() => {
            handleDelete(deleteItem);
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
}

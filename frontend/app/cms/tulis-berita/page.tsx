'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Type,
  FileText,
  Image as ImageIcon,
  Hash,
  Send,
  X,
  Upload,
  ChevronDown,
  Plus,
  Droplets,
  XCircle,
  LayoutGrid,
  Utensils,
  MapPin,
  BookOpen,
  Building2,
  Check,
  Newspaper,
  Tag,
} from 'lucide-react';
import RichTextEditor from '@/app/components/cms/RichTextEditor';
import { useAuthStore } from '@/stores/authStore';
import { canPublish } from '@/app/constants/roles';
import { Role } from '@/app/types';
import { createArticle, updateArticleStatus, updateArticle } from '@/lib/api/articles';
import { getCategories } from '@/lib/api/categories';
import { uploadMedia } from '@/lib/api/media';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'published', label: 'Submit', dot: 'bg-green-500'  },
  { value: 'draft',     label: 'Draft',  dot: 'bg-gray-400'   },
  { value: 'review',    label: 'Review', dot: 'bg-yellow-400' },
];

const KANAL_OPTIONS = [
  { value: 'Kuliner',    label: 'Kuliner',    icon: <Utensils  size={14} /> },
  { value: 'Wisata',     label: 'Wisata',     icon: <MapPin    size={14} /> },
  { value: 'Pendidikan', label: 'Pendidikan', icon: <BookOpen  size={14} /> },
  { value: 'Hotel',      label: 'Hotel',      icon: <Building2 size={14} /> },
];


const MAX_PHOTOS = 3;

// ─── Mock Media ────────────────────────────────────────────────────────────────

interface MediaItem {
  id: string;
  file_url: string;
  caption: string;
  category: string;
}

const MOCK_MEDIA: MediaItem[] = [
  { id: '1',  file_url: 'https://picsum.photos/id/28/600/400',  caption: 'Kegiatan Belajar Mengajar di SMA 4 Malang',    category: 'Pendidikan' },
  { id: '2',  file_url: 'https://picsum.photos/id/29/600/400',  caption: 'Nikmati Kelezatan Bakso Malang Legendaris',     category: 'Kuliner'   },
  { id: '3',  file_url: 'https://picsum.photos/id/164/600/400', caption: 'Hotel Nyaman dengan Pemandangan Kota Malang',   category: 'Hotel'     },
  { id: '4',  file_url: 'https://picsum.photos/id/42/600/400',  caption: 'Wisata Kuliner Sego Sambel Favorit Malang',     category: 'Kuliner'   },
  { id: '5',  file_url: 'https://picsum.photos/id/152/600/400', caption: 'Pesona Alun-Alun Batu untuk Liburan Keluarga',  category: 'Wisata'    },
  { id: '6',  file_url: 'https://picsum.photos/id/192/600/400', caption: 'Classic Hotel Malang',                         category: 'Hotel'     },
  { id: '7',  file_url: 'https://picsum.photos/id/201/600/400', caption: 'Lomba Sains Tingkat Kota Malang 2025',         category: 'Pendidikan'},
  { id: '8',  file_url: 'https://picsum.photos/id/225/600/400', caption: 'Bakso Bakar Khas Malang yang Menggugah Selera',category: 'Kuliner'   },
  { id: '9',  file_url: 'https://picsum.photos/id/237/600/400', caption: 'Air Terjun Coban Rondo Menawan',               category: 'Wisata'    },
  { id: '10', file_url: 'https://picsum.photos/id/244/600/400', caption: 'Hotel Bintang 5 Terbaik di Malang',            category: 'Hotel'     },
  { id: '11', file_url: 'https://picsum.photos/id/250/600/400', caption: 'Wisuda Akbar Universitas Brawijaya',          category: 'Pendidikan'},
  { id: '12', file_url: 'https://picsum.photos/id/292/600/400', caption: 'Rawon Hitam Pekat Khas Malang',               category: 'Kuliner'   },
];

// ─── Media Library Modal ──────────────────────────────────────────────────────

function MediaLibraryModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
}) {
  const [search, setSearch]             = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const CATS = ['Semua', 'Kuliner', 'Wisata', 'Pendidikan', 'Hotel'];

  const filtered = MOCK_MEDIA.filter((m) => {
    const matchSearch = m.caption.toLowerCase().includes(search.toLowerCase());
    const matchCat    = activeCategory === 'Semua' || m.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Media Tersimpan</h3>
            <p className="text-xs text-gray-400 font-medium">Klik gambar untuk memilih</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Search + Filter */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-col gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari gambar..."
            className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
          />
          <div className="flex flex-wrap gap-2">
            {CATS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="text-4xl mb-3">🖼️</span>
              <p className="text-sm font-medium">Tidak ada gambar ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item); onClose(); }}
                  className="group relative flex flex-col gap-2 text-left"
                >
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 border-2 border-transparent group-hover:border-blue-400 transition-all">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.file_url} alt={item.caption} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-all flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Check size={16} className="text-blue-500" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-medium line-clamp-2 px-0.5">{item.caption}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Photo Item Interface ─────────────────────────────────────────────────────

interface PhotoItem {
  url: string;
  caption: string;
  watermark: boolean;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TulisBeritaPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user }     = useAuthStore();
  const role         = user?.role as Role | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isEditorOrAbove = role ? canPublish(role) : false;

  const allowedStatusOptions = isEditorOrAbove
    ? STATUS_OPTIONS
    : STATUS_OPTIONS.filter((opt) => opt.value === 'draft' || opt.value === 'review');

  // Deteksi edit
  const articleId  = searchParams.get('id');
  const isRejected = searchParams.get('rejected') === 'true';
  const isEdit     = !!articleId;

  const rejectionReason = searchParams.get('reason') ?? 'Tidak ada catatan dari reviewer.';
  const [showRejectionBanner, setShowRejectionBanner] = useState(true);

  // Pre-fill dari URL params
  const prefillTitle      = isEdit ? (searchParams.get('title')   ?? '') : '';
  const prefillContentRaw = isEdit ? (searchParams.get('content') ?? '') : '';
  const prefillImage      = isEdit ? (searchParams.get('image')   ?? '') : '';
  const prefillCaption    = isEdit ? (searchParams.get('caption') ?? '') : '';
  const prefillTagsRaw    = isEdit ? (searchParams.get('tags')    ?? '[]') : '[]';

  const prefillContent = prefillContentRaw
    ? prefillContentRaw.split(/\n\n+/).map((p) => `<p>${p.trim()}</p>`).join('')
    : '';
  const prefillTags: string[] = (() => {
    try { return JSON.parse(prefillTagsRaw); } catch { return []; }
  })();

  // ── State ──
  const [title,      setTitle]      = useState(prefillTitle);
  const [content,    setContent]    = useState(prefillContent);
  const [photos,     setPhotos]     = useState<PhotoItem[]>(
    prefillImage ? [{ url: prefillImage, caption: prefillCaption, watermark: false }] : []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [tags,       setTags]       = useState<string[]>(prefillTags.length > 0 ? prefillTags : ['#KetikPedia']);
  const [tagInput,   setTagInput]   = useState('');
  const [kanal,      setKanal]      = useState('');

  const defaultStatusForRole = isEditorOrAbove ? 'published' : 'draft';
  const prefillStatus = searchParams.get('status') ?? defaultStatusForRole;
  const [status,     setStatus]     = useState(prefillStatus);
  const [statusOpen, setStatusOpen] = useState(false);
  const [isSaving,   setIsSaving]   = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media modal
  const [showMediaModal,   setShowMediaModal]   = useState(false);
  const [mediaModalTarget, setMediaModalTarget] = useState<'add' | number>('add');

  // ── Tag handlers ──
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const raw = tagInput.trim().replace(/^#/, '');
      if (raw && !tags.includes(`#${raw}`)) setTags((prev) => [...prev, `#${raw}`]);
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) setTags((prev) => prev.slice(0, -1));
  };
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  // ── Photo handlers ──
  const addPhotoFromFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (photos.length >= MAX_PHOTOS) return;
    setPhotos((prev) => [...prev, { url: URL.createObjectURL(file), caption: '', watermark: false }]);
  };
  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) addPhotoFromFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length]);
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addPhotoFromFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const removePhoto     = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  const updateCaption   = (i: number, cap: string) =>
    setPhotos((prev) => prev.map((p, idx) => idx === i ? { ...p, caption: cap } : p));
  const toggleWatermark = (i: number) =>
    setPhotos((prev) => prev.map((p, idx) => idx === i ? { ...p, watermark: !p.watermark } : p));

  const handleMediaSelect = (item: MediaItem) => {
    if (mediaModalTarget === 'add') {
      if (photos.length < MAX_PHOTOS)
        setPhotos((prev) => [...prev, { url: item.file_url, caption: item.caption, watermark: false }]);
    } else if (typeof mediaModalTarget === 'number') {
      setPhotos((prev) =>
        prev.map((p, i) => i === mediaModalTarget ? { ...p, url: item.file_url, caption: item.caption } : p)
      );
    }
  };

  const handleSimpan = async () => {
    if (!title || !content || !kanal) {
      alert('Mohon lengkapi judul, isi berita, dan kanal.');
      return;
    }

    setIsSaving(true);
    try {
      const { data: catRes } = await getCategories();
      const cat = catRes.data.find((c) => c.name.toLowerCase() === kanal.toLowerCase());
      if (!cat) {
        alert('Kategori ' + kanal + ' tidak ditemukan di server.');
        setIsSaving(false);
        return;
      }

      let featured_image_url = photos[0]?.url;
      const isBlob = featured_image_url?.startsWith('blob:');

      const payload = {
        title,
        content,
        category_id: cat.id,
        featured_image_url: isBlob ? undefined : featured_image_url,
      };

      const res = await createArticle(payload);
      const newArticleId = res.data.data.id;

      if (isBlob && featured_image_url) {
        try {
          const blobResponse = await fetch(featured_image_url);
          const blob = await blobResponse.blob();
          const formData = new FormData();
          formData.append('image', blob, 'image.jpg');
          formData.append('article_id', newArticleId);
          formData.append('alt_text', photos[0]?.caption || title);
          
          const uploadRes = await uploadMedia(formData);
          const uploadedUrl = uploadRes.data.data.file_url;
          
          await updateArticle(newArticleId, { featured_image_url: uploadedUrl });
        } catch (uploadError) {
          console.error("Gagal upload gambar:", uploadError);
          // Tetap lanjut karena artikel sudah berhasil dibuat
        }
      }

      if (status !== 'draft') {
        await updateArticleStatus(newArticleId, { status: status as any });
      }

      alert('Berita berhasil disimpan!');
      router.push('/cms/artikel');
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Gagal menyimpan berita');
    } finally {
      setIsSaving(false);
    }
  };
  const handleBatal = () => router.push('/cms/artikel');

  const selectedStatus = allowedStatusOptions.find((s) => s.value === status) ?? allowedStatusOptions[0];
  const canAddPhoto    = photos.length < MAX_PHOTOS;

  return (
    <div className="min-h-full pb-16">
      {/* Page Header */}
      <div className="mb-6 pt-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1">
          {isRejected || isEdit ? 'Edit Berita' : 'Buat Berita Baru'}
        </h1>
        <p className="text-gray-400 font-medium text-sm">Isi informasi berita secara lengkap dan benar</p>
      </div>

      {/* ─── Rejection Banner ─── */}
      {isRejected && showRejectionBanner && (
        <div className="relative mb-8 max-w-4xl">
          <div
            className="flex items-start gap-4 p-4 rounded-2xl border-2"
            style={{ background: 'linear-gradient(135deg,#fff5f5,#fff0f0)', borderColor: '#fca5a5' }}
          >
            <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
              <XCircle size={22} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-red-700 text-base mb-0.5">Berita Ditolak</p>
              <p className="text-red-500 text-sm mb-3">
                Berita ini telah ditolak oleh reviewer. Silahkan perbaiki sesuai catatan penolakan lalu kirim ulang.
              </p>
              <div className="bg-white/70 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-red-500 mb-1">Alasan Penolakan :</p>
                <p className="text-sm text-red-700 font-medium leading-relaxed">{rejectionReason}</p>
              </div>
            </div>
            <button
              onClick={() => setShowRejectionBanner(false)}
              className="shrink-0 w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
            >
              <X size={14} className="text-red-500" />
            </button>
          </div>
        </div>
      )}

      {/* Form Steps */}
      <div className="relative max-w-4xl">
        <div className="absolute left-6 top-12 bottom-12 border-l-2 border-dashed border-gray-200 z-0 hidden sm:block" />

        {/* ─── Step 1: Judul ─── */}
        <StepRow icon={<Type size={22} className="text-blue-500" />}>
          <h2 className="text-lg font-bold text-gray-700 mb-3">Judul Berita</h2>
          <div className="bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
            <input
              id="berita-judul"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              placeholder="Masukkan judul berita yang menarik......"
              className="w-full outline-none text-gray-700 placeholder-gray-300 bg-transparent font-medium text-base"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400 px-1">
            <span>Buat judul cerita yang singkat, padat dan informatif (maks, 100 karakter)</span>
            <span className="font-semibold shrink-0 ml-3">{title.length}/100</span>
          </div>
        </StepRow>

        {/* ─── Step 2: Isi Berita ─── */}
        <StepRow icon={<FileText size={22} className="text-blue-500" />}>
          <h2 className="text-lg font-bold text-gray-700 mb-3">Isi Berita</h2>
          <div className="shadow-sm border-2 border-gray-100 rounded-2xl overflow-hidden">
            <RichTextEditor value={content} onChange={setContent} placeholder="Tulis isi berita di sini..." minHeight={280} />
          </div>
        </StepRow>

        {/* ─── Step 3: Foto Utama ─── */}
        <StepRow icon={<ImageIcon size={22} className="text-blue-500" />}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-700">Foto Utama</h2>
            <span className="text-xs text-gray-400 font-medium">{photos.length}/{MAX_PHOTOS} foto</span>
          </div>

          {photos.length > 0 && (
            <div className="flex flex-col gap-5 mb-4">
              {photos.map((photo, index) => (
                <div key={index} className="bg-white border-2 border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                    <span className="text-sm font-semibold text-gray-600">Foto {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
                    >
                      <X size={13} /> Hapus
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm aspect-video bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                        {photo.watermark && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span
                              className="text-white/40 font-extrabold text-2xl rotate-[-30deg] select-none tracking-widest"
                              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                            >
                              KLOJEN.COM
                            </span>
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow">
                          #{index + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setMediaModalTarget(index); setShowMediaModal(true); }}
                        className="flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-blue-100 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-300 transition-all text-xs font-semibold text-blue-500"
                      >
                        <LayoutGrid size={13} /> Pilih dari Media Library
                      </button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <label
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
                          photo.watermark ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-blue-50/30'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                            photo.watermark ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                          }`}
                          onClick={() => toggleWatermark(index)}
                        >
                          {photo.watermark && (
                            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                              <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center gap-2" onClick={() => toggleWatermark(index)}>
                          <Droplets size={15} className={photo.watermark ? 'text-blue-500' : 'text-gray-400'} />
                          <span className={`text-sm font-semibold ${photo.watermark ? 'text-blue-600' : 'text-gray-600'}`}>
                            Beri watermark pada Foto {index + 1}
                          </span>
                        </div>
                      </label>
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-xs font-semibold text-gray-500 px-1">Caption Foto {index + 1}</label>
                        <textarea
                          value={photo.caption}
                          onChange={(e) => updateCaption(index, e.target.value.slice(0, 200))}
                          placeholder="Masukkan deskripsi foto.."
                          rows={4}
                          className="w-full flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium resize-none leading-relaxed"
                        />
                        <span className="text-right text-xs text-gray-300 pr-1">{photo.caption.length}/200 karakter</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {canAddPhoto && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                htmlFor="foto-utama-input"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleImageDrop}
                className={`flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                  isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  {photos.length === 0 ? <Upload size={22} className="text-blue-400" /> : <Plus size={22} className="text-blue-400" />}
                </div>
                <p className="text-sm font-semibold text-gray-600 text-center">
                  {photos.length === 0 ? 'Drag & drop gambar di sini' : 'Tambah foto lagi'}
                </p>
                <p className="text-xs text-gray-400 mt-1 text-center">atau klik untuk memilih file</p>
                <p className="text-xs text-gray-300 mt-2">Format: JPG, PNG, JPEG (Maks. 2MB)</p>
                <input
                  ref={fileInputRef}
                  id="foto-utama-input"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
              <button
                type="button"
                onClick={() => { setMediaModalTarget('add'); setShowMediaModal(true); }}
                className="flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/60 transition-all duration-200 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-blue-100 flex items-center justify-center mb-3 shadow-sm">
                  <LayoutGrid size={22} className="text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-blue-500">Pilih dari Media Library</p>
                <p className="text-xs text-blue-300 mt-1">Media tersimpan</p>
              </button>
            </div>
          )}
          {!canAddPhoto && (
            <p className="text-xs text-gray-400 mt-2 px-1">
              Maksimal {MAX_PHOTOS} foto telah diunggah. Hapus salah satu untuk menambah foto baru.
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2 px-1">
            Tambahkan keterangan/caption di bawah setiap foto (maks. 200 karakter)
          </p>
        </StepRow>

        {/* ─── Step 4: Tagar ─── */}
        <StepRow icon={<Hash size={22} className="text-blue-500" />}>
          <h2 className="text-lg font-bold text-gray-700 mb-3">Tagar</h2>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
          <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all min-h-[50px] flex items-center">
            <input
              id="berita-tagar"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Pisah tag dengan koma....."
              className="w-full outline-none text-gray-700 placeholder-gray-300 bg-transparent text-sm font-medium"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 px-1">Tekan Enter atau koma untuk menambah tagar</p>
        </StepRow>

        {/* ─── Step 5: Kanal — tombol inline ─── */}
        <StepRow icon={<Newspaper size={22} className="text-blue-500" />}>
          <h2 className="text-lg font-bold text-gray-700 mb-3">Kanal</h2>
          <div className="flex flex-wrap gap-3">
            {KANAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setKanal(opt.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 ${
                  kanal === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                    : 'border-gray-100 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/20'
                }`}
              >
                {kanal === opt.value
                  ? <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><Check size={10} className="text-white" /></span>
                  : <span className="text-gray-400">{opt.icon}</span>
                }
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 px-1">Pilih kanal yang sesuai dengan topik berita</p>
        </StepRow>


        {/* ─── Step 7: Status ─── */}
        <StepRow icon={<Send size={22} className="text-blue-500" />} isLast>
          <h2 className="text-lg font-bold text-gray-700 mb-4">Status</h2>
          <div className="max-w-xs">
            <button
              id="berita-status"
              type="button"
              onClick={() => setStatusOpen((v) => !v)}
              className="w-full flex items-center gap-3 bg-white border-2 border-gray-100 rounded-2xl px-4 py-3.5 shadow-sm font-semibold text-gray-700 text-sm hover:border-blue-300 transition-all"
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedStatus.dot}`} />
              <span className="flex-1 text-left">{selectedStatus.label}</span>
              <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${statusOpen ? 'rotate-180' : ''}`} />
            </button>
            {statusOpen && (
              <div className="mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                {allowedStatusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setStatus(opt.value); setStatusOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-blue-50 transition-colors text-left ${
                      status === opt.value ? 'text-blue-600 bg-blue-50/60' : 'text-gray-700'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </StepRow>
      </div>

      {/* ─── Action Buttons ─── */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 mt-10 pt-8 border-t border-gray-100 max-w-4xl">
        <button
          id="berita-batal"
          type="button"
          onClick={handleBatal}
          disabled={isSaving}
          className="px-8 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-sm w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-60"
        >
          Batal
        </button>
        <button
          id="berita-simpan"
          type="button"
          onClick={handleSimpan}
          disabled={isSaving}
          className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-md flex items-center justify-center gap-2.5 w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          <Send size={17} />
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      {/* Media Library Modal */}
      {showMediaModal && (
        <MediaLibraryModal
          onClose={() => setShowMediaModal(false)}
          onSelect={handleMediaSelect}
        />
      )}
    </div>
  );
}

/* ─── Helper Component ─── */
function StepRow({
  icon,
  children,
  isLast = false,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className={`relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-8 ${isLast ? 'mb-0' : 'mb-10'}`}>
      <div className="shrink-0 hidden sm:block">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
          {icon}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

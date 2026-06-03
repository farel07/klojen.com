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
  AlertCircle,
} from 'lucide-react';
import RichTextEditor from '@/app/components/cms/RichTextEditor';
import { useAuthStore } from '@/stores/authStore';
import { canPublish } from '@/app/constants/roles';
import { Role } from '@/app/types';

const STATUS_OPTIONS = [
  { value: 'published', label: 'Submit', dot: 'bg-green-500' },
  { value: 'draft', label: 'Draft', dot: 'bg-gray-400' },
];

const MAX_PHOTOS = 3;

interface PhotoItem {
  url: string;
  caption: string;
  watermark: boolean;
}

export default function TulisBeritaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const role = user?.role as Role | undefined;
  const isEditorOrAbove = role ? canPublish(role) : false;

  // Deteksi apakah ini edit artikel (bisa ditolak atau draf)
  const articleId = searchParams.get('id');
  const isRejected = searchParams.get('rejected') === 'true';
  const isEdit = !!articleId; // True jika ada ID di URL

  const rejectionReason = searchParams.get('reason') ?? 'Tidak ada catatan dari reviewer.';
  const [showRejectionBanner, setShowRejectionBanner] = useState(true);

  // Ambil data artikel dari URL params untuk pre-fill form (baik draf maupun rejected)
  const prefillTitle      = isEdit ? (searchParams.get('title') ?? '')   : '';
  const prefillContentRaw = isEdit ? (searchParams.get('content') ?? '') : '';
  const prefillImage      = isEdit ? (searchParams.get('image') ?? '')   : '';
  const prefillCaption    = isEdit ? (searchParams.get('caption') ?? '') : '';
  const prefillTagsRaw    = isEdit ? (searchParams.get('tags') ?? '[]')  : '[]';

  // Konversi plain text (paragraf dipisah \n\n) ke HTML <p> agar tampil di editor
  const prefillContent = prefillContentRaw
    ? prefillContentRaw
        .split(/\n\n+/)
        .map((p) => `<p>${p.trim()}</p>`)
        .join('')
    : '';

  const prefillTags: string[] = (() => {
    try { return JSON.parse(prefillTagsRaw); } catch { return []; }
  })();

  const [title, setTitle] = useState(prefillTitle);
  const [content, setContent] = useState(prefillContent);
  const [photos, setPhotos] = useState<PhotoItem[]>(
    prefillImage ? [{ url: prefillImage, caption: prefillCaption, watermark: false }] : []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>(prefillTags.length > 0 ? prefillTags : ['#KetikPedia']);
  const [tagInput, setTagInput] = useState('');
  
  const prefillStatus = searchParams.get('status') ?? 'published';
  const [status, setStatus] = useState(prefillStatus);
  
  const [isSaving, setIsSaving] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Tag handlers ── */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const raw = tagInput.trim().replace(/^#/, '');
      if (raw && !tags.includes(`#${raw}`)) {
        setTags((prev) => [...prev, `#${raw}`]);
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  /* ── Photo handlers ── */
  const addPhotoFromFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (photos.length >= MAX_PHOTOS) return;
    setPhotos((prev) => [...prev, { url: URL.createObjectURL(file), caption: '', watermark: false }]);
  };

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDraggingIndex(null);
    const file = e.dataTransfer.files[0];
    if (file) addPhotoFromFile(file);
  }, [photos.length]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addPhotoFromFile(file);
    // reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCaption = (index: number, caption: string) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, caption } : p)));
  };

  const toggleWatermark = (index: number) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, watermark: !p.watermark } : p)));
  };

  /* ── Submit / Batal ── */
  const handleSimpan = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSaving(false);
    router.push('/cms/artikel');
  };

  const handleBatal = () => {
    router.push('/cms/artikel');
  };

  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
  const canAddPhoto = photos.length < MAX_PHOTOS;

  return (
    <div className="min-h-full pb-16">
      {/* Page Header */}
      <div className="mb-10 pt-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          {isRejected ? 'Edit Berita' : 'Buat Berita Baru'}
        </h1>
        <p className="text-gray-400 font-medium text-sm">Isi informasi berita secara lengkap dan benar</p>
      </div>

      {/* ─── Rejection Banner ─── */}
      {isRejected && showRejectionBanner && (
        <div className="relative mb-8 max-w-4xl">
          <div
            className="flex items-start gap-4 p-4 rounded-2xl border-2"
            style={{
              background: 'linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%)',
              borderColor: '#fca5a5',
            }}
          >
            {/* Icon */}
            <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
              <XCircle size={22} className="text-red-500" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-red-700 text-base mb-0.5">Berita Ditolak</p>
              <p className="text-red-500 text-sm mb-3">
                Berita ini telah di tolak oleh reviewer. Silahkan perbaiki sesuai catatan penolakan dibawah ini lalu kirim ulang.
              </p>
              <div className="bg-white/70 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-red-500 mb-1">Alasan Penolakan :</p>
                <p className="text-sm text-red-700 font-medium leading-relaxed">{rejectionReason}</p>
              </div>
            </div>

            {/* Close */}
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
        {/* Vertical dashed connector line */}
        <div className="absolute left-6 top-12 bottom-12 border-l-2 border-dashed border-gray-200 z-0 hidden sm:block" />

        {/* ─── Step 1: Judul Berita ─── */}
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
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Tulis isi berita di sini..."
              minHeight={280}
            />
          </div>
        </StepRow>

        {/* ─── Step 3: Foto Utama (max 3 foto + caption) ─── */}
        <StepRow icon={<ImageIcon size={22} className="text-blue-500" />}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-700">Foto Utama</h2>
            <span className="text-xs text-gray-400 font-medium">
              {photos.length}/{MAX_PHOTOS} foto
            </span>
          </div>

          {/* Uploaded photos grid */}
          {photos.length > 0 && (
            <div className="flex flex-col gap-5 mb-4">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* ── Header bar ── */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                    <span className="text-sm font-semibold text-gray-600">
                      Foto {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
                    >
                      <X size={13} />
                      Hapus
                    </button>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Left: photo preview */}
                    <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm group aspect-video bg-gray-50">
                      <img
                        src={photo.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Watermark overlay preview */}
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
                      {/* Photo number badge */}
                      <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Right: caption + watermark */}
                    <div className="flex flex-col gap-3">
                      {/* Watermark checkbox */}
                      <label
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
                          photo.watermark
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-blue-50/30'
                        }`}
                      >
                        {/* Custom checkbox */}
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                            photo.watermark
                              ? 'bg-blue-500 border-blue-500'
                              : 'bg-white border-gray-300'
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
                          <span className={`text-sm font-semibold ${
                            photo.watermark ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            Beri watermark pada Foto {index + 1}
                          </span>
                        </div>
                      </label>

                      {/* Caption textarea */}
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-xs font-semibold text-gray-500 px-1">
                          Caption Foto {index + 1}
                        </label>
                        <textarea
                          value={photo.caption}
                          onChange={(e) => updateCaption(index, e.target.value.slice(0, 200))}
                          placeholder="Masukkan deskripsi berita.."
                          rows={4}
                          className="w-full flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium resize-none leading-relaxed"
                        />
                        <span className="text-right text-xs text-gray-300 pr-1">
                          {photo.caption.length}/200 karakter
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone — only show if less than 3 photos */}
          {canAddPhoto && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Drag & Drop Zone */}
              <label
                htmlFor="foto-utama-input"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleImageDrop}
                className={`
                  flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed
                  cursor-pointer transition-all duration-200
                  ${isDragging
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                  }
                `}
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  {photos.length === 0
                    ? <Upload size={22} className="text-blue-400" />
                    : <Plus size={22} className="text-blue-400" />
                  }
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

              {/* Pilih dari media */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/60 transition-all duration-200 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-blue-100 flex items-center justify-center mb-3 shadow-sm">
                  <ImageIcon size={22} className="text-blue-300" />
                </div>
                <p className="text-sm font-semibold text-blue-400">Belum ada gambar dipilih</p>
                <p className="text-xs text-blue-300 mt-1">Pilih dari media tersimpan</p>
              </button>
            </div>
          )}

          {/* All slots filled message */}
          {!canAddPhoto && (
            <p className="text-xs text-gray-400 mt-2 px-1">
              Maksimal {MAX_PHOTOS} foto telah diunggah. Hapus salah satu untuk menambah foto baru.
            </p>
          )}

          <p className="text-xs text-gray-400 mt-2 px-1">
            Tambahkan keterangan/caption di bawah setiap foto (maks. 120 karakter)
          </p>
        </StepRow>

        {/* ─── Step 4: Tagar ─── */}
        <StepRow icon={<Hash size={22} className="text-blue-500" />}>
          <h2 className="text-lg font-bold text-gray-700 mb-3">Tagar</h2>

          {/* Tags display ABOVE input */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input field */}
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

        {/* ─── Step 5: Status ─── */}
        <StepRow icon={<Send size={22} className="text-blue-500" />} isLast>
          <h2 className="text-lg font-bold text-gray-700 mb-4">Status</h2>
          <div className="max-w-xs">
            <div className="relative">
              <button
                id="berita-status"
                type="button"
                onClick={() => setStatusOpen((v) => !v)}
                className="w-full flex items-center gap-3 bg-white border-2 border-gray-100 rounded-2xl px-4 py-3.5 shadow-sm font-semibold text-gray-700 text-sm hover:border-blue-300 transition-all"
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedStatus.dot}`} />
                <span className="flex-1 text-left">{selectedStatus.label}</span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${statusOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {statusOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setStatus(opt.value); setStatusOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-blue-50 transition-colors text-left ${status === opt.value ? 'text-blue-600 bg-blue-50/60' : 'text-gray-700'}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </StepRow>
      </div>

      {/* ─── Action Buttons ─── */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 mt-10 pt-8 border-t border-gray-100 max-w-4xl">
        {/* Batal */}
        <button
          id="berita-batal"
          type="button"
          onClick={handleBatal}
          disabled={isSaving}
          className="px-8 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-60"
        >
          Batal
        </button>

        {/* Simpan */}
        <button
          id="berita-simpan"
          type="button"
          onClick={handleSimpan}
          disabled={isSaving}
          className="
            px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl
            hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-md
            flex items-center justify-center gap-2.5 w-full sm:w-auto
            disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0
          "
        >
          <Send size={17} />
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
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
      {/* Step icon */}
      <div className="shrink-0 hidden sm:block">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}

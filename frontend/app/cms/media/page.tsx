'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Copy, Trash2, Search, ImageIcon, CheckCircle } from 'lucide-react';

// ─── Mock Media Data ──────────────────────────────────────────────────────────

const PASTEL_COLORS = [
  'bg-blue-100', 'bg-green-100', 'bg-purple-100',
  'bg-yellow-100', 'bg-pink-100', 'bg-orange-100',
];

const MOCK_MEDIA = Array.from({ length: 12 }, (_, i) => ({
  id: `media-${i + 1}`,
  file_url: `https://picsum.photos/seed/${i + 10}/400/300`,
  alt_text: `Gambar ${i + 1}`,
  created_at: `${29 - i} Mei 2025`,
  size: `${Math.floor(Math.random() * 1800 + 100)} KB`,
}));

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MediaPage() {
  const [search, setSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mediaList, setMediaList] = useState(MOCK_MEDIA);
  const [error, setError] = useState<string | null>(null);

  const MAX_SIZE_KB = 2048;
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

  const validateAndUpload = useCallback((file: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Format file tidak didukung. Gunakan PNG, JPG, atau JPEG.');
      return;
    }
    if (file.size / 1024 > MAX_SIZE_KB) {
      setError('Ukuran file maksimal 2 MB.');
      return;
    }

    // Simulate upload
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          // Add to list
          const newMedia = {
            id: `media-${Date.now()}`,
            file_url: URL.createObjectURL(file),
            alt_text: file.name,
            created_at: 'Baru saja',
            size: `${Math.round(file.size / 1024)} KB`,
          };
          setMediaList((prev) => [newMedia, ...prev]);
          setUploading(false);
          return 0;
        }
        return p + 20;
      });
    }, 150);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndUpload(file);
  }, [validateAndUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    if (selected === id) setSelected(null);
  };

  const filtered = mediaList.filter((m) =>
    m.alt_text.toLowerCase().includes(search.toLowerCase())
  );

  const selectedMedia = mediaList.find((m) => m.id === selected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Media</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {mediaList.length} file tersimpan di galeri Anda.
          </p>
        </div>

        {/* Upload Button */}
        <label
          htmlFor="media-upload-input"
          className="
            inline-flex items-center gap-2 px-5 py-2.5 cursor-pointer
            bg-gradient-to-r from-blue-500 to-blue-700
            text-white text-sm font-semibold rounded-xl shadow-md
            hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
          "
        >
          <Upload size={16} />
          Upload Gambar
          <input
            id="media-upload-input"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200
          ${isDragging
            ? 'border-blue-400 bg-blue-50 scale-[1.01]'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50/50'
          }
        `}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Mengupload... {uploadProgress}%</p>
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <ImageIcon size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 font-medium">
              Drag & drop gambar di sini, atau{' '}
              <label htmlFor="media-upload-input" className="text-blue-600 cursor-pointer hover:underline">
                klik untuk memilih
              </label>
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG — maksimal 2 MB</p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center justify-between">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button onClick={() => setError(null)}>
            <X size={16} className="text-red-400 hover:text-red-600" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gallery Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="media-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama file..."
              className="
                w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200
                focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none
                text-sm text-gray-700 placeholder-gray-400 bg-white
                transition-all duration-200
              "
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map((media) => (
              <button
                key={media.id}
                onClick={() => setSelected(media.id === selected ? null : media.id)}
                className={`
                  group relative rounded-2xl overflow-hidden aspect-video
                  border-2 transition-all duration-200
                  ${selected === media.id
                    ? 'border-blue-500 shadow-lg scale-[1.02]'
                    : 'border-transparent hover:border-blue-200 hover:shadow-md'
                  }
                `}
              >
                <img
                  src={media.file_url}
                  alt={media.alt_text}
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                {selected === media.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium truncate">{media.alt_text}</p>
                  <p className="text-white/70 text-xs">{media.size}</p>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <ImageIcon size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-medium">Tidak ada media ditemukan</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div>
          {selectedMedia ? (
            <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden sticky top-4">
              <img
                src={selectedMedia.file_url}
                alt={selectedMedia.alt_text}
                className="w-full aspect-video object-cover"
              />
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Nama File</p>
                  <p className="text-sm font-semibold text-gray-800 break-all">{selectedMedia.alt_text}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Ukuran</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedMedia.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Diupload</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedMedia.created_at}</p>
                  </div>
                </div>

                {/* URL */}
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">URL</p>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                    <p className="text-xs text-gray-600 flex-1 truncate font-mono">
                      {selectedMedia.file_url}
                    </p>
                    <button
                      onClick={() => handleCopyUrl(selectedMedia.file_url)}
                      className="text-gray-400 hover:text-blue-600 transition-colors shrink-0"
                      title="Salin URL"
                    >
                      {copied ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => {
                    if (confirm('Yakin hapus media ini?')) handleDelete(selectedMedia.id);
                  }}
                  id={`btn-delete-media-${selectedMedia.id}`}
                  className="
                    w-full flex items-center justify-center gap-2 px-4 py-2.5
                    border border-red-200 text-red-500 text-sm font-semibold rounded-xl
                    hover:bg-red-50 transition-colors duration-200
                  "
                >
                  <Trash2 size={15} />
                  Hapus Media
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-8 text-center sticky top-4">
              <ImageIcon size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">
                Pilih gambar untuk melihat detail
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

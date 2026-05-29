'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Send, Eye, Clock, ImageIcon, Tag, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { canPublish } from '@/app/constants/roles';
import { Role } from '@/app/types';
import RichTextEditor from '@/app/components/cms/RichTextEditor';

const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Wisata' },
  { id: 'cat-2', name: 'Kuliner' },
  { id: 'cat-3', name: 'Pendidikan' },
  { id: 'cat-4', name: 'Hotel' },
];

// Mock data artikel yang sedang diedit
const MOCK_ARTICLE = {
  id: '1',
  title: 'Festival Kuliner Malang 2025 Resmi Dibuka di Alun-Alun Kota',
  content: '<p>Festival Kuliner Malang 2025 resmi dibuka pada Selasa malam di Alun-Alun Kota Malang. Acara yang dihadiri ribuan warga ini menghadirkan berbagai hidangan khas dari seluruh penjuru kota.</p><p>Wali Kota Malang secara simbolis memukul gong sebagai tanda pembukaan festival yang berlangsung selama tiga hari tersebut.</p>',
  category_id: 'cat-2',
  tags: ['Kuliner', 'Festival', 'Malang'],
  featured_image_url: null as string | null,
  status: 'review' as const,
};

export default function EditArtikelPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const role = user?.role as Role | undefined;
  const isEditorOrAbove = role ? canPublish(role) : false;

  const [title, setTitle] = useState(MOCK_ARTICLE.title);
  const [content, setContent] = useState(MOCK_ARTICLE.content);
  const [categoryId, setCategoryId] = useState(MOCK_ARTICLE.category_id);
  const [selectedTags, setSelectedTags] = useState<string[]>(MOCK_ARTICLE.tags);
  const [tagInput, setTagInput] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string | null>(MOCK_ARTICLE.featured_image_url);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  const handleTagAdd = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    const now = new Date();
    setLastSaved(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    setIsSaving(false);
  };

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    router.push('/cms/artikel');
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    router.push('/cms/artikel');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 pt-2">
        <Link
          href="/cms/artikel"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white shadow-sm transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Edit Artikel</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {lastSaved ? (
              <span className="text-green-600 font-medium">✓ Tersimpan otomatis pukul {lastSaved}</span>
            ) : (
              `ID: ${params.id}`
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-save-edit"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="
              flex items-center gap-2 px-4 py-2.5
              bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl
              hover:bg-gray-200 transition-all disabled:opacity-60
            "
          >
            <Save size={15} />
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>

          {!isEditorOrAbove && (
            <button
              id="btn-submit-review-edit"
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className="
                flex items-center gap-2 px-4 py-2.5
                bg-gradient-to-r from-yellow-400 to-yellow-500
                text-white text-sm font-semibold rounded-xl shadow-md
                hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60
              "
            >
              <Send size={15} />
              {isSubmitting ? 'Mengirim...' : 'Ajukan Review'}
            </button>
          )}

          {isEditorOrAbove && (
            <button
              id="btn-publish-edit"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="
                flex items-center gap-2 px-4 py-2.5
                bg-gradient-to-r from-blue-500 to-blue-700
                text-white text-sm font-semibold rounded-xl shadow-md
                hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60
              "
            >
              <Eye size={15} />
              {isSubmitting ? 'Menerbitkan...' : 'Publish'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Judul Artikel <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-artikel-judul"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul artikel..."
              maxLength={255}
              className="
                w-full px-4 py-3 rounded-xl border border-gray-200
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none
                text-gray-800 text-base font-medium placeholder-gray-300
                transition-all duration-200
              "
            />
            {title && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400">Slug:</span>
                <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-mono">
                  {slug}
                </code>
              </div>
            )}
            <div className="mt-1 text-right text-xs text-gray-300">{title.length}/255</div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Konten Artikel <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Tulis isi artikel di sini..."
              minHeight={500}
            />
          </div>
        </div>

        {/* Right: Meta Sidebar */}
        <div className="space-y-5">
          {/* Featured Image */}
          <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <ImageIcon size={14} className="inline mr-1.5 text-gray-400" />
              Gambar Utama
            </label>
            {featuredImage ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={featuredImage} alt="Featured" className="w-full h-44 object-cover" />
                <button
                  onClick={() => setFeaturedImage(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="edit-featured-image"
                className="flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-gray-50 cursor-pointer transition-all"
              >
                <ImageIcon size={28} className="text-gray-300 mb-2" />
                <span className="text-sm text-gray-400 font-medium">Klik untuk upload</span>
                <span className="text-xs text-gray-300 mt-1">PNG, JPG, JPEG (maks 2 MB)</span>
                <input
                  id="edit-featured-image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFeaturedImage(URL.createObjectURL(f));
                  }}
                />
              </label>
            )}
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              id="edit-artikel-kategori"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-700 bg-white transition-all"
            >
              <option value="">-- Pilih Kategori --</option>
              {MOCK_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Tag size={14} className="inline mr-1.5 text-gray-400" />
              Tag
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  {tag}
                  <button onClick={() => handleTagRemove(tag)}><X size={10} /></button>
                </span>
              ))}
            </div>
            <input
              id="edit-tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  handleTagAdd(tagInput);
                }
              }}
              placeholder="Ketik tag, tekan Enter..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-700 placeholder-gray-300 transition-all"
            />
          </div>

          {/* Schedule (editor+) */}
          {isEditorOrAbove && (
            <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Clock size={14} className="inline mr-1.5 text-gray-400" />
                Jadwalkan Tayang
              </label>
              <input
                id="edit-schedule"
                type="datetime-local"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-700 bg-white transition-all"
              />
              <p className="text-xs text-gray-400 mt-2">Minimal 5 menit dari sekarang (WIB)</p>
              <button
                id="btn-schedule-edit"
                type="button"
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-300 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors"
              >
                <Clock size={14} />
                Jadwalkan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

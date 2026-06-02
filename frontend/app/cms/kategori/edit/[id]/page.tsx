'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { ArrowLeft, Save, Upload, CheckCircle2 } from 'lucide-react';

function EditFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params.id as string;
  const typeParam = searchParams.get('type') || 'kategori';
  const type = typeParam === 'tag' ? 'Tag' : 'Kategori';

  const [formData, setFormData] = useState({
    nama: '',
    slug: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const initialCategories = [
    { id: 1, nama: 'Pendidikan', slug: 'pendidikan' },
    { id: 2, nama: 'Kuliner', slug: 'kuliner' },
    { id: 3, nama: 'Wisata', slug: 'wisata' },
    { id: 4, nama: 'Hotel', slug: 'hotel' },
  ];

  const initialTags = [
    { id: 1, nama: 'Berita Terkini', slug: 'berita-terkini' },
    { id: 2, nama: 'Teknologi', slug: 'teknologi' },
    { id: 3, nama: 'Kesehatan', slug: 'kesehatan' },
    { id: 4, nama: 'Olahraga', slug: 'olahraga' },
  ];

  useEffect(() => {
    // Mock fetch data based on id
    if (type === 'Kategori') {
      const cat = initialCategories.find(c => c.id === parseInt(id));
      if (cat) {
        setFormData({
          nama: cat.nama,
          slug: cat.slug,
        });
      } else {
        setFormData({
          nama: 'Kategori Dummy ' + id,
          slug: 'kategori-dummy-' + id,
        });
      }
    } else {
      const tag = initialTags.find(t => t.id === parseInt(id));
      if (tag) {
        setFormData({
          nama: tag.nama,
          slug: tag.slug,
        });
      } else {
        setFormData({
          nama: 'Tag Dummy ' + id,
          slug: 'tag-dummy-' + id,
        });
      }
    }
  }, [id, type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'nama') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData({ ...formData, nama: value, slug });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const storageKey = type === 'Kategori' ? 'dummyCategories' : 'dummyTags';
    const existing = localStorage.getItem(storageKey);
    if (existing) {
      let items = JSON.parse(existing);
      items = items.map((item: any) => {
        if (item.id === parseInt(id)) {
          return {
            ...item,
            nama: formData.nama,
            slug: formData.slug,
            gambar: imagePreview || item.gambar
          };
        }
        return item;
      });
      localStorage.setItem(storageKey, JSON.stringify(items));
    }

    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      router.push('/cms/kategori');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Kategori dan Tag</h1>
        <div className="text-sm font-medium text-gray-400 flex items-center">
          <Link href="/cms/kategori" className="hover:text-gray-600 transition-colors">
            Kategori dan Tag
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-600">Edit {type}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="nama" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nama {type}
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                required
                placeholder={`Masukkan nama ${type.toLowerCase()}`}
                value={formData.nama}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                placeholder="contoh-slug-kategori"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Slug akan dibuat otomatis berdasarkan nama.</p>
            </div>

            {type === 'Kategori' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Gambar Kategori
                </label>
                <label htmlFor="file-upload" className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 relative overflow-hidden group w-full min-h-[160px]">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview Gambar Kategori" className="h-40 w-auto object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-lg hover:bg-black/70 transition-colors">
                          Ganti Gambar
                        </span>
                      </div>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
                    </>
                  ) : (
                    <div className="space-y-1 text-center flex flex-col items-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="relative bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500">
                          Pilih File
                        </span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
                        <p className="pl-1">atau tarik & lepas kesini</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, GIF up to 2MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <Link 
              href="/cms/kategori"
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Batal
            </Link>
            <button 
              type="submit"
              className="px-6 py-2.5 flex items-center gap-2 bg-[#363259] hover:bg-[#2a2745] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Save size={18} />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-[#69c77e]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {type} Berhasil Diperbarui!
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                Perubahan telah disimpan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditKategoriTagPage() {
  return (
    <Suspense fallback={<div className="p-8">Memuat...</div>}>
      <EditFormContent />
    </Suspense>
  );
}

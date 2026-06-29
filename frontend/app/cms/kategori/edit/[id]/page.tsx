'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { getCmsCategories, updateCmsCategory } from '@/lib/api/taxonomy';

export default function EditKategoriPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    nama: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true);
      try {
        const res = await getCmsCategories();
        const cats = res.data.data;
        const category = cats.find((cat: any) => String(cat.id) === String(id));
        
        if (category) {
          setFormData({ nama: category.name });
        } else {
          const availableIds = cats.map(c => c.id).join(', ');
          setErrorMessage(`Kategori tidak ditemukan. ID yang dicari: ${id}. ID yang tersedia: ${availableIds}`);
        }
      } catch (error) {
        console.error('Failed to fetch category:', error);
        setErrorMessage('Gagal memuat data kategori.');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchCategory();
    } else {
      setErrorMessage('ID Kategori tidak valid.');
      setIsLoading(false);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      await updateCmsCategory(id, { name: formData.nama });
      setIsSuccessModalOpen(true);
      
      // Auto redirect after showing success modal
      setTimeout(() => {
        setIsSuccessModalOpen(false);
        router.push('/cms/kategori?tab=category');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to update category:', error);
      setErrorMessage(error.response?.data?.message || error.response?.data?.error || 'Gagal memperbarui kategori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 max-w-2xl p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Kategori</h1>
        <div className="text-sm font-medium text-gray-400">
          <Link href="/cms/kategori?tab=category" className="hover:text-gray-600 transition-colors">
            Kategori
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-600">Edit Kategori</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="mt-8">
        {isLoading ? (
          <div className="text-sm text-gray-500">Memuat data kategori...</div>
        ) : (
          <div className="space-y-6">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                {errorMessage}
              </div>
            )}
            
            {/* Hanya tampilkan form jika data berhasil dimuat */}
            {!errorMessage.includes('tidak ditemukan') && !errorMessage.includes('Gagal memuat') && (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Nama Kategori */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-900">Nama Kategori</label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Contoh: Pendidikan"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B2A4C]/20 focus:border-[#2B2A4C] transition-all shadow-sm"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 gap-3">
                  <Link
                    href="/cms/kategori?tab=category"
                    className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.nama.trim() || !!errorMessage}
                    className="bg-[#2B2A4C] hover:bg-[#1e1d35] disabled:bg-gray-400 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            )}

            {/* Tombol kembali (Batal) jika data tidak ditemukan */}
            {(errorMessage.includes('tidak ditemukan') || errorMessage.includes('Gagal memuat')) && (
               <div className="flex justify-start">
                  <Link
                    href="/cms/kategori?tab=category"
                    className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center"
                  >
                    Kembali
                  </Link>
               </div>
            )}
          </div>
        )}
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
                Kategori Telah Diperbarui!
              </h3>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

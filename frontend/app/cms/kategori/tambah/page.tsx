'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { createCmsCategory } from '@/lib/api/taxonomy';

export default function TambahKategoriPage() {
  const router = useRouter();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await createCmsCategory({ name: catName });
      setIsSuccessModalOpen(true);

      setTimeout(() => {
        setIsSuccessModalOpen(false);
        router.push('/cms/kategori');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to create category:', error);
      setErrorMessage(error?.response?.data?.message || 'Gagal menambahkan kategori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Kategori dan Tag</h1>
        <div className="text-sm font-medium text-gray-400">
          <Link href="/cms/kategori" className="hover:text-gray-600 transition-colors">
            Kategori
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-600">Tambah Kategori</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900">Nama Kategori</label>
            <input
              type="text"
              value={catName}
              onChange={(e) => {
                setCatName(e.target.value);
                setErrorMessage('');
              }}
              required
              placeholder="Contoh: Pendidikan"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-black"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end pt-4 gap-3">
            <Link
              href="/cms/kategori"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !catName.trim()}
              className="bg-[#363259] hover:bg-[#2a2745] disabled:bg-gray-400 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              {isSubmitting ? 'Menyimpan...' : 'Buat Kategori'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-[#69c77e]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Kategori Telah Dibuat!
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

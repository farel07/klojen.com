'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getCmsCategories,
  deleteCmsCategory,
  CategoryItem,
  getCmsTags,
  deleteCmsTag,
  TagItem,
} from '@/lib/api/taxonomy';
import { Plus, Edit3, Trash2, Hash, LayoutGrid, X } from 'lucide-react';

type Tab = 'category' | 'tag';

function KategoriContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'category';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Categories
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Tags
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Modals state for Delete Confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'category' | 'tag' | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await getCmsCategories();
      setCategories(res.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const res = await getCmsTags();
      setTags(res.data.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  // ─── Delete Actions ───────────────────────────────────────────────────

  const handleDeleteClick = (id: string, type: 'category' | 'tag') => {
    setDeleteTargetId(id);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId || !deleteType) return;
    
    try {
      if (deleteType === 'category') {
        await deleteCmsCategory(deleteTargetId);
        fetchCategories();
      } else {
        await deleteCmsTag(deleteTargetId);
        fetchTags();
      }
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      setDeleteType(null);
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || `Gagal menghapus ${deleteType}`);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);
    setDeleteType(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-y-auto bg-[#f8fafc]">
      <div className="p-6 lg:p-8 w-full space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: Title & Add Button */}
          <div className="flex flex-col gap-5">
            <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">
              {activeTab === 'category' ? 'Kategori' : 'Tag'}
            </h1>
            <div className="flex items-center gap-3">
              {activeTab === 'category' && (
                <Link
                  href="/cms/kategori/tambah"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2B2A4C] hover:bg-[#1e1d35] text-white rounded-xl text-[13px] font-bold shadow-md transition-all w-fit"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  Tambah Kategori
                </Link>
              )}
            </div>
          </div>

          {/* Right: Stat Cards (Act as Tabs) */}
          <div className="flex gap-4">
            {/* Category Card */}
            <div 
              onClick={() => setActiveTab('category')}
              className={`cursor-pointer flex flex-col justify-between w-[140px] h-[100px] rounded-2xl p-4 shadow-sm transition-all border ${
                activeTab === 'category' 
                  ? 'bg-[#2B2A4C] text-white border-transparent' 
                  : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[9px] font-extrabold tracking-wide uppercase leading-tight ${activeTab === 'category' ? 'text-[#a1a1c9]' : 'text-gray-500'}`}>TOTAL<br/>KATEGORI</span>
                <div className={`p-1.5 rounded-lg ${activeTab === 'category' ? 'bg-white/10' : 'bg-gray-100'}`}>
                  <LayoutGrid size={14} className={activeTab === 'category' ? 'text-white' : 'text-gray-500'} />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight">
                {categories.length}
              </div>
            </div>

            {/* Tag Card */}
            <div 
              onClick={() => setActiveTab('tag')}
              className={`cursor-pointer flex flex-col justify-between w-[140px] h-[100px] rounded-2xl p-4 shadow-sm transition-all border ${
                activeTab === 'tag' 
                  ? 'bg-[#2B2A4C] text-white border-transparent' 
                  : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[9px] font-extrabold tracking-wide uppercase leading-tight ${activeTab === 'tag' ? 'text-[#a1a1c9]' : 'text-gray-500'}`}>TOTAL<br/>TAG</span>
                <div className={`p-1.5 rounded-lg ${activeTab === 'tag' ? 'bg-white/10' : 'bg-blue-50'}`}>
                  <Hash size={14} className={activeTab === 'tag' ? 'text-white' : 'text-blue-500'} />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight">
                {tags.length}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {activeTab === 'category' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-sm text-[#152A4A] bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-bold w-16 text-center">NO.</th>
                    <th className="px-6 py-4 font-bold">Kategori</th>
                    <th className="px-6 py-4 font-bold text-center">Jumlah Artikel</th>
                    <th className="px-6 py-4 font-bold text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loadingCategories ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">Memuat kategori...</td></tr>
                  ) : categories.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">Belum ada kategori.</td></tr>
                  ) : (
                    categories.map((cat, idx) => (
                      <tr key={cat.id} className={`hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="px-6 py-4 text-center font-medium text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                        <td className="px-6 py-4 text-center font-medium text-gray-600">0</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <Link 
                              href={`/cms/kategori/edit/${cat.id}`}
                              className="text-green-500 hover:text-green-600 transition-colors bg-green-50 p-1.5 rounded-md border border-green-100 block" 
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </Link>
                            <button 
                              onClick={() => handleDeleteClick(cat.id, 'category')} 
                              className="text-red-500 hover:text-red-600 transition-colors bg-red-50 p-1.5 rounded-md border border-red-100" 
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-sm text-[#152A4A] bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-bold w-16 text-center">NO.</th>
                    <th className="px-6 py-4 font-bold">Tag</th>
                    <th className="px-6 py-4 font-bold text-center">Jumlah Artikel</th>
                    <th className="px-6 py-4 font-bold text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loadingTags ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">Memuat tag...</td></tr>
                  ) : tags.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">Belum ada tag.</td></tr>
                  ) : (
                    tags.map((tag, idx) => (
                      <tr key={tag.id} className={`hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="px-6 py-4 text-center font-medium text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-4 flex items-center gap-1.5 font-medium text-gray-900">
                          <Hash size={14} className="text-blue-500 shrink-0" />
                          {tag.name}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-600">0</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            {/* Hanya ada tombol Hapus untuk Tag */}
                            <button 
                              onClick={() => handleDeleteClick(tag.id, 'tag')} 
                              className="text-red-500 hover:text-red-600 transition-colors bg-red-50 p-1.5 rounded-md border border-red-100" 
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center relative">
              <button
                onClick={cancelDelete}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold text-gray-900 mt-4 mb-8 leading-tight">
                Apakah Anda Yakin<br />Ingin Menghapus Data Ini?
              </h3>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={confirmDelete}
                  className="px-8 py-2 bg-[#69c77e] hover:bg-[#5db471] text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
                >
                  Ya
                </button>
                <button
                  onClick={cancelDelete}
                  className="px-8 py-2 bg-[#ef6e6e] hover:bg-[#d96464] text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
                >
                  Tidak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KategoriPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat halaman...</div>}>
      <KategoriContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getCmsCategories,
  deleteCmsCategory,
  CategoryItem,
  getCmsTags,
  deleteCmsTag,
  TagItem,
} from '@/lib/api/taxonomy';
import { Plus, Edit, Trash2, Hash, LayoutGrid, X, CheckCircle2 } from 'lucide-react';

export default function KategoriPage() {
  // Tab State
  const [activeTab, setActiveTab] = useState<'category' | 'tag'>('category');

  // Categories
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Tags
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Delete Confirmation Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const handleDeleteClick = (id: string, type: 'category' | 'tag') => {
    setSelectedId(id);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedId !== null && deleteType !== null) {
      try {
        if (deleteType === 'category') {
          await deleteCmsCategory(selectedId);
          await fetchCategories();
        } else {
          await deleteCmsTag(selectedId);
          await fetchTags();
        }
        setIsDeleteModalOpen(false);
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          setIsSuccessModalOpen(false);
          setSelectedId(null);
          setDeleteType(null);
        }, 2000);
      } catch (error) {
        console.error('Failed to delete:', error);
        setIsDeleteModalOpen(false);
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedId(null);
    setDeleteType(null);
  };

  return (
    <div className="space-y-6 pb-10">

      {/* Header: Left = Title + Add Button | Right = Stat Cards */}
      <div className="flex items-start justify-between gap-6">
        
        {/* Left: Title + Add Button */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            {activeTab === 'category' ? 'Kategori' : 'Tag'}
          </h1>
          {activeTab === 'category' && (
            <Link
              href="/cms/kategori/tambah"
              className="inline-flex items-center gap-2 bg-[#363259] hover:bg-[#2a2745] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm w-fit"
            >
              <Plus size={16} />
              Tambah Kategori
            </Link>
          )}
        </div>

        {/* Right: Stat Cards (also act as tab switchers) */}
        <div className="flex gap-3 flex-shrink-0">
          {/* Kategori Card */}
          <button
            onClick={() => setActiveTab('category')}
            className={`rounded-2xl p-5 w-[160px] flex flex-col justify-between text-left transition-all duration-200 border shadow-sm ${
              activeTab === 'category'
                ? 'bg-[#363259] border-[#363259] shadow-md'
                : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[11px] font-bold uppercase tracking-wide ${activeTab === 'category' ? 'text-indigo-200' : 'text-gray-500'}`}>
                Total Kategori
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'category' ? 'bg-white/20 text-white' : 'bg-[#eef2ff] text-[#6366f1]'}`}>
                <LayoutGrid size={16} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${activeTab === 'category' ? 'text-white' : 'text-gray-900'}`}>
              {categories.length}
            </div>
          </button>

          {/* Tag Card */}
          <button
            onClick={() => setActiveTab('tag')}
            className={`rounded-2xl p-5 w-[160px] flex flex-col justify-between text-left transition-all duration-200 border shadow-sm ${
              activeTab === 'tag'
                ? 'bg-[#363259] border-[#363259] shadow-md'
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[11px] font-bold uppercase tracking-wide ${activeTab === 'tag' ? 'text-blue-200' : 'text-gray-500'}`}>
                Total Tag
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'tag' ? 'bg-white/20 text-white' : 'bg-[#eff6ff] text-[#3b82f6]'}`}>
                <Hash size={16} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${activeTab === 'tag' ? 'text-white' : 'text-gray-900'}`}>
              {tags.length}
            </div>
          </button>
        </div>
      </div>


      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Kategori Table */}
        {activeTab === 'category' && (
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
              <tbody className="divide-y divide-gray-100">
                {loadingCategories ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">Memuat kategori...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">Belum ada kategori.</td></tr>
                ) : (
                  categories.map((cat, idx) => (
                    <tr key={cat.id} className={`hover:bg-gray-50/60 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <td className="px-6 py-4 text-center font-medium text-gray-400">{idx + 1}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{cat.name}</td>
                      <td className="px-6 py-4 text-center font-medium text-gray-600">
                        {cat.children_count ?? '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <Link
                            href={`/cms/kategori/edit/${cat.id}`}
                            className="text-green-500 hover:text-green-600 transition-colors bg-green-50 p-1.5 rounded-md border border-green-100 flex items-center justify-center"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(cat.id, 'category')}
                            className="text-red-500 hover:text-red-600 transition-colors bg-red-50 p-1.5 rounded-md border border-red-100"
                            title="Hapus"
                          >
                            <Trash2 size={15} />
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

        {/* Tag Table */}
        {activeTab === 'tag' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-sm text-[#152A4A] bg-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold w-16 text-center">NO.</th>
                  <th className="px-6 py-4 font-bold">Nama Tag</th>
                  <th className="px-6 py-4 font-bold text-center">Slug</th>
                  <th className="px-6 py-4 font-bold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingTags ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">Memuat tag...</td></tr>
                ) : tags.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">Belum ada tag.</td></tr>
                ) : (
                  tags.map((tag, idx) => (
                    <tr key={tag.id} className={`hover:bg-gray-50/60 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <td className="px-6 py-4 text-center font-medium text-gray-400">{idx + 1}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-1.5">
                        <Hash size={13} className="text-blue-400" />
                        {tag.name}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-500">{tag.slug}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleDeleteClick(tag.id, 'tag')}
                            className="text-red-500 hover:text-red-600 transition-colors bg-red-50 p-1.5 rounded-md border border-red-100"
                            title="Hapus"
                          >
                            <Trash2 size={15} />
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center relative">
              <button
                onClick={cancelDelete}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold text-gray-900 mt-4 mb-8 leading-tight">
                Apakah Anda Yakin<br />Ingin Menghapus?
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

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-[#69c77e]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Data Telah Terhapus!
              </h3>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

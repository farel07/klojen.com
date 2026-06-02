'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, X, CheckCircle2, Tag as TagIcon, LayoutGrid } from 'lucide-react';

// Mock Data
const initialCategories = [
  { id: 1, nama: 'Pendidikan', gambar: '', jumlahArtikel: 120 },
  { id: 2, nama: 'Kuliner', gambar: '', jumlahArtikel: 120 },
  { id: 3, nama: 'Wisata', gambar: '', jumlahArtikel: 120 },
  { id: 4, nama: 'Hotel', gambar: '', jumlahArtikel: 120 },
];

const initialTags = [
  { id: 1, nama: 'Berita Terkini', jumlahArtikel: 45 },
  { id: 2, nama: 'Teknologi', jumlahArtikel: 30 },
  { id: 3, nama: 'Kesehatan', jumlahArtikel: 25 },
  { id: 4, nama: 'Olahraga', jumlahArtikel: 60 },
];

export default function KategoriTagPage() {
  const [activeTab, setActiveTab] = useState<'kategori' | 'tag'>('kategori');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    const existingCats = localStorage.getItem('dummyCategories');
    if (existingCats) {
      setCategories(JSON.parse(existingCats));
    } else {
      setCategories(initialCategories);
      localStorage.setItem('dummyCategories', JSON.stringify(initialCategories));
    }

    const existingTags = localStorage.getItem('dummyTags');
    if (existingTags) {
      setTags(JSON.parse(existingTags));
    } else {
      setTags(initialTags);
      localStorage.setItem('dummyTags', JSON.stringify(initialTags));
    }
  }, []);

  // Modal states for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<'kategori' | 'tag' | null>(null);

  const handleDeleteClick = (id: number, type: 'kategori' | 'tag') => {
    setSelectedId(id);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedId !== null && deleteType !== null) {
      if (deleteType === 'kategori') {
        const newCats = categories.filter((item) => item.id !== selectedId);
        setCategories(newCats);
        localStorage.setItem('dummyCategories', JSON.stringify(newCats));
      } else {
        const newTags = tags.filter((item) => item.id !== selectedId);
        setTags(newTags);
        localStorage.setItem('dummyTags', JSON.stringify(newTags));
      }
    }
    setIsDeleteModalOpen(false);
    setIsSuccessModalOpen(true);
    
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      setSelectedId(null);
      setDeleteType(null);
    }, 2000);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedId(null);
    setDeleteType(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {activeTab === 'kategori' ? 'Kategori' : 'Tag'}
          </h1>
          
          <div className="mt-4 flex items-center gap-4">
            <Link 
              href={`/cms/kategori/tambah?type=${activeTab}`}
              className="flex items-center gap-2 bg-[#363259] hover:bg-[#2a2745] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              Tambah {activeTab === 'kategori' ? 'Kategori' : 'Tag'}
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-4 w-full md:w-auto">
          <div 
            onClick={() => setActiveTab('kategori')}
            className={`flex flex-col justify-center items-start px-6 py-4 rounded-xl border cursor-pointer transition-all min-w-[150px] ${activeTab === 'kategori' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300'}`}
          >
            <div className="flex items-center justify-between w-full gap-4 mb-2">
              <span className="text-xs font-semibold text-gray-500">Total Kategori</span>
              <div className="bg-blue-100 p-1.5 rounded-md text-blue-500">
                <LayoutGrid size={16} />
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-900">{categories.length}</span>
          </div>

          <div 
            onClick={() => setActiveTab('tag')}
            className={`flex flex-col justify-center items-start px-6 py-4 rounded-xl border cursor-pointer transition-all min-w-[150px] ${activeTab === 'tag' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300'}`}
          >
            <div className="flex items-center justify-between w-full gap-4 mb-2">
              <span className="text-xs font-semibold text-gray-500">Total Tag</span>
              <div className="bg-blue-100 p-1.5 rounded-md text-blue-500">
                <TagIcon size={16} />
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-900">{tags.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">{activeTab === 'kategori' ? 'Kategori' : 'Tag'}</th>
                {activeTab === 'kategori' && <th className="px-6 py-4 font-bold text-center">Gambar</th>}
                <th className="px-6 py-4 font-bold text-center">Jumlah Artikel</th>
                <th className="px-6 py-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeTab === 'kategori' ? (
                categories.map((item, index) => (
                  <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.nama}</td>
                    <td className="px-6 py-4 text-center">
                      {item.gambar ? (
                        <img src={item.gambar} alt={item.nama} className="w-10 h-10 object-cover rounded-md mx-auto" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-md mx-auto"></div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">{item.jumlahArtikel}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Link 
                          href={`/cms/kategori/edit/${item.id}?type=kategori`}
                          className="text-green-500 hover:text-green-600 transition-colors" 
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(item.id, 'kategori')}
                          className="text-red-500 hover:text-red-600 transition-colors" 
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                tags.map((item, index) => (
                  <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-semibold">
                        #{item.nama}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium">{item.jumlahArtikel}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Link 
                          href={`/cms/kategori/edit/${item.id}?type=tag`}
                          className="text-green-500 hover:text-green-600 transition-colors" 
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(item.id, 'tag')}
                          className="text-red-500 hover:text-red-600 transition-colors" 
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {(activeTab === 'kategori' ? categories : tags).length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'kategori' ? 4 : 3} className="px-6 py-10 text-center text-gray-500 font-medium">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                Apakah Anda Yakin<br />Ingin Menghapus {deleteType === 'kategori' ? 'Kategori' : 'Tag'} ini?
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

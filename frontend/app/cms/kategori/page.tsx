'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, X, CheckCircle2, Tag as TagIcon, LayoutGrid, Search, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const [search, setSearch] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [gotoPage, setGotoPage] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk mengambil data (Siap disambungkan ke API backend)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // TODO: Ganti dengan fetch API yang sebenarnya (misal: await axios.get('/api/kategori'))
      
      // Simulasi delay jaringan (mock API)
      await new Promise(resolve => setTimeout(resolve, 500));

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
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  // Fungsi untuk menghapus data (Siap disambungkan ke API backend)
  const confirmDelete = async () => {
    if (selectedId !== null && deleteType !== null) {
      try {
        // TODO: Ganti dengan fetch API Delete yang sebenarnya 
        // misal: await axios.delete(`/api/${deleteType}/${selectedId}`);

        // Simulasi proses delete di server
        await new Promise(resolve => setTimeout(resolve, 400));

        // Update state lokal setelah server berhasil menghapus
        if (deleteType === 'kategori') {
          const newCats = categories.filter((item) => item.id !== selectedId);
          setCategories(newCats);
          localStorage.setItem('dummyCategories', JSON.stringify(newCats));
        } else {
          const newTags = tags.filter((item) => item.id !== selectedId);
          setTags(newTags);
          localStorage.setItem('dummyTags', JSON.stringify(newTags));
        }

        setIsDeleteModalOpen(false);
        setIsSuccessModalOpen(true);
        
        setTimeout(() => {
          setIsSuccessModalOpen(false);
          setSelectedId(null);
          setDeleteType(null);
        }, 2000);

      } catch (error) {
        console.error("Gagal menghapus data:", error);
        // Bisa tambahkan state/notifikasi error di sini
        setIsDeleteModalOpen(false);
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedId(null);
    setDeleteType(null);
  };

  // Filter Data
  const currentData = activeTab === 'kategori' ? categories : tags;
  const filteredData = currentData.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  const handlePageClick = (page: number) => setCurrentPage(page);

  const handleGotoPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(gotoPage, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
        setGotoPage('');
      }
    }
  };

  // Reset pagination on tab change
  useEffect(() => {
    setCurrentPage(1);
    setSearch('');
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Kelola {activeTab === 'kategori' ? 'Kategori' : 'Tag'}
        </h1>
      </div>

      {/* Toolbar (Cards & Search) */}
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Kategori Card */}
          <div 
            onClick={() => setActiveTab('kategori')}
            className={`flex flex-col justify-between p-6 rounded-2xl border cursor-pointer transition-all flex-1 min-w-[200px] h-[120px] ${activeTab === 'kategori' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] text-blue-600 flex items-center justify-center shrink-0">
                <LayoutGrid size={24} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-0.5">Total Kategori</div>
                <div className="text-2xl font-extrabold text-gray-900 leading-none tracking-tight">{categories.length}</div>
              </div>
            </div>
          </div>

          {/* Tag Card */}
          <div 
            onClick={() => setActiveTab('tag')}
            className={`flex flex-col justify-between p-6 rounded-2xl border cursor-pointer transition-all flex-1 min-w-[200px] h-[120px] ${activeTab === 'tag' ? 'bg-[#ecfdf5] border-emerald-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#ecfdf5] text-emerald-500 flex items-center justify-center shrink-0">
                <TagIcon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-0.5">Total Tag</div>
                <div className="text-2xl font-extrabold text-gray-900 leading-none tracking-tight">{tags.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`flex flex-col md:flex-row items-start md:items-end gap-4 w-full ${activeTab === 'kategori' ? 'justify-between' : 'justify-end'}`}>
          {activeTab === 'kategori' && (
            <Link 
              href="/cms/kategori/tambah?type=kategori"
              className="inline-flex items-center justify-center gap-2 bg-[#363259] hover:bg-[#2a2745] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm w-fit"
            >
              <Plus size={18} />
              Tambah Kategori
            </Link>
          )}

          {/* Search Box */}
          <div className="relative w-full md:w-[400px]">
            <input
              type="text"
              placeholder={`Cari ${activeTab === 'kategori' ? 'Kategori' : 'Tag'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-sm text-[#152A4A] bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold w-16 text-center">NO.</th>
                <th className="px-6 py-4 font-bold">{activeTab === 'kategori' ? 'Nama Kategori' : 'Nama Tag'}</th>
                {activeTab === 'kategori' && <th className="px-6 py-4 font-bold text-center">Gambar</th>}
                <th className="px-6 py-4 font-bold text-center">Jumlah Artikel</th>
                <th className="px-6 py-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!isLoading && paginatedData.map((item, index) => (
                <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-6 py-4 text-center font-medium text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {activeTab === 'tag' ? (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-semibold">
                        #{item.nama}
                      </span>
                    ) : (
                      item.nama
                    )}
                  </td>
                  {activeTab === 'kategori' && (
                    <td className="px-6 py-4 text-center">
                      {item.gambar ? (
                        <img src={item.gambar} alt={item.nama} className="w-10 h-10 object-cover rounded-md mx-auto" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-md mx-auto"></div>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-center font-medium text-gray-900">{item.jumlahArtikel}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      {activeTab === 'kategori' && (
                        <Link 
                          href={`/cms/kategori/edit/${item.id}?type=kategori`}
                          className="text-green-500 hover:text-green-600 transition-colors bg-green-50 p-1.5 rounded-md border border-green-100 block" 
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                      )}
                      <button 
                        onClick={() => handleDeleteClick(item.id, activeTab)}
                        className="text-red-500 hover:text-red-600 transition-colors bg-red-50 p-1.5 rounded-md border border-red-100 block" 
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {isLoading ? (
                <tr>
                  <td colSpan={activeTab === 'kategori' ? 5 : 4} className="px-6 py-10 text-center text-gray-500 font-medium">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'kategori' ? 5 : 4} className="px-6 py-10 text-center text-gray-500 font-medium">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2 py-1 cursor-pointer outline-none"
            >
              <option value={10}>10 baris</option>
              <option value={25}>25 baris</option>
              <option value={50}>50 baris</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={validCurrentPage === 1}
              className="p-1 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - validCurrentPage) <= 1)
                .map((page, idx, arr) => {
                  if (idx > 0 && page - arr[idx - 1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span className="px-1">...</span>
                        <button
                          onClick={() => handlePageClick(page)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${page === validCurrentPage ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'hover:bg-gray-100'}`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${page === validCurrentPage ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  );
                })
              }
            </div>
            <button
              onClick={handleNextPage}
              disabled={validCurrentPage === totalPages}
              className="p-1 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
            <div className="flex items-center gap-2 ml-4 text-xs font-medium text-gray-600">
              <span>Go to</span>
              <input
                type="text"
                value={gotoPage}
                onChange={(e) => setGotoPage(e.target.value)}
                onKeyDown={handleGotoPage}
                placeholder={validCurrentPage.toString()}
                className="w-10 text-center py-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
              <span>Page</span>
            </div>
          </div>
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

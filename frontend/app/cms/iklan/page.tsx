'use client';

import React, { useState } from 'react';
import { Calendar, Trash2, X, CheckCircle2, ChevronLeft, ChevronRight, Plus, Edit, Search } from 'lucide-react';
import Link from 'next/link';

// Mock Data Iklan
const initialData = [
  { id: 1, nama: 'Promo Kampus Malang 2026', posisi: 'Sidebar', status: 'Aktif', berakhir: '15-06-2026' },
  { id: 2, nama: 'Diskon Kuliner Klojen', posisi: 'Tengah Artikel', status: 'Nonaktif', berakhir: '05-06-2026' },
  { id: 3, nama: 'Festival Wisata Batu', posisi: 'Atas', status: 'Aktif', berakhir: '29-06-2026' },
  { id: 4, nama: 'Promo Tiket Jatim Park', posisi: 'Tengah Artikel', status: 'Aktif', berakhir: '12-07-2026' },
];

export default function KelolaIklanPage() {
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Date Filter states
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Table Filter states
  const [filterPosisi, setFilterPosisi] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isPosisiDropdownOpen, setIsPosisiDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [gotoPage, setGotoPage] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter Data
  const isDateInRange = (tanggal: string) => {
    if (!startDate && !endDate) return true;
    const [d, m, y] = tanggal.split('-');
    const itemDate = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
    
    const start = startDate ? new Date(startDate).getTime() : -Infinity;
    
    let end = Infinity;
    if (endDate) {
      const endD = new Date(endDate);
      endD.setHours(23, 59, 59, 999);
      end = endD.getTime();
    }
    
    return itemDate >= start && itemDate <= end;
  };

  const filteredData = data.filter((item) => {
    const passDate = isDateInRange(item.berakhir);
    const passPosisi = filterPosisi ? item.posisi === filterPosisi : true;
    const passStatus = filterStatus ? item.status === filterStatus : true;
    const passSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase());
    return passDate && passPosisi && passStatus && passSearch;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
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

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedId !== null) {
      setData(data.filter((item) => item.id !== selectedId));
    }
    setIsDeleteModalOpen(false);
    setIsSuccessModalOpen(true);
    
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      setSelectedId(null);
    }, 2000);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kelola Iklan</h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
        
        {/* Tambah Iklan Button */}
        <Link 
          href="/cms/iklan/tambah" 
          className="inline-flex items-center justify-center gap-2 bg-[#363259] hover:bg-[#2a2745] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm w-fit"
        >
          <Plus size={18} />
          Tambah Iklan
        </Link>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full md:w-[300px]">
            <input
              type="text"
              placeholder="Cari Iklan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Date Filter */}
          <div className="w-full md:w-auto flex flex-col gap-1 relative">
            <button 
              onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
              className="flex items-center justify-between w-full md:w-[220px] px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="truncate">
                  {startDate && endDate 
                    ? `${startDate} - ${endDate}` 
                    : startDate ? `Dari ${startDate}`
                    : endDate ? `Sampai ${endDate}`
                    : 'Filter Tanggal'}
                </span>
              </div>
              <span className="text-gray-500 text-[10px]">▼</span>
            </button>

          {isDatePopoverOpen && (
            <div className="absolute top-full right-0 mt-2 p-3 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-64 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mulai Tanggal</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsDatePopoverOpen(false)}
                  className="bg-blue-50 text-blue-600 font-semibold text-xs px-4 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-sm text-[#152A4A] bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold w-16 text-center">NO.</th>
                <th className="px-6 py-4 font-bold">Nama Iklan</th>
                <th className="px-6 py-4 font-bold relative">
                  <button 
                    onClick={() => { setIsPosisiDropdownOpen(!isPosisiDropdownOpen); setIsStatusDropdownOpen(false); }} 
                    className={`flex items-center gap-1 focus:outline-none ${filterPosisi ? 'text-blue-600' : ''}`}
                  >
                    Posisi <span className="text-[10px]">▼</span>
                  </button>
                  {isPosisiDropdownOpen && (
                    <div className="absolute top-full left-6 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-44 font-normal overflow-hidden">
                      <button onClick={() => { setFilterPosisi(''); setIsPosisiDropdownOpen(false); }} className={`block w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${filterPosisi === '' ? 'font-bold text-blue-600' : 'text-gray-700'}`}>Semua Posisi</button>
                      <button onClick={() => { setFilterPosisi('Atas'); setIsPosisiDropdownOpen(false); }} className={`block w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-t border-gray-100 ${filterPosisi === 'Atas' ? 'font-bold text-blue-600' : 'text-gray-700'}`}>Atas</button>
                      <button onClick={() => { setFilterPosisi('Tengah Artikel'); setIsPosisiDropdownOpen(false); }} className={`block w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-t border-gray-100 ${filterPosisi === 'Tengah Artikel' ? 'font-bold text-blue-600' : 'text-gray-700'}`}>Tengah Artikel</button>
                      <button onClick={() => { setFilterPosisi('Sidebar'); setIsPosisiDropdownOpen(false); }} className={`block w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-t border-gray-100 ${filterPosisi === 'Sidebar' ? 'font-bold text-blue-600' : 'text-gray-700'}`}>Sidebar</button>
                    </div>
                  )}
                </th>
                <th className="px-6 py-4 font-bold relative">
                  <button 
                    onClick={() => { setIsStatusDropdownOpen(!isStatusDropdownOpen); setIsPosisiDropdownOpen(false); }} 
                    className={`flex items-center gap-1 focus:outline-none ${filterStatus ? 'text-blue-600' : ''}`}
                  >
                    Status <span className="text-[10px]">▼</span>
                  </button>
                  {isStatusDropdownOpen && (
                    <div className="absolute top-full left-6 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-40 font-normal overflow-hidden">
                      <button onClick={() => { setFilterStatus(''); setIsStatusDropdownOpen(false); }} className={`block w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${filterStatus === '' ? 'font-bold text-blue-600' : 'text-gray-700'}`}>Semua Status</button>
                      <button onClick={() => { setFilterStatus('Aktif'); setIsStatusDropdownOpen(false); }} className={`block w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-t border-gray-100 ${filterStatus === 'Aktif' ? 'font-bold text-blue-600' : 'text-gray-700'}`}>Aktif</button>
                      <button onClick={() => { setFilterStatus('Nonaktif'); setIsStatusDropdownOpen(false); }} className={`block w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-t border-gray-100 ${filterStatus === 'Nonaktif' ? 'font-bold text-blue-600' : 'text-gray-700'}`}>Nonaktif</button>
                    </div>
                  )}
                </th>
                <th className="px-6 py-4 font-bold">Berakhir</th>
                <th className="px-6 py-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item, index) => {
                return (
                  <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4 text-center font-medium text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.nama}</td>
                    <td className="px-6 py-4 font-medium text-gray-600">{item.posisi}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">{item.berakhir}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/cms/iklan/${item.id}/edit`}
                          className="text-green-500 hover:text-green-600 transition-colors bg-green-50 p-1.5 rounded-md border border-green-100 block"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(item.id)}
                          className="text-red-500 hover:text-red-600 transition-colors bg-red-50 p-1.5 rounded-md border border-red-100 block" 
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 font-medium">
                    Tidak ada iklan ditemukan.
                  </td>
                </tr>
              )}
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
            <div className="flex items-center gap-1 text-sm font-medium text-gray-500">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - validCurrentPage) <= 1)
                .map((page, idx, arr) => {
                  if (idx > 0 && page - arr[idx - 1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span className="px-1 text-gray-400">...</span>
                        <button 
                          onClick={() => handlePageClick(page)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${page === validCurrentPage ? 'text-gray-900 bg-gray-100 font-bold' : 'hover:bg-gray-100'}`}
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
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${page === validCurrentPage ? 'text-gray-900 bg-gray-100 font-bold' : 'hover:bg-gray-100'}`}
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
              <div className="relative">
                <input 
                  type="text" 
                  value={gotoPage}
                  onChange={(e) => setGotoPage(e.target.value)}
                  onKeyDown={handleGotoPage}
                  placeholder={validCurrentPage.toString()} 
                  className="w-10 text-center py-1 bg-white border border-gray-400 rounded-full focus:outline-none focus:border-blue-500" 
                />
              </div>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-[#69c77e]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Iklan Telah Terhapus!
              </h3>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

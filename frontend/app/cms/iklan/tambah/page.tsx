'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Image as ImageIcon, ChevronDownCircle, CheckCircle2 } from 'lucide-react';

const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  name,
  placeholder = "Pilih..."
}: { 
  options: string[], 
  value: string, 
  onChange: (e: any) => void, 
  name: string,
  placeholder?: string
}) => {
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 flex justify-between items-center cursor-pointer transition-all shadow-sm ${
          isOpen ? 'bg-[#f4f4f4] rounded-t-xl border border-gray-200 border-b-transparent' : 'bg-[#f4f4f4] rounded-xl border border-gray-200'
        }`}
      >
        <span className={value ? "text-gray-900 font-bold text-sm" : "text-gray-400 font-bold text-sm"}>
          {value || placeholder}
        </span>
        <ChevronDownCircle size={18} strokeWidth={2} className="text-gray-700" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-x border-b border-gray-200 rounded-b-xl shadow-lg z-20">
          {options.map((option, idx) => (
            <div 
              key={option}
              onClick={() => {
                onChange({ target: { name, value: option } });
                setIsOpen(false);
              }}
              className="px-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className={`py-3 text-gray-900 font-bold text-sm ${idx !== options.length - 1 ? 'border-b border-gray-100' : ''}`}>
                {option}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function TambahIklanPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nama: '',
    pemilik: '',
    posisi: '',
    status: '',
    mulai: '',
    berakhir: '',
    url: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      router.push('/cms/iklan');
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-20 relative min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Kelola Iklan</h1>
        <div className="text-sm font-medium text-gray-400 flex items-center">
          <Link href="/cms/iklan" className="hover:text-gray-600 transition-colors">
            Kelola Iklan
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-600">Tambah Iklan</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Nama Iklan */}
          <div className="space-y-2">
            <label htmlFor="nama" className="block text-sm font-bold text-gray-900">
              Nama Iklan
            </label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              required
            />
          </div>

          {/* Pemilik Iklan */}
          <div className="space-y-2">
            <label htmlFor="pemilik" className="block text-sm font-bold text-gray-900">
              Pemilik Iklan
            </label>
            <input
              type="text"
              id="pemilik"
              name="pemilik"
              value={formData.pemilik}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              required
            />
          </div>

          {/* Posisi */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900">
              Posisi
            </label>
            <CustomSelect
              name="posisi"
              value={formData.posisi}
              onChange={handleInputChange}
              options={["Atas", "Tengah Artikel", "Sidebar"]}
              placeholder="Pilih..."
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900">
              Status
            </label>
            <CustomSelect
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={["Aktif", "Nonaktif"]}
              placeholder="Pilih..."
            />
          </div>

          {/* Tanggal Tayang */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900">
              Tanggal Tayang
            </label>
            <div className="grid grid-cols-2 gap-6">
              {/* Mulai */}
              <div className="space-y-2">
                <label htmlFor="mulai" className="block text-sm font-bold text-gray-900">
                  Mulai
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    id="mulai"
                    name="mulai"
                    value={formData.mulai}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>
              
              {/* Berakhir */}
              <div className="space-y-2">
                <label htmlFor="berakhir" className="block text-sm font-bold text-gray-900">
                  Berakhir
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    id="berakhir"
                    name="berakhir"
                    value={formData.berakhir}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <label htmlFor="url" className="block text-sm font-bold text-gray-900">
              URL
            </label>
            <input
              type="text"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              required
            />
          </div>

          {/* Gambar */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900">
              Gambar
            </label>
            <div className="space-y-3">
              <div className="w-[280px] h-[190px] bg-[#e5e5e5] rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={64} className="text-[#a3a3a3]" strokeWidth={1} />
                )}
              </div>
              <label htmlFor="gambar-upload" className="inline-block px-5 py-2 bg-[#e5e5e5] text-sm font-medium text-gray-800 rounded-md cursor-pointer hover:bg-gray-300 transition-colors">
                Pilih Gambar
                <input
                  id="gambar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 w-full">
            <button
              type="submit"
              className="bg-[#363259] hover:bg-[#2a2745] text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              Tambah Iklan
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
                Iklan Berhasil Ditambahkan!
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                Data akan segera muncul di daftar iklan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

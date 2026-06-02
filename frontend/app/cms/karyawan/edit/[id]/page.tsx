'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronDown } from 'lucide-react';

export default function EditKaryawanPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial state kosong, akan diisi dari "database" (mock)
  const [formData, setFormData] = useState({
    nama: '',
    role: '',
    email: '',
  });

  useEffect(() => {
    // Simulasi pengambilan data dari backend berdasarkan ID
    // Misalnya axios.get(`/api/users/${params.id}`)
    const timer = setTimeout(() => {
      setFormData({
        nama: 'Indah Rahma', // Data tiruan sesuai baris pertama tabel
        role: 'Pembaca',
        email: 'neunmarz09@gmail.com',
      });
      setIsLoading(false);
    }, 500); // loading effect 0.5s

    return () => clearTimeout(timer);
  }, [params.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API update call
    setIsSuccessModalOpen(true);
    
    // Auto redirect after showing success modal
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      router.push('/cms/karyawan');
    }, 2000); // 2 detik karena tidak ada instruksi email di edit
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Kelola Akun Karyawan</h1>
        <div className="text-sm font-medium text-gray-400">
          <Link href="/cms/karyawan" className="hover:text-gray-600 transition-colors">
            Kelola Akun Karyawan
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-600">Edit Akun</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
            
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900">Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            {/* Peran */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900">Peran</label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                >
                  <option value="" disabled>Pilih...</option>
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Jurnalis">Jurnalis</option>
                  <option value="Pembaca">Pembaca</option>
                  {/* Tambahan role karena data dummy ada yang "Pembaca" */}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900">E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-[#363259] hover:bg-[#2a2745] text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
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
              <h3 className="text-xl font-bold text-gray-900">
                Akun Telah Diperbarui!
              </h3>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

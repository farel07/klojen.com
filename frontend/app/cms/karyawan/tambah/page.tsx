'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import axiosInstance from '@/lib/axios';

export default function TambahKaryawanPage() {
  const router = useRouter();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    role: '',
    email: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      await axiosInstance.post('/users', {
        name: formData.nama,
        email: formData.email,
        role: formData.role.toLowerCase(),
        password: 'password', // Usually a default password is set or the user sets it
      });
      setIsSuccessModalOpen(true);
      
      // Auto redirect after showing success modal
      setTimeout(() => {
        setIsSuccessModalOpen(false);
        router.push('/cms/karyawan');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to create user:', error);
      setErrorMessage(error.response?.data?.message || error.response?.data?.error || 'Gagal membuat akun karyawan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setErrorMessage('');
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
          <span className="text-gray-600">Tambah Akun</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
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

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#363259] hover:bg-[#2a2745] disabled:bg-gray-400 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              {isSubmitting ? 'Menyimpan...' : 'Buat Akun'}
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
                Akun Telah Dibuat!
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                Informasi akun telah dikirim ke email <br />
                <span className="text-blue-600 font-bold">{formData.email}</span>
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

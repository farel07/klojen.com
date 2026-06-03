'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, EyeOff, Eye, AlertCircle } from 'lucide-react';
import axiosInstance from '@/lib/axios';

export default function UbahPasswordPage() {
  const router = useRouter();
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    old?: string;
    new?: string;
    confirm?: string;
    global?: string;
  }>({});

  const handleSave = async () => {
    let hasError = false;
    const newErrors: any = {};

    if (!oldPassword) {
      newErrors.old = 'Password lama wajib diisi';
      hasError = true;
    }
    if (!newPassword) {
      newErrors.new = 'Password baru wajib diisi';
      hasError = true;
    }
    if (!confirmPassword) {
      newErrors.confirm = 'konfirmasi password baru wajib diisi';
      hasError = true;
    }

    if (hasError) {
      newErrors.global = 'Password baru harus berbeda dari password sebelumnya dan minimal 8 karakter dengan kombinasi huruf dan angka.';
      setErrors(newErrors);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ global: 'Password baru dan konfirmasi tidak cocok.' });
      return;
    }
    if (newPassword.length < 8) {
      setErrors({ global: 'Password baru minimal 8 karakter.' });
      return;
    }

    try {
      setErrors({});
      await axiosInstance.put('/auth/change-password', {
        current_password: oldPassword,
        new_password: newPassword,
      });
      alert('Password berhasil diubah.');
      router.push('/cms/profil');
    } catch (err: any) {
      setErrors({ global: err.response?.data?.message || 'Gagal mengubah password' });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-2">
        <Link href="/cms/dashboard" className="hover:text-blue-600 transition-colors">
          Beranda
        </Link>
        <span className="text-gray-400 font-bold">&gt;</span>
        <Link href="/cms/profil" className="hover:text-blue-600 transition-colors">
          Lihat Profile
        </Link>
        <span className="text-gray-400 font-bold">&gt;</span>
        <span className="text-gray-600">Ubah Password</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[36px] font-bold text-gray-700 mb-1">Ubah Password</h1>
        <p className="text-gray-400 font-bold text-[15px]">Perbarui password Anda untuk menjaga keamanan akun</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.06)] border border-gray-200 p-8 md:p-10">
        
        <div className="flex flex-col gap-6 max-w-3xl">
          
          {/* Password Lama */}
          <div>
            <label className="block text-[18px] font-bold text-gray-600 mb-3">Password Lama</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={errors.old ? "text-gray-700" : "text-blue-600"} size={18} strokeWidth={2.5} />
              </div>
              <input 
                type={showOldPassword ? 'text' : 'password'} 
                value={oldPassword}
                placeholder="Masukkan password kamu"
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (errors.old) setErrors({ ...errors, old: undefined, global: undefined });
                }}
                className={`w-full pl-12 pr-12 py-3 bg-white border rounded-full text-[15px] font-semibold text-gray-700 outline-none transition-colors ${
                  errors.old ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              <button 
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className={`absolute inset-y-0 right-0 pr-4 flex items-center ${errors.old ? 'text-gray-700' : 'text-blue-600 hover:text-blue-700'}`}
              >
                {showOldPassword ? <Eye size={20} strokeWidth={2} /> : <EyeOff size={20} strokeWidth={2} />}
              </button>
            </div>
            {errors.old && <p className="text-red-500 font-semibold text-[13px] mt-2 ml-2">{errors.old}</p>}
          </div>

          {/* Password Baru */}
          <div>
            <label className="block text-[18px] font-bold text-gray-600 mb-3">Password Baru</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={errors.new ? "text-gray-700" : "text-blue-600"} size={18} strokeWidth={2.5} />
              </div>
              <input 
                type={showNewPassword ? 'text' : 'password'} 
                value={newPassword}
                placeholder="Masukkan password baru kamu"
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.new) setErrors({ ...errors, new: undefined, global: undefined });
                }}
                className={`w-full pl-12 pr-12 py-3 bg-white border rounded-full text-[15px] font-semibold text-gray-700 outline-none transition-colors ${
                  errors.new ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              <button 
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={`absolute inset-y-0 right-0 pr-4 flex items-center ${errors.new ? 'text-gray-700' : 'text-blue-600 hover:text-blue-700'}`}
              >
                {showNewPassword ? <Eye size={20} strokeWidth={2} /> : <EyeOff size={20} strokeWidth={2} />}
              </button>
            </div>
            {errors.new ? (
              <p className="text-red-500 font-semibold text-[13px] mt-2 ml-2">{errors.new}</p>
            ) : (
              <p className="text-gray-400 font-semibold text-[13px] mt-2 ml-2">Gunakan minimal 8 karakter dengan kombinasi huruf dan angka</p>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-[18px] font-bold text-gray-600 mb-3">Konfirmasi Password Baru</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={errors.confirm ? "text-gray-700" : "text-blue-600"} size={18} strokeWidth={2.5} />
              </div>
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                value={confirmPassword}
                placeholder="Masukkan konfirmasi password kamu"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirm) setErrors({ ...errors, confirm: undefined, global: undefined });
                }}
                className={`w-full pl-12 pr-12 py-3 bg-white border rounded-full text-[15px] font-semibold text-gray-700 outline-none transition-colors ${
                  errors.confirm ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute inset-y-0 right-0 pr-4 flex items-center ${errors.confirm ? 'text-gray-700' : 'text-blue-600 hover:text-blue-700'}`}
              >
                {showConfirmPassword ? <Eye size={20} strokeWidth={2} /> : <EyeOff size={20} strokeWidth={2} />}
              </button>
            </div>
            {errors.confirm && <p className="text-red-500 font-semibold text-[13px] mt-2 ml-2">{errors.confirm}</p>}
          </div>
          
          {/* Global Warning Box */}
          {errors.global && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-5 flex gap-3 text-red-500 w-full">
              <div className="mt-0.5 shrink-0">
                <AlertCircle size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-bold text-[15px]">Perhatian</h3>
                <p className="text-[13px] mt-1 font-semibold leading-relaxed max-w-xl">{errors.global}</p>
              </div>
            </div>
          )}
          
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-10">
          <button 
            onClick={() => router.push('/cms/profil')}
            className="w-full sm:w-auto px-10 py-3 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm shadow-sm"
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#1d5ac9] hover:bg-blue-700 text-white font-bold transition-colors text-sm shadow-sm"
          >
            Simpan Perubahan
          </button>
        </div>

      </div>
    </div>
  );
}

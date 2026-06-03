'use client';

import { useAuthStore } from '@/stores/authStore';
import { User, Mail, Lock, Edit3 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilPage() {
  const { user } = useAuthStore();

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-2">
        <Link href="/cms/dashboard" className="hover:text-blue-600 transition-colors">
          Beranda
        </Link>
        <span className="text-blue-500 font-bold">&gt;</span>
        <span className="text-gray-600">Lihat Profile</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[32px] font-bold text-gray-600 mb-1">Profile Saya</h1>
        <p className="text-gray-400 font-bold text-sm">Kelola informasi profil dan akun Anda</p>
      </div>
      
      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.06)] border border-gray-200 p-8 md:p-10">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          
          {/* Avatar Section */}
          <div className="flex-shrink-0 flex items-start justify-center md:pt-4">
            {user?.avatar ? (
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-md">
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <svg viewBox="0 0 100 100" className="w-40 h-40 text-[#85929E]">
                <circle cx="50" cy="35" r="22" fill="currentColor" />
                <path d="M50 65 C25 65 10 82 10 95 L90 95 C90 82 75 65 50 65 Z" fill="currentColor" />
              </svg>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-grow">
            
            {/* Top Info: Informasi Akun */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-[22px] font-bold text-gray-600">Informasi Akun</h2>
              <Link href="/cms/profil/edit" className="flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors text-sm shadow-sm w-full sm:w-auto">
                <Edit3 size={16} />
                Edit Profil
              </Link>
            </div>

            <div className="space-y-6 mb-12">
              {/* Nama */}
              <div className="flex items-center">
                <div className="flex items-center gap-3 w-36 shrink-0">
                  <User className="text-blue-600" size={20} strokeWidth={2.5} />
                  <span className="text-[#a0aab5] font-bold">Nama</span>
                </div>
                <span className="text-gray-700 font-bold text-[17px]">{user?.name || 'Paulenta'}</span>
              </div>

              {/* Email */}
              <div className="flex items-center">
                <div className="flex items-center gap-3 w-36 shrink-0">
                  <Mail className="text-blue-600" size={20} strokeWidth={2.5} />
                  <span className="text-[#a0aab5] font-bold">Email</span>
                </div>
                {/* Menampilkan email dari authStore jika ada, fallback ke ismy@gmail.com */}
                <span className="text-gray-700 font-bold text-[17px]">{(user as any)?.email || 'ismy@gmail.com'}</span>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-300 mb-8" />

            {/* Bottom Info: Keamanan Akun */}
            <div className="mb-6">
              <h2 className="text-[22px] font-bold text-gray-600">Keamanan Akun</h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center">
                <div className="flex items-center gap-3 w-36 shrink-0">
                  <Lock className="text-blue-600" size={20} strokeWidth={2.5} />
                  <span className="text-[#a0aab5] font-bold">Pasword</span>
                </div>
                {/* Using distinct dots for password */}
                <div className="flex items-center gap-1.5 mt-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-gray-800"></div>
                  ))}
                </div>
              </div>
              
              <Link href="/cms/reset-password" className="flex items-center justify-center gap-2 bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-50 px-5 py-2 rounded-lg font-bold transition-colors text-sm shadow-sm w-full sm:w-auto">
                <Lock size={16} strokeWidth={2.5} />
                Ubah Password
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

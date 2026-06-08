'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { User, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

export default function EditProfilPage() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      formData.append('_method', 'PUT'); // Trick for Laravel PUT via FormData

      const res = await axiosInstance.post('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data?.data) {
        updateUser({ 
          name: res.data.data.name, 
          email: res.data.data.email, 
          avatar: res.data.data.avatar_url || avatar 
        });
      } else {
        updateUser({ name, email, avatar });
      }
      router.push('/cms/profil');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan profil');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-2">
        <Link href="/cms/dashboard" className="hover:text-blue-600 transition-colors">
          Beranda
        </Link>
        <span className="text-blue-500 font-bold">&gt;</span>
        <Link href="/cms/profil" className="hover:text-blue-600 transition-colors">
          Lihat Profile
        </Link>
        <span className="text-blue-500 font-bold">&gt;</span>
        <span className="text-gray-600">Edit Profile</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[32px] font-bold text-gray-600 mb-1">Edit Profile</h1>
        <p className="text-gray-400 font-bold text-sm">Pembarui profil dan akun anda</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.06)] border border-gray-200 p-8 md:p-10">
        
        <div className="flex flex-col md:flex-row">
          
          {/* Left Column */}
          <div className="w-full md:w-[40%] flex flex-col items-center pr-0 md:pr-10 border-b md:border-b-0 md:border-r border-gray-300 pb-10 md:pb-0">
            <h2 className="text-[20px] font-bold text-gray-600 mb-6 w-full text-center">Foto Profile</h2>
            
            {avatar ? (
              <div className="w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-white shadow-md">
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <svg viewBox="0 0 100 100" className="w-40 h-40 text-[#85929E] mb-6">
                <circle cx="50" cy="35" r="22" fill="currentColor" />
                <path d="M50 65 C25 65 10 82 10 95 L90 95 C90 82 75 65 50 65 Z" fill="currentColor" />
              </svg>
            )}

            <div className="w-full text-center">
              <h3 className="font-bold text-gray-600 mb-3 text-lg">Upload Image :</h3>
              
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageChange}
                className="w-full max-w-[250px] mx-auto text-sm text-gray-400
                  file:mr-4 file:py-1.5 file:px-3
                  file:rounded-md file:border file:border-gray-200
                  file:text-xs file:font-bold
                  file:bg-gray-100 file:text-gray-600
                  hover:file:bg-gray-200 cursor-pointer"
              />
              
              <p className="text-[11px] text-gray-400 mt-4 leading-relaxed max-w-[220px] mx-auto font-medium">
                Jika tidak mengubah gambar,<br />
                kolom ini tidak perlu diisi<br />
                Format : JPG, PNG, Maks 2MB
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-[60%] pt-10 md:pt-0 pl-0 md:pl-10 flex flex-col justify-between">
            <div>
              <h2 className="text-[20px] font-bold text-gray-600 mb-6">Foto Profile</h2>
              
              <div className="space-y-6">
                {/* Nama Input */}
                <div>
                  <label className="block text-[15px] font-bold text-gray-600 mb-2">Nama</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="text-blue-600" size={18} strokeWidth={2.5} />
                    </div>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-2 bg-white border border-gray-400 rounded-full text-[15px] font-bold text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-[15px] font-bold text-gray-600 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="text-blue-600" size={18} strokeWidth={2.5} />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      disabled
                      className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[15px] font-bold text-gray-500 outline-none cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-4 mt-12 md:mt-0">
              <button 
                onClick={() => router.push('/cms/profil')}
                className="px-10 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm shadow-sm"
              >
                Batal
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 rounded-lg bg-[#1d5ac9] hover:bg-blue-700 text-white font-bold transition-colors text-sm shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

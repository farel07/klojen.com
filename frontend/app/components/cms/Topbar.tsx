'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, User as UserIcon, Lock, Search, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter, usePathname } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { clearRefreshToken } from '@/lib/auth';

interface TopbarProps {
  onToggle?: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  editor: 'Editor',
  journalist: 'Jurnalis',
  reader: 'Pembaca',
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  journalist: 'bg-green-100 text-green-700',
  reader: 'bg-gray-100 text-gray-700',
};

export default function Topbar({ onToggle }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    setIsLoggingOut(true);
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await axiosInstance.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch {
      // Logout tetap lanjut walau request gagal
    } finally {
      logout();
      clearRefreshToken();
      router.push('/login');
    }
  };

  const initials = user?.name
    ? user.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    : 'U';

  const roleLabel = user?.role ? ROLE_LABELS[user.role] ?? user.role : 'Tamu';
  const roleBadge = user?.role ? ROLE_BADGE_COLORS[user.role] ?? 'bg-gray-100 text-gray-700' : '';

  return (
    <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-transparent z-10 w-full gap-4">
      
      {/* Left/Center: Search Bar */}
      {(!pathname.startsWith('/cms/profil') && !pathname.startsWith('/cms/reset-password')) ? (
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Cari Sesuatu..." 
              className="w-full pl-5 pr-12 py-3 bg-white border border-gray-100 rounded-full text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all shadow-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:text-blue-600 transition-colors">
              <Search size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-xl hidden md:block"></div>
      )}

      <div className="flex-1 md:hidden"></div> {/* Spacer for mobile */}

      {/* Right: User Profile */}
      <div className="relative" ref={dropdownRef}>
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {/* Name & Role */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="font-bold text-gray-900 text-sm leading-tight">
              {user?.name ?? 'Pengguna'}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${roleBadge}`}>
              {roleLabel}
            </span>
          </div>

          {/* Avatar */}
          {user?.avatar ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm shrink-0">
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="
                w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-700
                flex items-center justify-center text-white font-bold text-sm
                shadow-md group-hover:shadow-lg transition-shadow duration-200
                shrink-0
              "
            >
              {initials}
            </div>
          )}
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 overflow-hidden transform opacity-100 scale-100 transition-all duration-200">
            <Link 
              href="/cms/profil" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <UserIcon size={16} className="text-blue-600" />
              </div>
              Lihat Profile
            </Link>
            <div className="px-4 py-1">
              <div className="h-px w-full bg-gray-100"></div>
            </div>
            <Link 
              href="/cms/reset-password" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Lock size={16} className="text-blue-600" />
              </div>
              Reset Password
            </Link>
            <div className="px-4 py-1">
              <div className="h-px w-full bg-gray-100"></div>
            </div>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <LogOut size={16} className="text-red-600" />
              </div>
              {isLoggingOut ? 'Keluar...' : 'Keluar'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

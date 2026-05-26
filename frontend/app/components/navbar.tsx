'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Bookmark, LogOut, ChevronDown } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { clearRefreshToken } from '@/lib/auth';
import axiosInstance from '@/lib/axios';

const NAV_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Kuliner', href: '/kategori/kuliner' },
  { label: 'Wisata', href: '/kategori/wisata' },
  { label: 'Pendidikan', href: '/kategori/pendidikan' },
  { label: 'Hotel', href: '/kategori/hotel' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { isAuthenticated, user, logout } = useAuthStore();

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Alur logout sesuai docs section 2.4
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await axiosInstance.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch {
      // Tetap logout meskipun request gagal
    } finally {
      logout();
      clearRefreshToken();
      setIsDropdownOpen(false);
      setIsOpen(false);
      router.push('/');
    }
  };

  // Inisial nama untuk avatar
  const getInitial = (name: string) =>
    name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <section id="section-header" className="fixed top-0 left-0 w-full z-50 px-4 py-8">
      {/* Navbar Container */}
      <div className="max-w-7xl mx-auto bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 flex justify-between items-center relative shadow-lg shadow-black/5">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <img
            src="/images/logo.png"
            alt="Klojen Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-bold text-white tracking-tight">
            Klojen
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/80 font-medium text-sm hover:text-white transition-colors first:bg-white first:text-black first:px-5 first:py-2 first:rounded-full first:font-semibold first:shadow-md first:hover:scale-105 first:duration-300"
            >
              {link.label}
            </Link>
          ))}

          {/* Kondisional: Sudah login vs belum */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full pl-1 pr-3 py-1 transition-all duration-200"
                aria-label="Menu pengguna"
              >
                {/* Avatar inisial */}
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {getInitial(user.name)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-white/60 leading-none">hi,</span>
                  <span className="text-sm font-semibold text-white leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-white/60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/bookmark"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Bookmark size={16} className="text-gray-400" />
                    Bookmark Saya
                  </Link>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-white hover:text-black transition-all duration-300"
            >
              Masuk/Daftar
            </Link>
          )}
        </nav>

        {/* Mobile Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-[75px] left-0 w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 flex flex-col gap-5 lg:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-white font-medium hover:text-gray-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-white/10 pt-4">
              {isAuthenticated && user ? (
                <>
                  {/* Info user mobile */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-base">
                      {getInitial(user.name)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{user.name}</p>
                      <p className="text-white/50 text-xs capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Link
                    href="/bookmark"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-white/80 font-medium hover:text-white transition-colors mb-3"
                  >
                    <Bookmark size={16} />
                    Bookmark Saya
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full bg-red-500/20 text-red-400 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-red-500/30 transition-colors"
                  >
                    <LogOut size={16} />
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-white text-black px-5 py-2.5 rounded-full font-medium hover:bg-black hover:text-white transition-all duration-300"
                >
                  Masuk/Daftar
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Navbar;
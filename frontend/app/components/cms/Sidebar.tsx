'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  PenLine,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  ClipboardList,
  Hash,
  LineChart,
  Images,
  Newspaper,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/lib/axios';
import { clearRefreshToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Role } from '@/app/types';

// ─── Custom Icons ─────────────────────────────────────────────────────────────

const AdsIcon = ({ size = 19, className = '' }) => (
  <span
    className={`font-black flex items-center justify-center tracking-tighter ${className}`}
    style={{ width: size, height: size, fontSize: size * 0.55 }}
  >
    ADS
  </span>
);

// ─── Nav item type ────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles: Role[];
  isAction?: boolean;
}

// ─── Role-specific nav configs ────────────────────────────────────────────────

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  reader: [],

  journalist: [
    { label: 'Dashboard', href: '/cms/dashboard', icon: LayoutDashboard, roles: ['journalist'] },
    { label: 'Media Tersimpan', href: '/cms/media', icon: Images, roles: ['journalist'] },
    { label: 'Bank Berita', href: '/cms/artikel', icon: Newspaper, roles: ['journalist'] },
    { label: 'Tulis Berita', href: '/cms/tulis-berita', icon: PenLine, roles: ['journalist'], isAction: true },
  ],

  editor: [
    { label: 'Dashboard',      href: '/cms/dashboard',    icon: LayoutDashboard, roles: ['editor'] },
    { label: 'Media Tersimpan', href: '/cms/media',        icon: Images,          roles: ['editor'] },
    { label: 'Bank Berita',    href: '/cms/artikel',       icon: Newspaper,       roles: ['editor'] },
    { label: 'Tulis Berita',   href: '/cms/tulis-berita',  icon: PenLine,         roles: ['editor'], isAction: true },
  ],

  admin: [
    { label: 'Dashboard', href: '/cms/dashboard', icon: Home, roles: ['admin'] },
    { label: 'Kelola Akun Karyawan', href: '/cms/karyawan', icon: ClipboardList, roles: ['admin'] },
    { label: 'Kelola Akun Pengguna', href: '/cms/pengguna', icon: ClipboardList, roles: ['admin'] },
    { label: 'Kategori dan Tag', href: '/cms/kategori', icon: Hash, roles: ['admin'] },
    { label: 'Kelola Iklan', href: '/cms/iklan', icon: AdsIcon, roles: ['admin'] },
    { label: 'Statistik Portal', href: '/cms/statistik', icon: LineChart, roles: ['admin'] },
  ],
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const role = user?.role as Role | undefined;

  const filteredNav = role ? NAV_BY_ROLE[role] ?? [] : [];

  const handleLogout = async () => {
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

  const isActive = (href: string) => {
    if (href === '/cms/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        relative flex flex-col h-full bg-[#eaf2ff] shadow-lg z-20 shrink-0
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between px-5 py-7">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Klojen Logo" width={40} height={40} className="h-8 w-auto" priority />
            <span className="text-xl font-bold tracking-tight text-gray-900">Klojen</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center overflow-hidden">
            <Image src="/images/logo.png" alt="Klojen Logo" width={40} height={40} className="h-full w-auto object-contain object-left" priority />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-md hover:bg-white/60"
            title="Tutup sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center mb-2">
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-md hover:bg-white/60"
            title="Buka sidebar"
          >
            <PanelLeftOpen size={20} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 mt-2">
        <ul className="flex flex-col gap-1 px-2">
          {filteredNav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-xl font-medium
                    transition-all duration-200 group relative
                    ${active
                      ? 'bg-white text-blue-600 shadow-sm font-semibold'
                      : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                    }
                    ${collapsed ? 'justify-center px-0' : ''}
                  `}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                  )}
                  <Icon
                    size={20}
                    className={active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                  />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-blue-200/60" />

      {/* Logout */}
      <div className={`mb-6 mt-4 ${collapsed ? 'flex justify-center' : 'px-4'}`}>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={collapsed ? 'Keluar' : undefined}
          className={`
            flex items-center gap-4 font-medium text-gray-600
            hover:text-red-500 transition-colors rounded-xl px-4 py-3
            hover:bg-red-50 w-full disabled:opacity-60
            ${collapsed ? 'justify-center px-0 w-auto' : ''}
          `}
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm">{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>}
        </button>
      </div>
    </aside>
  );
}

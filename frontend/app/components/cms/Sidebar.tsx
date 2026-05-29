'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  HardDrive,
  Database,
  PenLine,
  MessageSquare,
  Users,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/lib/axios';
import { clearRefreshToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Role } from '@/app/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/cms/dashboard',
    icon: LayoutDashboard,
    roles: ['journalist', 'editor', 'admin'],
  },
  {
    label: 'Media Tersimpan',
    href: '/cms/media',
    icon: HardDrive,
    roles: ['journalist', 'editor', 'admin'],
  },
  {
    label: 'Bank Berita',
    href: '/cms/artikel',
    icon: Database,
    roles: ['journalist', 'editor', 'admin'],
  },
  {
    label: 'Tulis Berita',
    href: '/cms/tulis-berita',
    icon: PenLine,
    roles: ['journalist', 'editor', 'admin'],
  },
  {
    label: 'Komentar',
    href: '/cms/komentar',
    icon: MessageSquare,
    roles: ['editor', 'admin'],
  },
  {
    label: 'Pengguna',
    href: '/cms/pengguna',
    icon: Users,
    roles: ['admin'],
  },
];

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

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (!role) return false;
    return item.roles.includes(role);
  });

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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-sm">K</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Klojen</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-sm">K</span>
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

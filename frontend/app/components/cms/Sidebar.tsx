'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  ImageIcon,
  MessageSquare,
  Users,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  FileText,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/lib/axios';
import { clearRefreshToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Role } from '@/app/types';

// ─── Nav item type ────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** Prefix a "+" icon to visually indicate create/shortcut actions */
  isAction?: boolean;
}

// ─── Role-specific nav configs ────────────────────────────────────────────────

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  reader: [],

  journalist: [
    { label: 'Dashboard',      href: '/cms/dashboard',      icon: LayoutDashboard },
    { label: 'Media Tersimpan',href: '/cms/media',           icon: ImageIcon },
    { label: 'Bank Berita',    href: '/cms/artikel',         icon: Newspaper },
    { label: 'Tulis Berita',   href: '/cms/artikel/baru',    icon: PenLine,   isAction: true },
  ],

  editor: [
    { label: 'Dashboard',      href: '/cms/dashboard',           icon: LayoutDashboard },
    { label: 'Media Tersimpan',href: '/cms/media',               icon: ImageIcon },
    { label: 'Bank Berita',    href: '/cms/artikel',             icon: Newspaper },
    { label: 'Tulis Berita',   href: '/cms/artikel/baru',        icon: PenLine,   isAction: true },
    { label: 'Draf Berita',    href: '/cms/artikel?status=draft',icon: FileText,  isAction: true },
  ],

  admin: [
    { label: 'Dashboard',      href: '/cms/dashboard',      icon: LayoutDashboard },
    { label: 'Semua Artikel',  href: '/cms/artikel',         icon: Newspaper },
    { label: 'Media',          href: '/cms/media',           icon: ImageIcon },
    { label: 'Komentar',       href: '/cms/komentar',        icon: MessageSquare },
    { label: 'Pengguna',       href: '/cms/pengguna',        icon: Users },
  ],
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const role = (user?.role ?? 'reader') as Role;
  const navItems = NAV_BY_ROLE[role] ?? [];

  // ── Active detection ──────────────────────────────────────────────────────
  const isActive = (href: string) => {
    // Exact match for dashboard and create pages
    if (href === '/cms/dashboard' || href === '/cms/artikel/baru') {
      return pathname === href;
    }
    // Query-param links: match both pathname AND query
    if (href.includes('?')) {
      const [hrefPath] = href.split('?');
      return pathname === hrefPath && typeof window !== 'undefined' && window.location.search.includes('status=draft');
    }
    return pathname.startsWith(href);
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await axiosInstance.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch {
      // Lanjut logout meski request gagal
    } finally {
      logout();
      clearRefreshToken();
      router.push('/login');
    }
  };

  return (
    <aside
      className={`
        relative flex flex-col h-full bg-[#eaf2ff] shadow-lg z-20 shrink-0
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* ── Logo + Toggle ──────────────────────────────────────────────────── */}
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

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="flex-1 mt-2">
        <ul className="flex flex-col gap-0.5 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium
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
                    size={19}
                    className={active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                  />

                  {!collapsed && (
                    <span className="text-sm flex items-center gap-1.5">
                      {item.isAction && (
                        <span className={`text-base leading-none font-bold ${active ? 'text-blue-500' : 'text-gray-400'}`}>
                          +
                        </span>
                      )}
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <div className="mx-4 border-t border-blue-200/60" />

      {/* ── Logout ─────────────────────────────────────────────────────────── */}
      <div className={`mb-6 mt-4 ${collapsed ? 'flex justify-center' : 'px-4'}`}>
        <button
          id="btn-sidebar-logout"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={collapsed ? 'Keluar' : undefined}
          className={`
            flex items-center gap-3 font-medium text-gray-600
            hover:text-red-500 transition-colors rounded-xl px-4 py-3
            hover:bg-red-50 w-full disabled:opacity-60
            ${collapsed ? 'justify-center px-0 w-auto' : ''}
          `}
        >
          <LogOut size={19} />
          {!collapsed && (
            <span className="text-sm">{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
          )}
        </button>
      </div>
    </aside>
  );
}

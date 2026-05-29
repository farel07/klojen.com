'use client';

import { Search, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';

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

export default function Topbar() {
  const { user } = useAuthStore();
  const [searchValue, setSearchValue] = useState('');

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
    <header className="flex items-center justify-between px-6 md:px-10 py-5 bg-transparent z-10 gap-4">
      {/* Global Search */}
      <div className="relative w-full max-w-xl">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          id="cms-search"
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Cari Sesuatu..."
          className="
            w-full pl-11 pr-5 py-3.5 rounded-full
            bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]
            border border-transparent focus:border-blue-300
            focus:ring-2 focus:ring-blue-100 outline-none
            text-gray-700 placeholder-gray-400 text-sm
            transition-all duration-200
          "
        />
      </div>

      {/* Right: Notification + User */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification Bell */}
        <button
          id="cms-notification-btn"
          className="
            relative w-10 h-10 rounded-full bg-white
            shadow-[0_2px_8px_rgba(0,0,0,0.08)]
            flex items-center justify-center
            text-gray-500 hover:text-blue-600
            transition-colors duration-200
          "
          title="Notifikasi"
        >
          <Bell size={18} />
          {/* Badge */}
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          {/* Avatar */}
          <div
            className="
              w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700
              flex items-center justify-center text-white font-bold text-sm
              shadow-md group-hover:shadow-lg transition-shadow duration-200
              shrink-0
            "
          >
            {initials}
          </div>

          {/* Name & Role */}
          <div className="hidden sm:block">
            <div className="font-semibold text-gray-900 text-sm leading-tight">
              {user?.name ?? 'Pengguna'}
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge}`}
            >
              {roleLabel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

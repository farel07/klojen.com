'use client';

import Image from 'next/image';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

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
  const { user } = useAuthStore();

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
    <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-transparent z-10">
      {/* Left: Logo + Hamburger */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/logo.png"
            alt="Klojen Logo"
            width={32}
            height={32}
            className="h-8 w-auto"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-gray-900">Klojen</span>
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            className="ml-1 p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-white/70 transition-colors"
            title="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-3 cursor-pointer group">
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
      </div>
    </header>
  );
}

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
    <header className="flex items-center justify-end px-6 md:px-8 py-4 bg-transparent z-10">

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

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { CMS_ROLES } from '@/app/constants/roles';
import { Role } from '@/app/types';
import Sidebar from '@/app/components/cms/Sidebar';
import Topbar from '@/app/components/cms/Topbar';
import { useState } from 'react';

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user && !CMS_ROLES.includes(user.role as Role)) {
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, user, router]);

  // Tampilkan loading saat belum hydrated atau cek auth
  if (!hydrated || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f7fb]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Memuat CMS...</span>
        </div>
      </div>
    );
  }

  if (!CMS_ROLES.includes(user.role as Role)) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#f5f7fb] font-sans overflow-hidden text-gray-900">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-6 md:px-10 pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}

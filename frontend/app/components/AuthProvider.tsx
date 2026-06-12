'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getRefreshToken, saveRefreshToken } from '@/lib/auth';
import axiosInstance from '@/lib/axios';
import { ApiSuccess } from '@/app/types';

/**
 * AuthProvider: melakukan silent refresh saat app pertama dimuat.
 * Jika ada refresh_token di localStorage, coba dapatkan access_token baru
 * agar user tetap login meski halaman di-refresh (sesuai docs 2.2).
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Jika sudah ada di store (misal navigasi antar halaman), skip
    if (isAuthenticated) return;

    const refreshToken = getRefreshToken();
    if (!refreshToken) return;

    // Coba dapatkan access_token baru dengan refresh_token
    const rehydrate = async () => {
      try {
        const res = await axiosInstance.post<
          ApiSuccess<{
            access_token: string;
            refresh_token: string;
            user: { id: string; name: string; email: string; avatar_url?: string; role: 'reader' | 'journalist' | 'editor' | 'admin' };
          }>
        >('/auth/refresh', { refresh_token: refreshToken });

        const { access_token, refresh_token, user } = res.data.data;
        setAuth(access_token, { id: user.id, name: user.name, email: user.email, avatar: user.avatar_url, role: user.role });
        if (refresh_token) saveRefreshToken(refresh_token);
      } catch {
        // Refresh gagal (token expired/revoked) — biarkan user guest
      }
    };

    rehydrate();
  }, []);

  return <>{children}</>;
}

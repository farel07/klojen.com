'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import axiosInstance from '@/lib/axios';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Hindari track halaman backend/API langsung (meski tidak mungkin dari nextjs router)
    // dan hindari melacak dashboard admin itu sendiri jika dirasa tidak perlu.
    // Tapi untuk keperluan metrik total, kita track semua aktivitas page view.
    if (!pathname) return;

    axiosInstance.post('/analytics/track', { path: pathname })
      .catch((err) => {
        // Silently fail, tidak perlu mengganggu UX jika tracker gagal
        console.error('Failed to track analytics:', err);
      });
  }, [pathname]);

  return null; // Komponen ini tidak me-render UI apa pun
}

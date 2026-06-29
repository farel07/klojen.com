import { Suspense } from 'react';
import type { Metadata } from 'next';
import CariPage from '../../pages/cari';

export const metadata: Metadata = {
  title: 'Cari Berita | Klojen',
  description: 'Cari artikel dan berita terbaru dari Portal Berita Klojen.',
  alternates: {
    canonical: '/cari',
  },
};

export default function CariRoute() {
  return (
    <Suspense>
      <CariPage />
    </Suspense>
  );
}

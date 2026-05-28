import Kategori from '@/app/pages/kategori';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

// ── Dynamic metadata per kategori ─────────────────────────────────────────────

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  kuliner: {
    title: 'Kuliner Kota Malang | Klojen',
    description: 'Temukan rekomendasi kuliner terbaik di Kota Malang — dari street food legendaris hingga restoran modern.',
  },
  wisata: {
    title: 'Wisata Kota Malang | Klojen',
    description: 'Eksplorasi destinasi wisata terbaik di Malang — alam, budaya, dan spot instagramable terpopuler.',
  },
  pendidikan: {
    title: 'Pendidikan Kota Malang | Klojen',
    description: 'Berita dan informasi seputar dunia pendidikan di Kota Malang — universitas, sekolah, dan beasiswa.',
  },
  hotel: {
    title: 'Hotel di Kota Malang | Klojen',
    description: 'Rekomendasi hotel dan penginapan terbaik di Malang — dari budget hingga bintang 5.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = CATEGORY_META[slug];
  return {
    title: meta?.title ?? `Kategori: ${slug} | Klojen`,
    description: meta?.description ?? `Baca artikel terbaru kategori ${slug} di Klojen — Portal Berita Kota Malang.`,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function KategoriPage({ params }: Props) {
  const { slug } = await params;
  return <Kategori slug={slug} />;
}

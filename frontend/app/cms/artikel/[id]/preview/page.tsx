'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Clock, CheckCircle2, CloudUpload, XCircle } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

// ─── Mock Data (sama dengan bank berita) ──────────────────────────────────────
// Nantinya ini diganti dengan fetch ke API menggunakan article.id

type ArticleStatus = 'published' | 'draft' | 'scheduled' | 'rejected';

interface MockArticleItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  status: ArticleStatus;
  image: string;
  caption?: string;
  content?: string;
  tags?: string[];
  rejectionReason?: string;
  author?: string;
  publishedAt?: string;
}

const MOCK_ARTICLES: MockArticleItem[] = [
  {
    id: '1',
    title: 'Wisata Gunung Bromo Via Malang Semakin Diminati Wisatawan',
    excerpt: 'Jumlah kunjungan wisatawa...',
    category: 'Wisata',
    status: 'published',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80',
    author: 'Ahmad Fauzi',
    publishedAt: '2026-05-20',
    content: `<p>Wisata Gunung Bromo yang diakses melalui jalur Malang semakin diminati wisatawan lokal maupun mancanegara. Berdasarkan data terbaru dari Balai Besar Taman Nasional Bromo Tengger Semeru (BB-TNBTS), jumlah kunjungan melalui pintu masuk Malang meningkat signifikan.</p>

<p>Keindahan lautan pasir dan panorama matahari terbit dari puncak Penanjakan menjadi daya tarik utama yang membuat wisatawan terus berdatangan. Jalur via Malang menawarkan pengalaman perjalanan yang lebih beragam dengan melewati kawasan pedesaan yang asri.</p>

<p>"Kami mencatat peningkatan sekitar 35% dibanding tahun lalu untuk kunjungan melalui jalur Malang," ujar Kepala BB-TNBTS, Sukoco, dalam keterangan resminya.</p>

<p>Pihak pengelola pun terus melakukan pembenahan fasilitas untuk meningkatkan kenyamanan pengunjung, mulai dari perbaikan jalan menuju kawasan wisata hingga penambahan spot foto yang instagramable.</p>`,
    tags: ['#GunungBromo', '#WisataMalang', '#Jatim'],
  },
  {
    id: '2',
    title: 'SMA di Malang Terapkan Kelas Digital Mulai Semester Ini',
    excerpt: 'Sekolah mulai menerapkan...',
    category: 'Pendidikan',
    status: 'published',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
    author: 'Siti Rahayu',
    publishedAt: '2026-05-22',
    content: `<p>Sejumlah SMA di Kota Malang mulai menerapkan sistem kelas digital secara penuh pada semester genap tahun ajaran 2025/2026. Program ini merupakan bagian dari transformasi digital pendidikan yang dicanangkan oleh Dinas Pendidikan Kota Malang.</p>

<p>Dengan sistem kelas digital, seluruh materi pembelajaran, tugas, dan ujian dilakukan secara daring menggunakan platform Learning Management System (LMS) yang dikembangkan khusus untuk kebutuhan lokal.</p>

<p>"Siswa sangat antusias dengan sistem baru ini. Mereka bisa mengakses materi kapan saja dan di mana saja," kata Kepala SMAN 1 Malang, Drs. Hendra Kusuma, M.Pd.</p>`,
    tags: ['#PendidikanDigital', '#Malang', '#SMA'],
  },
  {
    id: '3',
    title: 'Hotel Baru Dekat Alun-Alun Malang Resmi Dibuka',
    excerpt: 'Hotel dengan konsep modern ini menawarkan lokasi dipusat...',
    category: 'Hotel',
    status: 'draft',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    author: 'Budi Santoso',
    content: `<p>Sebuah hotel baru dengan konsep modern dan minimalis resmi dibuka di kawasan strategis dekat Alun-Alun Kota Malang. Hotel berlantai 12 ini menawarkan 150 kamar dengan berbagai tipe, mulai dari Standard hingga Suite.</p>

<p>Keunggulan utama hotel ini adalah lokasinya yang sangat strategis, hanya 200 meter dari Alun-Alun Kota Malang dan berjarak jalan kaki ke berbagai pusat kuliner dan perbelanjaan.</p>`,
    tags: ['#HotelMalang', '#Wisata', '#AlunAlunMalang'],
  },
  {
    id: '4',
    title: 'Bakso President Malang Jadi Favorit Wisatawan',
    excerpt: 'Cita rasa khas dan porsi jumbo membuat Bakso...',
    category: 'Kuliner',
    status: 'scheduled',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
    author: 'Dewi Kartika',
    content: `<p>Bakso President yang berlokasi di Jalan Batanghari, Malang, semakin populer di kalangan wisatawan yang berkunjung ke Kota Malang. Cita rasa khas dengan kuah yang gurih dan bakso yang kenyal menjadi daya tarik utamanya.</p>

<p>Porsi jumbo dengan harga terjangkau membuat bakso legendaris ini selalu ramai dikunjungi, terutama pada akhir pekan dan hari libur. Antrian panjang menjadi pemandangan biasa di depan gerai yang sudah berdiri sejak tahun 1977 ini.</p>`,
    tags: ['#KulinerMalang', '#Bakso', '#WisataKuliner'],
  },
  {
    id: '5',
    title: 'Jatim Park 3 Dipadati Pengunjung Saat Libur Panjang',
    excerpt: 'Wahana wisata keluarga ...',
    category: 'Wisata',
    status: 'rejected',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80',
    caption: 'Ribuan pengunjung memadati kawasan Jatim Park 3 di Kota Batu saat libur panjang akhir Mei 2026. (Foto: Dokumentasi Jatim Park Group)',
    content: `Jatim Park 3 yang berlokasi di Kota Batu, Jawa Timur, kembali dipadati ribuan pengunjung selama libur panjang akhir Mei 2026. Wahana wisata keluarga ini menjadi salah satu destinasi favorit warga Jawa Timur dan sekitarnya untuk menghabiskan waktu liburan bersama keluarga.

Pada hari puncak libur, Sabtu (24/5/2026), manajemen Jatim Park 3 mencatat lebih dari 8.000 pengunjung yang memasuki kawasan wisata. Angka ini merupakan salah satu rekor kunjungan tertinggi sepanjang tahun 2026.

"Kami menyiapkan operasional ekstra dengan menambah staf dan memperpanjang jam operasional hingga pukul 20.00 WIB selama periode libur," ujar Humas Jatim Park Group, Arini Setyawati, Sabtu (24/5/2026).`,
    author: 'Rizky Pratama',
    tags: ['#JatimPark', '#WisataBatu', '#LiburPanjang', '#Keluarga'],
    rejectionReason: 'Konten tidak sesuai dengan pedoman editorial. Judul kurang informatif dan isi berita perlu dilengkapi dengan data pendukung yang valid.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return dayjs().format('D MMMM YYYY');
  return dayjs(dateStr).format('D MMMM YYYY');
}

const STATUS_CONFIG: Record<ArticleStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  published: {
    label: 'Dipublikasi',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <CheckCircle2 size={14} />,
  },
  draft: {
    label: 'Draft',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50 border-cyan-200',
    icon: <Clock size={14} />,
  },
  scheduled: {
    label: 'Publish Terjadwal',
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
    icon: <CloudUpload size={14} />,
  },
  rejected: {
    label: 'Ditolak',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: <XCircle size={14} />,
  },
};

const CATEGORY_COLOR: Record<string, string> = {
  Wisata:     'bg-blue-100 text-blue-700',
  Pendidikan: 'bg-yellow-100 text-yellow-700',
  Hotel:      'bg-purple-100 text-purple-700',
  Kuliner:    'bg-green-100 text-green-700',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>;
}

export default function PreviewBeritaPage({ params }: Props) {
  const { id } = use(params);
  const article = MOCK_ARTICLES.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Artikel tidak ditemukan.</p>
          <Link
            href="/cms/artikel"
            className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium"
          >
            <ArrowLeft size={16} />
            Kembali ke Bank Berita
          </Link>
        </div>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[article.status];

  return (
    <div className="min-h-full pb-16 bg-white rounded-tl-3xl">

      {/* ─── Preview Banner ─── */}
      <div className="sticky top-0 z-40 bg-amber-400 text-amber-900 px-6 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Eye size={16} />
          <span>MODE PREVIEW — Artikel ini belum dipublikasikan ke publik</span>
        </div>
        <Link
          href="/cms/artikel"
          className="flex items-center gap-1.5 text-xs font-bold bg-amber-900/10 hover:bg-amber-900/20 px-3 py-1.5 rounded-full transition-colors"
        >
          <ArrowLeft size={13} />
          Kembali ke Bank Berita
        </Link>
      </div>

      {/* ─── Article Content ─── */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Status + Kategori */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${statusConf.bg} ${statusConf.color}`}>
            {statusConf.icon}
            {statusConf.label}
          </span>
          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-extrabold ${CATEGORY_COLOR[article.category] ?? 'bg-gray-100 text-gray-600'}`}>
            {article.category}
          </span>
        </div>

        {/* Rejection notice */}
        {article.status === 'rejected' && article.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex gap-3">
            <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700 mb-1">Alasan Penolakan</p>
              <p className="text-sm text-red-600">{article.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Author + Date */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm uppercase">
              {(article.author ?? 'J').charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{article.author ?? 'Jurnalis'}</p>
              <p className="text-xs text-gray-400">{formatDate(article.publishedAt)}</p>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <figure className="mb-8">
          <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-[300px] md:h-[460px] object-cover"
            />
          </div>
          {article.caption && (
            <figcaption className="text-xs text-gray-400 mt-3 text-center italic">
              {article.caption}
            </figcaption>
          )}
        </figure>

        {/* Content */}
        {article.content ? (
          <div
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-10"
            dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }}
          />
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-10 text-center mb-10">
            <p className="text-gray-400 text-sm">Konten artikel belum tersedia.</p>
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-10">
            <span className="text-gray-500 font-medium text-sm mr-2">Tag :</span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-600 font-medium px-4 py-1.5 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="border-t border-gray-100 pt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/cms/artikel"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={15} />
            Kembali ke Bank Berita
          </Link>
          {article.status !== 'published' && (
            <Link
              href={`/cms/tulis-berita?id=${article.id}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              Edit Artikel
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

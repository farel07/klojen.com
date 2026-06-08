'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  XCircle,
  Calendar,
  Clock,
  RefreshCw,
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { useAuthStore } from '@/stores/authStore';

dayjs.locale('id');

// ─── Mock Data ────────────────────────────────────────────────────────────────

type ArticleStatus = 'published' | 'draft' | 'review' | 'on_progress' | 'rejected' | 'scheduled';

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
    excerpt: 'Jumlah kunjungan wisatawan...',
    category: 'Wisata',
    status: 'published',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80',
    author: 'Ahmad Fauzi',
    publishedAt: '2026-05-20',
    content: `<p>Wisata Gunung Bromo yang diakses melalui jalur Malang semakin diminati wisatawan lokal maupun mancanegara. Berdasarkan data terbaru dari Balai Besar Taman Nasional Bromo Tengger Semeru (BB-TNBTS), jumlah kunjungan melalui pintu masuk Malang meningkat signifikan.</p>
<p>Keindahan lautan pasir dan panorama matahari terbit dari puncak Penanjakan menjadi daya tarik utama yang membuat wisatawan terus berdatangan. Jalur via Malang menawarkan pengalaman perjalanan yang lebih beragam dengan melewati kawasan pedesaan yang asri.</p>
<p>"Kami mencatat peningkatan sekitar 35% dibanding tahun lalu untuk kunjungan melalui jalur Malang," ujar Kepala BB-TNBTS dalam keterangan resminya.</p>`,
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
    content: `<p>Sejumlah SMA di Kota Malang mulai menerapkan sistem kelas digital secara penuh pada semester genap tahun ajaran 2025/2026.</p>
<p>Dengan sistem kelas digital, seluruh materi pembelajaran, tugas, dan ujian dilakukan secara daring menggunakan platform Learning Management System (LMS) yang dikembangkan khusus untuk kebutuhan lokal.</p>`,
    tags: ['#PendidikanDigital', '#Malang', '#SMA'],
  },
  {
    id: '3',
    title: 'Hotel Baru Dekat Alun-Alun Malang Resmi Dibuka',
    excerpt: 'Hotel dengan konsep modern ini menawarkan lokasi di pusat...',
    category: 'Hotel',
    status: 'draft',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    author: 'Budi Santoso',
    content: `<p>Sebuah hotel baru dengan konsep modern dan minimalis resmi dibuka di kawasan strategis dekat Alun-Alun Kota Malang. Hotel berlantai 12 ini menawarkan 150 kamar dengan berbagai tipe, mulai dari Standard hingga Suite.</p>
<p>Keunggulan utama hotel ini adalah lokasinya yang sangat strategis, hanya 200 meter dari Alun-Alun Kota Malang dan berjarak jalan kaki ke berbagai pusat kuliner dan perbelanjaan.</p>`,
  },
  {
    id: '4',
    title: 'Bakso President Malang Jadi Favorit Wisatawan',
    excerpt: 'Cita rasa khas dan porsi jumbo membuat Bakso President selalu ramai dikunjungi...',
    category: 'Kuliner',
    status: 'review' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
    caption: 'Sajian Bakso President Malang yang terkenal dengan ukurannya yang jumbo dan cita rasa khas. (Foto: Klojen.com)',
    author: 'Dewi Kartika',
    publishedAt: '2026-05-28',
    content: `<p>Bakso President yang berlokasi di Jalan Batanghari No. 5, Kota Malang, semakin populer di kalangan wisatawan yang berkunjung ke kota ini. Warung bakso legendaris yang telah berdiri sejak tahun 1977 ini selalu ramai dikunjungi, bahkan pada hari kerja sekalipun.</p><p>Ciri khas Bakso President adalah ukuran baksonya yang jumbo, hampir seukuran kepalan tangan orang dewasa. Daging sapi segar berkualitas tinggi dipilih setiap hari untuk menjaga cita rasa yang konsisten. Harga yang ditawarkan pun terjangkau, mulai dari Rp 25.000 hingga Rp 45.000 per porsi.</p><p>"Kami tidak berubah sejak tahun 1977. Resep yang sama, kualitas yang sama," ujar Hendra, cucu pendiri Bakso President, saat ditemui Klojen.com. "Itulah mengapa pelanggan kami selalu kembali."</p><p>Pada akhir pekan, antrean pengunjung bisa mencapai 30 menit. Bakso President kini juga menyediakan layanan pemesanan online untuk mengakomodasi pelanggan yang tidak ingin mengantri.</p>`,
    tags: ['#BaksoPresident', '#KulinerMalang', '#WisataKuliner', '#BaksoMalang'],
  },
  {
    id: '4b',
    title: 'Sate Gabug, Sensasi Sate Khas Malang yang Unik',
    excerpt: 'Sajian sate dengan bumbu kacang gurih khas Kota Malang yang wajib dicoba...',
    category: 'Kuliner',
    status: 'on_progress' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80',
    caption: 'Sate Gabug Malang dengan bumbu kacang khas yang menggugah selera. (Foto: Klojen.com)',
    author: 'Farel Alfara',
    publishedAt: '2026-05-29',
    content: `<p>Sate Gabug adalah salah satu kuliner khas Kota Malang yang jarang diketahui wisatawan dari luar kota. Berbeda dari sate pada umumnya, Sate Gabug menggunakan daging yang digabungkan antara ayam dan kambing muda dengan bumbu kacang gurih yang khas.</p><p>Warung Sate Gabug Pak Kumis di Jalan Soekarno-Hatta menjadi salah satu tempat yang paling legendaris untuk menikmati sajian ini. Sejak berdiri pada tahun 1985, warung ini telah melayani ribuan pelanggan setia dan wisatawan yang sengaja datang untuk mencicipi kelezatannya.</p><p>"Rahasianya ada di bumbu kacang kami yang diracik sendiri menggunakan kacang tanah pilihan dan rempah-rempah khusus," jelas Pak Kumis, sang pemilik warung. Setiap tusuk sate dibakar di atas arang kelapa sehingga menghasilkan aroma khas yang menggugah selera.</p>`,
    tags: ['#SateGabug', '#KulinerMalang', '#SateMalang', '#Wisata'],
  },
  {
    id: '4c',
    title: 'Pantai Balekambang Malang Selatan, Surga Tersembunyi yang Memukau',
    excerpt: 'Keindahan pura di atas batu karang tengah laut menjadikan Pantai Balekambang destinasi wisata unik...',
    category: 'Wisata',
    status: 'review' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    caption: 'Pemandangan Pantai Balekambang dengan pura khas Bali di atas batu karang yang menjadi ikon wisata Malang Selatan. (Foto: Klojen.com)',
    author: 'Ahmad Fauzi',
    publishedAt: '2026-05-30',
    content: `<p>Pantai Balekambang yang terletak di Kecamatan Bantur, Kabupaten Malang, menyimpan pesona alam yang tak kalah memukau dengan pantai-pantai terkenal di Pulau Bali. Keunikan utama pantai ini adalah keberadaan pura Hindu yang berdiri kokoh di atas batu karang di tengah laut, menjadikannya pemandangan yang sangat ikonik.</p><p>Pantai berpasir cokelat keemasan ini membentang sepanjang sekitar 2 kilometer dengan deburan ombak yang cukup besar dari Samudra Hindia. Meski demikian, terdapat beberapa titik yang relatif aman untuk bermain air, terutama di sekitar muara sungai kecil yang mengalir membelah pantai.</p><p>"Balekambang adalah permata tersembunyi Malang yang masih perlu lebih banyak promosi," ujar Kepala Dinas Pariwisata Kabupaten Malang, Slamet Riyadi, kepada Klojen.com. Pemerintah daerah terus berbenah dengan menambah fasilitas penunjang seperti toilet umum, area parkir yang lebih luas, dan warung kuliner.</p><p>Untuk menuju Pantai Balekambang, pengunjung dapat menempuh perjalanan sekitar 65 kilometer dari pusat Kota Malang melalui Kepanjen. Akses jalan menuju pantai kini semakin baik dengan adanya perbaikan infrastruktur jalan yang dilakukan sepanjang tahun 2025.</p>`,
    tags: ['#PantaiBalekambang', '#WisataMalang', '#PantaiMalang', '#WisataAlamJatim'],
  },
  {
    id: '7',
    title: 'Cafe Baru di Kayutangan Tawarkan Sensasi Kopi Vintage',
    excerpt: 'Kawasan Kayutangan Heritage kembali diramaikan dengan hadirnya cafe baru bernuansa tempo dulu...',
    category: 'Kuliner',
    status: 'review' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    caption: 'Suasana klasik di cafe baru kawasan Kayutangan Heritage. (Foto: Klojen.com)',
    author: 'Rina Wijaya',
    content: `<p>Kawasan Kayutangan Heritage di Kota Malang kembali menjadi primadona bagi pecinta kopi dengan dibukanya sebuah cafe berkonsep vintage. Cafe bernama "Kopi Kenangan Masa" ini menawarkan pengalaman menikmati kopi lokal dengan suasana layaknya berada di tahun 1930-an.</p><p>Pemilik cafe merenovasi sebuah bangunan kolonial tanpa merubah fasad aslinya, hanya menambahkan furnitur antik dan pencahayaan hangat. Menu andalan mereka adalah Kopi Tubruk Nusantara dan Roti Bakar Kaya yang dibuat dengan resep warisan keluarga.</p>`,
    tags: ['#Kayutangan', '#KopiMalang', '#CafeMalang', '#Kuliner'],
  },
  {
    id: '4d',
    title: 'Hotel Tugu Malang, Pesona Sejarah dan Kemewahan yang Menyatu',
    excerpt: 'Menginap di Hotel Tugu Malang memberikan pengalaman layaknya berada di museum hidup dengan koleksi barang antik...',
    category: 'Hotel',
    status: 'review' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    caption: 'Suasana lobi Hotel Tugu Malang yang dipenuhi dengan koleksi barang antik bernilai sejarah tinggi. (Foto: Klojen.com)',
    author: 'Budi Santoso',
    publishedAt: '2026-05-30',
    content: `<p>Bagi wisatawan yang mencari pengalaman menginap unik dan tak terlupakan di Kota Malang, Hotel Tugu adalah jawabannya. Berlokasi strategis tepat di jantung kota, menghadap Monumen Tugu dan Balai Kota Malang, hotel bintang lima ini menawarkan lebih dari sekadar kemewahan.</p><p>Memasuki lobi Hotel Tugu layaknya melangkah ke masa lalu. Ribuan koleksi barang antik peninggalan sejarah dari berbagai penjuru Nusantara dan Asia dipamerkan dengan apik di setiap sudut hotel. "Kami ingin tamu tidak hanya sekadar menginap, tetapi juga merasakan dan mempelajari kekayaan budaya Indonesia," ungkap General Manager Hotel Tugu Malang.</p><p>Setiap kamar di Hotel Tugu didesain dengan tema yang berbeda-beda, terinspirasi dari tokoh-tokoh sejarah atau budaya tertentu. Fasilitas modern seperti kolam renang, spa tradisional, dan restoran dengan menu fine dining melengkapi kenyamanan para tamu.</p><p>Dengan perpaduan sempurna antara warisan sejarah, arsitektur kolonial yang indah, dan layanan kelas dunia, Hotel Tugu Malang tetap menjadi pilihan utama bagi wisatawan domestik maupun mancanegara yang mengutamakan kualitas dan pengalaman berkesan.</p>`,
    tags: ['#HotelTugu', '#HotelMalang', '#WisataSejarah', '#PenginapanMalang'],
  },
  {
    id: '5',
    title: 'Jatim Park 3 Dipadati Pengunjung Saat Libur Panjang',
    excerpt: 'Wahana wisata keluarga ...',
    category: 'Wisata',
    status: 'rejected',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80',
    caption: 'Ribuan pengunjung memadati kawasan Jatim Park 3 di Kota Batu saat libur panjang akhir Mei 2026.',
    content: `<p>Jatim Park 3 yang berlokasi di Kota Batu, Jawa Timur, kembali dipadati ribuan pengunjung selama libur panjang akhir Mei 2026.</p>`,
    author: 'Rizky Pratama',
    tags: ['#JatimPark', '#WisataBatu', '#LiburPanjang'],
    rejectionReason: 'Konten tidak sesuai dengan pedoman editorial. Judul kurang informatif dan isi berita perlu dilengkapi dengan data pendukung yang valid.',
  },
];

// Popular sidebar articles (static mock)
const POPULAR_ARTICLES = [
  {
    id: 'p1',
    title: 'Tahu Walik Cemilan Khas Malang yang Selalu Dicari',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&q=80',
    date: '26 Mei 2026',
  },
  {
    id: 'p2',
    title: 'Sempol Ayam, Jajanan Murah yang Bikin Nagih',
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=200&q=80',
    date: '26 Mei 2026',
  },
  {
    id: 'p3',
    title: 'Sego Sambel Cak Uut Pedesnya nampol!',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&q=80',
    date: '25 Mei 2026',
  },
  {
    id: 'p4',
    title: 'Bakso Bakar Malang Tetap Jadi Buruan Wisatawan',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&q=80',
    date: '25 Mei 2026',
  },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return dayjs().format('D MMMM YYYY, HH:mm[WIB]');
  return dayjs(dateStr).format('D MMMM YYYY');
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function PreviewBeritaPage({ params }: Props) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const article = MOCK_ARTICLES.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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

  const authorInitial = (article.author ?? 'J').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-white font-sans">



      {/* ── Main Content ────────────────────────────────────────────────────────── */}
      {article.status === 'scheduled' && article.publishedAt && (
        <div className="bg-blue-50 border-b border-blue-100 text-blue-700 py-3 px-4 text-center font-semibold text-sm flex items-center justify-center gap-2">
          <Calendar size={16} /> Akan dipublikasikan pada {dayjs(article.publishedAt).format('D MMMM YYYY, HH:mm')} WIB
        </div>
      )}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Article ───────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 border border-gray-200 bg-white p-6 md:p-10">

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>



            {/* Author Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
              {/* Source */}
              <div className="flex items-center gap-2.5 mr-auto">
                {/* Logo Klojen Placeholder (Like MalangPedia in image) */}
                <div className="w-6 h-6 bg-[#00A3FF] rounded-[5px] flex items-center justify-center shrink-0">
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                </div>
                <span className="font-extrabold text-gray-900 text-[15px] tracking-tight">Klojen.com</span>
              </div>

              {/* Writer & Editor Pill Box */}
              <div className="flex items-center rounded-[20px] border border-gray-200/80 px-1.5 py-1 bg-white shadow-sm">
                
                {/* Writer */}
                <div className="flex items-center gap-2.5 px-3 py-1">
                  <div className="w-7 h-7 rounded-full bg-blue-50 overflow-hidden shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${article.author ?? 'Jurnalis'}&background=fce7f3&color=be185d`} alt="Author" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-semibold leading-tight">Penulis</span>
                    <span className="text-[11px] font-extrabold text-gray-800 leading-tight my-[1px]">{article.author ?? 'Jurnalis'}</span>
                    <span className="text-[8px] text-gray-400 font-medium leading-tight">Redaksi klojen.com</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px h-7 bg-gray-200 mx-1"></div>

                {/* Editor */}
                <div className="flex items-center gap-2.5 px-3 py-1">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 overflow-hidden shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=Tim+Editor&background=e0f2fe&color=0369a1`} alt="Editor" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-semibold leading-tight">Editor</span>
                    <span className="text-[11px] font-extrabold text-gray-800 leading-tight my-[1px]">Tim Editor</span>
                    <span className="text-[8px] text-gray-400 font-medium leading-tight">Redaksi klojen.com</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Featured Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-auto rounded-lg mb-3 object-cover max-h-[460px]"
            />
            {article.caption ? (
              <p className="text-sm text-gray-400 mb-8">{article.caption}</p>
            ) : (
              <p className="text-sm text-gray-400 mb-8">
                {article.title}. (Foto: Klojen.com)
              </p>
            )}

            {/* Content */}
            {article.content ? (
              <div
                className="text-gray-800 leading-relaxed space-y-6 mb-10 text-base md:text-lg"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-10 text-center mb-10">
                <p className="text-gray-400 text-sm">Konten artikel belum tersedia.</p>
              </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-3 mb-8">
                <span className="text-gray-400 text-sm mr-2">Tag :</span>
                {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-sm hover:bg-gray-300 cursor-pointer transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
              </div>
            )}

            {/* Share */}
            <div className="flex items-center space-x-4 mb-10 pb-8 border-b border-gray-200">
              <span className="text-gray-400 text-sm">Bagikan Artikel ini :</span>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <button className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:opacity-80 transition-opacity">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                {/* Twitter/X */}
                <button className="w-8 h-8 rounded-full bg-sky-400 flex items-center justify-center hover:opacity-80 transition-opacity">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.766l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
                {/* WhatsApp */}
                <button className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center hover:opacity-80 transition-opacity">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </button>
                    {/* Copy Link */}
                    <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:opacity-80 transition-opacity">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </button>
                  </div>
                </div>


              </div>

              {/* ── Right: Sidebar ──────────────────────────────────────────────────── */}
              <div className="lg:col-span-1">
                <div className="border border-gray-200 bg-white p-6 rounded-xl sticky top-16">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wide">
                    TERPOPULER MINGGU INI
                  </h2>

                  <div className="space-y-6">
                    {POPULAR_ARTICLES.map((item, index) => (
                      <a
                        key={item.id}
                        href="#"
                        className={`flex space-x-4 items-start hover:opacity-80 transition-opacity group ${
                          index < POPULAR_ARTICLES.length - 1 ? 'pb-6 border-b border-gray-100' : ''
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-28 h-20 object-cover rounded-lg shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-400">{item.date}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ── Footer ─────────────────────────────────────────────────────────────── */}
          <footer className="bg-[#0f172a] text-white pt-16 pb-12 mt-12">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

              {/* Brand */}
              <div>
                <div className="flex items-center space-x-2 mb-8">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-sm">K</span>
                  </div>
                  <span className="font-bold text-2xl">Klojen</span>
                </div>
                <p className="text-slate-400 mb-4">Connect With Us</p>
                <div className="flex space-x-4 mb-8">
                  {['TikTok', 'IG', 'FB', 'TW'].map((s) => (
                    <a key={s} href="#" className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors">
                      <span className="text-white text-xs font-bold">{s.charAt(0)}</span>
                    </a>
                  ))}
                </div>
                <p className="text-slate-400 text-sm">Media Kolaborasi Indonesia</p>
                <p className="text-slate-400 text-sm mt-2">
                  &copy; 2026 PT. Ketik Media Siber All Rights Reserved.
                </p>
              </div>

              {/* Kategori */}
              <div>
                <h4 className="text-emerald-500 font-bold mb-6 tracking-wider">KATEGORI</h4>
                <ul className="space-y-4">
                  {['Kuliner', 'Wisata', 'Pendidikan', 'Hotel'].map((cat) => (
                    <li key={cat}>
                      <a href="#" className="text-white hover:text-emerald-400 transition-colors">{cat}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Informasi */}
              <div>
                <h4 className="text-emerald-500 font-bold mb-6 tracking-wider">INFORMASI</h4>
                <ul className="space-y-4">
                  {['Redaksi', 'Tentang Kami', 'Verifikasi Dewan Pers', 'Pedoman Media Siber dan Kode Perilaku'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-white hover:text-emerald-400 transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-emerald-500 font-bold mb-6 tracking-wider opacity-0 hidden lg:block">LINKS</h4>
                <ul className="space-y-4">
                  {['Disclaimer', 'Privacy & Policy', 'Terms of Service', 'Karier'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-white hover:text-emerald-400 transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </footer>

        </div>
      );
    }

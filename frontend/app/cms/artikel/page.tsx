'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  CheckCircle2,
  Clock,
  CloudUpload,
  XCircle,
  Tag,
  Trash2,
  X,
  RefreshCw,
  UserCircle2,
  Calendar,
} from 'lucide-react';
import { getCmsArticles } from '@/lib/api/articles';

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
  lockedBy?: string;
  publishedAt?: string;
}

const MOCK_ARTICLES: MockArticleItem[] = [
  {
    id: '1',
    title: 'Wisata Gunung Bromo Via Malang Semakin Diminati Wisatawan',
    excerpt: 'Jumlah kunjungan wisatawa...',
    category: 'Wisata',
    status: 'published' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=200&q=80',
  },
  {
    id: '2',
    title: 'SMA di Malang Terapkan Kelas Digital Mulai Semester Ini',
    excerpt: 'Sekolah mulai menerapkan...',
    category: 'Pendidikan',
    status: 'published' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200&q=80',
  },
  {
    id: '3',
    title: 'Hotel Baru Dekat Alun-Alun Malang Resmi Dibuka',
    excerpt: 'Hotel dengan konsep modern ini menawarkan lokasi di pusat...',
    category: 'Hotel',
    status: 'draft' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    caption: 'Fasad bangunan hotel baru berkonsep modern minimalis yang berlokasi strategis di dekat kawasan Alun-Alun Kota Malang. (Foto: Klojen.com)',
    author: 'Budi Santoso',
    content: `<p>Sebuah hotel baru dengan konsep modern dan minimalis resmi dibuka di kawasan strategis dekat Alun-Alun Kota Malang. Kehadiran hotel ini diharapkan dapat memenuhi tingginya permintaan akomodasi wisata di pusat kota, terutama saat musim liburan tiba.</p>
<p>Hotel berlantai 12 ini menawarkan 150 kamar dengan berbagai tipe, mulai dari Standard, Deluxe, hingga Premium Suite. Setiap kamar dilengkapi dengan fasilitas modern berstandar internasional, termasuk koneksi internet berkecepatan tinggi, smart TV, dan area kerja yang ergonomis.</p>
<p>Keunggulan utama hotel ini adalah lokasinya yang sangat strategis. Hanya berjarak 200 meter dari Alun-Alun Kota Malang, tamu dapat dengan mudah menjangkau berbagai pusat kuliner legendaris, kawasan pecinan, dan sentra perbelanjaan legendaris di Kota Malang hanya dengan berjalan kaki.</p>
<p>"Kami membidik segmen keluarga dan business traveler yang membutuhkan penginapan berkualitas di pusat kota dengan akses mudah ke mana-mana," ujar Manajer Operasional Hotel, Budi Santoso saat acara soft opening, Rabu (27/5/2026).</p>
<p>Selama masa promosi pembukaan, manajemen memberikan diskon tarif kamar hingga 30 persen bagi tamu yang memesan melalui aplikasi atau website resmi mereka. Promosi ini berlaku hingga akhir bulan depan.</p>`,
  },
  {
    id: '3b',
    title: 'Festival Kuliner Malang 2026 Hadirkan 200 Stand Makanan',
    excerpt: 'Festival kuliner tahunan Kota Malang kembali digelar dengan skala lebih besar...',
    category: 'Kuliner',
    status: 'draft' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    caption: 'Suasana meriah Festival Kuliner Malang 2026 di area Alun-Alun Kota. (Foto: Klojen.com)',
    author: 'Siti Rahayu',
    content: `<p>Festival Kuliner Malang 2026 resmi dibuka pada Sabtu, 25 Mei 2026, di kawasan Alun-Alun Kota Malang. Festival tahunan yang sudah memasuki tahun ke-8 ini menghadirkan lebih dari 200 stand makanan dari berbagai penjuru Jawa Timur.</p><p>Berbagai sajian kuliner khas Malang tersedia, mulai dari bakso legendaris, cwie mie, tahu campur, hingga jajanan kekinian yang tengah viral di media sosial. Ribuan pengunjung memadati arena festival sejak pintu dibuka pukul 10.00 WIB.</p><p>"Tahun ini kami menargetkan 50.000 pengunjung selama tiga hari penyelenggaraan," ujar Ketua Panitia Festival, Budi Hartono, saat pembukaan. Festival berlangsung hingga 27 Mei 2026 dengan berbagai pertunjukan seni budaya sebagai hiburan tambahan.</p>`,
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
    content: `<p>Bakso President yang berlokasi di Jalan Batanghari No. 5, Kota Malang, semakin populer di kalangan wisatawan yang berkunjung ke kota ini. Warung bakso legendaris yang telah berdiri sejak tahun 1977 ini selalu ramai dikunjungi, bahkan pada hari kerja sekalipun.</p><p>Ciri khas Bakso President adalah ukuran baksonya yang jumbo, hampir seukuran kepalan tangan orang dewasa. Daging sapi segar berkualitas tinggi dipilih setiap hari untuk menjaga cita rasa yang konsisten. Harga yang ditawarkan pun terjangkau, mulai dari Rp 25.000 hingga Rp 45.000 per porsi.</p><p>"Kami tidak berubah sejak tahun 1977. Resep yang sama, kualitas yang sama," ujar Hendra, cucu pendiri Bakso President, saat ditemui Klojen.com. "Itulah mengapa pelanggan kami selalu kembali."</p><p>Pada akhir pekan, antrean pengunjung bisa mencapai 30 menit. Bakso President kini juga menyediakan layanan pemesanan online untuk mengakomodasi pelanggan yang tidak ingin mengantri.</p>`,
    tags: ['#BaksoPresident', '#KulinerMalang', '#WisataKuliner', '#BaksoMalang'],
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
    content: `<p>Pantai Balekambang yang terletak di Kecamatan Bantur, Kabupaten Malang, menyimpan pesona alam yang tak kalah memukau dengan pantai-pantai terkenal di Pulau Bali. Keunikan utama pantai ini adalah keberadaan pura Hindu yang berdiri kokoh di atas batu karang di tengah laut, menjadikannya pemandangan yang sangat ikonik.</p><p>Pantai berpasir cokelat keemasan ini membentang sepanjang sekitar 2 kilometer dengan deburan ombak yang cukup besar dari Samudra Hindia. Meski demikian, terdapat beberapa titik yang relatif aman untuk bermain air, terutama di sekitar muara sungai kecil yang mengalir membelah pantai.</p><p>"Balekambang adalah permata tersembunyi Malang yang masih perlu lebih banyak promosi," ujar Kepala Dinas Pariwisata Kabupaten Malang, Slamet Riyadi, kepada Klojen.com. Pemerintah daerah terus berbenah dengan menambah fasilitas penunjang seperti toilet umum, area parkir yang lebih luas, dan warung kuliner.</p><p>Untuk menuju Pantai Balekambang, pengunjung dapat menempuh perjalanan sekitar 65 kilometer dari pusat Kota Malang melalui Kepanjen. Akses jalan menuju pantai kini semakin baik dengan adanya perbaikan infrastruktur jalan yang dilakukan sepanjang tahun 2025.</p>`,
    tags: ['#PantaiBalekambang', '#WisataMalang', '#PantaiMalang', '#WisataAlamJatim'],
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
    content: `<p>Bagi wisatawan yang mencari pengalaman menginap unik dan tak terlupakan di Kota Malang, Hotel Tugu adalah jawabannya. Berlokasi strategis tepat di jantung kota, menghadap Monumen Tugu dan Balai Kota Malang, hotel bintang lima ini menawarkan lebih dari sekadar kemewahan.</p><p>Memasuki lobi Hotel Tugu layaknya melangkah ke masa lalu. Ribuan koleksi barang antik peninggalan sejarah dari berbagai penjuru Nusantara dan Asia dipamerkan dengan apik di setiap sudut hotel. "Kami ingin tamu tidak hanya sekadar menginap, tetapi juga merasakan dan mempelajari kekayaan budaya Indonesia," ungkap General Manager Hotel Tugu Malang.</p><p>Setiap kamar di Hotel Tugu didesain dengan tema yang berbeda-beda, terinspirasi dari tokoh-tokoh sejarah atau budaya tertentu. Fasilitas modern seperti kolam renang, spa tradisional, dan restoran dengan menu fine dining melengkapi kenyamanan para tamu.</p><p>Dengan perpaduan sempurna antara warisan sejarah, arsitektur kolonial yang indah, dan layanan kelas dunia, Hotel Tugu Malang tetap menjadi pilihan utama bagi wisatawan domestik maupun mancanegara yang mengutamakan kualitas dan pengalaman berkesan.</p>`,
    tags: ['#HotelTugu', '#HotelMalang', '#WisataSejarah', '#PenginapanMalang'],
  },
  {
    id: '4b',
    title: 'Sate Gabug, Sensasi Sate Khas Malang yang Unik',
    excerpt: 'Sajian sate dengan bumbu kacang gurih khas Kota Malang yang wajib dicoba wisatawan...',
    category: 'Kuliner',
    status: 'on_progress' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=200&q=80',
    lockedBy: 'Farel Alfara',
  },
  {
    id: '5',
    title: 'Jatim Park 3 Dipadati Pengunjung Saat Libur Panjang',
    excerpt: 'Wahana wisata keluarga ...',
    category: 'Wisata',
    status: 'rejected' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80',
    caption: 'Ribuan pengunjung memadati kawasan Jatim Park 3 di Kota Batu saat libur panjang akhir Mei 2026. (Foto: Dokumentasi Jatim Park Group)',
    content: `Jatim Park 3 yang berlokasi di Kota Batu, Jawa Timur, kembali dipadati ribuan pengunjung selama libur panjang akhir Mei 2026. Wahana wisata keluarga ini menjadi salah satu destinasi favorit warga Jawa Timur dan sekitarnya untuk menghabiskan waktu liburan bersama keluarga.

Pada hari puncak libur, Sabtu (24/5/2026), manajemen Jatim Park 3 mencatat lebih dari 8.000 pengunjung yang memasuki kawasan wisata. Angka ini merupakan salah satu rekor kunjungan tertinggi sepanjang tahun 2026.

"Kami menyiapkan operasional ekstra dengan menambah staf dan memperpanjang jam operasional hingga pukul 20.00 WIB selama periode libur," ujar Humas Jatim Park Group, Arini Setyawati, Sabtu (24/5/2026).

Berbagai wahana baru yang diluncurkan awal tahun ini turut menjadi daya tarik tambahan, termasuk roller coaster tipe baru dan area bermain air untuk anak-anak. Pengunjung juga dapat menikmati pertunjukan seni budaya Jawa Timur yang digelar setiap hari pukul 16.00 WIB.

Untuk menghindari kepadatan, manajemen mengimbau pengunjung untuk memesan tiket secara online dan memilih jadwal kunjungan pada hari kerja. Harga tiket masuk berkisar antara Rp 60.000 hingga Rp 120.000 tergantung jenis wahana yang dipilih.`,
    tags: ['#JatimPark', '#WisataBatu', '#LiburPanjang', '#Keluarga'],
    rejectionReason: 'Konten tidak sesuai dengan pedoman editorial. Judul kurang informatif dan isi berita perlu dilengkapi dengan data pendukung yang valid.',
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
    id: '6',
    title: 'Acara Puncak Malang Night Run 2026 Siap Digelar',
    excerpt: 'Ribuan pelari dari berbagai kota siap meramaikan event lari malam hari...',
    category: 'Wisata',
    status: 'scheduled' as ArticleStatus,
    image: 'https://images.unsplash.com/photo-1502224562085-639556652f33?w=800&q=80',
    caption: 'Ilustrasi peserta lari pada malam hari. (Foto: Unsplash)',
    author: 'Farel Alfara',
    publishedAt: '2026-06-15 19:00',
    content: `<p>Ajang lari malam hari "Malang Night Run 2026" siap digelar pada akhir pekan ini. Diperkirakan lebih dari 5.000 pelari dari berbagai kota akan meramaikan acara tahunan yang melintasi ikon-ikon sejarah Kota Malang.</p><p>Rute sepanjang 10 kilometer telah disiapkan, dimulai dari Balai Kota Malang dan berakhir di kawasan Ijen Boulevard.</p>`,
    tags: ['#MalangNightRun', '#EventMalang', '#LariMalam'],
  },
];

const CATEGORIES = ['Semua Kategori', 'Wisata', 'Pendidikan', 'Kuliner', 'Hotel'];

type StatusKey = ArticleStatus | 'semua';

const STATUS_TABS: { label: string; value: StatusKey; countKey: string }[] = [
  { label: 'Semua',        value: 'semua',       countKey: 'semua'       },
  { label: 'Dipublikasi',  value: 'published',   countKey: 'published'   },
  { label: 'Terjadwal',    value: 'scheduled',   countKey: 'scheduled'   },
  { label: 'Draft',        value: 'draft',       countKey: 'draft'       },
  { label: 'Review',       value: 'review',      countKey: 'review'      },
  { label: 'On Progress',  value: 'on_progress', countKey: 'on_progress' },
  { label: 'Ditolak',      value: 'rejected',    countKey: 'rejected'    },
];

const CATEGORY_BADGE: Record<string, string> = {
  Wisata:     'bg-blue-100 text-blue-500',
  Pendidikan: 'bg-yellow-100/80 text-yellow-600',
  Hotel:      'bg-purple-100/80 text-purple-400',
  Kuliner:    'bg-green-100/80 text-green-500',
};

function StatusBadge({ status }: { status: ArticleStatus }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A85A32]">
        Dipublikasi
        <CheckCircle2 size={14} className="text-[#A85A32]" />
      </span>
    );
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#20B2AA]">
        Draft
        <Clock size={14} className="text-[#20B2AA]" />
      </span>
    );
  }
  if (status === 'review') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6A5ACD]">
        Review
        <Clock size={14} className="text-[#6A5ACD]" />
      </span>
    );
  }
  if (status === 'on_progress') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706]">
        On Progress
        <RefreshCw size={14} className="text-[#D97706] animate-spin" />
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DC143C]">
        Ditolak
        <XCircle size={14} className="text-[#DC143C]" />
      </span>
    );
  }
  if (status === 'scheduled') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
        Terjadwal
        <Calendar size={14} className="text-blue-600" />
      </span>
    );
  }
  return null;
}

const ITEMS_PER_PAGE = 3;

// ─── Main Page ─────────────────────────────────────────────────────────────────

// ─── Main Content ────────────────────────────────────────────────────────────────

function BankBeritaContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  
  const { user } = useAuthStore();
  const role = user?.role;

  const [articles, setArticles] = useState<MockArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [activeStatus, setActiveStatus] = useState<StatusKey>('semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  // Jika query param 'q' berubah dari Topbar, update state search
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);

  useEffect(() => {
    if (role === 'editor') {
      setActiveStatus('review');
    }
  }, [role]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const res = await getCmsArticles();
        const apiData = res.data.data;
        
        // Map API data to frontend format
        let mappedArticles: MockArticleItem[] = apiData.map((item: any) => ({
          id: item.id,
          title: item.title,
          excerpt: item.excerpt || (item.content ? item.content.replace(/<[^>]+>/g, '').substring(0, 60) + '...' : ''),
          category: item.category_name || 'Uncategorized',
          status: item.status as ArticleStatus,
          image: item.featured_image_url || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80',
          caption: '',
          content: item.content,
          tags: item.tags || [],
          author: item.author_name || 'Jurnalis',
          publishedAt: item.published_at,
        }));

        // Apply local overrides for UI mock testing (if any)
        const onProgressRaw = localStorage.getItem('mock_on_progress_ids');
        if (onProgressRaw) {
          try {
            const overrides = JSON.parse(onProgressRaw);
            mappedArticles = mappedArticles.map(a => {
              const found = overrides.find((o: any) => o.id === a.id);
              if (found) {
                return { ...a, status: 'on_progress', lockedBy: found.lockedBy };
              }
              return a;
            });
          } catch (e) {
            console.error('Failed to parse mock on_progress overrides', e);
          }
        }

        const statusOverrideRaw = localStorage.getItem('mock_status_overrides');
        if (statusOverrideRaw) {
          try {
            const overrides = JSON.parse(statusOverrideRaw);
            mappedArticles = mappedArticles.map(a => {
              if (overrides[a.id]) {
                const over = overrides[a.id];
                if (typeof over === 'string') {
                  return { ...a, status: over as ArticleStatus };
                } else {
                  return { 
                    ...a, 
                    status: over.status, 
                    rejectionReason: over.reason || a.rejectionReason 
                  };
                }
              }
              return a;
            });
          } catch (e) {
            console.error('Failed to parse mock status overrides', e);
          }
        }

        setArticles(mappedArticles);
      } catch (err) {
        console.error("Gagal mengambil data artikel:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Reset halaman ke 1 setiap kali filter berubah agar pencarian berlaku di semua data
  useEffect(() => { setPage(1); }, [search, activeStatus, selectedCategory]);

  // Hitung jumlah dinamis dari data yang ada (tanpa filter search/kategori, hanya per status)
  const dynamicCounts = useMemo(() => {
    const counts: Record<string, number> = {
      semua: articles.length,
      published: 0,
      draft: 0,
      review: 0,
      on_progress: 0,
      rejected: 0,
      scheduled: 0,
    };
    articles.forEach((a) => {
      if (a.status in counts) counts[a.status]++;
    });
    return counts;
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchStatus = activeStatus === 'semua' || a.status === activeStatus;
      const matchCat =
        selectedCategory === 'Semua Kategori' || a.category === selectedCategory;
      return matchSearch && matchStatus && matchCat;
    });
  }, [articles, search, activeStatus, selectedCategory]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const startItem = totalItems === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, totalItems);

  const changePage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <div className="min-h-full pb-16 bg-white rounded-tl-3xl p-6 sm:p-8">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
          <RefreshCw className="animate-spin text-blue-500 w-10 h-10" />
        </div>
      )}
      
      {/* ─── Filter Section ─── */}
      <div className="border border-gray-200 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative flex-1 max-w-2xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Berdasarkan Caption atau Kategori.."
              className="w-full pl-6 pr-12 py-3 rounded-full border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none text-sm text-gray-600 placeholder-gray-400"
            />
            <Search size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500" />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-2 px-4 py-3 rounded-full border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Tag size={14} className="text-blue-500" />
                <span>{selectedCategory}</span>
                <ChevronDown size={14} className="text-blue-500 ml-1" />
              </button>
              {categoryOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setCategoryOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tambah Berita */}
            <Link
              href="/cms/tulis-berita"
              className="flex items-center gap-1.5 px-5 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Plus size={14} />
              Tambah Berita
            </Link>
          </div>

        </div>
      </div>

      {/* ─── Table Section ─── */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
        
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-4 sm:p-5 border-b border-gray-200">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.value;
            const count = dynamicCounts[tab.countKey] ?? 0;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-bold transition-all
                  ${isActive ? 'bg-gray-200 text-gray-800' : 'bg-transparent text-gray-500 hover:bg-gray-100'}
                `}
              >
                {tab.label}
                <span className={isActive ? 'text-blue-600' : 'text-blue-500'}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="pb-4 text-center text-xs font-bold text-gray-400 w-1/2">Judul Berita</th>
                <th className="pb-4 text-center text-xs font-bold text-gray-400 w-[15%]">Kategori</th>
                <th className="pb-4 text-center text-xs font-bold text-gray-400 w-[20%]">Status</th>
                <th className="pb-4 text-center text-xs font-bold text-gray-400 w-[15%]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((article, idx) => (
                <tr key={article.id} className={idx !== paginated.length - 1 ? "border-b border-gray-100" : ""}>
                  {/* Judul Berita */}
                  <td className="py-5">
                    <div className="flex items-start gap-4 pr-4">
                      <img
                        src={article.image}
                        alt="Thumbnail"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80'; }}
                        className="w-28 h-20 object-cover rounded-md border border-gray-100 shrink-0"
                      />
                      <div className="flex flex-col pt-1">
                        <span className="text-sm font-extrabold text-gray-800 leading-snug">
                          {article.title}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-400 mt-1">
                          {article.excerpt}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Kategori */}
                  <td className="py-5 text-center">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-[11px] font-extrabold ${CATEGORY_BADGE[article.category] || 'bg-gray-100 text-gray-500'}`}>
                      {article.category}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-5 text-center">
                    <StatusBadge status={article.status} />
                  </td>

                  {/* Aksi */}
                  <td className="py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      
                      {article.status === 'draft' && (
                        <>
                          <button
                            onClick={() => setArticleToDelete(article.id)}
                            title="Hapus draft"
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={20} strokeWidth={2.5} />
                          </button>
                          <Link
                            href={`/cms/tulis-berita?id=${article.id}`}
                            title="Edit draft"
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            <Edit3 size={20} strokeWidth={2.5} />
                          </Link>
                        </>
                      )}

                      {article.status === 'rejected' && (
                        <Link
                          href={`/cms/tulis-berita?id=${article.id}&rejected=true&reason=${encodeURIComponent(article.rejectionReason ?? '')}`}
                          title="Edit berita"
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Edit3 size={20} strokeWidth={2.5} />
                        </Link>
                      )}

                      {article.status === 'review' && (
                        <Link
                          href={`/cms/tulis-berita?id=${article.id}`}
                          title="Edit berita"
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Edit3 size={20} strokeWidth={2.5} />
                        </Link>
                      )}

                      {article.status === 'on_progress' && article.lockedBy && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap">
                          <UserCircle2 size={14} className="text-gray-400" />
                          <span>Diedit oleh {article.lockedBy}</span>
                        </div>
                      )}

                      {article.status === 'published' && (
                        <Link
                          href={`/cms/artikel/${article.id}/preview`}
                          title="Preview berita"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye size={22} strokeWidth={2.5} />
                        </Link>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] font-bold text-gray-400">
            Menampilkan {startItem}–{endItem} dari {totalItems} slide
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-blue-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => changePage(p)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  p === page
                    ? 'bg-gray-200 text-gray-600'
                    : 'border border-gray-200 text-blue-500 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-blue-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setArticleToDelete(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <div className="mt-8 mb-8 text-center px-4">
              <h3 className="text-[18px] font-bold text-[#2A3752] leading-snug">
                Apakah Anda Yakin Ingin<br />Menghapus?
              </h3>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setArticles((prev) => prev.filter((a) => a.id !== articleToDelete));
                  setArticleToDelete(null);
                }}
                className="w-24 py-2.5 rounded-lg bg-[#5DD672] text-white font-bold hover:bg-[#4bc760] transition-colors"
              >
                Ya
              </button>
              <button
                onClick={() => setArticleToDelete(null)}
                className="w-24 py-2.5 rounded-lg bg-[#E36666] text-white font-bold hover:bg-[#d65555] transition-colors"
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function BankBeritaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat...</div>}>
      <BankBeritaContent />
    </Suspense>
  );
}

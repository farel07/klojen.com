import Link from "next/link";

export default function Home() {
  // 1. DATA DUMMY (Siap diganti dengan data dari API Laravel nanti)
  const popularNews = [
    { id: 1, title: "5 Wisata Alam di Malang Raya yang Wajib Dikunjungi", date: "25 Mei 2026", time: "13.50", img: "" },
    { id: 2, title: "Kuliner Khas Malang yang Menggugah Selera Wisatawan", date: "25 Mei 2026", time: "13.50", img: "" },
    { id: 3, title: "10 Hotel Nyaman di Malang dengan View Pegunungan", date: "25 Mei 2026", time: "13.50", img: "" },
    { id: 4, title: "Dunia Pendidikan Malang Fokus pada Teknologi dan Kreativitas Siswa", date: "25 Mei 2026", time: "13.50", img: "" },
  ];

  const latestNews = [
    { id: 1, title: "Tumpak Sewu, Destinasi Alam di Malang", category: "WISATA", color: "bg-emerald-500", img: "" },
    { id: 2, title: "Rawon Legendaris Malang yang Wajib Dicoba Saat Musim Hujan", category: "KULINER", color: "bg-orange-500", img: "" },
    { id: 3, title: "5 Kampus Favorit di Malang dengan Lingkungan Belajar Nyaman", category: "PENDIDIKAN", color: "bg-blue-500", img: "" },
    { id: 4, title: "Rekomendasi Hotel Nyaman di Tengah Kota Malang", category: "HOTEL", color: "bg-violet-500", img: "" },
  ];

  const categories = [
    { id: 1, name: "Kuliner", desc: "Temukan berbagai cita rasa khas Malang yang menggugah selera.", img: "" },
    { id: 2, name: "Wisata", desc: "Jelajahi destinasi wisata terbaik di Malang.", img: "" },
    { id: 3, name: "Pendidikan", desc: "Informasi sekolah, kampus, dan pendidikan terbaik.", img: "" },
    { id: 4, name: "Hotel", desc: "Temukan hotel nyaman untuk pengalaman menginap terbaik.", img: "" },
  ];

  const readNow = [
    { id: 1, title: "Alun-Alun Malang, Ikon Kota yang Selalu Ramai", desc: "Tempat favorit warga untuk bersantai, kuliner malam, dan menikmati suasana kota.", img: "" },
    { id: 2, title: "Alun-Alun Malang, Ikon Kota yang Selalu Ramai", desc: "Tempat favorit warga untuk bersantai, kuliner malam, dan menikmati suasana kota.", img: "" },
    { id: 3, title: "Kampung Warna-Warni Jodipan yang Instagramable", desc: "Destinasi wisata penuh warna yang cocok untuk berburu foto estetik.", img: "" },
    { id: 4, title: "Kampung Warna-Warni Jodipan yang Instagramable", desc: "Destinasi wisata penuh warna yang cocok untuk berburu foto estetik.", img: "" },
    { id: 5, title: "Kayutangan Heritage, Menelusuri Sejarah Kota Malang", desc: "Kawasan bersejarah dengan bangunan klasik dan suasana tempo dulu yang menarik.", img: "" },
    { id: 6, title: "Kayutangan Heritage, Menelusuri Sejarah Kota Malang", desc: "Kawasan bersejarah dengan bangunan klasik dan suasana tempo dulu yang menarik.", img: "" },
  ];

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Featured */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden h-[400px] lg:h-[500px] group cursor-pointer bg-gray-200">
            <img src={""} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Featured" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white w-full md:w-4/5">
              <span className="bg-emerald-500 text-white text-[10px] tracking-wider font-bold px-3 py-1.5 rounded-full mb-4 inline-block">WISATA</span>
              <h2 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">Air Terjun Coban Rondo, Keindahan Alam di Malang yang Memikat</h2>
              <p className="text-gray-200 text-sm md:text-base line-clamp-2">Nikmati kesejukan alam dan panorama eksotis Air Terjun Coban Rondo yang cocok untuk liburan keluarga maupun healing akhir pekan.</p>
            </div>
          </div>

          {/* Popular List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <h3 className="font-bold text-lg text-gray-900 mb-6">TERPOPULER MINGGU INI</h3>
            <div className="space-y-6 flex-1">
              {popularNews.map((news) => (
                <div key={news.id} className="flex gap-4 group cursor-pointer">
                  <div className="w-28 h-20 shrink-0 overflow-hidden rounded-xl bg-gray-200">
                    <img src={news.img} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt={news.title} />
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{news.title}</h4>
                    <div className="text-[11px] text-gray-400 flex items-center gap-3">
                      <span>{news.date}</span>
                      <span>{news.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LATEST NEWS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-10 border-t border-gray-100 mt-4">
        <h3 className="font-bold text-xl text-gray-900 mb-8">BERITA TERBARU</h3>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestNews.map((news) => (
              <div key={news.id} className="group cursor-pointer flex flex-col">
                <div className="relative rounded-2xl overflow-hidden mb-4 h-48 shadow-sm bg-gray-200">
                  <img src={news.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={news.title} />
                  <span className={`absolute top-3 left-3 ${news.color} text-white text-[10px] tracking-wider font-bold px-3 py-1 rounded-full`}>{news.category}</span>
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">{news.title}</h4>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full overflow-hidden"><img src={""} alt="Author" /></div>
                    <span className="font-semibold text-gray-900">Klojen</span>
                  </div>
                  <div className="flex gap-2">
                    <span>25 Mei 2026</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weather Widget */}
          <div className="lg:col-span-1 bg-blue-500/80 rounded-2xl p-6 text-center text-gray-900 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="relative z-10 h-full flex flex-col">
              <h4 className="font-semibold text-sm mb-6 text-white">Cuaca Malang Hari ini</h4>
              <div className="flex items-center justify-center gap-4 mb-8 flex-1 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><img src={""} alt="Weather" /></div>
                <div className="text-left">
                  <div className="text-4xl font-bold tracking-tighter">24° C</div>
                  <div className="text-sm font-medium mt-1">Cerah Berawan</div>
                </div>
              </div>
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center text-[10px] font-medium text-white">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="opacity-80">Kelembapan</span>
                  <span className="font-bold">60%</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="opacity-80">Angin</span>
                  <span className="font-bold">12 km/j</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-10 border-t border-gray-100 mt-4">
        <h3 className="font-bold text-xl text-gray-900 mb-8">KATEGORI BERITA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="relative rounded-2xl overflow-hidden h-[280px] group cursor-pointer shadow-sm bg-gray-800">
              <img src={cat.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={cat.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-300"></div>
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="flex justify-end">
                  <button className="border border-white/60 text-white text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/20 backdrop-blur-sm transition-all">
                    Lihat Semua &rarr;
                  </button>
                </div>
                <div className="text-white transform transition-transform duration-300 group-hover:-translate-y-2">
                  <h4 className="text-3xl font-bold mb-3">{cat.name}</h4>
                  <p className="text-sm text-gray-200 max-w-md line-clamp-2">{cat.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* READ NOW SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-10 border-t border-gray-100 mt-4 mb-12">
        <h3 className="font-bold text-xl text-gray-900 mb-8">BACA SEKARANG</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
          {readNow.map((item) => (
            <div key={item.id} className="flex gap-6 group cursor-pointer items-center">
              <div className="w-40 h-28 shrink-0 overflow-hidden rounded-xl shadow-sm bg-gray-200">
                <img src={item.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.title} />
              </div>
              <div>
                <h4 className="font-bold text-[15px] text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">{item.title}</h4>
                <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
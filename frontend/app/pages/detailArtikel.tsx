import Link from "next/link";

export default function DetailArtikel() {
  // --- DATA DUMMY UNTUK OTOMATISASI KOMPONEN --- //
  
  const tags = ["#Sate Gabug", "#Kuliner Malang", "#Kuliner Khas Malang", "#Kuliner Legendaris"];

  const popularNews = [
    { id: 1, title: "Tahu Walik Cemilan Khas Malang yang Selalu Dicari", date: "26 Mei 2026", img: "" },
    { id: 2, title: "Sempol Ayam, Jajanan Murah yang Bikin Nagih", date: "26 Mei 2026", img: "" },
    { id: 3, title: "Sego Sambel Cak Uut Pedesnya nampol!", date: "25 Mei 2026", img: "" },
    { id: 4, title: "Bakso Bakar Malang Tetap Jadi Buruan Wisatawan", date: "25 Mei 2026", img: "" },
  ];

  const comments = [
    {
      id: 1,
      name: "Budi Santoso",
      datetime: "26 Mei 2026, 10.39",
      text: "Sate Gabug ini memang juara! Dagingnya empuk bumbu kacangnya juara.",
      avatar: "",
    },
    {
      id: 2,
      name: "Siti Nurhalizah",
      datetime: "27 Mei 2026, 13.05",
      text: "Wajib cobain kalau ke malang! Sambelnya nagih.",
      avatar: "",
    },
  ];

  return (
    <div className="w-full bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMBS */}
        <nav className="flex items-center text-sm text-gray-500 mb-8 space-x-2 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-gray-900 transition-colors">Beranda</Link>
          <span className="text-gray-400">/</span>
          <Link href="/kategori/kuliner" className="hover:text-gray-900 transition-colors">Kuliner</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium truncate">Bakso malang kuliner legendaris yang jadi favorit</span>
        </nav>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: MAIN ARTICLE */}
          <article className="lg:col-span-2 border border-gray-200 rounded-3xl p-6 md:p-10 bg-white">
            
            {/* Article Meta */}
            <div className="flex justify-between items-center mb-6">
              <time className="text-gray-500 text-sm font-medium">26 Mei 2026</time>
              <button className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-5 py-2 flex items-center space-x-2 transition-colors">
                {/* Icon Bookmark/Save */}
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span className="text-sm font-semibold text-gray-800">Simpan</span>
              </button>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-gray-900 mb-6 leading-tight">
              Sate Gabug, Sensasi Sate Khas Malang yang Unik
            </h1>

            {/* Author */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                <img src={""} alt="Author Avatar" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-gray-900">MalangPedia</span>
            </div>

            {/* Featured Image */}
            <figure className="mb-8">
              <div className="w-full h-[300px] md:h-[450px] bg-gray-200 rounded-2xl overflow-hidden">
                <img src={""} alt="Sate Gabug" className="w-full h-full object-cover" />
              </div>
              <figcaption className="text-sm text-gray-500 italic mt-4 text-center">
                Daging empuk dengan bumbu kacang gurih dan sambal khas.
              </figcaption>
            </figure>

            {/* Article Body */}
            <div className="text-gray-800 space-y-6 leading-relaxed text-lg mb-10">
              <p>
                Sate Gabug merupakan salah satu kuliner khas Malang yang punya cita rasa unik dan menggugah selera. 
                Hidangan ini terkenal dengan potongan dagingnya yang empuk serta bumbu kacang gurih yang meresap sempurna hingga ke dalam daging.
              </p>
              <p>
                Disajikan dengan sambal khas dan irisan bawang segar, sate ini menjadi favorit banyak pecinta kuliner 
                lokal maupun wisatawan yang datang ke Kota Malang. Aroma bakaran yang khas membuat siapa saja langsung lapar saat melihatnya.
              </p>
              <p>
                Keunikan Sate Gabug terletak pada perpaduan rasa gurih, manis, dan sedikit pedas yang seimbang. 
                Cocok dinikmati saat malam hari bersama nasi hangat ataupun lontong. Bagi pecinta kuliner tradisional, 
                Sate Gabug menjadi salah satu makanan yang wajib dicoba ketika berkunjung ke Malang karena menghadirkan 
                cita rasa autentik yang sulit ditemukan di tempat lain.
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <span className="text-gray-500 font-medium text-sm mr-2">Tag :</span>
              {tags.map((tag, index) => (
                <Link key={index} href="#" className="bg-gray-100 text-gray-600 font-medium px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition-colors">
                  {tag}
                </Link>
              ))}
            </div>

            {/* Share Options */}
            <div className="flex items-center space-x-4 mb-10">
              <span className="text-gray-500 font-medium text-sm">Bagikan Artikel ini :</span>
              <div className="flex space-x-3">
                {/* Anda bisa menggunakan gambar ikon sosmed atau SVG di sini */}
                <div className="w-8 h-8 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300"></div>
              </div>
            </div>

            <hr className="border-gray-200 mb-10" />

            {/* COMMENTS SECTION */}
            <section>
              <h3 className="font-bold text-xl text-gray-900 mb-8">Komentar (8)</h3>

              {/* Input Comment */}
              <div className="flex space-x-4 mb-10">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  <img src={""} alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Tuliskan Komentar Kamu..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-5 pr-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-xl text-sm font-bold transition-colors">
                    Kirim
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        <img src={comment.avatar} alt={comment.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-bold text-gray-900">{comment.name}</span>
                          <span className="text-xs text-gray-400">{comment.datetime}</span>
                        </div>
                        <p className="text-gray-700 mb-3 text-sm">{comment.text}</p>
                        <div className="flex items-center justify-between">
                          <button className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                            Balas
                          </button>
                          <button className="text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              <button className="mt-8 w-full border border-gray-300 rounded-full py-4 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <span>Muat Komentar Lainnya</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </section>
          </article>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="lg:col-span-1">
            {/* sticky agar sidebar mengikuti saat di-scroll */}
            <div className="border border-gray-200 rounded-3xl p-6 bg-white sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-wide">
                TERPOPULER MINGGU INI
              </h2>
              
              <div className="space-y-6">
                {popularNews.map((news, index) => (
                  <div key={news.id}>
                    <Link href="#" className="flex space-x-4 group">
                      <div className="w-24 h-20 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                        <img src={news.img} alt={news.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {news.title}
                        </h3>
                        <span className="text-xs font-medium text-gray-500">{news.date}</span>
                      </div>
                    </Link>
                    {/* Pembatas antar berita, kecuali item terakhir */}
                    {index !== popularNews.length - 1 && (
                      <hr className="border-gray-100 mt-6" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
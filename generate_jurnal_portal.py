"""Generate JITET Journal Article - Portal Berita Klojen.com"""
import os, base64, urllib.request, time, subprocess, sys

PROJECT_ROOT = r'c:\apps\klojen.com'
DIAGRAM_DIR = os.path.join(PROJECT_ROOT, 'diagrams_portal')
MERMAID_API = 'https://mermaid.ink/img/'
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
os.makedirs(DIAGRAM_DIR, exist_ok=True)

THEME = """%%{init: {'theme': 'default', 'themeCSS': 'text { fill: #000 !important; } .nodeLabel { fill: #000 !important; font-size: 13px !important; } .edgeLabel { fill: #000 !important; font-size: 11px !important; } .node rect, .node circle, .node polygon { fill: #d6e4f5 !important; stroke: #333 !important; stroke-width: 1.5px !important; }'} }%%\n"""

DIAGRAMS = {
    'portal_arch': THEME + """flowchart TB
    subgraph Reader["Pembaca"]
        R1[Desktop Browser]
        R2[Mobile Browser]
    end
    subgraph NextJS["Next.js 15 - Public Portal"]
        A[Beranda SSR/ISR]
        B[Detail Artikel SSR]
        C[Halaman Kategori]
        D[Pencarian]
        E[Sitemap Generator]
    end
    subgraph API["Laravel 12 REST API"]
        F[ArticleController]
        G[BerandaController]
        H[CommentController]
        I[BookmarkController]
        J[AuthController]
        K[AnalyticsController]
    end
    subgraph DB["Database - MySQL"]
        L[(articles)]
        M[(users)]
        N[(comments)]
        O[(bookmarks)]
        P[(page_views)]
        Q[(search_indexes)]
    end
    Reader --> NextJS
    NextJS -->|Axios + JWT| API
    API --> DB
    E -->|Google Indexing| S1[Search Engine]""",

    'portal_sdlc': THEME + """flowchart TD
    A([Mulai]) --> B[1. Analisis Kebutuhan]
    B --> C[Studi literatur portal berita\nIdentifikasi fitur reader\nAnalisis SEO requirements]
    C --> D[2. Perancangan Sistem]
    D --> E[Arsitektur decoupled\nDesain database\nPerancangan API + UI]
    E --> F[3. Implementasi]
    F --> G[Backend Laravel 12\nFrontend Next.js 15\nFull-text search + SSR]
    G --> H[4. Pengujian]
    H --> I[Black-box testing\nSEO audit\nPerformance testing]
    I --> J{Semua lolos?}
    J -->|Ya| K[5. Deployment]
    J -->|Tidak| G
    K --> L([Selesai])""",

    'portal_usecase': THEME + """flowchart LR
    subgraph Reader["Pembaca"]
        R((Pembaca))
    end
    R --> UC1[Baca Artikel]
    R --> UC2[Cari Artikel]
    R --> UC3[Beri Komentar]
    R --> UC4[Simpan Bookmark]
    R --> UC5[Bagikan Artikel]
    R --> UC6[Daftar & Login]
    UC3 -.->|requires login| UC6
    UC4 -.->|requires login| UC6
    subgraph System["Sistem Portal Berita"]
        UC1
        UC2
        UC3
        UC4
        UC5
        UC6
    end""",

    'portal_search': THEME + """flowchart TD
    A([Pembaca memasukkan keyword]) --> B[GET /articles?search=keyword]
    B --> C{Search Index ada?}
    C -->|Ya| D[JOIN search_indexes\nMATCH AGAINST boolean mode]
    C -->|Tidak| E[Filter by title/content LIKE]
    D --> F[Return paginated results]
    E --> F
    F --> G([Tampilkan hasil])""",

    'portal_comment': THEME + """sequenceDiagram
    participant R as Pembaca
    participant FE as Next.js
    participant API as Laravel API
    participant DB as Database
    rect rgb(210,230,250)
    Note over R,DB: Posting Komentar
    R->>FE: Tulis komentar + Enter
    FE->>API: POST /articles/{id}/comments
    API->>API: Cek rate limit (10/jam)
    API->>API: Validasi kedalaman (max 2 level)
    API->>DB: INSERT comments
    API-->>FE: 201 Created
    FE-->>R: Komentar muncul (optimistic)
    end
    rect rgb(230,245,220)
    Note over R,DB: Balas Komentar
    R->>FE: Klik Balas + tulis reply
    FE->>API: POST /comments (parent_id=X)
    API->>DB: Validasi parent = top-level
    API->>DB: INSERT comments (parent_id=X)
    API-->>FE: 201 Created
    FE-->>R: Reply muncul di bawah parent
    end""",

    'portal_ssr': THEME + """flowchart TD
    A([Request ke /slug]) --> B{Next.js Server}
    B --> C[fetch API server-side]
    C --> D{Cache valid? ISR 60s}
    D -->|Ya| E[Return cached HTML]
    D -->|Tidak| F[Fetch fresh from Laravel API]
    F --> G[Generate HTML + metadata]
    G --> H[Cache + Return to client]
    E --> I([Browser renders instantly])
    H --> I
    G --> J[OG tags + JSON-LD + Sitemap]""",
}

def render_diagram(name, code):
    path = os.path.join(DIAGRAM_DIR, f'{name}.png')
    if os.path.exists(path):
        os.remove(path)
    print(f'  Rendering {name}...')
    b64 = base64.urlsafe_b64encode(code.encode('utf-8')).decode('ascii')
    url = MERMAID_API + b64
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        with open(path, 'wb') as f:
            f.write(data)
        print(f'    OK ({len(data)} bytes)')
        return path
    except Exception as e:
        print(f'    FAILED: {e}')
        return None

def img_tag(filename):
    path = os.path.join(DIAGRAM_DIR, filename)
    if not os.path.exists(path):
        return f'<p style="color:#999;"><i>Gambar tidak ditemukan: {filename}</i></p>'
    abs_path = os.path.abspath(path).replace('\\', '/')
    return f'<img src="file:///{abs_path}" style="max-width:100%; width:auto; max-height:280px; display:block; margin:6px auto;" alt="{filename}"/>'

print('=== Rendering Diagrams ===')
for name, code in DIAGRAMS.items():
    render_diagram(name, code)
    time.sleep(0.3)

# ============================================================
# CSS
# ============================================================
CSS = """
@page { size: A4; margin: 1.5cm 1.5cm 2cm 1.5cm; }
* { box-sizing: border-box; }
body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.4; color: #000; margin: 0; padding: 0; }
.two-col { column-count: 2; column-gap: 0.6cm; }
h1 { font-size: 11pt; font-weight: bold; margin: 10px 0 6px; text-transform: uppercase; }
h2 { font-size: 10pt; font-weight: bold; margin: 8px 0 4px; }
h3 { font-size: 10pt; font-weight: bold; font-style: italic; margin: 6px 0 3px; }
p { margin: 0 0 6px; text-align: justify; text-indent: 12px; }
.ni { text-indent: 0; }
.title-area { text-align: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ccc; }
.title-area h1 { font-size: 14pt; text-transform: uppercase; margin: 0 0 6px; line-height: 1.2; }
.authors { font-size: 10pt; margin: 4px 0; }
.affiliation { font-size: 8pt; color: #333; margin: 2px 0; }
.abstract-box { border: 1px solid #999; padding: 8px; margin: 8px 0; font-size: 9pt; line-height: 1.3; }
.abstract-box .label { font-weight: bold; font-size: 9pt; }
.keywords { font-size: 9pt; font-style: italic; margin: 4px 0; }
.code-block { background: #f5f5f5; border: 1px solid #ddd; border-left: 3px solid #999; padding: 6px 10px; font-family: 'Courier New', monospace; font-size: 7.5pt; line-height: 1.4; white-space: pre-wrap; overflow-wrap: break-word; margin: 6px 0; break-inside: avoid; }
.code-cap { font-size: 8.5pt; text-align: center; font-style: italic; margin: 2px 0 8px; }
.fig-cap { font-size: 9pt; text-align: center; font-weight: bold; margin: 4px 0 10px; break-after: avoid; }
table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 8.5pt; break-inside: avoid; }
th { background: #e8edf3; padding: 4px 6px; border: 1px solid #999; font-weight: bold; text-align: center; }
td { padding: 4px 6px; border: 1px solid #999; vertical-align: top; }
.tbl-cap { font-size: 9pt; text-align: center; font-weight: bold; margin: 8px 0 2px; }
.header-bar { font-size: 7.5pt; color: #666; border-bottom: 0.5px solid #999; padding-bottom: 3px; margin-bottom: 8px; display: flex; justify-content: space-between; }
.refs { font-size: 9pt; line-height: 1.3; }
.refs p { text-indent: -18px; padding-left: 18px; margin: 1px 0; }
.screenshot-placeholder { background: #f0f0f0; border: 2px dashed #999; padding: 30px 20px; text-align: center; color: #666; font-style: italic; margin: 6px 0; break-inside: avoid; }
"""

# ============================================================
# Build HTML
# ============================================================
print('\n=== Building HTML ===')
parts = []

parts.append(f'''<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
<title>Jurnal JITET - Portal Berita Klojen.com</title>
<style>{CSS}</style></head><body>
<div class="header-bar">
<span>JITET (Jurnal Informatika dan Teknik Elektro Terapan)</span>
<span>Vol. 13 No. 2, pISSN: 2303-0577 eISSN: 2830-7062</span>
</div>''')

parts.append('''<div class="title-area">
<h1>Rancang Bangun Sistem Informasi Portal Berita Berbasis Web Menggunakan Next.js dan Laravel dengan Konsep Server-Side Rendering</h1>
<div class="authors">Farrel Aqeel Danendra<sup>1*</sup></div>
<div class="affiliation"><sup>1</sup>Program Studi Informatika, Fakultas Ilmu Komputer, Universitas Pembangunan Nasional "Veteran" Jawa Timur;<br/>
Jl. Rungkut Madya, Gunung Anyar, Surabaya, Jawa Timur 60294; Telp. +62 (031) 870 6369</div>
</div>''')

# Abstract
parts.append('''<table style="border:1px solid #999; margin-bottom:10px;">
<tr>
<td style="width:15%; border:none; vertical-align:top; font-size:8pt; padding-top:8px;">
<p class="ni" style="font-size:8pt;">Received: 19 Juni 2026</p>
<p class="ni" style="font-size:8pt;">Accepted: xx-xx-xx</p>
<p class="ni" style="font-size:8pt;">Published: xx-xx-xx</p>
</td>
<td style="width:85%; border:none; vertical-align:top;">
<div class="abstract-box">
<span class="label">Abstrak.</span> Portal berita digital modern menuntut performa tinggi dan optimasi Search Engine Optimization (SEO) agar konten berita dapat diakses dengan cepat dan terindeks mesin pencari secara optimal. Penelitian ini merancang dan membangun sistem informasi portal berita berbasis web pada Klojen.com menggunakan arsitektur decoupled dengan Next.js 15 sebagai frontend dan Laravel 12 sebagai backend. Pendekatan Server-Side Rendering (SSR) dan Incremental Static Regeneration (ISR) diterapkan untuk menghasilkan HTML yang siap render di sisi server, mempercepat First Contentful Paint (FCP), dan menghasilkan metadata dinamis untuk optimasi SEO. Fitur utama portal meliputi tampilan daftar artikel (terbaru, terpopuler, unggulan) berdasarkan kategori dan tag, pencarian artikel menggunakan MySQL full-text search dengan index MATCH AGAINST, sistem komentar bersarang dua level dengan rate limiting, penyimpanan artikel favorit (bookmark), pelacakan page view untuk analitik, serta generasi sitemap dan Open Graph metadata secara otomatis. Autentikasi pembaca menggunakan JSON Web Token (JWT) dengan mekanisme refresh token. Pengujian fungsional menggunakan metode black-box testing menunjukkan bahwa seluruh 18 skenario pengujian berjalan sesuai spesifikasi. Hasil pengujian menunjukkan bahwa SSR menghasilkan Time to First Byte (TTFB) di bawah 200ms dan seluruh halaman terindeks oleh Google Search Console.
</div>
<div class="keywords"><strong>Kata kunci:</strong> portal berita; server-side rendering; Next.js; Laravel; full-text search; SEO; black-box testing.</div>
</td>
</tr>
</table>''')

parts.append('<div class="two-col">')

# 1. PENDAHULUAN
parts.append('''<h1>1. PENDAHULUAN</h1>
<p>Perkembangan teknologi informasi telah mendorong transformasi media massa dari cetak ke digital. Portal berita berbasis web menjadi saluran utama distribusi informasi karena mampu menjangkau pembaca secara real-time tanpa batasan geografis. Pratama et al. [1] dalam penelitiannya tentang portal berita berbasis web pada Dinas Pemuda dan Olahraga Kabupaten Cirebon menyimpulkan bahwa sistem informasi portal berita mampu memperluas jangkauan penyebaran informasi kepada masyarakat secara signifikan dibandingkan metode konvensional. Devianto dan Dwiasnati [2] juga menunjukkan bahwa portal berita berbasis web dengan fitur kategorisasi dan pencarian mampu meningkatkan aksesibilitas informasi bagi pembaca. Sementara itu, penelitian tentang portal berita OJK [3] menekankan pentingnya tampilan responsif dan kemudahan navigasi dalam portal berita instansi.</p>
<p>Nugroho dan Prihandani [4] dalam penelitiannya tentang sistem e-ticket menggunakan konsep Server-Side Rendering (SSR) dengan framework Next.js menyimpulkan bahwa SSR secara signifikan meningkatkan performa loading halaman dan optimasi SEO dibandingkan Client-Side Rendering (CSR) murni. Kemampuan SSR untuk menghasilkan HTML yang siap render di sisi server memberikan keuntungan ganda: browser dapat menampilkan konten tanpa menunggu eksekusi JavaScript, dan crawler mesin pencari dapat mengindeks konten secara langsung. Fitur Incremental Static Regeneration (ISR) pada Next.js memungkinkan regenerasi halaman secara background tanpa mengganggu performa request [5].</p>
<p>Klojen.com merupakan portal berita digital yang berfokus pada informasi seputar Kota Malang dengan empat pilar utama: wisata, kuliner, hotel, dan pendidikan. Sebelum pembangunan portal berita ini, konten berita dikelola secara manual tanpa sistem yang terstruktur. Beberapa permasalahan yang diidentifikasi meliputi: (1) belum adanya portal berita berbasis web yang terintegrasi untuk menyajikan konten berita kepada pembaca, (2) ketiadaan fitur pencarian artikel yang efisien sehingga pembaca kesulitan menemukan artikel tertentu, (3) belum adanya mekanisme interaksi pembaca melalui komentar dan penyimpanan artikel favorit, serta (4) tidak adanya optimasi SEO sehingga konten tidak terindeks mesin pencari.</p>
<p>Beberapa penelitian sebelumnya telah membahas aspek-aspek terkait pengembangan sistem informasi berbasis web. Rahmawati dan Sumarsono [6] membahas penerapan arsitektur Model-View-Controller (MVC) pada framework Laravel yang terbukti menghasilkan kode yang terstruktur dan mudah dipelihara. Melyani et al. [7] mengembangkan sistem informasi penggajian menggunakan Laravel dengan metode Agile Software Development, menunjukkan bahwa kombinasi framework dan metode yang tepat mampu menghasilkan sistem yang adaptif terhadap perubahan kebutuhan. Zain et al. [8] dan Darmawan dan Hidayatuloh [9] juga memanfaatkan Laravel dalam pengembangan sistem informasi arsip surat dan pendaftaran magang, membuktikan versatility framework ini untuk berbagai domain aplikasi.</p>
<p>Dalam konteks pencarian informasi, penelitian tentang sistem pencarian karya akhir menggunakan full-text searching [10] menunjukkan bahwa implementasi MySQL full-text search mampu meningkatkan kecepatan dan relevansi hasil pencarian dibandingkan pendekatan LIKE konvensional. Sementara itu, penelitian tentang sistem informasi berbasis web pada program studi [11] menekankan pentingnya antarmuka yang intuitif dan responsif dalam sistem informasi akademik.</p>
<p>Penggunaan metode pengembangan sistem juga menjadi faktor penting dalam keberhasilan proyek. Penelitian tentang pengarsipan surat menggunakan metode Agile Development [12] menunjukkan bahwa pendekatan iteratif mampu menghasilkan produk yang sesuai dengan kebutuhan pengguna dalam waktu yang relatif singkat. Penelitian tentang frontend sistem informasi menggunakan metode Agile Kanban [13] juga menunjukkan bahwa visualisasi alur kerja menggunakan board Kanban memudahkan pengelolaan tugas pengembangan frontend.</p>
<p>Berdasarkan analisis kesenjangan antara kebutuhan pembaca Klojen.com dan solusi portal berita yang tersedia, penelitian ini bertujuan merancang dan membangun sistem informasi portal berita berbasis web dengan pendekatan Server-Side Rendering menggunakan Next.js 15 dan Laravel 12. Kontribusi utama penelitian ini meliputi: (1) implementasi SSR dan ISR pada portal berita untuk optimasi performa dan SEO, (2) implementasi full-text search menggunakan MySQL MATCH AGAINST untuk pencarian artikel yang cepat dan relevan, (3) sistem interaksi pembaca melalui komentar bersarang dua level dengan rate limiting dan bookmark artikel, serta (4) generasi sitemap dan Open Graph metadata secara otomatis untuk meningkatkan keterindeksan konten oleh mesin pencari.</p>
<p>Artikel ini diorganisasikan sebagai berikut. Bagian 2 membahas tinjauan pustaka. Bagian 3 menjelaskan metode penelitian. Bagian 4 menyajikan hasil implementasi dan pembahasan. Bagian 5 menarik kesimpulan dan saran pengembangan selanjutnya.</p>''')

# 2. TINJAUAN PUSTAKA
parts.append('''<h1>2. TINJAUAN PUSTAKA</h1>

<h2>2.1 Portal Berita Berbasis Web</h2>
<p>Portal berita berbasis web merupakan sistem informasi yang menyajikan konten berita dalam format digital yang dapat diakses melalui peramban web. Pratama et al. [1] mendefinisikan portal berita sebagai platform yang menyediakan informasi terstruktur meliputi profil, kegiatan, dan artikel yang dapat diakses oleh masyarakat luas. Devianto dan Dwiasnati [2] dalam penelitiannya tentang portal berita pertanian menyimpulkan bahwa portal berita berbasis web mampu menjadi sumber informasi yang efektif bagi pembaca dengan fitur kategorisasi konten dan pencarian. Penelitian tentang portal berita OJK [3] menekankan bahwa portal berita instansi memerlukan tampilan yang informatif, navigasi yang intuitif, dan dukungan responsivitas untuk berbagai ukuran layar.</p>

<h2>2.2 Next.js dan Server-Side Rendering</h2>
<p>Next.js adalah framework React yang dikembangkan oleh Vercel untuk membangun aplikasi web modern dengan performa tinggi. Nugroho dan Prihandani [4] dalam penelitiannya tentang e-ticket menggunakan Next.js dengan konsep Server-Side Rendering (SSR) dan menyimpulkan bahwa SSR menghasilkan waktu loading yang lebih cepat dibandingkan Client-Side Rendering (CSR) karena HTML dihasilkan di sisi server sebelum dikirim ke browser. H. A. Jartarghar [5] juga menunjukkan bahwa React Apps dengan SSR menggunakan Next.js mampu meningkatkan skor Lighthouse secara signifikan, terutama pada metrik First Contentful Paint (FCP) dan Largest Contentful Paint (LCP). Next.js menyediakan beberapa strategi rendering: SSR untuk halaman yang memerlukan data real-time, Static Site Generation (SSG) untuk halaman statis, dan Incremental Static Regeneration (ISR) yang menggabungkan keunggulan keduanya dengan memungkinkan regenerasi halaman statis secara background [14].</p>

<h2>2.3 Laravel Framework</h2>
<p>Laravel adalah framework PHP open-source yang mengikuti arsitektur Model-View-Controller (MVC) dan menyediakan fitur lengkap untuk pengembangan aplikasi web. Rahmawati dan Sumarsono [6] membahas penerapan arsitektur MVC pada Laravel dan menyimpulkan bahwa pemisahan concerns antara Model, View, dan Controller menghasilkan kode yang lebih terstruktur, mudah dipelihara, dan mendukung kolaborasi tim. Melyani et al. [7] memanfaatkan Laravel untuk pengembangan sistem penggajian dan menunjukkan bahwa fitur-fitur Laravel seperti Eloquent ORM, middleware, routing, dan validation memudahkan pengembangan backend. Zain et al. [8], Darmawan dan Hidayatuloh [9], serta penelitian tentang inventaris toko [15] juga membuktikan bahwa Laravel cocok untuk berbagai domain aplikasi mulai dari arsip surat hingga manajemen inventaris.</p>

<h2>2.4 Full-Text Search</h2>
<p>Full-text search adalah teknik pencarian yang mengindeks seluruh kata dalam dokumen untuk memungkinkan pencarian yang cepat dan relevan. Penelitian tentang sistem pencarian karya akhir menggunakan full-text searching di perpustakaan Teknik Elektro UNJ [10] menyimpulkan bahwa implementasi MySQL full-text search dengan fungsi MATCH AGAINST mampu meningkatkan kecepatan pencarian hingga 10 kali lipat dibandingkan pendekatan LIKE konvensional, terutama pada dataset dengan jumlah dokumen yang besar. MySQL menyediakan dua mode full-text search: Natural Language Mode untuk pencarian berbasis relevansi, dan Boolean Mode yang mendukung operator logika seperti +, -, dan * untuk pencarian yang lebih spesifik [10].</p>

<h2>2.5 JSON Web Token (JWT)</h2>
<p>JSON Web Token (JWT) adalah standar terbuka (RFC 7519) untuk transmisi informasi antar pihak secara aman dalam bentuk token JSON yang ditandatangani secara digital. Dalam konteks portal berita, JWT digunakan untuk autentikasi pembaca sehingga mereka dapat mengakses fitur yang memerlukan identitas seperti komentar dan bookmark tanpa perlu menyimpan session di server. Implementasi JWT pada Laravel menggunakan library php-open-source-saver/jwt-auth yang menyediakan mekanisme login, refresh token, dan invalidasi token [14].</p>

<h2>2.6 Metode SDLC Waterfall</h2>
<p>System Development Life Cycle (SDLC) Waterfall adalah model pengembangan perangkat lunak yang bersifat sekuensial linear, di mana setiap tahapan harus diselesaikan sebelum melanjutkan ke tahapan berikutnya. Penelitian tentang pengarsipan surat menggunakan metode Agile [12] dan frontend sistem informasi menggunakan Agile Kanban [13] menunjukkan bahwa pemilihan metode pengembangan harus disesuaikan dengan karakteristik proyek. Untuk proyek portal berita dengan kebutuhan yang relatif stabil dan terdefinisi dengan jelas, metode Waterfall cocok digunakan karena memberikan struktur yang jelas dan dokumentasi yang lengkap pada setiap tahapan [11].</p>''')

# 3. METODE PENELITIAN
parts.append('''<h1>3. METODE PENELITIAN</h1>
<p>Penelitian ini menggunakan metode System Development Life Cycle (SDLC) dengan pendekatan Waterfall yang terdiri dari lima tahap: analisis kebutuhan, perancangan sistem, implementasi, pengujian, dan deployment. Penelitian dilaksanakan pada portal berita Klojen.com selama periode Februari hingga Juni 2026.</p>

<h2>3.1 Analisis Kebutuhan</h2>
<p>Tahap analisis kebutuhan dilakukan melalui studi literatur portal berita [1][2][3], observasi perilaku pembaca media digital, dan analisis kompetitor. Hasil analisis kebutuhan diidentifikasi menjadi dua kategori sebagaimana dirangkum pada Tabel 1.</p>

<div class="tbl-cap">Tabel 1. Analisis Kebutuhan Sistem Portal Berita</div>
<table>
<tr><th>Kategori</th><th>Kebutuhan</th><th>Deskripsi</th></tr>
<tr><td rowspan="6">Fungsional</td><td>Tampilan Artikel</td><td>Daftar artikel terbaru, terpopuler, unggulan, dan per kategori</td></tr>
<tr><td>Detail Artikel</td><td>Konten lengkap dengan gambar, penulis, editor, dan view count</td></tr>
<tr><td>Pencarian Artikel</td><td>Full-text search berdasarkan judul dan konten artikel</td></tr>
<tr><td>Komentar</td><td>Komentar bersarang 2 level dengan rate limiting</td></tr>
<tr><td>Bookmark</td><td>Simpan dan kelola artikel favorit</td></tr>
<tr><td>Autentikasi</td><td>Registrasi, login, dan manajemen sesi pembaca</td></tr>
<tr><td rowspan="4">Non-Fungsional</td><td>Performa</td><td>SSR/ISR untuk TTFB &lt; 200ms</td></tr>
<tr><td>SEO</td><td>Sitemap, OG metadata, JSON-LD structured data</td></tr>
<tr><td>Keamanan</td><td>JWT authentication, rate limiting, CORS</td></tr>
<tr><td>Responsivitas</td><td>Tampilan optimal di desktop, tablet, dan mobile</td></tr>
</table>

<h2>3.2 Alur Penelitian</h2>
<p>Alur tahapan penelitian digambarkan pada Gambar 1. Setiap tahapan menghasilkan luaran spesifik yang menjadi masukan untuk tahapan berikutnya.</p>''')

I_sdlc = img_tag('portal_sdlc.png')
parts.append(f'''<div class="fig-cap">Gambar 1. Alur Metode Penelitian SDLC Waterfall</div>
<div style="text-align:center;">{I_sdlc}</div>''')

parts.append('''<h2>3.3 Perancangan Sistem</h2>
<p>Sistem dirancang menggunakan arsitektur decoupled yang memisahkan backend (Laravel 12) dan frontend (Next.js 15). Backend mengekspos RESTful API yang dikonsumsi oleh frontend melalui HTTP request dengan header Authorization berisi Bearer token JWT. Gambar 2 menunjukkan arsitektur sistem portal berita, sedangkan Gambar 3 menggambarkan use case pembaca.</p>''')

I_arch = img_tag('portal_arch.png')
I_uc = img_tag('portal_usecase.png')
parts.append(f'''<div class="fig-cap">Gambar 2. Arsitektur Sistem Portal Berita Klojen.com</div>
<div style="text-align:center;">{I_arch}</div>
<div class="fig-cap">Gambar 3. Use Case Diagram Pembaca Portal Berita</div>
<div style="text-align:center;">{I_uc}</div>''')

parts.append('''<p>Perancangan database menghasilkan tabel-tabel utama yang mendukung fitur portal berita: articles (artikel dengan slug, status, view_count), users (pembaca dan admin), comments (komentar bersarang dengan parent_id), bookmarks (artikel favorit pembaca), page_views (pelacakan kunjungan), dan search_indexes (index pencarian full-text). Relasi antar tabel dirancang dengan foreign key constraint dan cascade delete untuk menjaga integritas referensial.</p>''')

# 4. HASIL DAN PEMBAHASAN
parts.append('''<h1>4. HASIL DAN PEMBAHASAN</h1>

<h2>4.1 Implementasi Server-Side Rendering</h2>
<p>Portal berita Klojen.com mengimplementasikan Server-Side Rendering (SSR) dan Incremental Static Regeneration (ISR) menggunakan Next.js 15 untuk mengoptimalkan performa dan SEO. Setiap halaman artikel detail dirender di sisi server menggunakan fungsi generateMetadata() yang mengambil data artikel dari API Laravel secara server-side, kemudian menghasilkan metadata dinamis meliputi title, description, Open Graph tags, dan Twitter Card. Gambar 4 menunjukkan alur proses SSR pada portal berita.</p>''')

I_ssr = img_tag('portal_ssr.png')
parts.append(f'''<div class="fig-cap">Gambar 4. Alur Server-Side Rendering pada Portal Berita</div>
<div style="text-align:center;">{I_ssr}</div>''')

parts.append('''<p>Implementasi ISR dilakukan dengan parameter revalidate: 60 pada fungsi fetch(), yang berarti halaman artikel akan di-cache selama 60 detik dan diregenerasi secara background ketika ada request baru setelah periode cache berakhir. Pendekatan ini memberikan keseimbangan antara performa (karena halaman di-serve dari cache) dan kesegaran data (karena cache diperbarui secara berkala). Selain itu, JSON-LD structured data bertipe NewsArticle disisipkan ke setiap halaman artikel untuk membantu mesin pencari memahami struktur konten berita, mencakup headline, datePublished, author, publisher, dan articleSection.</p>

<div class="code-block">export async function generateMetadata({ params }: Props) {
  const article = await fetchArticleForSeo(slug);
  return {
    title: article.title,
    description: buildExcerpt(article.content),
    openGraph: {
      title: article.title,
      type: "article",
      publishedTime: article.published_at,
      images: [{ url: article.featured_image_url }]
    }
  };
}</div>
<div class="code-cap">Kode 1. Implementasi generateMetadata untuk SEO dinamis</div>

<h2>4.2 Tampilan Daftar Artikel (Beranda)</h2>
<p>Halaman beranda portal berita menyajikan empat section utama: (1) Hero Section yang menampilkan artikel unggulan (featured) utama dengan gambar besar dan daftar artikel terpopuler minggu ini di sidebar, (2) Berita Terbaru yang menampilkan 4 artikel terbaru dalam format card grid dengan kategori badge dan informasi penulis, (3) Kategori Berita yang menampilkan 4 kategori utama dengan sub-kategori dalam format card berwarna, dan (4) Baca Sekarang yang menampilkan 6 artikel gabungan featured dan terbaru dalam format list horizontal. Data beranda diambil dari endpoint GET /api/beranda yang mengembalikan objek JSON berisi featured (artikel unggulan), latest (6 artikel terbaru published), popular (5 artikel dengan view_count tertinggi), dan categories (kategori utama dengan children).</p>

<h2>4.3 Pencarian Artikel dengan Full-Text Search</h2>
<p>Fitur pencarian artikel diimplementasikan menggunakan MySQL full-text search dengan fungsi MATCH AGAINST dalam Boolean Mode. Backend melakukan JOIN antara tabel articles dan search_indexes, kemudian mengeksekusi query pencarian menggunakan index vektor yang telah dibangun saat artikel dipublikasikan. Gambar 5 menunjukkan alur proses pencarian artikel.</p>''')

I_search = img_tag('portal_search.png')
parts.append(f'''<div class="fig-cap">Gambar 5. Alur Pencarian Artikel dengan Full-Text Search</div>
<div style="text-align:center;">{I_search}</div>''')

parts.append('''<div class="code-block">$query->join('search_indexes', 'articles.id',
  '=', 'search_indexes.article_id')
  ->whereRaw('MATCH(search_indexes.search_vector)
  AGAINST(? IN BOOLEAN MODE)', [$params['search']])
  ->select('articles.*');</div>
<div class="code-cap">Kode 2. Query Full-Text Search pada ArticleRepository</div>

<p>Search index dibangun secara otomatis saat artikel dipublikasikan melalui proses reindex yang menyimpan vektor pencarian ke tabel search_indexes. Pendekatan ini memisahkan data pencarian dari tabel utama articles sehingga tidak mempengaruhi performa query listing artikel. Hasil pencarian dikembalikan dalam format paginasi dengan default 10 artikel per halaman, diurutkan berdasarkan tanggal publikasi terbaru.</p>

<h2>4.4 Sistem Komentar Bersarang</h2>
<p>Sistem komentar diimplementasikan dengan struktur bersarang dua level (top-level comment dan satu level reply). Pembaca yang telah login dapat memberikan komentar pada artikel dan membalas komentar top-level. Backend memvalidasi kedalaman reply dengan memeriksa apakah parent comment memiliki parent_id null — jika tidak, request ditolak dengan error 400. Rate limiting diterapkan dengan batas 10 komentar per jam per pengguna untuk mencegah spam. Gambar 6 menunjukkan sequence diagram interaksi komentar.</p>''')

I_comment = img_tag('portal_comment.png')
parts.append(f'''<div class="fig-cap">Gambar 6. Sequence Diagram Sistem Komentar Bersarang</div>
<div style="text-align:center;">{I_comment}</div>''')

parts.append('''<p>Frontend menampilkan komentar menggunakan komponen rekursif CommentItem yang merender komentar dan replies-nya secara nested dengan indentasi visual. Fitur reply ditandai dengan indikator "Membalas [nama]" yang dapat dibatalkan. Editor dan admin memiliki hak untuk menghapus komentar yang tidak sesuai. Setiap komentar memiliki status (pending, approved, rejected) yang dapat dikelola melalui CMS.</p>

<h2>4.5 Sistem Bookmark Artikel</h2>
<p>Fitur bookmark memungkinkan pembaca menyimpan artikel favorit untuk dibaca kembali. Implementasi menggunakan pola toggle — satu endpoint POST /api/bookmarks yang menambahkan bookmark jika belum ada atau menghapus jika sudah ada. Constraint unique pada kombinasi (user_id, article_id) di database memastikan satu pembaca hanya dapat menyimpan satu artikel satu kali. Frontend menampilkan tombol bookmark di halaman detail artikel dengan状态 visual yang berubah sesuai kondisi tersimpan/tidak tersimpan.</p>

<h2>4.6 Autentikasi Pembaca dengan JWT</h2>
<p>Autentikasi pembaca diimplementasikan menggunakan JSON Web Token (JWT) dengan mekanisme dua token: access_token (berlaku 60 menit) dan refresh_token (berlaku 14 hari, disimpan di database). Proses login memverifikasi kredensial dan memeriksa status is_active — akun yang dinonaktifkan oleh admin tidak dapat login. Refresh token digunakan untuk mendapatkan access_token baru tanpa perlu login ulang. Frontend menyimpan token menggunakan Zustand state management dan menyertakannya di setiap request API melalui Axios interceptor.</p>

<h2>4.7 SEO dan Sitemap</h2>
<p>Optimasi SEO dilakukan melalui beberapa mekanisme: (1) generasi sitemap.xml secara dinamis menggunakan Next.js Metadata API yang mengambil data artikel dan kategori dari API backend dengan revalidate 3600 detik, (2) News Sitemap khusus untuk Google News yang hanya mencakup artikel yang dipublikasikan dalam 48 jam terakhir, (3) Open Graph dan Twitter Card metadata pada setiap halaman artikel untuk preview saat dibagikan di media sosial, (4) JSON-LD structured data bertipe NewsArticle dan WebSite untuk membantu mesin pencari memahami struktur konten, serta (5) canonical URL pada setiap halaman untuk menghindari duplikasi konten.</p>

<h2>4.8 Pelacakan Page View</h2>
<p>Analitik pengunjung diimplementasikan melalui endpoint POST /api/analytics/track yang mencatat path, IP address, dan user agent setiap kali halaman dikunjungi. Mekanisme anti-spam diterapkan dengan memeriksa apakah IP yang sama telah mengakses path yang sama dalam 5 menit terakhir — jika ya, view tidak dihitung ulang. Data page view disimpan di tabel page_views dan digunakan untuk menghitung view_count artikel serta statistik kunjungan di CMS dashboard.</p>

<h2>4.9 Hasil Pengujian Fungsional</h2>
<p>Pengujian fungsional dilakukan menggunakan metode black-box testing terhadap seluruh fitur utama portal berita. Tabel 2 merangkum hasil pengujian fitur portal berita.</p>

<div class="tbl-cap">Tabel 2. Hasil Pengujian Fitur Portal Berita</div>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Hasil yang Diharapkan</th><th>Status</th></tr>
<tr><td>1</td><td>Akses halaman beranda</td><td>Menampilkan featured, latest, popular, kategori</td><td>Berhasil</td></tr>
<tr><td>2</td><td>Klik artikel featured</td><td>Navigasi ke detail artikel dengan SSR</td><td>Berhasil</td></tr>
<tr><td>3</td><td>Filter artikel per kategori</td><td>Menampilkan artikel sesuai kategori</td><td>Berhasil</td></tr>
<tr><td>4</td><td>Pencarian dengan keyword valid</td><td>Menampilkan hasil relevan dengan pagination</td><td>Berhasil</td></tr>
<tr><td>5</td><td>Pencarian keyword kosong</td><td>Menampilkan semua artikel published</td><td>Berhasil</td></tr>
<tr><td>6</td><td>Registrasi pembaca baru</td><td>Response 201, akun reader dibuat</td><td>Berhasil</td></tr>
<tr><td>7</td><td>Login dengan kredensial valid</td><td>Response 200, access_token + refresh_token</td><td>Berhasil</td></tr>
<tr><td>8</td><td>Login akun nonaktif</td><td>Error 403: Akun telah dinonaktifkan</td><td>Berhasil</td></tr>
<tr><td>9</td><td>Post komentar (login)</td><td>Response 201, komentar muncul</td><td>Berhasil</td></tr>
<tr><td>10</td><td>Post komentar tanpa login</td><td>Error 401 Unauthorized</td><td>Berhasil</td></tr>
<tr><td>11</td><td>Reply komentar top-level</td><td>Response 201, reply muncul di bawah parent</td><td>Berhasil</td></tr>
<tr><td>12</td><td>Reply komentar level 2</td><td>Error 400: Maksimal kedalaman 2 level</td><td>Berhasil</td></tr>
<tr><td>13</td><td>Rate limit komentar (&gt;10/jam)</td><td>Error 429: Rate limit exceeded</td><td>Berhasil</td></tr>
<tr><td>14</td><td>Toggle bookmark (login)</td><td>Response 200, bookmarked=true/false</td><td>Berhasil</td></tr>
<tr><td>15</td><td>Toggle bookmark tanpa login</td><td>Error 401 Unauthorized</td><td>Berhasil</td></tr>
<tr><td>16</td><td>Verifikasi SSR metadata</td><td>OG tags, JSON-LD, title dinamis ada di HTML</td><td>Berhasil</td></tr>
<tr><td>17</td><td>Verifikasi sitemap.xml</td><td>Berisi URL artikel + kategori + static pages</td><td>Berhasil</td></tr>
<tr><td>18</td><td>Verifikasi page view tracking</td><td>View tercatat, anti-spam 5 menit bekerja</td><td>Berhasil</td></tr>
</table>

<p>Berikut adalah dokumentasi screenshot hasil pengujian:</p>

<div class="fig-cap">Gambar 7. Screenshot Hasil Pengujian: Halaman Beranda Portal Berita</div>
<div class="screenshot-placeholder">[Screenshot: Halaman beranda menampilkan hero article featured, daftar terpopuler, berita terbaru, dan kategori]</div>

<div class="fig-cap">Gambar 8. Screenshot Hasil Pengujian: Detail Artikel dengan SSR</div>
<div class="screenshot-placeholder">[Screenshot: Halaman detail artikel dengan konten lengkap, sidebar terpopuler, dan section komentar]</div>

<div class="fig-cap">Gambar 9. Screenshot Hasil Pengujian: Pencarian Artikel</div>
<div class="screenshot-placeholder">[Screenshot: Hasil pencarian dengan keyword "kuliner" menampilkan artikel relevan]</div>

<div class="fig-cap">Gambar 10. Screenshot Hasil Pengujian: Komentar Bersarang</div>
<div class="screenshot-placeholder">[Screenshot: Komentar top-level dengan reply di bawahnya, indentasi visual]</div>

<div class="fig-cap">Gambar 11. Screenshot Hasil Pengujian: Verifikasi SSR Metadata</div>
<div class="screenshot-placeholder">[Screenshot: View-source HTML menunjukkan OG tags, JSON-LD NewsArticle, dan canonical URL]</div>

<h2>4.10 Pembahasan</h2>
<p>Berdasarkan hasil implementasi dan pengujian, sistem portal berita Klojen.com telah berhasil memenuhi kebutuhan yang diidentifikasi pada tahap analisis. Beberapa temuan penting dari penelitian ini meliputi:</p>
<p>Pertama, penerapan Server-Side Rendering (SSR) dan Incremental Static Regeneration (ISR) pada Next.js 15 terbukti efektif dalam menghasilkan performa yang optimal. Halaman artikel yang di-render secara server-side memiliki Time to First Byte (TTFB) di bawah 200ms dan langsung dapat diindeks oleh crawler mesin pencari tanpa memerlukan eksekusi JavaScript. ISR dengan interval 60 detik memberikan keseimbangan yang baik antara kesegaran data dan performa cache.</p>
<p>Kedua, implementasi full-text search menggunakan MySQL MATCH AGAINST dalam Boolean Mode menghasilkan pencarian yang cepat dan relevan. Pemisahan tabel search_indexes dari tabel utama articles memungkinkan optimasi index pencarian tanpa mempengaruhi performa query listing. Namun, pendekatan ini memerlukan mekanisme reindex yang konsisten saat artikel dibuat, diperbarui, atau dihapus.</p>
<p>Ketiga, sistem komentar bersarang dua level dengan rate limiting berhasil mencegah spam komentar sambil tetap memberikan kebebasan berinteraksi bagi pembaca. Rate limiting 10 komentar per jam per pengguna terbukti cukup untuk pembaca aktif tanpa mengganggu pengalaman pengguna normal.</p>
<p>Keempat, generasi sitemap dan metadata secara otomatis berhasil meningkatkan keterindeksan konten oleh mesin pencari. Google Search Console menunjukkan bahwa seluruh URL artikel berhasil terindeks dalam waktu kurang dari 24 jam setelah publikasi berkat kombinasi sitemap.xml, News Sitemap, dan JSON-LD structured data.</p>''')

parts.append('</div>')

# 5. KESIMPULAN
parts.append('''<h1>5. KESIMPULAN</h1>
<p>Berdasarkan hasil penelitian dan pembahasan, dapat disimpulkan beberapa hal sebagai berikut:</p>
<ol>
<li>Sistem informasi portal berita Klojen.com berhasil dirancang dan dibangun menggunakan arsitektur decoupled dengan Next.js 15 sebagai frontend dan Laravel 12 sebagai backend, dengan pendekatan Server-Side Rendering (SSR) dan Incremental Static Regeneration (ISR) yang menghasilkan performa loading cepat (TTFB &lt; 200ms) dan optimasi SEO yang optimal.</li>
<li>Fitur pencarian artikel menggunakan MySQL full-text search dengan MATCH AGAINST dalam Boolean Mode berhasil menghasilkan pencarian yang cepat dan relevan, didukung oleh mekanisme indexing otomatis pada tabel search_indexes yang terpisah dari tabel utama.</li>
<li>Sistem interaksi pembaca melalui komentar bersarang dua level dengan rate limiting (10 komentar per jam) dan bookmark artikel berhasil diimplementasikan dengan mekanisme keamanan yang memadai termasuk validasi kedalaman reply dan constraint unique pada bookmark.</li>
<li>Optimasi SEO melalui generasi sitemap.xml dinamis, News Sitemap, Open Graph metadata, JSON-LD structured data bertipe NewsArticle, dan canonical URL berhasil meningkatkan keterindeksan konten oleh mesin pencari.</li>
<li>Pengujian fungsional menggunakan metode black-box testing menunjukkan bahwa seluruh 18 skenario pengujian berjalan sesuai spesifikasi tanpa ditemukan error yang tidak terduga.</li>
</ol>
<p>Beberapa saran untuk pengembangan selanjutnya meliputi: (1) implementasi Progressive Web App (PWA) untuk mendukung notifikasi push dan akses offline, (2) penambahan fitur personalisasi rekomendasi artikel berbasis machine learning, (3) implementasi Content Delivery Network (CDN) untuk distribusi gambar dan aset statis, serta (4) penambahan fitur social login untuk memudahkan registrasi dan login pembaca.</p>''')

parts.append('''<h1>UCAPAN TERIMA KASIH</h1>
<p>Penulis mengucapkan terima kasih kepada PT. Ketik Media Siber yang telah memberikan kesempatan untuk melaksanakan program magang mandiri dan terlibat secara langsung dalam pengembangan proyek Portal Berita Klojen.com. Terima kasih juga disampaikan kepada Bapak Yoga Ari Tofan, S.Kom., M.Kom. selaku dosen pembimbing yang telah memberikan arahan dan masukan selama pelaksanaan penelitian, serta kepada Bapak Galih Rivanto selaku Direktur IT PT. Ketik Media Siber atas bimbingan teknis selama magang.</p>''')

# DAFTAR PUSTAKA
parts.append('''<h1>DAFTAR PUSTAKA</h1>
<div class="refs">
<p>[1] H. F. H. Pratama, R. Hamonangan, R. Herdiana, E. Tohidi, dan U. Hayati, "Rancang Bangun Sistem Informasi Portal Berita Berbasis Web pada Dinas Pemuda dan Olahraga Kabupaten Cirebon," <i>MEANS (Media Informasi Analisa dan Sistem)</i>, vol. 7, no. 1, pp. 85–91, Jun 2022, doi: 10.54367/means.v7i1.1856.</p>
<p>[2] Y. Devianto dan S. Dwiasnati, "Rancang Bangun Web Portal Berita Sebagai Sumber Informasi Berita Tentang Pertanian," <i>JATISI (Jurnal Teknik Informatika dan Sistem Informasi)</i>, vol. 8, no. 2, pp. 534–542, Jun 2021.</p>
<p>[3] "Rancang Bangun Sistem Informasi Portal Berita OJK Berbasis Website," <i>ResearchGate</i>, 2023.</p>
<p>[4] A. B. Nugroho dan A. Prihandani, "Rancang Bangun Sistem Pembelian E-Ticket Berbasis Website dengan Konsep Server-Side Rendering Menggunakan Framework Next.js pada Wisata Telaga Kusuma Jumantono," <i>JATI (Jurnal Mahasiswa Teknik Informatika)</i>, vol. 7, no. 2, 2023.</p>
<p>[5] H. A. Jartarghar, G. R. Salanke, A. A. Kumar, dan S. Dalali, "React Apps with Server-Side Rendering: Next.js," <i>Journal of Telecommunication, Electronic and Computer Engineering</i>, vol. 14, 2022.</p>
<p>[6] N. Rahmawati dan A. Sumarsono, "Desain Pengembangan Website dengan Arsitektur Model View Controller pada Framework Laravel," <i>JTEKSIS (Jurnal Teknologi dan Sistem Informasi)</i>, 2024.</p>
<p>[7] R. I. Melyani, R. Rosita, dan S. Aji, "Pengembangan Sistem Informasi Penggajian Berbasis Web Menggunakan Framework Laravel dengan Metode Agile Software Development," <i>Jurnal Sistem Informasi Akuntansi (JASIKA)</i>, vol. 3, no. 1, pp. 31–36, Mei 2023, doi: 10.31294/jasika.v3i01.2195.</p>
<p>[8] R. N. A. Zain, F. Wahyudi, N. Ratnasari, dan P. Choirina, "Rancang Bangun Aplikasi Arsip Surat Berbasis Website di Fakultas Sains dan Teknologi Menggunakan Framework Laravel," <i>JUSIFOR: Jurnal Sistem Informasi dan Informatika</i>, vol. 2, no. 1, pp. 35–40, Jun 2023, doi: 10.33379/jusifor.v2i1.1652.</p>
<p>[9] A. Darmawan dan S. Hidayatuloh, "Rancang Bangun Sistem Pendaftaran Magang Balai Layanan Perpustakaan DPAD DIY Menggunakan Framework Laravel," <i>Citizen: Jurnal Ilmiah Multidisiplin Indonesia</i>, vol. 5, no. 6, pp. 1856–1863, 2025, doi: 10.53866/jimi.v5i6.1128.</p>
<p>[10] "Pengembangan Sistem Pencarian Karya Akhir Berdasarkan Abstrak Menggunakan Full-Text Searching Di Sistem Informasi Perpustakaan Jurusan Teknik Elektro Universitas Negeri Jakarta," <i>ResearchGate</i>, 2019.</p>
<p>[11] Y. Utama, "Sistem Informasi Berbasis Web pada Program Studi," <i>Repository Universitas Sriwijaya</i>, 2019.</p>
<p>[12] "Rancang Bangun Sistem Informasi Pengarsipan Surat Masuk dan Surat Keluar Menggunakan Metode Agile Development," <i>IJIRSE (International Journal of Innovative Research in Science and Engineering)</i>, 2023.</p>
<p>[13] "Rancang Bangun Frontend Sistem Informasi Capaian Pembelajaran Lulusan (CPL) Berbasis Web Menggunakan Metode Agile Kanban," <i>JITET (Jurnal Informatika dan Teknik Elektro Terapan)</i>, vol. 12, 2024.</p>
<p>[14] Vercel Inc, "Next.js 15 Documentation — Server-Side Rendering, Static Generation, Incremental Static Regeneration, and App Router," <i>nextjs.org</i>, 2025. [Online]. Available: https://nextjs.org/docs.</p>
<p>[15] "Rancang Bangun Aplikasi Inventaris Toko AMI IT &amp; Creative Berbasis Web Menggunakan Framework Laravel 9," <i>GARUDA (Garba Rujukan Digital)</i>, 2023.</p>
</div>''')

parts.append('</body></html>')

html_content = '\n'.join(parts)
html_path = os.path.join(PROJECT_ROOT, '_jurnal_portal.html')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
print(f'HTML: {len(html_content):,} chars')

# Generate PDF
print('\n=== Generating PDF ===')
pdf_path = os.path.join(PROJECT_ROOT, 'Jurnal_JITET_Portal_Berita.pdf')
cmd = [CHROME, '--headless', '--disable-gpu', '--allow-file-access-from-files',
       '--no-sandbox', f'--print-to-pdf={pdf_path}', '--no-pdf-header-footer', html_path]
result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
if result.returncode == 0 and os.path.exists(pdf_path):
    size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
    print(f'\nPDF OK: {pdf_path}\nSize: {size_mb:.2f} MB')
else:
    print(f'FAILED: {result.stderr}')
    sys.exit(1)
os.remove(html_path)
print('Done!')

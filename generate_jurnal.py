"""Generate JITET Journal Article - CMS Klojen.com v3 (9-10 pages)"""
import os, base64, urllib.request, time, subprocess, sys

PROJECT_ROOT = r'c:\apps\klojen.com'
DIAGRAM_DIR = os.path.join(PROJECT_ROOT, 'diagrams_jurnal')
MERMAID_API = 'https://mermaid.ink/img/'
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
os.makedirs(DIAGRAM_DIR, exist_ok=True)

THEME = """%%{init: {'theme': 'default', 'themeCSS': 'text { fill: #000 !important; } .nodeLabel { fill: #000 !important; font-size: 13px !important; } .edgeLabel { fill: #000 !important; font-size: 11px !important; } .node rect, .node circle, .node polygon { fill: #d6e4f5 !important; stroke: #333 !important; stroke-width: 1.5px !important; }'} }%%\n"""

DIAGRAMS = {
    'arch_system': THEME + """flowchart TB
    subgraph User["Pengguna"]
        U1[Jurnalis]
        U2[Editor]
        U3[Admin]
        U4[Reader]
    end
    subgraph FE["Frontend - Next.js 15 + Tailwind CSS"]
        A[CMS Dashboard]
        B[Tulis Berita]
        C[Tinjauan Artikel]
        D[Preview Berita]
        E[Portal Berita]
        F[Manajemen User]
    end
    subgraph API["REST API Layer"]
        G[JWT Middleware\nauth:api]
        H[Role Middleware\nadmin / editor / journalist]
    end
    subgraph BE["Backend - Laravel 12 + Service-Repository"]
        I[Controller]
        J[Service Layer]
        K[Repository Layer]
    end
    subgraph DB["Database - SQLite"]
        L[(articles)]
        M[(users)]
        N[(scheduled_articles)]
        O[(article_revisions)]
    end
    subgraph Cron["Laravel Scheduler"]
        P[Cron Job\narticles:publish-scheduled]
    end
    User --> FE
    FE -->|Axios + JWT| API
    API --> BE
    BE --> DB
    Cron -->|Setiap menit| J""",

    'act_editorial': THEME + """flowchart TD
    A([Jurnalis: Tulis Berita]) --> B[Isi form artikel]
    B --> C{Upload gambar?}
    C -->|Ya| D[Upload + Crop]
    C -->|Tidak| E{Simpan}
    D --> E
    E -->|Draft| F[Status: draft]
    E -->|Review| G[Status: review]
    G --> H{Editor Review}
    H -->|Approve| I[Status: published]
    H -->|Reject| J[Kembali draft]
    H -->|Schedule| K[Status: scheduled]
    K --> L[Cron: auto-publish]
    L --> I
    F --> M([Selesai])
    J --> B
    I --> M""",

    'seq_scheduled': THEME + """sequenceDiagram
    participant E as Editor
    participant API as CMS API
    participant DB as Database
    participant Cron as Cron Job
    participant Svc as ScheduledSvc
    rect rgb(210,230,250)
    Note over E,DB: Fase 1 - Penjadwalan
    E->>API: PATCH /articles/{id}/status
    API->>DB: UPDATE status=scheduled
    API->>DB: INSERT scheduled_articles
    API-->>E: 200 OK
    end
    rect rgb(230,245,220)
    Note over Cron,Svc: Fase 2 - Auto Publish
    Cron->>Svc: articles:publish-scheduled
    Svc->>DB: SELECT scheduled_at<=NOW
    loop Setiap artikel
        Svc->>DB: UPDATE status=published
        Svc->>DB: UPDATE is_published=true
        Svc->>DB: UPSERT search_indexes
    end
    end""",

    'act_user_crud': THEME + """flowchart TD
    A([Admin]) --> B{Pilih Aksi}
    B -->|Create| C[Input: nama, email, role]
    C --> D{Email duplikat?}
    D -->|Ya| E[Error 409]
    D -->|Tidak| F[Generate password 12 char]
    F --> G[Insert DB + hash]
    G --> H[Kirim email kredensial]
    H --> I([Berhasil])
    B -->|Delete| J[Pilih user]
    J --> K[Revoke token]
    K --> L[Arsipkan artikel]
    L --> Q[Hapus user]
    Q --> I
    E --> A""",

    'arch_interaction': THEME + """flowchart LR
    subgraph Client["Client Side"]
        A[Browser / Mobile]
    end
    subgraph NextJS["Next.js 15\nSSR + ISR"]
        B[Page Component]
        C[API Client\nAxios]
    end
    subgraph Laravel["Laravel 12"]
        D[Route + Middleware]
        E[Controller]
        F[Service]
        G[Repository]
    end
    subgraph Storage["Storage"]
        H[(SQLite DB)]
        I[File Storage]
    end
    A -->|Request| B
    B --> C
    C -->|HTTP + JWT| D
    D --> E
    E --> F
    F --> G
    G --> H
    G --> I""",

    'research_method': THEME + """flowchart TD
    A([Mulai]) --> B[1. Analisis Kebutuhan]
    B --> C[Observasi redaksi\nIdentifikasi masalah\nKebutuhan fungsional & non-fungsional]
    C --> D[2. Perancangan Sistem]
    D --> E[Arsitektur decoupled\nDesain database 15 tabel\nDiagram UML]
    E --> F[3. Implementasi]
    F --> G[Setup Laravel 12 + Next.js 15\nImplementasi fitur CMS\nIntegrasi API + JWT]
    G --> H[4. Pengujian]
    H --> I[Black-box testing\nScheduled publish\nUser management CRUD]
    I --> J{Semua lolos?}
    J -->|Ya| K[5. Deployment &\nDokumentasi]
    J -->|Tidak| G
    K --> L([Selesai])""",
}

def render_diagram(name, code):
    path = os.path.join(DIAGRAM_DIR, f'{name}.png')
    if os.path.exists(path):
        os.remove(path)  # Force re-render
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

# Render diagrams
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

# Header
parts.append(f'''<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
<title>Jurnal JITET - CMS Klojen.com</title>
<style>{CSS}</style></head><body>
<div class="header-bar">
<span>JITET (Jurnal Informatika dan Teknik Elektro Terapan)</span>
<span>Vol. 13 No. 2, pISSN: 2303-0577 eISSN: 2830-7062</span>
</div>''')

# Title area
parts.append('''<div class="title-area">
<h1>Rancang Bangun Content Management System dengan Editorial Workflow Berbasis Web pada Portal Berita Klojen.com</h1>
<div class="authors">Farrel Aqeel Danendra<sup>1*</sup></div>
<div class="affiliation"><sup>1</sup>Program Studi Informatika, Fakultas Ilmu Komputer, Universitas Pembangunan Nasional "Veteran" Jawa Timur;<br/>
Jl. Rungkut Madya, Gunung Anyar, Surabaya, Jawa Timur 60294; Telp. +62 (031) 870 6369</div>
</div>''')

# Abstract
parts.append('''<table style="border:1px solid #999; margin-bottom:10px;">
<tr>
<td style="width:15%; border:none; vertical-align:top; font-size:8pt; padding-top:8px;">
<p class="ni" style="font-size:8pt;">Received: 15 Juni 2026</p>
<p class="ni" style="font-size:8pt;">Accepted: xx-xx-xx</p>
<p class="ni" style="font-size:8pt;">Published: xx-xx-xx</p>
</td>
<td style="width:85%; border:none; vertical-align:top;">
<div class="abstract-box">
<span class="label">Abstrak.</span> Portal berita digital memerlukan sistem pengelolaan konten yang terstruktur untuk mendukung alur kerja redaksi. Penelitian ini merancang dan membangun Content Management System (CMS) berbasis web pada portal berita Klojen.com dengan menerapkan arsitektur decoupled dan pola Service-Repository. Sistem dikembangkan menggunakan Laravel 12 sebagai backend dan Next.js 15 sebagai frontend, dengan fitur utama meliputi manajemen artikel dengan revision history, editorial workflow berbasis role (jurnalis, editor, admin), penjadwalan publikasi otomatis menggunakan cron job, pengelolaan pengguna dengan kontrol akses berbasis peran, serta pencarian artikel menggunakan full-text search. Pengujian fungsional menggunakan metode black-box testing menunjukkan bahwa seluruh fitur berjalan sesuai spesifikasi yang ditetapkan, termasuk mekanisme auto-publish artikel terjadwal dan penanganan dampak penghapusan pengguna terhadap data terkait.
</div>
<div class="keywords"><strong>Kata kunci:</strong> content management system; editorial workflow; portal berita; Laravel; Next.js; cron job; black-box testing.</div>
</td>
</tr>
</table>''')

# Start two-column
parts.append('<div class="two-col">')

# 1. PENDAHULUAN
parts.append('''<h1>1. PENDAHULUAN</h1>
<p>Perkembangan teknologi informasi telah mendorong berbagai instansi dan perusahaan media untuk membangun sistem pengelolaan konten berbasis web yang terstruktur. Roby et al. [1] menyatakan bahwa website yang dikelola melalui Content Management System (CMS) memberikan kemudahan bagi organisasi dalam mengelola informasi secara mandiri tanpa memerlukan keahlian pemrograman yang mendalam. Dalam konteks industri media digital, CMS menjadi komponen krusial yang memungkinkan tim redaksi untuk mengelola siklus hidup konten berita secara efisien, mulai dari tahap penulisan draf oleh jurnalis, proses peninjauan dan persetujuan oleh editor, hingga publikasi ke portal berita [2].</p>
<p>Martha et al. [2] dalam penelitiannya tentang CMS berbasis Next.js menyimpulkan bahwa pemilihan framework frontend yang tepat seperti Next.js dengan kemampuan Server-Side Rendering (SSR) dapat meningkatkan performa dan optimasi SEO pada portal berita. Sementara itu, Maranatha et al. [3] menekankan pentingnya pengujian fungsional menggunakan metode black-box testing untuk memastikan seluruh fitur CMS berjalan sesuai spesifikasi sebelum dirilis ke pengguna.</p>
<p>PT. Ketik Media Siber merupakan perusahaan media digital yang mengelola beberapa portal berita, salah satunya adalah Klojen.com yang berfokus pada informasi seputar Kota Malang dengan empat pilar utama: wisata, kuliner, hotel, dan pendidikan. Sebelum adanya Content Management System (CMS), proses pengelolaan konten berita dilakukan secara manual melalui komunikasi informal antara jurnalis dan editor menggunakan aplikasi pesan instan. Kondisi ini menyebabkan beberapa permasalahan signifikan yang menghambat produktivitas dan kualitas publikasi: (1) kesulitan melacak riwayat perubahan artikel karena tidak adanya sistem pencatatan revisi yang terstruktur, (2) tidak adanya mekanisme penjadwalan publikasi otomatis sehingga editor harus melakukan publish secara manual pada waktu yang ditentukan, yang sering kali terlewatkan karena kesibukan, (3) ketiadaan kontrol akses berbasis peran yang terstruktur sehingga semua pengguna memiliki hak akses yang sama tanpa pembedaan antara jurnalis, editor, dan admin, serta (4) tidak adanya sistem pencarian artikel yang efisien sehingga editor kesulitan menemukan artikel lama untuk referensi atau verifikasi.</p>
<p>Beberapa penelitian sebelumnya telah membahas aspek-aspek terkait pengembangan CMS. Al Farisi et al. [4] mengimplementasikan Role-Based Access Control (RBAC) menggunakan Filament Shield pada sistem informasi pengelolaan tugas akhir, menunjukkan bahwa RBAC efektif dalam mengatur hak akses pengguna berdasarkan peran. Model RBAC yang dikemukakan oleh Sandhu et al. [5] menjadi landasan teoritis untuk implementasi kontrol akses berbasis peran pada berbagai sistem informasi. Rozi [6] dalam penelitian tugas akhirnya membahas penerapan Service-Repository Pattern pada pengembangan back end berbasis REST API, yang terbukti meningkatkan modularitas dan maintainability kode. Sementara itu, Irawan dan Sanusi [7] mengembangkan sistem ERP berbasis web menggunakan kombinasi Next.js dan Laravel dengan pendekatan SDLC Prototyping, menunjukkan bahwa kombinasi kedua framework ini mampu menghasilkan aplikasi web yang responsif dan scalable.</p>
<p>Berdasarkan analisis kesenjangan antara kebutuhan redaksi Klojen.com dan solusi yang tersedia, penelitian ini bertujuan merancang dan membangun CMS dengan editorial workflow berbasis web yang mengintegrasikan seluruh kebutuhan redaksi dalam satu platform terpadu. Kontribusi utama penelitian ini meliputi: (1) perancangan arsitektur decoupled menggunakan Service-Repository Pattern yang memisahkan logika bisnis dari operasi database untuk meningkatkan maintainability, (2) implementasi editorial workflow berbasis role dengan revision history untuk pelacakan perubahan artikel secara lengkap, (3) mekanisme penjadwalan publikasi otomatis menggunakan cron job dengan database transaction untuk menjamin konsistensi data, serta (4) sistem pengelolaan pengguna dengan kontrol akses berbasis peran dan penanganan dampak penghapusan data terhadap konten terkait melalui mekanisme arsip.</p>
<p>Artikel ini diorganisasikan sebagai berikut. Bagian 2 membahas tinjauan pustaka yang menjadi landasan teoritis penelitian. Bagian 3 menjelaskan metode penelitian yang digunakan. Bagian 4 menyajikan hasil implementasi dan pembahasan. Bagian 5 menarik kesimpulan dan saran untuk pengembangan selanjutnya.</p>''')

# 2. TINJAUAN PUSTAKA (expanded)
parts.append('''<h1>2. TINJAUAN PUSTAKA</h1>

<h2>2.1 Content Management System</h2>
<p>Content Management System (CMS) adalah aplikasi yang memfasilitasi pembuatan, pengelolaan, modifikasi, dan publikasi konten digital secara terstruktur dan kolaboratif. Roby et al. [1] mendefinisikan CMS sebagai sistem yang memisahkan concerns antara pembuatan konten (content creation), pengelolaan alur kerja (workflow management), dan presentasi (presentation layer). Martha et al. [2] dalam penelitiannya tentang CMS berbasis Next.js pada company profile menyimpulkan bahwa CMS memberikan kemudahan bagi organisasi dalam mengelola konten secara mandiri tanpa memerlukan keahlian pemrograman yang mendalam, serta framework Next.js dengan kemampuan Server-Side Rendering (SSR) mampu meningkatkan performa dan optimasi SEO. Maranatha et al. [3] menekankan bahwa CMS yang berkualitas harus melalui pengujian fungsional yang komprehensif menggunakan metode black-box testing sebelum dirilis ke pengguna.</p>

<h2>2.2 Editorial Workflow dan Role-Based Access Control</h2>
<p>Editorial workflow merupakan serangkaian proses terstruktur yang dilalui konten berita dari tahap penulisan hingga publikasi. Workflow editorial yang efektif dalam media daring mencakup empat tahapan utama: drafting (penulisan draf oleh jurnalis), reviewing (peninjauan oleh editor), approval (persetujuan untuk publikasi), dan publishing (proses publikasi ke portal berita). Setiap tahapan melibatkan aktor dengan peran spesifik yang memiliki hak akses berbeda terhadap konten.</p>
<p>Role-Based Access Control (RBAC) adalah model keamanan yang membatasi akses sistem berdasarkan peran yang diberikan kepada pengguna. Sandhu et al. [5] dalam paper fundamentalnya yang diterbitkan oleh NIST menjelaskan bahwa RBAC memungkinkan pembagian akses yang terstruktur berdasarkan peran pengguna, yang mengurangi kompleksitas manajemen hak akses dibandingkan pendekatan tradisional. Al Farisi et al. [4] mengimplementasikan RBAC menggunakan Filament Shield pada sistem informasi pengelolaan tugas akhir dan menunjukkan bahwa pendekatan ini efektif dalam mengatur hak akses pengguna berdasarkan peran secara granular. Dalam konteks CMS editorial, peran-peran tersebut meliputi: jurnalis (penulis artikel dengan hak membuat dan mengedit draf), editor (peninjau artikel dengan hak approve, reject, atau publish), dan admin (pengelola sistem dengan hak penuh termasuk manajemen pengguna).</p>

<h2>2.3 Laravel Framework</h2>
<p>Laravel adalah framework PHP open-source yang mengikuti arsitektur Model-View-Controller (MVC) dan menyediakan berbagai fitur untuk mempercepat pengembangan aplikasi web. Irawan dan Sanusi [7] memanfaatkan Laravel sebagai backend dalam pengembangan sistem ERP berbasis web, menunjukkan bahwa Laravel menyediakan fitur lengkap untuk pengembangan backend termasuk Eloquent ORM, middleware, Artisan CLI, Task Scheduler, dan Mailable. Beberapa fitur Laravel yang dimanfaatkan dalam penelitian ini meliputi: Eloquent ORM untuk interaksi dengan database, middleware untuk autentikasi dan otorisasi, Artisan Command Line Interface untuk membuat custom commands, Task Scheduler untuk penjadwalan tugas otomatis, dan Mailable untuk pengiriman email. Laravel juga mendukung penerapan berbagai pola arsitektur seperti Service-Repository Pattern yang memisahkan logika bisnis dari operasi database, sehingga kode menjadi lebih modular, testable, dan mudah dipelihara [6].</p>

<h2>2.4 Next.js Framework</h2>
<p>Next.js adalah framework React yang dikembangkan oleh Vercel untuk membangun aplikasi web modern dengan performa tinggi. H. A. Jartarghar [8] dalam penelitiannya tentang React Apps dengan Server-Side Rendering menggunakan Next.js menyimpulkan bahwa SSR secara signifikan meningkatkan performa loading halaman dan optimasi SEO dibandingkan pendekatan Client-Side Rendering (CSR) murni. Martha et al. [2] juga memanfaatkan Next.js dalam pengembangan CMS company profile dan menunjukkan bahwa fitur-fitur Next.js seperti Server-Side Rendering (SSR), Static Site Generation (SSG), Incremental Static Regeneration (ISR), dan App Router memberikan fleksibilitas tinggi dalam pengembangan frontend. Dalam konteks penelitian ini, Next.js digunakan untuk membangun antarmuka frontend CMS (dashboard, tulis berita, tinjauan artikel, preview berita) serta portal berita publik (beranda, detail artikel, kategori) dengan kemampuan SEO yang optimal melalui dynamic metadata generation.</p>

<h2>2.5 Service-Repository Pattern</h2>
<p>Service-Repository Pattern adalah pola arsitektur perangkat lunak yang memisahkan logika bisnis (service layer) dari operasi akses data (repository layer). Rozi [6] dalam penelitian tugas akhirnya di UGM mengimplementasikan Service-Repository Pattern pada pengembangan back end berbasis REST API untuk sistem informasi properti dan menyimpulkan bahwa pola ini meningkatkan modularitas, testability, dan maintainability kode secara signifikan. Dalam implementasinya pada Laravel: Controller hanya menangani HTTP request/response dan validasi input, Service layer berisi seluruh logika bisnis dan orkestrasi antar komponen, sedangkan Repository layer menangani query database dan pemetaan objek. Pemisahan ini memudahkan pengujian unit karena setiap layer dapat diuji secara independen dengan mocking dependency-nya.</p>

<h2>2.6 Decoupled Architecture</h2>
<p>Decoupled architecture (atau headless architecture) memisahkan backend dan frontend menjadi dua aplikasi independen yang berkomunikasi melalui Application Programming Interface (API). Penelitian tentang performa arsitektur decoupled [9] menunjukkan bahwa pendekatan ini memberikan fleksibilitas dalam pemilihan teknologi untuk masing-masing sisi serta memungkinkan skalabilitas yang lebih baik dibandingkan arsitektur monolitik. Irawan dan Sanusi [7] juga mengadopsi pendekatan decoupled dengan memisahkan frontend Next.js dan backend Laravel dalam sistem ERP-nya, yang memungkinkan tim frontend dan backend bekerja secara paralel. Dalam penelitian ini, Laravel sebagai backend mengekspos RESTful API yang dikonsumsi oleh Next.js sebagai frontend, dengan JSON Web Token (JWT) sebagai mekanisme autentikasi.</p>

<h2>2.7 Black-Box Testing</h2>
<p>Black-box testing adalah metode pengujian perangkat lunak yang mengevaluasi fungsionalitas sistem tanpa melihat struktur kode internal. Maranatha et al. [3] dalam penelitiannya tentang pengujian CMS Quest Master menggunakan black-box testing dengan teknik equivalence partitioning dan menyimpulkan bahwa metode ini efektif dalam menemukan cacat fungsional pada sistem. Saian et al. [10] juga menerapkan black-box testing dengan teknik boundary value analysis pada CMS Sekolahku dan menunjukkan bahwa kombinasi equivalence partitioning dan boundary value analysis mampu mencakup skenario pengujian secara komprehensif. Dalam konteks penelitian ini, black-box testing dipilih karena fokus pengujian adalah pada perilaku sistem dari perspektif pengguna akhir, bukan pada implementasi internal. Setiap skenario pengujian didokumentasikan dengan langkah-langkah yang jelas, hasil yang diharapkan, dan hasil aktual untuk memudahkan pelacakan dan verifikasi.</p>''')

# 3. METODE PENELITIAN
parts.append('''<h1>3. METODE PENELITIAN</h1>
<p>Penelitian ini menggunakan metode Research and Development (R&amp;D) dengan pendekatan waterfall yang terdiri dari lima tahap: analisis kebutuhan, perancangan sistem, implementasi, pengujian, dan deployment. Penelitian dilaksanakan di PT. Ketik Media Siber selama periode Februari hingga Juni 2026.</p>

<h2>3.1 Analisis Kebutuhan</h2>
<p>Tahap analisis kebutuhan dilakukan melalui observasi langsung alur kerja redaksi dan diskusi dengan stakeholder. Hasil analisis kebutuhan sistem diidentifikasi menjadi dua kategori: kebutuhan fungsional dan kebutuhan non-fungsional, sebagaimana dirangkum pada Tabel 1.</p>

<div class="tbl-cap">Tabel 1. Analisis Kebutuhan Sistem</div>
<table>
<tr><th>Kategori</th><th>Kebutuhan</th><th>Deskripsi</th></tr>
<tr><td rowspan="6">Fungsional</td><td>Manajemen Artikel</td><td>CRUD artikel dengan revision history dan auto-generate slug</td></tr>
<tr><td>Editorial Workflow</td><td>Alur draft &rarr; review &rarr; published berbasis role</td></tr>
<tr><td>Scheduled Publish</td><td>Penjadwalan publikasi otomatis menggunakan cron job</td></tr>
<tr><td>User Management</td><td>CRUD pengguna dengan kontrol akses berbasis peran</td></tr>
<tr><td>Pencarian Artikel</td><td>Full-text search dengan indexing otomatis</td></tr>
<tr><td>Preview Artikel</td><td>Preview tampilan artikel sebelum dipublikasikan</td></tr>
<tr><td rowspan="4">Non-Fungsional</td><td>Keamanan</td><td>JWT authentication dan RBAC</td></tr>
<tr><td>Performa</td><td>SSR/ISR untuk optimasi SEO dan kecepatan</td></tr>
<tr><td>Maintainability</td><td>Service-Repository Pattern untuk modularitas</td></tr>
<tr><td>Responsiveness</td><td>Tampilan optimal di desktop dan mobile</td></tr>
</table>

<h2>3.2 Alur Penelitian</h2>
<p>Alur tahapan penelitian digambarkan pada Gambar 1. Setiap tahapan menghasilkan luaran spesifik yang menjadi masukan untuk tahapan berikutnya. Jika hasil pengujian menunjukkan adanya ketidaksesuaian, proses kembali ke tahap implementasi untuk perbaikan sebelum dilanjutkan ke deployment.</p>''')

I_method = img_tag('research_method.png')
parts.append(f'''<div class="fig-cap">Gambar 1. Alur Metode Penelitian</div>
<div style="text-align:center;">{I_method}</div>''')

parts.append('''<h2>3.3 Perancangan Sistem</h2>
<p>Sistem dirancang menggunakan arsitektur decoupled yang memisahkan backend (Laravel 12, PHP 8.4, database SQLite) dan frontend (Next.js 15, TypeScript, Tailwind CSS). Komunikasi antara frontend dan backend dilakukan melalui RESTful API dengan autentikasi JWT. Backend menerapkan Service-Repository Pattern untuk memisahkan logika bisnis dari operasi database. Perancangan database menghasilkan 15 tabel utama: articles, users, categories, tags, article_tags, article_revisions, scheduled_articles, bookmarks, comments, page_views, search_indexes, refresh_tokens, password_reset_tokens, media, dan comment_rate_limits. Gambar 2 menunjukkan arsitektur sistem secara keseluruhan, sedangkan Gambar 3 menggambarkan interaksi antar komponen dalam arsitektur decoupled.</p>''')

I_arch = img_tag('arch_system.png')
I_interaction = img_tag('arch_interaction.png')
parts.append(f'''<div class="fig-cap">Gambar 2. Arsitektur Sistem CMS Klojen.com</div>
<div style="text-align:center;">{I_arch}</div>
<div class="fig-cap">Gambar 3. Diagram Interaksi Komponen Decoupled Architecture</div>
<div style="text-align:center;">{I_interaction}</div>''')

parts.append('''<h2>3.4 Implementasi</h2>
<p>Implementasi dilakukan secara iteratif dengan prioritas fitur sebagai berikut: (1) setup proyek dan konfigurasi lingkungan pengembangan termasuk database migration dan seeder, (2) implementasi fitur inti CMS meliputi manajemen artikel dan editorial workflow dengan revision history, (3) implementasi scheduled publish dengan Artisan Command dan Laravel Task Scheduler, (4) implementasi user management dengan RBAC dan email notification, serta (5) integrasi frontend-backend menggunakan Axios dan pengujian fungsional.</p>

<h2>3.5 Pengujian</h2>
<p>Pengujian dilakukan menggunakan metode black-box testing sebagaimana dijelaskan pada bagian 2.7. Skenario pengujian dirancang untuk mencakup seluruh fitur utama sistem dengan fokus pada: (1) pengujian scheduled publish yang mencakup penjadwalan artikel, verifikasi auto-publish oleh cron job, validasi waktu minimal penjadwalan, dan pembatalan jadwal, (2) pengujian user management yang mencakup operasi CRUD lengkap, kontrol akses berbasis peran, dan penanganan dampak penghapusan pengguna. Setiap skenario pengujian didokumentasikan dengan langkah-langkah detail, hasil yang diharapkan, dan screenshot hasil eksekusi untuk memudahkan verifikasi dan reproduksi.</p>''')

# 4. HASIL DAN PEMBAHASAN
parts.append('''<h1>4. HASIL DAN PEMBAHASAN</h1>

<h2>4.1 Arsitektur Sistem</h2>
<p>Sistem CMS Klojen.com berhasil dibangun dengan arsitektur decoupled yang memisahkan backend (Laravel 12) dan frontend (Next.js 15) menjadi dua aplikasi independen seperti ditunjukkan pada Gambar 1 dan Gambar 2. Backend mengekspos RESTful API yang dikonsumsi oleh frontend melalui HTTP request dengan header Authorization berisi Bearer token JWT. Autentikasi menggunakan JWT dengan refresh token yang disimpan di database untuk mendukung mekanisme token revocation ketika terjadi perubahan role atau penghapusan pengguna.</p>
<p>Arsitektur ini memberikan beberapa keuntungan: (1) tim backend dan frontend dapat bekerja secara paralel tanpa saling mengganggu, (2) penggantian teknologi di salah satu sisi (misalnya migrasi dari Next.js ke framework lain) tidak mempengaruhi sisi backend selama API contract tetap sama, (3) API yang sama dapat dikonsumsi oleh berbagai client termasuk aplikasi mobile di masa depan, dan (4) skalabilitas yang lebih baik karena backend dan frontend dapat di-deploy dan di-scale secara independen.</p>

<h2>4.2 Editorial Workflow Berbasis Role</h2>
<p>Editorial workflow diimplementasikan menggunakan RBAC dengan tiga peran utama: jurnalis, editor, dan admin. Gambar 3 menggambarkan alur editorial workflow secara lengkap dari tahap penulisan hingga publikasi. Jurnalis dapat membuat artikel baru dengan status draft dan mengirimkannya ke review. Editor dapat meninjau artikel yang berstatus review dengan tiga opsi: approve (mengubah status menjadi published), reject (mengembalikan ke draft dengan catatan), atau schedule (menjadwalkan publikasi pada waktu tertentu). Editor juga memiliki kemampuan untuk mengunci artikel (lock) yang sedang dikerjakan untuk mencegah konflik editing antar editor yang mengerjakan artikel yang sama secara bersamaan.</p>''')

I_editorial = img_tag('act_editorial.png')
parts.append(f'''<div class="fig-cap">Gambar 4. Activity Diagram Editorial Workflow</div>
<div style="text-align:center;">{I_editorial}</div>''')

parts.append('''<p>Setiap perubahan pada artikel dicatat dalam tabel article_revisions sebagai audit trail. Tabel ini menyimpan snapshot judul dan konten sebelum perubahan dilakukan, beserta identitas pengguna yang melakukan perubahan, timestamp, dan catatan perubahan. Mekanisme ini memungkinkan pelacakan riwayat perubahan artikel secara lengkap dari awal pembuatan hingga versi terkini.</p>
<p>Proses pembuatan artikel baru melalui beberapa tahapan dalam service layer: (1) penentuan slug — jika pengguna mengirim slug manual, sistem memvalidasi keunikan; jika tidak, sistem melakukan auto-generate dari judul dengan loop pengecekan ke database dan penambahan suffix (-2, -3, dst.) jika terjadi duplikasi, (2) insert data artikel ke database dengan status awal draft, (3) pemrosesan relasi tag menggunakan pendekatan firstOrCreate yang membuat tag baru jika belum ada berdasarkan slug-nya, (4) penyimpanan revision pertama sebagai audit trail yang mencatat snapshot judul dan konten, serta (5) reindex artikel ke search index untuk memastikan artikel langsung muncul di hasil pencarian.</p>

<h2>4.3 Penjadwalan Publikasi Otomatis</h2>
<p>Fitur scheduled publish diimplementasikan menggunakan Artisan Command (articles:publish-scheduled) yang dipicu oleh Laravel Task Scheduler setiap menit melalui cron daemon di server. ScheduledPublishService memproses artikel yang sudah waktunya tayang dengan langkah-langkah berikut: (1) mengambil daftar artikel dari tabel scheduled_articles dengan kondisi scheduled_at <= NOW() dan is_published = false, (2) untuk setiap artikel, melakukan UPDATE status menjadi published dan published_at dengan waktu saat ini dalam satu database transaction, (3) memperbarui flag is_published menjadi true pada tabel scheduled_articles untuk menandai bahwa artikel sudah diproses, serta (4) melakukan reindex pada tabel search_indexes agar artikel langsung muncul di hasil pencarian. Gambar 5 menunjukkan sequence diagram interaksi antar komponen.</p>''')

I_seq = img_tag('seq_scheduled.png')
parts.append(f'''<div class="fig-cap">Gambar 5. Sequence Diagram Scheduled Publish</div>
<div style="text-align:center;">{I_seq}</div>''')

parts.append('''<p>Seluruh operasi publish dibungkus dalam database transaction untuk menjamin konsistensi data (ACID properties). Jika salah satu operasi gagal (misalnya update status berhasil tetapi reindex gagal), seluruh perubahan akan di-rollback sehingga data tetap konsisten. Validasi waktu minimal 5 menit diterapkan untuk memberikan buffer sebelum cron job berikutnya berjalan. Command ini mengembalikan jumlah artikel yang berhasil di-publish sebagai output untuk keperluan monitoring.</p>''')

parts.append('''<h2>4.4 Pengelolaan Pengguna dengan RBAC</h2>
<p>Fitur user management hanya dapat diakses oleh pengguna dengan role admin melalui middleware admin yang memvalidasi role sebelum request diproses. Fitur ini mencakup operasi CRUD lengkap dengan beberapa mekanisme keamanan: (1) validasi duplikasi email menggunakan unique constraint di database dan pengecekan di service layer, (2) auto-generate password 12 karakter dengan komposisi minimal satu huruf besar, huruf kecil, angka, dan simbol untuk memastikan kekuatan password, (3) pengiriman email berisi kredensial login menggunakan NewUserCredentials Mailable dengan template HTML yang informatif, serta (4) pencegahan admin menghapus atau mengedit akunnya sendiri untuk menghindari penguncian akun secara tidak sengaja.</p>
<p>Pada operasi delete, sistem melakukan tiga langkah berurutan dalam satu operasi: (1) revoke seluruh refresh token pengguna dari tabel refresh_tokens untuk logout paksa dari semua perangkat yang aktif, (2) arsipkan seluruh artikel milik pengguna dengan mengubah statusnya menjadi archived menggunakan query UPDATE batch, serta (3) hapus data pengguna dari tabel users. Mekanisme arsipkan artikel (bukan menghapus) diterapkan untuk menjaga integritas sejarah konten — artikel tetap tersimpan di database namun tidak tampil di portal berita publik. Gambar 6 menunjukkan alur operasi user management.</p>''')

I_user = img_tag('act_user_crud.png')
parts.append(f'''<div class="fig-cap">Gambar 6. Activity Diagram Manajemen User (CRUD)</div>
<div style="text-align:center;">{I_user}</div>''')

parts.append('''<p>Proses penghapusan user melalui tiga langkah berurutan yang diorkestrasi oleh service layer: pertama, revoke seluruh refresh token dari tabel refresh_tokens untuk memastikan pengguna langsung logout dari semua perangkat; kedua, arsipkan seluruh artikel milik pengguna dengan mengubah status menjadi archived melalui query UPDATE batch; ketiga, hapus data pengguna dari tabel users. Validasi CANNOT_MODIFY_SELF memastikan admin tidak dapat menghapus akunnya sendiri.</p>''')

# Testing section with screenshot placeholders
parts.append('''<h2>4.5 Hasil Pengujian Fungsional</h2>
<p>Pengujian fungsional dilakukan menggunakan metode black-box testing terhadap seluruh fitur utama sistem. Setiap skenario pengujian didokumentasikan dengan langkah-langkah detail, hasil yang diharapkan, hasil aktual, dan screenshot hasil eksekusi untuk memudahkan verifikasi. Tabel 2 merangkum hasil pengujian fitur scheduled publish.</p>

<div class="tbl-cap">Tabel 2. Hasil Pengujian Fitur Scheduled Publish</div>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Hasil yang Diharapkan</th><th>Status</th></tr>
<tr><td>1</td><td>Jadwalkan artikel (&gt; 5 menit dari sekarang)</td><td>Status berubah menjadi scheduled</td><td>Berhasil</td></tr>
<tr><td>2</td><td>Verifikasi auto-publish oleh cron job</td><td>Status berubah menjadi published saat jadwal tiba</td><td>Berhasil</td></tr>
<tr><td>3</td><td>Validasi waktu minimal (&lt; 5 menit)</td><td>Error 400: SCHEDULED_TIME_TOO_SOON</td><td>Berhasil</td></tr>
<tr><td>4</td><td>Batalkan jadwal (kembali ke draft)</td><td>Status berubah kembali ke draft</td><td>Berhasil</td></tr>
<tr><td>5</td><td>Artikel belum waktunya publish</td><td>Artikel tetap berstatus scheduled</td><td>Berhasil</td></tr>
<tr><td>6</td><td>Verifikasi search index reindex</td><td>Artikel muncul di hasil pencarian</td><td>Berhasil</td></tr>
</table>

<p>Berikut adalah dokumentasi screenshot hasil pengujian scheduled publish:</p>

<div class="fig-cap">Gambar 7. Screenshot Hasil Pengujian: Jadwalkan Artikel</div>
<div class="screenshot-placeholder">[Screenshot: Response 200 OK dengan status = scheduled]</div>

<div class="fig-cap">Gambar 8. Screenshot Hasil Pengujian: Auto-Publish oleh Cron Job</div>
<div class="screenshot-placeholder">[Screenshot: Output terminal php artisan articles:publish-scheduled<br/>menampilkan jumlah artikel yang berhasil di-publish]</div>

<div class="fig-cap">Gambar 9. Screenshot Hasil Pengujian: Validasi Waktu Minimal</div>
<div class="screenshot-placeholder">[Screenshot: Response 400 dengan error SCHEDULED_TIME_TOO_SOON]</div>

<p>Tabel 3 merangkum hasil pengujian fitur user management.</p>

<div class="tbl-cap">Tabel 3. Hasil Pengujian Fitur User Management</div>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Hasil yang Diharapkan</th><th>Status</th></tr>
<tr><td>1</td><td>Create user data lengkap</td><td>Response 201, email kredensial terkirim</td><td>Berhasil</td></tr>
<tr><td>2</td><td>Create user email duplikat</td><td>Error 409 EMAIL_ALREADY_EXISTS</td><td>Berhasil</td></tr>
<tr><td>3</td><td>Verifikasi email kredensial</td><td>Email berisi nama, password sementara, dan role</td><td>Berhasil</td></tr>
<tr><td>4</td><td>Update nama user</td><td>Nama berhasil diperbarui</td><td>Berhasil</td></tr>
<tr><td>5</td><td>Update role (revoke token)</td><td>Role berubah, semua token di-revoke</td><td>Berhasil</td></tr>
<tr><td>6</td><td>Nonaktifkan user (is_active=false)</td><td>User berhasil dinonaktifkan</td><td>Berhasil</td></tr>
<tr><td>7</td><td>Edit akun sendiri</td><td>Error 403 CANNOT_MODIFY_SELF</td><td>Berhasil</td></tr>
<tr><td>8</td><td>Delete user</td><td>User dihapus, artikel berubah ke archived</td><td>Berhasil</td></tr>
<tr><td>9</td><td>Delete akun sendiri</td><td>Error 403 CANNOT_MODIFY_SELF</td><td>Berhasil</td></tr>
<tr><td>10</td><td>Akses tanpa role admin</td><td>Response 403 Forbidden</td><td>Berhasil</td></tr>
</table>

<p>Berikut adalah dokumentasi screenshot hasil pengujian user management:</p>

<div class="fig-cap">Gambar 10. Screenshot Hasil Pengujian: Create User Berhasil</div>
<div class="screenshot-placeholder">[Screenshot: Response 201 Created dengan data user baru]</div>

<div class="fig-cap">Gambar 11. Screenshot Hasil Pengujian: Email Kredensial Terkirim</div>
<div class="screenshot-placeholder">[Screenshot: Inbox email berisi nama, password sementara, dan role]</div>

<div class="fig-cap">Gambar 12. Screenshot Hasil Pengujian: Delete User dengan Arsip Artikel</div>
<div class="screenshot-placeholder">[Screenshot: Response 200 OK, database menunjukkan artikel user berubah status menjadi archived]</div>

<p>Hasil pengujian menunjukkan bahwa seluruh fitur berjalan sesuai spesifikasi yang ditetapkan. Mekanisme database transaction pada fitur scheduled publish menjamin konsistensi data saat proses auto-publish berlangsung — jika salah satu operasi gagal, seluruh perubahan akan di-rollback. Pada fitur user management, mekanisme arsipkan artikel saat penghapusan pengguna berhasil menjaga integritas data konten meskipun data pengguna telah dihapus dari sistem. Validasi kontrol akses berbasis peran juga berjalan dengan baik, memastikan bahwa hanya admin yang dapat mengakses endpoint user management.</p>

<h2>4.6 Pembahasan</h2>
<p>Berdasarkan hasil implementasi dan pengujian, sistem CMS Klojen.com telah berhasil memenuhi kebutuhan yang diidentifikasi pada tahap analisis. Beberapa temuan penting dari penelitian ini meliputi:</p>
<p>Pertama, penerapan Service-Repository Pattern terbukti efektif dalam menghasilkan kode yang modular dan mudah dipelihara. Pemisahan logika bisnis dari operasi database memudahkan pengujian unit dan memungkinkan penggantian implementasi repository tanpa mempengaruhi service layer. Namun, pola ini juga menambah kompleksitas karena memerlukan lebih banyak file dan class dibandingkan pendekatan monolitik sederhana.</p>
<p>Kedua, mekanisme revision history menggunakan tabel article_revisions memberikan kemampuan pelacakan perubahan yang komprehensif. Setiap versi artikel dapat direkonstruksi dengan mengambil snapshot dari tabel revisions. Keterbatasan pendekatan ini adalah pertumbuhan tabel yang cepat jika artikel sering diubah, sehingga diperlukan strategi archival atau pagination untuk artikel dengan banyak revisi.</p>
<p>Ketiga, implementasi scheduled publish menggunakan cron job dan database transaction memberikan jaminan konsistensi data yang kuat. Namun, pendekatan ini memiliki keterbatasan skalabilitas karena cron job berjalan pada satu server. Untuk skala yang lebih besar, diperlukan message queue (seperti Redis Queue) untuk mendistribusikan tugas publish ke multiple workers.</p>
<p>Keempat, mekanisme arsip artikel saat penghapusan pengguna (soft delete pada artikel) berhasil menjaga integritas konten tanpa kehilangan data historis. Pendekatan ini lebih aman dibandingkan hard delete karena memungkinkan pemulihan jika penghapusan pengguna dilakukan secara tidak sengaja.</p>''')

# End two-column
parts.append('</div>')

# 5. KESIMPULAN (full width)
parts.append('''<h1>5. KESIMPULAN</h1>
<p>Berdasarkan hasil penelitian dan pembahasan, dapat disimpulkan beberapa hal sebagai berikut:</p>
<ol>
<li>Content Management System dengan editorial workflow berhasil dirancang dan dibangun menggunakan arsitektur decoupled (Laravel 12 sebagai backend dan Next.js 15 sebagai frontend) dengan Service-Repository Pattern yang menghasilkan kode modular, testable, dan mudah dipelihara.</li>
<li>Editorial workflow berbasis role (jurnalis, editor, admin) berhasil diimplementasikan dengan mekanisme revision history yang memungkinkan pelacakan riwayat perubahan artikel secara lengkap dari awal pembuatan hingga versi terkini, serta fitur lock/unlock untuk mencegah konflik editing antar editor.</li>
<li>Mekanisme penjadwalan publikasi otomatis menggunakan Artisan Command dan Laravel Task Scheduler berhasil memproses artikel terjadwal secara konsisten setiap menit dengan jaminan konsistensi data melalui database transaction.</li>
<li>Fitur pengelolaan pengguna berhasil menyediakan mekanisme CRUD lengkap dengan auto-generate password 12 karakter, pengiriman email kredensial menggunakan Mailable, kontrol akses berbasis peran melalui middleware, serta penanganan dampak penghapusan pengguna terhadap data artikel terkait melalui mekanisme arsip (status = archived).</li>
<li>Pengujian fungsional menggunakan metode black-box testing menunjukkan bahwa seluruh 16 skenario pengujian (6 untuk scheduled publish dan 10 untuk user management) berjalan sesuai spesifikasi tanpa ditemukan error yang tidak terduga.</li>
</ol>
<p>Beberapa saran untuk pengembangan selanjutnya meliputi: (1) implementasi soft delete pada tabel users untuk mempertahankan riwayat pengguna meskipun telah dihapus, (2) penambahan audit log untuk melacak seluruh perubahan yang dilakukan oleh admin, (3) migrasi dari SQLite ke PostgreSQL untuk mendukung skala produksi yang lebih besar dan fitur full-text search yang lebih canggih, serta (4) implementasi message queue untuk meningkatkan skalabilitas fitur scheduled publish.</p>''')

# UCAPAN TERIMA KASIH
parts.append('''<h1>UCAPAN TERIMA KASIH</h1>
<p>Penulis mengucapkan terima kasih kepada PT. Ketik Media Siber yang telah memberikan kesempatan untuk melaksanakan program magang mandiri dan terlibat secara langsung dalam pengembangan proyek Sistem Portal Berita dan CMS Redaksi Klojen.com. Terima kasih juga disampaikan kepada Bapak Yoga Ari Tofan, S.Kom., M.Kom. selaku dosen pembimbing yang telah memberikan arahan dan masukan selama pelaksanaan penelitian, serta kepada Bapak Galih Rivanto selaku Direktur IT PT. Ketik Media Siber atas bimbingan teknis selama magang.</p>''')

# DAFTAR PUSTAKA
parts.append('''<h1>DAFTAR PUSTAKA</h1>
<div class="refs">
<p>[1] A. I. Roby, R. Cahyana, R. Kurniawati, dan L. Fitriani, “Rancang Bangun Content Management System Untuk Situs Web Instansi Pemerintahan,” <i>Jurnal Algoritma</i>, vol. 18, no. 2, pp. 367–375, Jan 2022, doi: 10.33364/algoritma.v18i2.367.</p>
<p>[2] G. Martha, I. N. Y. A. Wijaya, dan N. W. Utami, “Rancang Bangun Company Profile Berbasis Content Management System Menggunakan Framework Next.Js Pada Satelit NET Komputer,” <i>Jurnal Saintikom (Jurnal Sains Manajemen Informatika dan Komputer)</i>, vol. 24, no. 2, Agu 2025, doi: 10.53513/jis.v24i2.11912.</p>
<p>[3] I. F. Maranatha, A. J. Santoso, dan A. W. R. Emanuel, “Pengujian Content Management System – Quest Master Menggunakan Black Box Testing (Studi Kasus: Astra Credit Companies),” <i>Jurnal Informatika Atma Jogja</i>, vol. 3, no. 1, Mei 2022, doi: 10.24002/jiaj.v3i1.5908.</p>
<p>[4] R. Al Farisi, A. R. Zayn, B. A. Nugroho, A. Heriadi, dan N. D. Susanti, “Integrasi Role-Based Access Control (RBAC) Menggunakan Filament Shield Pada Sistem Informasi Pengelolaan Tugas Akhir,” <i>Jurnal Sistem Informasi Triguna Dharma (JURSI TGD)</i>, vol. 5, no. 2, Mar 2026, doi: 10.53513/jursi.v5i2.12379.</p>
<p>[5] R. S. Sandhu, D. F. Ferraiolo, dan R. Kuhn, “The NIST Model for Role-Based Access Control: Towards a Unified Standard,” in <i>Proceedings of the 5th ACM Workshop on Role-Based Access Control</i>, Berlin, Germany, 2000, pp. 47–63.</p>
<p>[6] M. F. Rozi, “Pengembangan Back End Berbasis REST API pada Sistem Informasi Properti Menggunakan Service Repository Pattern,” Tugas Akhir, D4 Teknologi Perangkat Lunak, Universitas Gadjah Mada, Yogyakarta, 2024.</p>
<p>[7] A. N. Irawan dan A. P. Sanusi, “Development of a Web-Based ERP System Using Next.js and Laravel: A Prototyping SDLC Approach,” <i>SMATIKA Jurnal</i>, vol. 16, no. 01, Mar 2026, doi: 10.32664/smatika.v16i01.2174.</p>
<p>[8] H. A. Jartarghar, G. R. Salanke, A. A. Kumar, dan S. Dalali, “React Apps with Server-Side Rendering: Next.js,” <i>Journal of Telecommunication, Electronic and Computer Engineering</i>, vol. 14, 2022.</p>
<p>[9] D. G. Right and D. O. Hall, “The Performance of Decoupled Architectures,” <i>ResearchGate</i>, 2004. [Online]. Available: https://www.researchgate.net/publication/2670701.</p>
<p>[10] S. D. S. Saian, N. L. Kakihary, dan T. Wahyono, “Pengujian Content Management System (CMS) Sekolahku Menggunakan Metode Black Box Testing dengan Teknik Boundary Value Analysis,” <i>IT-Explore: Jurnal Penerapan Teknologi Informasi dan Komunikasi</i>, vol. 1, no. 2, pp. 100–113, Jun 2022, doi: 10.24246/itexplore.v1i2.2022.pp100-113.</p>
<p>[11] R. A. Sukamto dan M. Shalahuddin, <i>Rekayasa Perangkat Lunak Terstruktur dan Berorientasi Objek</i>. Bandung: Informatika Bandung, 2018.</p>
<p>[12] Laravel LLC, “Laravel 12 Documentation — Service Container, Middleware, Artisan, Task Scheduling, and Mailable,” <i>laravel.com</i>, 2025. [Online]. Available: https://laravel.com/docs.</p>
<p>[13] Vercel Inc, “Next.js 15 Documentation — Server-Side Rendering, Static Generation, Incremental Static Regeneration, and App Router,” <i>nextjs.org</i>, 2025. [Online]. Available: https://nextjs.org/docs.</p>
<p>[14] S. Newman, <i>Building Microservices: Designing Fine-Grained Systems</i>, 2nd ed. Sebastopol: O’Reilly Media, 2021.</p>
<p>[15] M. Fowler, <i>Patterns of Enterprise Application Architecture</i>. Boston: Addison Wesley, 2003.</p>
</div>''')

parts.append('</body></html>')

html_content = '\n'.join(parts)
html_path = os.path.join(PROJECT_ROOT, '_jurnal_cms.html')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
print(f'HTML: {len(html_content):,} chars')

# Generate PDF
print('\n=== Generating PDF ===')
pdf_path = os.path.join(PROJECT_ROOT, 'Jurnal_JITET_CMS_Klojen.pdf')
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

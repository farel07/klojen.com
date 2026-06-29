# Dokumentasi Komprehensif Proyek Portal Berita "Klojen.com"

Dokumen ini merupakan analisis dan pemahaman mendetail dari arsitektur, alur sistem, dan implementasi kode pada proyek Klojen.com, yang mencakup baik sisi Backend (Laravel) maupun Frontend (Next.js).

---

## 1. Arsitektur Umum & Tech Stack
Proyek ini mengadopsi arsitektur **Decoupled (Headless CMS)** di mana Backend (API) dan Frontend (Client) dipisah sepenuhnya.

*   **Backend:** **Laravel 12.0** berjalan dengan PHP 8.2+. Berperan sebagai RESTful API provider.
*   **Frontend:** **Next.js 16.2** (App Router) menggunakan React 19. Berperan sebagai antarmuka publik dan CMS (Content Management System).
*   **Database:** Relational Database (SQL) dengan desain skema yang sangat terstruktur menggunakan UUID untuk seluruh *primary key*.

---

## 2. Struktur Database & Model (Backend)
Sistem database dirancang untuk skalabilitas dan keamanan (menggunakan tipe data UUID).
1.  **Users:** Tabel pengguna sentral. Memiliki peran (*role*): `admin`, `editor`, `journalist`, `reader`.
2.  **Articles:** Tabel paling kompleks. Menyimpan berita dengan field `status` (`draft`, `review`, `published`, `scheduled`, `rejected`, `archived`). Memiliki fitur `locked_by` (untuk mencegah konflik saat editor mereview) dan `published_by`.
3.  **Categories & Tags:** Taksonomi berita. Categories mendukung hierarki (`parent_id`), sementara Tags berbentuk flat. (Relasi *Many-to-Many* melalui pivot `article_tags`).
4.  **Media:** Sistem penyimpanan *file* gambar terpusat. Menggunakan penanda boolean `is_library` untuk memisahkan antara foto yang menempel di satu artikel saja dengan foto yang masuk ke *Bank Media Global*.
5.  **Page_Views:** Sistem analitik *real-time* yang merekam kunjungan asli pengunjung berdasarkan `path`, `ip_address`, `user_agent`, dan `created_at`.
6.  **Tabel Pendukung:** `comments` (hierarkis), `bookmarks` (simpan artikel), `article_revisions` (riwayat edit), `search_indexes` (pencarian fulltext).

---

## 3. Alur Kerja Editorial (CMS Workflow)
Alur ini adalah nyawa dari portal berita Klojen.com:
1.  **Journalist (Jurnalis):**
    *   Hanya dapat menulis berita (Draft) dan mengirimkannya ke Editor (Review).
    *   Hanya dapat melihat dan mengedit berita buatannya sendiri (selama belum *Published*).
2.  **Editor:**
    *   Dapat melihat semua berita yang berstatus `review`.
    *   Dapat mengunci artikel (`lock`) dengan status `on_progress` sehingga editor lain tahu bahwa berita ini sedang direview/diedit.
    *   Dapat menerbitkan langsung (`published`), menjadwalkan (`scheduled`), atau mengembalikan berita ke jurnalis (`rejected` + menyertakan *Rejection Reason*).
3.  **Admin:**
    *   Memiliki kendali penuh atas sistem *backend*.
    *   Mengatur daftar kategori, tag, akun pengguna, dan melihat statistik portal.

---

## 4. Analisis Mendetail: Frontend (Next.js)

### A. State Management & Auth
*   Menggunakan **Zustand** (`authStore`) untuk menyimpan token dan data *user*.
*   **Axios Interceptors:** Menggunakan `axiosInstance` yang otomatis menempelkan `Authorization: Bearer <token>`. Jika token kedaluwarsa (401), sistem *interceptor* akan otomatis mencoba me-*refresh* token ke `/auth/refresh` di *background*, dan mengulang request tanpa pengguna sadari. Sangat *seamless*.

### B. Routing (App Router)
*   **Publik (`app/(public)`):** Beranda, Detail Artikel, Login/Register.
*   **CMS (`app/cms`):** Diproteksi menggunakan sistem pembatasan *role* di `Sidebar.tsx`.
*   **Analytics Tracker:** Komponen siluman `AnalyticsTracker.tsx` ditanam di dalam `layout.tsx` utama. Ia membaca URL melalui `usePathname()` dan menembakkan API `POST /analytics/track` secara diam-diam.

### C. Fitur Tulis Berita (TulisBerita / Rich Editor)
Ini adalah modul frontend paling *advanced*:
*   **Upload Gambar & Crop:** Menggunakan `react-easy-crop` untuk memotong *thumbnail* berita langsung di sisi klien sebelum dikirim.
*   **Watermark System:** Sistem watermark tidak menggunakan prosesing server yang lambat, melainkan di-*bake* (dicetak) menggunakan `HTMLCanvasElement` di sisi *browser*. Jika jurnalis mencentang "Beri Watermark", teks "KLOJEN.COM" akan digambar ke atas foto secara *overlay*, lalu diubah menjadi `Blob` baru dan dikirim.
*   **Manajemen Form Data:** Karena ada gambar (binary) dan data teks berformat *Rich Text* (HTML), pengiriman menggunakan spesifikasi `FormData` (multipart/form-data).

### D. Dashboard Admin
*   Dashboard menggunakan **Recharts** untuk visualisasi (Area Chart, Pie Chart, Bar Chart).
*   Data ditarik secara asli dari tabel `page_views` di server, yang dikelompokkan (*grouped*) sesuai filter waktu (Hari ini, 7 Hari, 30 Hari, 1 Tahun) sehingga grafiknya responsif dan 100% *real*.

---

## 5. Analisis Mendetail: Backend (Laravel)

### A. Repositories & Services Pattern
*   Daripada menumpuk kueri SQL/Eloquent di dalam Controller, aplikasi ini menggunakan *Service Layer* (`ArticleService`) dan *Repository Layer* (`MediaRepository`).
*   Ini membuat *Controller* sangat bersih (hanya mengurusi *Request Validation* dan HTTP *Response*). Logika bisnis ada di Service, dan pemanggilan *Database* ada di Repository.

### B. Manajemen Autentikasi (JWT)
*   Menggunakan `tymon/jwt-auth`. Berbeda dengan *Session* bawaan Laravel, arsitektur *stateless* ini sempurna untuk API karena token disahkan tanpa membebani memori server.

### C. Analitik dan Kinerja
*   **AnalyticsController:** Memiliki sistem anti-spam. Sebelum mencatat halaman baru ke `page_views`, ia akan memeriksa apakah ada *IP Address* dan *Path* yang identik dalam 5 menit terakhir. Jika ada, ia tidak akan mencatat *double-count*.
*   **Sitemap Controller:** Terdapat endpoint *sitemap* khusus (`sitemap` dan `news-sitemap` untuk Google News) yang sangat SEO-friendly, dibatasi pada durasi waktu mundur (misalnya: hanya berita 48 jam terakhir untuk News Sitemap).

---

## 6. Kesimpulan & Opini Analisis
Secara keseluruhan, proyek Klojen.com ini sudah sangat "Enterprise-Ready". Pemisahan logic (*Headless*), penggunaan Canvas untuk *watermarking* (sehingga menghemat CPU Server Backend), dan pengamanan alur *role-based access control* (RBAC) pada editorial menunjukkan struktur *codebase* yang elegan dan sangat efisien. Sistem *Real-time Visitor Tracking* yang baru dibangun juga membuat CMS ini setara dengan platform media modern independen yang efisien tanpa ketergantungan pihak ketiga di awal pengembangannya.

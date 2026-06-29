# Penjelasan Presentasi Rekognisi Mata Kuliah
## Proyek: Portal Berita Klojen.com

---

## 1. Analisis Kebutuhan

### 1.1 Latar Belakang

Portal Berita Klojen.com adalah sistem informasi berbasis web yang dibangun untuk menyediakan platform pemberitaan digital. Sistem ini terdiri dari dua bagian utama:

1. **Portal Publik** — halaman yang dapat diakses oleh seluruh masyarakat umum untuk membaca berita.
2. **CMS (Content Management System) Redaksi** — panel khusus yang digunakan oleh tim internal (Admin, Editor, Jurnalis) untuk mengelola konten berita.

---

### 1.2 Identifikasi Pengguna (User Roles)

Berdasarkan analisis kebutuhan, sistem memiliki **4 jenis pengguna** dengan hak akses yang berbeda-beda:

| Role | Deskripsi |
|---|---|
| **Reader** | Masyarakat umum. Dapat membaca berita, memberikan komentar (jika login), dan menyimpan bookmark. |
| **Journalist** | Wartawan/penulis. Dapat membuat dan mengedit artikel miliknya sendiri, serta mengajukannya untuk direviu. |
| **Editor** | Mempunyai hak akses lebih luas. Dapat menerbitkan (publish), menjadwalkan, dan mengarsipkan artikel. Dapat menghapus komentar. |
| **Admin** | Hak akses penuh. Semua fitur editor ditambah manajemen pengguna (menambah/mengedit/menonaktifkan akun karyawan). |

---

### 1.3 Kebutuhan Fungsional

Kebutuhan fungsional adalah **apa saja yang harus bisa dilakukan oleh sistem**:

#### Portal Publik
- **KF-01** — Menampilkan daftar berita terbaru dan berita unggulan (featured) di halaman utama.
- **KF-02** — Menampilkan detail artikel lengkap beserta gambar, kategori, penulis, dan jumlah penayangan.
- **KF-03** — Menampilkan dan menerima komentar dari pengguna yang sudah login.
- **KF-04** — Sistem pencarian artikel berdasarkan kata kunci dengan debounce 300ms.
- **KF-05** — Pengelompokan artikel berdasarkan Kategori dan Tag.
- **KF-06** — Fitur Bookmark artikel untuk pengguna yang sudah login.
- **KF-07** — Sistem registrasi dan login pengguna dengan manajemen token yang aman.
- **KF-08** — Sistem pelacakan jumlah pengunjung (analytics tracking) secara otomatis setiap kali halaman berita dibuka.

#### CMS Redaksi
- **KF-09** — Dashboard statistik admin yang menampilkan grafik pengunjung, distribusi kategori, total berita, dan total user dengan filter waktu (Hari Ini, 7 Hari, 30 Hari, 1 Tahun).
- **KF-10** — Pengelolaan artikel: membuat, mengedit, menyimpan draft, mengajukan review, menerbitkan, menjadwalkan, dan mengarsipkan.
- **KF-11** — Rich Text Editor untuk penulisan konten berita yang mendukung format teks, heading, daftar, dan embed gambar.
- **KF-12** — Penjadwalan artikel tayang otomatis pada waktu yang ditentukan.
- **KF-13** — Manajemen Media (upload, lihat, dan hapus gambar/foto berita).
- **KF-14** — Moderasi Komentar: melihat semua komentar dari seluruh artikel dan menghapus komentar yang tidak layak.
- **KF-15** — Manajemen Pengguna oleh Admin: menambah, mengedit, mengaktifkan/menonaktifkan akun karyawan.
- **KF-16** — Sistem penguncian artikel (locking) agar tidak ada dua editor yang mengedit artikel yang sama secara bersamaan.

---

### 1.4 Kebutuhan Non-Fungsional

Kebutuhan non-fungsional adalah **bagaimana sistem harus berjalan**, bukan apa yang dilakukannya:

| Aspek | Detail |
|---|---|
| **Keamanan** | Token autentikasi menggunakan JWT (JSON Web Token). Access token disimpan di memory (bukan localStorage) untuk mencegah serangan XSS. Refresh token digunakan untuk memperbarui sesi secara otomatis tanpa paksa logout pengguna. |
| **Performa** | Frontend dibangun dengan Next.js yang mendukung Server-Side Rendering (SSR) sehingga halaman berita dapat dimuat lebih cepat dan ramah mesin pencari (SEO). |
| **Ketersediaan (Availability)** | Sistem memiliki mekanisme silent token refresh, sehingga sesi pengguna diperbarui otomatis di latar belakang tanpa gangguan. |
| **Skalabilitas** | Arsitektur dipisah antara Frontend (Next.js) dan Backend (Laravel API), sehingga masing-masing dapat dikembangkan dan di-scale secara independen. |
| **Kemudahan Penggunaan (Usability)** | Antarmuka CMS dirancang responsif dan menggunakan notifikasi (toast) untuk setiap aksi agar pengguna selalu mendapat umpan balik yang jelas. |

---

## 2. Pemrograman Framework

### 2.1 Arsitektur Sistem

Sistem dibangun menggunakan arsitektur **Client-Server** dengan pemisahan yang jelas antara frontend dan backend:

```
┌─────────────────────┐         HTTPS / REST API          ┌──────────────────────┐
│                     │ ────────────────────────────────► │                      │
│  Frontend (Client)  │                                   │   Backend (Server)   │
│   Next.js / React   │ ◄──────────────────────────────── │   Laravel (PHP)      │
│                     │         JSON Response              │                      │
└─────────────────────┘                                   └──────────────────────┘
                                                                     │
                                                                     ▼
                                                          ┌──────────────────────┐
                                                          │      Database        │
                                                          │       MySQL          │
                                                          └──────────────────────┘
```

---

### 2.2 Teknologi yang Digunakan

#### Frontend
| Teknologi | Kegunaan |
|---|---|
| **Next.js 14 (App Router)** | Framework utama React untuk membangun halaman web dengan fitur SSR dan routing berbasis folder. |
| **TypeScript** | Superset JavaScript yang menambahkan tipe data statis untuk kode yang lebih aman dan mudah dirawat. |
| **Tailwind CSS** | Library utility CSS untuk styling yang cepat dan konsisten. |
| **Zustand** | Manajemen state global yang ringan, digunakan untuk menyimpan data sesi login pengguna. |
| **Axios** | Library HTTP client untuk memanggil API backend, dilengkapi dengan *interceptor* untuk otomasi token. |
| **Recharts** | Library untuk menggambar grafik (Area Chart, Pie Chart) pada halaman dashboard admin. |
| **TipTap / Quill** | Rich Text Editor (WYSIWYG) yang digunakan jurnalis untuk menulis konten berita. |

#### Backend
| Teknologi | Kegunaan |
|---|---|
| **Laravel (PHP)** | Framework PHP untuk membangun RESTful API. |
| **JWT (JSON Web Token)** | Mekanisme autentikasi berbasis token yang stateless. |
| **MySQL** | Database relasional untuk menyimpan semua data (artikel, pengguna, komentar, dll). |
| **Eloquent ORM** | Query builder bawaan Laravel untuk berinteraksi dengan database secara elegan. |

---

### 2.3 Implementasi Framework: Fitur Utama

#### A. Sistem Autentikasi dengan Axios Interceptor

Salah satu implementasi framework yang penting adalah **Axios Interceptor**. Interceptor ini adalah kode yang berjalan otomatis sebelum setiap request dikirim ke server, dan setelah setiap response diterima.

**Fungsinya:**
- **Request Interceptor**: Secara otomatis menyisipkan token JWT ke header setiap request API, sehingga programmer tidak perlu menulisnya secara manual di setiap pemanggilan API.
- **Response Interceptor**: Jika server mengembalikan error `401 TOKEN_EXPIRED`, sistem secara otomatis meminta token baru (silent refresh) dan mengulang request yang gagal — tanpa pengguna perlu login ulang.

```typescript
// Otomatis sisipkan token di setiap request
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Otomatis refresh token jika expired
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.data?.error === "TOKEN_EXPIRED") {
      // Minta token baru dan ulangi request
      const newToken = await refreshToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(error.config); // Ulangi request asal
    }
  }
);
```

---

#### B. Sistem Routing & Role-Based Access Control

Next.js App Router menggunakan **struktur folder sebagai routing**. Halaman CMS dilindungi oleh guard yang memeriksa role pengguna sebelum menampilkan konten:

```
app/
├── (main)/           → Portal publik (bisa diakses siapa saja)
│   └── [slug]/       → Halaman detail berita
├── cms/              → Panel redaksi (hanya untuk admin, editor, journalist)
│   ├── dashboard/    → Hanya jika sudah login
│   ├── artikel/      → journalist, editor, admin
│   ├── karyawan/     → Hanya admin
│   └── kategori/     → Hanya admin
├── login/            → Halaman login
└── register/         → Halaman registrasi
```

Jika pengguna mencoba mengakses halaman `/cms/karyawan` padahal bukan admin, sistem akan otomatis mengarahkan ke halaman 403 (Forbidden).

---

#### C. Dashboard Analytics dengan Data Real-Time

Dashboard Admin menampilkan **Grafik Pengunjung** yang diambil dari data nyata di database. Implementasinya:

1. **Pencatatan (Tracking)**: Setiap kali halaman berita dibuka, komponen `AnalyticsTracker` di frontend memanggil API `POST /api/analytics/track`. Backend lalu menyimpan satu record baru ke tabel `page_views` berisi: halaman yang dikunjungi, IP pengunjung, dan waktu kunjungan.

2. **Agregasi Data**: Saat Admin membuka dashboard, backend (`CmsDashboardController`) mengambil data dari tabel `page_views` dan menghitungnya berdasarkan rentang waktu (per jam, per hari, per bulan), lalu mengirimnya dalam format JSON.

3. **Visualisasi**: Frontend menerima data JSON tersebut dan menggunakannya sebagai bahan untuk menggambar grafik dengan library **Recharts**.

---

#### D. CMS Artikel dengan Multiple Status Workflow

Artikel di sistem ini tidak langsung terbit, melainkan melewati alur kerja (workflow) yang terstruktur:

```
[Jurnalis Menulis] → DRAFT
       ↓
[Jurnalis Ajukan] → REVIEW
       ↓
[Editor Setujui] → PUBLISHED (atau SCHEDULED jika dijadwalkan)
       ↓
[Editor Arsipkan] → ARCHIVED
```

Setiap perubahan status dicatat dan hak aksesnya dijaga ketat di backend, sehingga jurnalis tidak bisa langsung menerbitkan artikel tanpa persetujuan editor.

---

## 3. Uji Coba dan Implementasi

### 3.1 Metode Pengujian

Pengujian dilakukan secara **manual (black-box testing)**, yaitu menguji sistem dari sisi pengguna berdasarkan skenario nyata tanpa melihat kode internal — hanya memastikan output yang dihasilkan sesuai dengan yang diharapkan.

---

### 3.2 Skenario Uji Coba

#### Modul 1: Autentikasi

| ID | Skenario | Input | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-01 | Login dengan kredensial valid | Email & password benar | Berhasil masuk, redirect ke dashboard CMS sesuai role | ✅ Berhasil |
| TC-02 | Login dengan password salah | Email benar, password salah | Muncul pesan error "Email atau password salah" | ✅ Berhasil |
| TC-03 | Akses halaman CMS tanpa login | Buka `/cms/dashboard` langsung | Otomatis redirect ke halaman `/login` | ✅ Berhasil |
| TC-04 | Akses halaman karyawan sebagai Editor | Login sebagai Editor, buka `/cms/karyawan` | Redirect ke halaman 403 (Forbidden) | ✅ Berhasil |

#### Modul 2: Manajemen Artikel (CMS)

| ID | Skenario | Input | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-05 | Jurnalis membuat artikel baru | Isi judul, konten, kategori → Simpan Draft | Artikel tersimpan dengan status "Draft" | ✅ Berhasil |
| TC-06 | Jurnalis mengajukan artikel untuk review | Klik tombol "Ajukan Review" | Status artikel berubah menjadi "Review" | ✅ Berhasil |
| TC-07 | Editor menerbitkan artikel | Login sebagai Editor, klik "Publish" | Status artikel berubah menjadi "Published" dan muncul di portal publik | ✅ Berhasil |
| TC-08 | Editor menjadwalkan artikel | Input tanggal & waktu tayang → Jadwalkan | Status berubah menjadi "Scheduled", artikel tayang otomatis pada waktu yang ditentukan | ✅ Berhasil |
| TC-09 | Upload gambar untuk artikel | Pilih file JPG/PNG (< 2MB) → Upload | Gambar berhasil diupload dan URL-nya dapat digunakan di artikel | ✅ Berhasil |
| TC-10 | Upload file yang terlalu besar | Pilih file > 2MB | Muncul pesan error "Ukuran file maksimal 2 MB" sebelum terkirim ke server | ✅ Berhasil |

#### Modul 3: Portal Publik

| ID | Skenario | Input | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-11 | Pembaca membuka detail berita | Klik judul berita | Halaman detail berita tampil lengkap dengan konten, gambar, dan komentar | ✅ Berhasil |
| TC-12 | Sistem mencatat kunjungan | Buka halaman berita | Satu record baru muncul di tabel `page_views` di database | ✅ Berhasil |
| TC-13 | Pencarian artikel | Ketik kata kunci di kolom pencarian | Daftar artikel yang relevan tampil sesuai kata kunci | ✅ Berhasil |
| TC-14 | Pengguna mengirim komentar | Login, isi komentar, klik Kirim | Komentar langsung muncul di bawah artikel tanpa reload halaman | ✅ Berhasil |
| TC-15 | Bookmark artikel | Login, klik tombol bookmark | Artikel tersimpan di halaman `/bookmark` | ✅ Berhasil |

#### Modul 4: Dashboard Admin

| ID | Skenario | Input | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-16 | Melihat grafik pengunjung | Buka dashboard admin, pilih filter "7 Hari Terakhir" | Grafik menampilkan data kunjungan per hari selama 7 hari terakhir | ✅ Berhasil |
| TC-17 | Mengganti filter waktu grafik | Klik dropdown → pilih "Hari Ini" | Grafik berubah menampilkan data kunjungan per 4 jam pada hari ini | ✅ Berhasil |
| TC-18 | Melihat distribusi kategori | Buka dashboard admin | Pie chart menampilkan persentase berita per kategori | ✅ Berhasil |

---

### 3.3 Implementasi (Deployment)

Sistem ini diimplementasikan dengan konfigurasi sebagai berikut:

| Komponen | Teknologi / Keterangan |
|---|---|
| **Frontend** | Next.js — dijalankan dengan perintah `npm run dev` (development) atau `npm run build && npm start` (production) |
| **Backend API** | Laravel — dijalankan dengan `php artisan serve` |
| **Database** | MySQL — dikelola menggunakan phpMyAdmin atau client database lainnya |
| **Environment** | Variabel lingkungan disimpan di file `.env` untuk keamanan konfigurasi (URL API, kredensial database, dll.) |

---

### 3.4 Kesimpulan Uji Coba

Dari **18 skenario pengujian** yang dilakukan, seluruhnya menunjukkan hasil yang sesuai dengan yang diharapkan. Sistem berhasil:

- ✅ Mengelola hak akses pengguna berdasarkan role dengan benar.
- ✅ Menjalankan alur kerja penerbitan artikel (Draft → Review → Published).
- ✅ Mencatat dan menampilkan data pengunjung secara real-time pada dashboard.
- ✅ Memberikan umpan balik yang jelas kepada pengguna untuk setiap aksi (berhasil maupun gagal).
- ✅ Menjaga keamanan sistem melalui mekanisme autentikasi JWT dengan silent refresh.

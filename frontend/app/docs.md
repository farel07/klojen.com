# Portal Berita — Spesifikasi Frontend

> **Versi:** 1.0 | **Status:** Draft  
> Dokumen ini adalah panduan lengkap pengembangan frontend portal berita. Dibuat agar frontend dan backend dapat bekerja paralel tanpa miskomunikasi. Seluruh kontrak API, business rule, dan behavior UI di dokumen ini sudah sinkron dengan `Portal_Berita_Dokumentasi_Lengkap.md`.

---

## Daftar Isi

1. [Stack & Struktur Proyek](#1-stack--struktur-proyek)
2. [Autentikasi & Manajemen Token](#2-autentikasi--manajemen-token)
3. [Role & Hak Akses](#3-role--hak-akses)
4. [Halaman & Routing](#4-halaman--routing)
5. [Komponen Global](#5-komponen-global)
6. [Spesifikasi Halaman — Portal Publik](#6-spesifikasi-halaman--portal-publik)
7. [Spesifikasi Halaman — CMS Redaksi](#7-spesifikasi-halaman--cms-redaksi)
8. [Integrasi API](#8-integrasi-api)
9. [State Management](#9-state-management)
10. [Penanganan Error](#10-penanganan-error)
11. [Validasi Form](#11-validasi-form)
12. [Konvensi & Aturan Koding](#12-konvensi--aturan-koding)

---

# 1. Stack & Struktur Proyek

## 1.1 Tech Stack

| Kebutuhan        | Pilihan               |
| ---------------- | --------------------- |
| Framework        | Next.js (App Router)  |
| Bahasa           | TypeScript            |
| Styling          | Tailwind CSS          |
| State Management | Zustand               |
| HTTP Client      | Axios                 |
| Form             | React Hook Form + Zod |
| Rich Text Editor | TipTap atau Quill     |
| Tanggal & Waktu  | day.js                |

## 1.2 Struktur Folder

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/               # Route group portal publik
│   │   ├── page.tsx            # Halaman utama
│   │   ├── [slug]/             # Detail artikel
│   │   ├── kategori/[slug]/    # Listing per kategori
│   │   ├── tag/[slug]/         # Listing per tag
│   │   └── cari/               # Hasil pencarian
│   ├── (auth)/                 # Route group autentikasi
│   │   ├── login/
│   │   └── register/
│   └── cms/                    # Route group CMS redaksi
│       ├── layout.tsx          # Layout CMS + guard role
│       ├── dashboard/
│       ├── artikel/
│       ├── media/
│       ├── komentar/
│       └── pengguna/           # Admin only
├── components/
│   ├── ui/                     # Komponen dasar (Button, Input, Modal, dll)
│   ├── public/                 # Komponen khusus portal publik
│   └── cms/                    # Komponen khusus CMS
├── lib/
│   ├── axios.ts                # Instance axios + interceptor
│   ├── auth.ts                 # Helper token
│   └── utils.ts
├── hooks/                      # Custom hooks
├── stores/                     # Zustand stores
├── types/                      # TypeScript types & interfaces
└── constants/                  # Konstanta (role, status, dll)
```

## 1.3 Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.portalberita.com/v1
NEXT_PUBLIC_CDN_URL=https://cdn.portalberita.com
```

---

# 2. Autentikasi & Manajemen Token

## 2.1 Mekanisme Token

Sistem menggunakan dua jenis token:

| Token           | Masa Berlaku | Penyimpanan                           | Keterangan                                      |
| --------------- | ------------ | ------------------------------------- | ----------------------------------------------- |
| `access_token`  | 15 menit     | Memory (variabel JS)                  | **Jangan disimpan di localStorage atau cookie** |
| `refresh_token` | 30 hari      | `httpOnly cookie` atau `localStorage` | Digunakan untuk memperbarui access token        |

## 2.2 Axios Interceptor

Buat dua interceptor pada instance axios:

**Request interceptor** — menyisipkan access token ke setiap request:

```typescript
// lib/axios.ts
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Response interceptor** — menangani token expired secara otomatis (silent refresh):

```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Jika 401 TOKEN_EXPIRED dan belum pernah di-retry
    if (error.response?.data?.error === "TOKEN_EXPIRED" && !original._retry) {
      original._retry = true;
      try {
        // Minta access token baru
        const res = await axiosInstance.post("/auth/refresh", {
          refresh_token: getRefreshToken(),
        });
        const newToken = res.data.data.access_token;
        setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(original); // Ulangi request asli
      } catch {
        // Refresh gagal — paksa logout
        logout();
        redirect("/login");
      }
    }
    return Promise.reject(error);
  },
);
```

## 2.3 Alur Login

```
1. User submit form login
2. POST /auth/login → terima access_token + refresh_token
3. Simpan access_token ke Zustand store (memory)
4. Simpan refresh_token ke localStorage / httpOnly cookie
5. Simpan data user (id, name, role) ke Zustand store
6. Redirect berdasarkan role:
   - admin / editor / journalist → /cms/dashboard
   - reader → / (halaman utama)
```

## 2.4 Alur Logout

```
1. User klik tombol Logout
2. POST /auth/logout { refresh_token }
3. Clear access_token dari Zustand store
4. Clear refresh_token dari localStorage / cookie
5. Reset seluruh state auth
6. Redirect ke /login
```

## 2.5 Proteksi Route

Buat middleware Next.js atau layout guard yang mengecek token sebelum render halaman:

```typescript
// Jika belum login → redirect ke /login
// Jika login tapi role tidak cukup → redirect ke /403
// Halaman CMS hanya untuk: admin, editor, journalist
// Halaman /cms/pengguna hanya untuk: admin
```

---

# 3. Role & Hak Akses

## 3.1 Tabel Hak Akses per Fitur

| Fitur                    | reader   | journalist | editor | admin |
| ------------------------ | -------- | ---------- | ------ | ----- |
| Baca artikel             | ✅       | ✅         | ✅     | ✅    |
| Kirim komentar           | ✅ login | ✅         | ✅     | ✅    |
| Hapus komentar           | ❌       | ❌         | ✅     | ✅    |
| Bookmark artikel         | ✅ login | ✅         | ✅     | ✅    |
| Buat artikel             | ❌       | ✅         | ✅     | ✅    |
| Edit artikel sendiri     | ❌       | ✅         | ✅     | ✅    |
| Publish / jadwal artikel | ❌       | ❌         | ✅     | ✅    |
| Arsipkan artikel         | ❌       | ❌         | ✅     | ✅    |
| Upload media             | ❌       | ✅         | ✅     | ✅    |
| Kelola pengguna          | ❌       | ❌         | ❌     | ✅    |

## 3.2 Implementasi Guard di Komponen

```typescript
// constants/roles.ts
export const ROLES = {
  READER: "reader",
  JOURNALIST: "journalist",
  EDITOR: "editor",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Cek apakah user boleh publish artikel
export const canPublish = (role: Role) =>
  [ROLES.EDITOR, ROLES.ADMIN].includes(role);

// Cek apakah user boleh hapus komentar
export const canDeleteComment = (role: Role) =>
  [ROLES.EDITOR, ROLES.ADMIN].includes(role);

// Cek apakah user boleh kelola pengguna
export const canManageUsers = (role: Role) => role === ROLES.ADMIN;
```

---

# 4. Halaman & Routing

## 4.1 Portal Publik

| Route              | Komponen            | Deskripsi                           | Auth                              |
| ------------------ | ------------------- | ----------------------------------- | --------------------------------- |
| `/`                | `HomePage`          | Artikel terbaru + featured articles | Tidak                             |
| `/[slug]`          | `ArticleDetailPage` | Detail artikel lengkap + komentar   | Tidak                             |
| `/kategori/[slug]` | `CategoryPage`      | Listing artikel per kategori        | Tidak                             |
| `/tag/[slug]`      | `TagPage`           | Listing artikel per tag             | Tidak                             |
| `/cari`            | `SearchPage`        | Hasil pencarian (`?q=keyword`)      | Tidak                             |
| `/login`           | `LoginPage`         | Form login                          | Tidak (redirect jika sudah login) |
| `/register`        | `RegisterPage`      | Form registrasi                     | Tidak (redirect jika sudah login) |
| `/bookmark`        | `BookmarkPage`      | Daftar artikel yang di-bookmark     | ✅ Login                          |

## 4.2 CMS Redaksi

| Route                     | Komponen          | Deskripsi                             | Role                                      |
| ------------------------- | ----------------- | ------------------------------------- | ----------------------------------------- |
| `/cms/dashboard`          | `DashboardPage`   | Ringkasan statistik & artikel terbaru | journalist, editor, admin                 |
| `/cms/artikel`            | `ArticleListPage` | Daftar artikel milik sendiri / semua  | journalist, editor, admin                 |
| `/cms/artikel/baru`       | `ArticleFormPage` | Form buat artikel baru                | journalist, editor, admin                 |
| `/cms/artikel/[id]/edit`  | `ArticleFormPage` | Form edit artikel                     | journalist (milik sendiri), editor, admin |
| `/cms/media`              | `MediaPage`       | Galeri media yang sudah diupload      | journalist, editor, admin                 |
| `/cms/komentar`           | `CommentPage`     | Daftar komentar + hapus               | editor, admin                             |
| `/cms/pengguna`           | `UserPage`        | Manajemen akun pengguna               | admin                                     |
| `/cms/pengguna/baru`      | `UserFormPage`    | Form buat akun jurnalis/editor        | admin                                     |
| `/cms/pengguna/[id]/edit` | `UserFormPage`    | Form edit akun                        | admin                                     |

---

# 5. Komponen Global

## 5.1 Navbar (Portal Publik)

**Konten:**

- Logo portal
- Navigasi kategori utama (dari API `GET /categories`)
- Kolom pencarian dengan debounce 300ms
- Tombol Login / Register jika belum login
- Avatar + dropdown (Bookmark, Logout) jika sudah login

**Behavior:**

- Sticky di atas saat scroll
- Mobile: hamburger menu

## 5.2 Sidebar CMS

**Konten berdasarkan role:**

```
journalist : Dashboard, Artikel Saya, Media
editor     : Dashboard, Semua Artikel, Media, Komentar
admin      : Dashboard, Semua Artikel, Media, Komentar, Pengguna
```

## 5.3 Toast Notification

Gunakan untuk semua feedback aksi. Format:

```typescript
type ToastType = "success" | "error" | "warning" | "info";

// Contoh penggunaan
toast.success("Artikel berhasil diterbitkan");
toast.error("Email sudah terdaftar");
toast.warning("Koneksi lambat, mohon tunggu...");
```

## 5.4 Komponen ProtectedRoute

```typescript
interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode; // default: redirect ke /403
}
```

---

# 6. Spesifikasi Halaman — Portal Publik

## 6.1 Halaman Utama (`/`)

**Data yang diambil:**

```typescript
// 2 request paralel
GET /articles?status=published&featured=true&limit=5   // artikel featured
GET /articles?status=published&page=1&limit=10          // artikel terbaru
```

**Layout:**

- Hero section — 1 artikel featured utama (gambar besar, judul, excerpt)
- Grid featured — 4 artikel featured lainnya
- Daftar terbaru — listing artikel dengan pagination atau infinite scroll
- Sidebar — kategori populer, tag trending

**Behavior:**

- Loading state: skeleton card
- Error state: pesan "Gagal memuat artikel, coba refresh"
- Pagination: tombol Muat Lebih Banyak atau numbered pagination

---

## 6.2 Halaman Detail Artikel (`/[slug]`)

**Data yang diambil:**

```typescript
GET /articles/:slug           // detail artikel
GET /articles/:id/comments    // komentar artikel
```

**Layout:**

- Header artikel: judul, kategori, penulis, tanggal, view count
- Featured image
- Konten artikel (render HTML/Markdown)
- Tag list
- Tombol bookmark (toggle) — tampil hanya jika login
- Seksi komentar

**Seksi Komentar:**

- Tampilkan semua komentar dengan replies (max 2 level)
- Form komentar — tampil hanya jika login, jika belum login tampil pesan "Login untuk berkomentar"
- Tombol Hapus komentar — tampil hanya untuk role `editor` dan `admin`
- Counter karakter saat mengetik komentar (max 1000)

**Behavior penting:**

- Saat halaman dimuat, view count bertambah otomatis di backend
- Setelah submit komentar sukses: tambahkan komentar baru ke list secara optimistic (tanpa reload)
- Jika rate limit tercapai (`COMMENT_RATE_LIMIT`): tampilkan toast error dengan sisa waktu cooldown

---

## 6.3 Halaman Kategori (`/kategori/[slug]`)

**Data yang diambil:**

```typescript
GET /articles?category=:slug&status=published&page=1&limit=12
```

**Layout:**

- Header: nama kategori + deskripsi
- Grid artikel: 12 per halaman
- Sub-kategori (jika ada)
- Pagination

---

## 6.4 Halaman Pencarian (`/cari`)

**Data yang diambil:**

```typescript
GET /search?q=:keyword&page=1&limit=10
```

**Behavior:**

- Input pencarian di URL query param: `/cari?q=pemilu`
- Debounce 300ms sebelum trigger request
- Keyword minimum 2 karakter — di bawah itu jangan kirim request, tampilkan hint
- Highlight kata kunci di judul dan snippet hasil
- Tampilkan `relevance_score` tidak perlu, tapi urutkan berdasarkan skor dari API
- Jika tidak ada hasil: tampilkan ilustrasi + pesan "Tidak ada artikel untuk kata kunci ini"

---

## 6.5 Halaman Bookmark (`/bookmark`) `🔒`

**Data yang diambil:**

```typescript
GET / bookmarks;
```

**Layout:**

- Grid artikel yang di-bookmark
- Tombol hapus bookmark di tiap kartu (toggle `POST /bookmarks`)

---

# 7. Spesifikasi Halaman — CMS Redaksi

## 7.1 Dashboard (`/cms/dashboard`)

**Data yang diambil:**

```typescript
GET /articles?status=draft&limit=5        // draft terbaru milik sendiri
GET /articles?status=review&limit=5       // menunggu review (editor/admin)
GET /articles?status=published&limit=5    // baru tayang
```

**Layout:**

- Kartu statistik: total artikel, total komentar, total view
- Tabel artikel draft terbaru
- Tabel artikel menunggu review (editor/admin saja)

---

## 7.2 Daftar Artikel (`/cms/artikel`)

**Data yang diambil:**

```typescript
GET /articles?page=1&limit=20   // + filter status, kategori
```

**Filter yang tersedia:**

- Status: semua | draft | review | scheduled | published | archived
- Kategori
- Pencarian judul

**Tabel kolom:**

- Judul, Kategori, Status (badge warna), Penulis, Tanggal, Aksi

**Badge warna status:**
| Status | Warna |
|---|---|
| draft | Abu-abu |
| review | Kuning |
| scheduled | Biru |
| published | Hijau |
| archived | Merah |

**Aksi per baris:**

- Edit — semua role yang punya akses
- Publish / Jadwalkan — editor, admin
- Arsipkan — editor, admin

---

## 7.3 Form Artikel (`/cms/artikel/baru` dan `/cms/artikel/[id]/edit`)

**Field:**

| Field          | Komponen              | Validasi                | Keterangan                                         |
| -------------- | --------------------- | ----------------------- | -------------------------------------------------- |
| Judul          | Input text            | Wajib, max 255 karakter | Auto-generate slug dari judul                      |
| Konten         | Rich text editor      | Wajib                   | Support gambar embed, bold, italic, heading, list  |
| Kategori       | Select                | Wajib                   | Ambil dari `GET /categories`                       |
| Tag            | Multi-select + create | Opsional                | Ambil dari `GET /tags`, bisa buat tag baru         |
| Featured image | Upload / URL          | Opsional                | Upload via `POST /media/upload` lalu pakai URL-nya |
| Status         | —                     | —                       | Ditentukan lewat tombol aksi, bukan dropdown biasa |

**Tombol aksi:**

| Tombol        | Role                      | Aksi                                                                                                 |
| ------------- | ------------------------- | ---------------------------------------------------------------------------------------------------- |
| Simpan Draft  | journalist, editor, admin | `POST /articles` atau `PUT /articles/:id` dengan status tetap draft                                  |
| Ajukan Review | journalist                | `PATCH /articles/:id/status` → `{status: "review"}`                                                  |
| Publish       | editor, admin             | `PATCH /articles/:id/status` → `{status: "published"}`                                               |
| Jadwalkan     | editor, admin             | Buka modal pilih waktu → `PATCH /articles/:id/status` → `{status: "scheduled", scheduled_at: "..."}` |
| Arsipkan      | editor, admin             | `PATCH /articles/:id/status` → `{status: "archived"}`                                                |

**Modal Jadwalkan Tayang:**

- Date picker + time picker
- Validasi: waktu minimal 5 menit dari sekarang — jika kurang tampilkan error inline
- Tampilkan zona waktu yang digunakan

**Auto-save:**

- Auto-save draft setiap 30 detik jika ada perubahan
- Tampilkan indikator "Tersimpan otomatis pukul HH:mm"

---

## 7.4 Halaman Media (`/cms/media`)

**Data yang diambil:**

```typescript
GET / media; // daftar media milik user / semua (tergantung role)
```

**Layout:**

- Grid thumbnail gambar
- Tombol Upload di atas
- Klik gambar → tampilkan detail + URL + tombol hapus

**Upload behavior:**

- Drag & drop atau klik untuk pilih file
- Validasi sebelum upload:
  - Tipe file: hanya `image/png`, `image/jpeg`, `image/jpg`
  - Ukuran: maksimal 2048 KB (2 MB)
  - Jika tidak valid: tampilkan pesan error inline sebelum dikirim ke server
- Progress bar saat upload berlangsung
- Setelah sukses: tambahkan ke grid secara langsung (tanpa reload)

---

## 7.5 Halaman Komentar (`/cms/komentar`) `👤 editor | admin`

**Data yang diambil:**

```typescript
GET /comments?page=1&limit=20   // semua komentar dari semua artikel
```

**Tabel kolom:**

- Konten komentar (truncate 100 karakter), Artikel, Pengguna, Tanggal, Aksi

**Aksi:**

- Hapus — tampilkan dialog konfirmasi sebelum `DELETE /comments/:id`

---

## 7.6 Halaman Pengguna (`/cms/pengguna`) `👤 admin`

**Data yang diambil:**

```typescript
GET / users;
```

**Tabel kolom:**

- Nama, Email, Role (badge), Status Aktif, Tanggal Dibuat, Aksi

**Aksi per baris:**

- Edit → buka `/cms/pengguna/[id]/edit`
- Nonaktifkan / Aktifkan → `PATCH /users/:id {is_active: false/true}` dengan konfirmasi
- Hapus → dialog konfirmasi dengan input nama user → `DELETE /users/:id`

**Aturan UI:**

- Baris yang menampilkan akun admin yang sedang login: tombol Nonaktifkan dan Hapus harus di-disable dengan tooltip "Tidak bisa mengubah akun sendiri" (BR-19)

---

## 7.7 Form Pengguna (`/cms/pengguna/baru` dan `/cms/pengguna/[id]/edit`)

**Field:**

| Field        | Validasi            | Keterangan                                                      |
| ------------ | ------------------- | --------------------------------------------------------------- |
| Nama         | Wajib               | —                                                               |
| Email        | Wajib, format email | Cek duplikat saat blur (opsional, bisa andalkan error dari API) |
| Role         | Wajib               | Pilihan: journalist, editor                                     |
| Status Aktif | —                   | Hanya di form edit, bukan form buat baru                        |

**Catatan:** Tidak ada field password — sistem generate otomatis dan kirim ke email.

---

# 8. Integrasi API

## 8.1 Tipe Data TypeScript

```typescript
// types/index.ts

export type Role = "reader" | "journalist" | "editor" | "admin";
export type ArticleStatus =
  | "draft"
  | "review"
  | "scheduled"
  | "published"
  | "archived";
export type MediaType = "image";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image_url: string | null;
  status: ArticleStatus;
  is_featured: boolean;
  view_count: number;
  category: Category;
  tags: Tag[];
  author: Pick<User, "id" | "name">;
  media: Media[];
  published_at: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  user: Pick<User, "id" | "name">;
  parent_id: string | null;
  replies: Comment[];
  created_at: string;
}

export interface Media {
  id: string;
  file_url: string;
  media_type: MediaType;
  alt_text: string | null;
}

export interface Bookmark {
  id: string;
  article: Pick<Article, "id" | "title" | "slug" | "featured_image_url">;
  created_at: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiSuccess<T> {
  status: "success";
  data: T;
}

export interface ApiError {
  status: "error";
  code: number;
  error: string;
  message: string;
  field?: string;
}
```

## 8.2 Contoh Fungsi API

```typescript
// lib/api/articles.ts
export const getArticles = (params?: {
  status?: ArticleStatus;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}) =>
  axiosInstance.get<
    ApiSuccess<{ articles: Article[]; pagination: Pagination }>
  >("/articles", { params });

export const getArticleBySlug = (slug: string) =>
  axiosInstance.get<ApiSuccess<Article>>(`/articles/${slug}`);

export const createArticle = (data: {
  title: string;
  content: string;
  category_id: string;
  tags?: string[];
  featured_image_url?: string;
}) =>
  axiosInstance.post<
    ApiSuccess<{ id: string; slug: string; status: ArticleStatus }>
  >("/articles", data);

export const updateArticleStatus = (
  id: string,
  data: {
    status: ArticleStatus;
    scheduled_at?: string;
    change_note?: string;
  },
) =>
  axiosInstance.patch<
    ApiSuccess<{ id: string; status: ArticleStatus; published_at?: string }>
  >(`/articles/${id}/status`, data);
```

---

# 9. State Management

## 9.1 Auth Store

```typescript
// stores/authStore.ts
interface AuthState {
  accessToken: string | null;
  user: Pick<User, "id" | "name" | "role"> | null;
  isAuthenticated: boolean;

  setAuth: (token: string, user: AuthState["user"]) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}
```

## 9.2 Aturan State

- Data yang cukup di-fetch per halaman (lokal) — tidak perlu masuk store global
- Store global hanya untuk: data auth user, preferensi UI (tema, sidebar open/close)
- Jangan simpan daftar artikel di store global — gunakan React Query atau fetch biasa per halaman
- Setelah logout: panggil `store.logout()` yang me-reset semua field ke null

---

# 10. Penanganan Error

## 10.1 Mapping Error Code ke Pesan UI

Gunakan mapping terpusat agar pesan konsisten di seluruh aplikasi:

```typescript
// constants/errorMessages.ts
export const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "Email sudah terdaftar, gunakan email lain",
  INVALID_CREDENTIALS: "Email atau password salah",
  TOKEN_EXPIRED: "Sesi telah berakhir, silakan login ulang",
  TOKEN_REVOKED: "Sesi tidak valid, silakan login ulang",
  ACCOUNT_INACTIVE: "Akun Anda telah dinonaktifkan, hubungi admin",
  FORBIDDEN: "Anda tidak memiliki akses untuk aksi ini",
  ARTICLE_NOT_FOUND: "Artikel tidak ditemukan",
  SLUG_ALREADY_EXISTS: "Judul artikel sudah digunakan, coba judul lain",
  INVALID_STATUS_TRANSITION: "Perubahan status ini tidak diizinkan",
  SCHEDULED_TIME_TOO_SOON: "Waktu tayang minimal 5 menit dari sekarang",
  COMMENT_TOO_SHORT: "Komentar minimal 3 karakter",
  COMMENT_TOO_LONG: "Komentar maksimal 1000 karakter",
  COMMENT_RATE_LIMIT: "Terlalu banyak komentar, coba lagi nanti",
  MAX_REPLY_DEPTH: "Tidak bisa membalas komentar lebih dari 2 level",
  INVALID_FILE_TYPE: "Format file tidak didukung (PNG, JPG, JPEG)",
  FILE_TOO_LARGE: "Ukuran file maksimal 2 MB",
  NO_FILE_UPLOADED: "Pilih file terlebih dahulu",
  CANNOT_MODIFY_SELF: "Tidak bisa mengubah akun sendiri",
  USER_NOT_FOUND: "Pengguna tidak ditemukan",
  INTERNAL_SERVER_ERROR: "Terjadi kesalahan pada server, coba lagi",
};

export const getErrorMessage = (errorCode: string): string =>
  ERROR_MESSAGES[errorCode] ?? "Terjadi kesalahan, coba lagi";
```

## 10.2 Error per Konteks

| Konteks                       | Cara Tampil                                |
| ----------------------------- | ------------------------------------------ |
| Validasi form (field error)   | Teks merah di bawah field yang bermasalah  |
| Aksi tombol (submit, hapus)   | Toast notification                         |
| Halaman tidak ditemukan (404) | Halaman 404 khusus dengan tombol kembali   |
| Tidak punya akses (403)       | Halaman 403 khusus                         |
| Server error (500)            | Toast error + log ke console               |
| Token expired                 | Silent refresh otomatis (lihat bagian 2.2) |
| Rate limit komentar (429)     | Toast error dengan pesan sisa waktu        |

## 10.3 Error Boundary

Pasang React Error Boundary di level layout untuk menangkap error rendering yang tidak terduga agar aplikasi tidak crash total.

---

# 11. Validasi Form

Semua validasi menggunakan **Zod schema** yang dipasang ke **React Hook Form**. Validasi berjalan di client sebelum request dikirim ke server.

## 11.1 Schema Validasi

```typescript
import { z } from "zod";

// Login
export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

// Register
export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

// Artikel
export const articleSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(255, "Judul maksimal 255 karakter"),
  content: z.string().min(1, "Konten tidak boleh kosong"),
  category_id: z.string().uuid("Pilih kategori"),
  tags: z.array(z.string().uuid()).optional(),
  featured_image_url: z.string().url().optional().or(z.literal("")),
});

// Jadwal tayang
export const scheduleSchema = z.object({
  scheduled_at: z.string().refine((val) => {
    const diff = new Date(val).getTime() - Date.now();
    return diff >= 5 * 60 * 1000; // minimal 5 menit
  }, "Waktu tayang minimal 5 menit dari sekarang"),
});

// Komentar
export const commentSchema = z.object({
  content: z
    .string()
    .min(3, "Komentar minimal 3 karakter")
    .max(1000, "Komentar maksimal 1000 karakter"),
  parent_id: z.string().uuid().optional(),
});

// Tambah pengguna (admin)
export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["journalist", "editor"], {
    errorMap: () => ({ message: "Pilih role yang valid" }),
  }),
});
```

---

# 12. Konvensi & Aturan Koding

## 12.1 Penamaan

| Hal              | Konvensi                   | Contoh                |
| ---------------- | -------------------------- | --------------------- |
| Komponen         | PascalCase                 | `ArticleCard.tsx`     |
| Hooks            | camelCase + prefix `use`   | `useArticles.ts`      |
| Store            | camelCase + suffix `Store` | `authStore.ts`        |
| Tipe / Interface | PascalCase                 | `Article`, `ApiError` |
| Konstanta        | SCREAMING_SNAKE_CASE       | `MAX_FILE_SIZE`       |
| Fungsi biasa     | camelCase                  | `getErrorMessage`     |

## 12.2 Aturan Penting

- **Jangan hardcode URL API** — selalu gunakan `process.env.NEXT_PUBLIC_API_URL`
- **Jangan tampilkan data error mentah dari server** ke user — selalu gunakan `getErrorMessage()`
- **Jangan kirim request** jika validasi form gagal — validasi Zod wajib jalan duluan
- **Jangan simpan access_token** di localStorage atau cookie biasa — hanya di memory (Zustand)
- **Selalu handle loading state** — setiap tombol yang trigger request harus punya state `isLoading` dan di-disable selama request berjalan
- **Konfirmasi sebelum aksi destruktif** — hapus artikel, hapus komentar, hapus akun, nonaktifkan akun wajib ada dialog konfirmasi

## 12.3 Konstanta yang Wajib Ada

```typescript
// constants/index.ts
export const MAX_FILE_SIZE_KB = 2048;
export const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
export const MAX_COMMENT_LENGTH = 1000;
export const MIN_COMMENT_LENGTH = 3;
export const MAX_REPLY_DEPTH = 2;
export const SEARCH_DEBOUNCE_MS = 300;
export const AUTOSAVE_INTERVAL_MS = 30000;
export const MIN_SCHEDULE_AHEAD_MS = 5 * 60 * 1000; // 5 menit
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 menit
```

---

_Akhir Dokumen — Portal Berita Frontend Spec v1.0_

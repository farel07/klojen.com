<div align="center">

# 📰 Portal Berita

Platform publikasi berita digital dengan sistem manajemen redaksi lengkap — dari penulisan artikel, review editorial, hingga penerbitan dan interaksi pembaca.

[![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=flat-square)](.)
[![Versi](https://img.shields.io/badge/Versi-1.0.0-blue?style=flat-square)](.)
[![Lisensi](https://img.shields.io/badge/Lisensi-MIT-green?style=flat-square)](.)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](.)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?style=flat-square&logo=mysql)](.)

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Tech Stack](#-tech-stack)
- [Struktur Repositori](#-struktur-repositori)
- [Alur Kerja Redaksi](#-alur-kerja-redaksi)
- [Role & Hak Akses](#-role--hak-akses)
- [API Overview](#-api-overview)
- [Database](#-database)
- [Cara Menjalankan](#-cara-menjalankan)
- [Dokumentasi](#-dokumentasi)
- [Kontribusi](#-kontribusi)

---

## 📖 Tentang Proyek

**Portal Berita** adalah platform publikasi digital full-stack yang dirancang untuk mendukung seluruh alur kerja tim redaksi — mulai dari jurnalis menulis draft, editor mereview dan menerbitkan, hingga pembaca membaca, berkomentar, dan menyimpan artikel favorit.

Sistem ini terdiri dari dua antarmuka utama:
- **Portal Publik** — Antarmuka pembaca untuk menjelajahi dan membaca berita
- **CMS Redaksi** — Dashboard internal untuk jurnalis, editor, dan admin mengelola konten

---

## ✨ Fitur Utama

### Portal Publik
- 🏠 Halaman utama dengan artikel terbaru dan artikel unggulan
- 📄 Halaman detail artikel dengan konten lengkap dan komentar
- 🗂️ Navigasi berdasarkan kategori dan tag
- 🔍 Pencarian artikel full-text dengan ranking relevansi
- 🔖 Bookmark artikel untuk dibaca nanti *(perlu login)*
- 💬 Komentar bersarang hingga 2 level *(perlu login)*

### CMS Redaksi
- ✍️ Editor artikel dengan rich text editor
- 📅 Penjadwalan tayang otomatis *(scheduled publish)*
- 🖼️ Upload dan manajemen media (PNG, JPG, JPEG, maks 2 MB)
- 📝 Riwayat revisi artikel sebagai audit trail
- 👥 Manajemen pengguna lengkap *(admin only)*
- 🔐 Autentikasi JWT dengan refresh token dan invalidasi sesi

### Keamanan & Performa
- 🔒 JWT access token (15 menit) + refresh token (30 hari)
- 🚦 Rate limiting komentar (maks 10/jam per user)
- 📊 Full-text search MySQL dengan `MATCH ... AGAINST`
- 🔄 Cron job auto-publish artikel terjadwal

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│                                                         │
│   ┌─────────────────────┐   ┌─────────────────────┐    │
│   │    Portal Publik    │   │    CMS Redaksi      │    │
│   │   (Next.js SSR)     │   │   (Next.js SPA)     │    │
│   └──────────┬──────────┘   └──────────┬──────────┘    │
└──────────────┼───────────────────────────┼──────────────┘
               │         REST API          │
               └─────────────┬─────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                      BACKEND                            │
│                                                         │
│         Node.js / NestJS  (REST API v1)                 │
│                                                         │
│   Auth  │  Articles  │  Comments  │  Media  │  Users    │
│                                                         │
│              JWT + Refresh Token                        │
│              node-cron (scheduled publish)              │
└──────┬────────────────────────────────────┬─────────────┘
       │                                    │
┌──────▼──────┐                   ┌─────────▼──────────┐
│    MySQL    │                   │   Cloud Storage    │
│  (13 tabel) │                   │  (AWS S3/Cloudinary)│
│   + Redis   │                   └────────────────────┘
│  (caching)  │
└─────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Kegunaan |
|---|---|
| [Next.js 15](https://nextjs.org) | Framework React (App Router, SSR/SSG) |
| [TypeScript](https://typescriptlang.org) | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [Zustand](https://zustand-demo.pmnd.rs) | State management |
| [Axios](https://axios-http.com) | HTTP client + interceptor |
| [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | Form & validasi |
| [TipTap](https://tiptap.dev) | Rich text editor |
| [day.js](https://day.js.org) | Manipulasi tanggal & waktu |

### Backend
| Teknologi | Kegunaan |
|---|---|
| [Node.js](https://nodejs.org) + [NestJS](https://nestjs.com) | REST API |
| [MySQL 8](https://mysql.com) | Database utama |
| [Redis](https://redis.io) | Caching & rate limiting |
| [JWT](https://jwt.io) | Autentikasi |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Hash password |
| [node-cron](https://github.com/node-cron/node-cron) | Scheduled publish |
| [Multer](https://github.com/expressjs/multer) | Upload file |

### Infrastruktur
| Teknologi | Kegunaan |
|---|---|
| AWS S3 / Cloudinary | Penyimpanan media |
| Cloudflare CDN | Distribusi konten |
| Vercel / Railway | Deployment |

---

## 📁 Struktur Repositori

```
portal-berita/
├── frontend/                   # Aplikasi Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/       # Portal publik
│   │   │   ├── (auth)/         # Login & register
│   │   │   └── cms/            # CMS redaksi
│   │   ├── components/
│   │   ├── lib/                # Axios instance, helpers
│   │   ├── hooks/
│   │   ├── stores/             # Zustand stores
│   │   ├── types/              # TypeScript interfaces
│   │   └── constants/
│   └── package.json
│
├── backend/                    # Aplikasi NestJS
│   ├── src/
│   │   ├── auth/
│   │   ├── articles/
│   │   ├── comments/
│   │   ├── media/
│   │   ├── users/
│   │   ├── search/
│   │   └── scheduler/          # Cron job auto-publish
│   └── package.json
│
├── docs/                       # Dokumentasi proyek
│   ├── Portal_Berita_Dokumentasi_Lengkap.md
│   └── Portal_Berita_Frontend_Spec.md
│
└── README.md
```

---

## 🔄 Alur Kerja Redaksi

```
Jurnalis                    Editor                     Sistem
    │                          │                          │
    │ Buat artikel (draft)      │                          │
    │──────────────────────────►│                          │
    │                          │                          │
    │ Ajukan ke review          │                          │
    │──────────────────────────►│                          │
    │                          │ Review artikel            │
    │                          │──────────────────────────►│
    │                          │                          │
    │◄─ Feedback revisi ────────│   (jika perlu revisi)    │
    │                          │                          │
    │ Edit & ajukan ulang       │                          │
    │──────────────────────────►│                          │
    │                          │ Publish / Jadwalkan       │
    │                          │──────────────────────────►│
    │                          │                     Artikel tayang
    │                          │                     di portal publik
```

**Status artikel:** `draft` → `review` → `published` / `scheduled` → `archived`

> ⚠️ Jurnalis **tidak bisa** menerbitkan artikel sendiri. Semua artikel wajib melewati review editor.

---

## 👥 Role & Hak Akses

| Fitur | Reader | Journalist | Editor | Admin |
|---|:---:|:---:|:---:|:---:|
| Baca artikel | ✅ | ✅ | ✅ | ✅ |
| Komentar | ✅* | ✅ | ✅ | ✅ |
| Hapus komentar | ❌ | ❌ | ✅ | ✅ |
| Bookmark | ✅* | ✅ | ✅ | ✅ |
| Buat artikel | ❌ | ✅ | ✅ | ✅ |
| Publish artikel | ❌ | ❌ | ✅ | ✅ |
| Upload media | ❌ | ✅ | ✅ | ✅ |
| Kelola pengguna | ❌ | ❌ | ❌ | ✅ |

*\* Perlu login*

---

## 🔌 API Overview

Base URL: `https://api.portalberita.com/v1`

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/auth/register` | Registrasi akun baru |
| `POST` | `/auth/login` | Login & dapatkan token |
| `POST` | `/auth/refresh` | Perbarui access token |
| `POST` | `/auth/logout` | Logout & revoke token |
| `GET` | `/articles` | Daftar artikel (dengan filter) |
| `GET` | `/articles/:slug` | Detail artikel |
| `POST` | `/articles` | Buat artikel baru |
| `PUT` | `/articles/:id` | Update konten artikel |
| `PATCH` | `/articles/:id/status` | Ubah status artikel |
| `GET` | `/articles/:id/comments` | Komentar artikel |
| `POST` | `/comments` | Kirim komentar |
| `DELETE` | `/comments/:id` | Hapus komentar |
| `POST` | `/media/upload` | Upload media |
| `GET` | `/bookmarks` | Daftar bookmark |
| `POST` | `/bookmarks` | Toggle bookmark |
| `GET` | `/search` | Pencarian artikel |
| `GET` | `/users` | Daftar pengguna *(admin)* |
| `POST` | `/users` | Buat akun pengguna *(admin)* |
| `PATCH` | `/users/:id` | Edit akun pengguna *(admin)* |
| `DELETE` | `/users/:id` | Hapus akun pengguna *(admin)* |

Format response error standar:
```json
{
  "status": "error",
  "code": 400,
  "error": "EMAIL_ALREADY_EXISTS",
  "message": "Email sudah terdaftar",
  "field": "email"
}
```

> 📄 Dokumentasi API lengkap tersedia di [`docs/Portal_Berita_Dokumentasi_Lengkap.md`](docs/Portal_Berita_Dokumentasi_Lengkap.md) — Bagian 14.

---

## 🗄️ Database

Menggunakan **MySQL 8** dengan **13 tabel**:

```
USERS                 — Semua pengguna (admin, editor, journalist, reader)
ARTICLES              — Konten berita utama
CATEGORIES            — Kategori & sub-kategori berita
TAGS                  — Label fleksibel lintas artikel
ARTICLE_TAGS          — Relasi many-to-many artikel ↔ tag
COMMENTS              — Komentar pembaca (threaded, maks 2 level)
MEDIA                 — Metadata file media
BOOKMARKS             — Artikel tersimpan pembaca
REFRESH_TOKENS        — Manajemen sesi login aktif
ARTICLE_REVISIONS     — Riwayat perubahan artikel (audit trail)
SCHEDULED_ARTICLES    — Antrian jadwal tayang otomatis
SEARCH_INDEXES        — Index full-text search (FULLTEXT)
COMMENT_RATE_LIMITS   — Pelacak rate limit komentar per user
```

> 📄 Skema lengkap, ERD, dan class diagram tersedia di [`docs/Portal_Berita_Dokumentasi_Lengkap.md`](docs/Portal_Berita_Dokumentasi_Lengkap.md).

---

## 🚀 Cara Menjalankan

### Prasyarat

- Node.js >= 18
- MySQL 8
- Redis
- npm atau yarn

### 1. Clone repositori

```bash
git clone https://github.com/username/portal-berita.git
cd portal-berita
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env sesuai konfigurasi lokal Anda
npm install
npm run migration   # Jalankan migrasi database
npm run seed        # (opsional) Isi data awal
npm run start:dev
```

Variabel environment backend (`.env`):
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=portal_berita
DB_USER=root
DB_PASS=password

REDIS_URL=redis://localhost:6379

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=900
REFRESH_TOKEN_EXPIRES_IN=2592000

CLOUD_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Setup Frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local
npm install
npm run dev
```

Variabel environment frontend (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
NEXT_PUBLIC_CDN_URL=https://res.cloudinary.com/your_cloud_name
```

### 4. Akses Aplikasi

| Layanan | URL |
|---|---|
| Portal Publik | http://localhost:3000 |
| CMS Redaksi | http://localhost:3000/cms |
| Backend API | http://localhost:3001/v1 |

---

## 📚 Dokumentasi

| Dokumen | Deskripsi |
|---|---|
| [`Portal_Berita_Dokumentasi_Lengkap.md`](docs/Portal_Berita_Dokumentasi_Lengkap.md) | Dokumentasi sistem lengkap: database, API contract, business rules, error handling, activity & sequence diagram, class diagram, ER diagram |
| [`Portal_Berita_Frontend_Spec.md`](docs/Portal_Berita_Frontend_Spec.md) | Spesifikasi frontend: routing, komponen, state management, validasi, konvensi koding |

---

## 🤝 Kontribusi

1. Fork repositori ini
2. Buat branch fitur baru: `git checkout -b fitur/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin fitur/nama-fitur`
5. Buat Pull Request

**Format commit message:**
```
feat:     Fitur baru
fix:      Perbaikan bug
docs:     Perubahan dokumentasi
style:    Perubahan styling (tidak mengubah logika)
refactor: Refaktor kode
test:     Menambah atau mengubah test
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<div align="center">
  Dibuat dengan ☕ dan 📝
</div>

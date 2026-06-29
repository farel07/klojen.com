# API Documentation — Portal Berita Klojen.com

> **Base URL:** `http://localhost:8000/api`
> **Content-Type:** `application/json` (kecuali upload media: `multipart/form-data`)
> **Autentikasi:** JWT Bearer Token di header `Authorization: Bearer <token>`

---

## Daftar Isi

1. [Konvensi & Format Response](#1-konvensi--format-response)
2. [Health Check](#2-health-check)
3. [Authentication (Auth)](#3-authentication-auth)
4. [Beranda (Homepage)](#4-beranda-homepage)
5. [Categories (Public)](#5-categories-public)
6. [Tags (Public)](#6-tags-public)
7. [Articles (Public)](#7-articles-public)
8. [Comments](#8-comments)
9. [Bookmarks](#9-bookmarks)
10. [Media](#10-media)
11. [Analytics](#11-analytics)
12. [CMS Articles](#12-cms-articles)
13. [CMS Comments](#13-cms-comments)
14. [CMS Dashboard Statistics](#14-cms-dashboard-statistics)
15. [CMS Categories](#15-cms-categories)
16. [CMS Tags](#16-cms-tags)
17. [User Management (Admin)](#17-user-management-admin)
18. [SEO: Sitemap](#18-seo-sitemap)
19. [Error Codes Reference](#19-error-codes-reference)

---

## 1. Konvensi & Format Response

### Format Response Sukses

```json
{
  "status": "success",
  "data": { ... },
  "message": "Deskripsi opsional"
}
```

### Format Response Error

```json
{
  "status": "error",
  "code": 404,
  "error": "ERROR_CODE_CONSTANT",
  "message": "Pesan error yang mudah dipahami."
}
```

### Konvensi

| Aspek | Keterangan |
|-------|-----------|
| Primary Key | UUID string untuk tabel bisnis (`"id": "550e8400-..."`) , BIGINT untuk users (`"id": 3`) |
| Pagination | `?page=1&limit=20` → response berisi `current_page`, `per_page`, `total`, `last_page` |
| Auth Header | `Authorization: Bearer eyJ0eXAiOiJKV1QiLC...` |
| Role Required | Ditulis di setiap endpoint. Role: `reader`, `journalist`, `editor`, `admin` |
| Tanggal | ISO 8601: `"2026-06-15T10:30:00.000000Z"` |

---

## 2. Health Check

### `GET /ping`

Mengecek ketersediaan server API.

**Auth:** Tidak diperlukan

**Response `200 OK`:**
```json
{
  "status": "ok",
  "message": "Portal Berita API aktif."
}
```

---

## 3. Authentication (Auth)

### 3.1 Register

**`POST /auth/register`**

Mendaftarkan akun baru. Role otomatis = `reader`.

**Auth:** Tidak diperlukan

**Request Body:**
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "password123"
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `name` | string | Ya | max:255 |
| `email` | string | Ya | email, unique di tabel users |
| `password` | string | Ya | min:8 |

**Response `201 Created`:**
```json
{
  "status": "success",
  "data": {
    "user_id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "reader"
  }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 422 | VALIDATION_ERROR | Field tidak valid / email sudah terdaftar |

---

### 3.2 Login

**`POST /auth/login`**

Login dan dapatkan access_token (JWT) + refresh_token.

**Auth:** Tidak diperlukan

**Request Body:**
```json
{
  "email": "budi@example.com",
  "password": "password123"
}
```

| Field | Tipe | Wajib |
|-------|------|-------|
| `email` | string | Ya |
| `password` | string | Ya |

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
    "refresh_token": "def50200a3b2c1d4e5f6...",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "name": "Budi Santoso",
      "role": "reader"
    }
  }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 401 | INVALID_CREDENTIALS | Email atau password salah |
| 403 | ACCOUNT_INACTIVE | Akun nonaktif (`is_active = false`) |

**Catatan:**
- `access_token` disimpan di Zustand store (frontend) dan dikirim sebagai Bearer token.
- `refresh_token` disimpan di `localStorage` dan hanya digunakan untuk endpoint `/auth/refresh`.
- Refresh token di-hash SHA-256 sebelum disimpan di database (tabel `refresh_tokens`).

---

### 3.3 Refresh Token

**`POST /auth/refresh`**

Dapatkan access_token baru menggunakan refresh_token yang masih valid.

**Auth:** Tidak diperlukan (refresh_token dikirim di body)

**Request Body:**
```json
{
  "refresh_token": "def50200a3b2c1d4e5f6..."
}
```

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGci..._NEW",
    "refresh_token": "def50200a3b2c1d4e5f6...",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "avatar_url": "https://example.com/storage/avatars/1.jpg",
      "role": "reader"
    }
  }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 401 | TOKEN_REVOKED | Refresh token sudah di-revoke |
| 401 | TOKEN_EXPIRED | Refresh token sudah kedaluwarsa (> 14 hari) |
| 400 | TOKEN_NOT_FOUND | Refresh token tidak ditemukan di database |

**Catatan:** Frontend Axios interceptor memanggil endpoint ini secara otomatis (silent refresh) saat access_token expired, tanpa interaksi user.

---

### 3.4 Logout

**`POST /auth/logout`**

Logout: revoke refresh token + invalidasi JWT.

**Auth:** JWT Bearer Token (wajib)

**Request Body:**
```json
{
  "refresh_token": "def50200a3b2c1d4e5f6..."
}
```

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Logout berhasil"
}
```

**Catatan:** Refresh token ditandai `is_revoked = true` di database. Frontend tetap melanjutkan logout meskipun request ini gagal.

---

### 3.5 Get Current User (Me)

**`GET /auth/me`**

Ambil data profil user yang sedang login.

**Auth:** JWT Bearer Token (wajib)

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "reader",
    "avatar_url": "https://example.com/storage/avatars/1.jpg"
  }
}
```

---

### 3.6 Update Profile

**`PUT /auth/profile`**

Update data profil user (nama, email, avatar).

**Auth:** JWT Bearer Token (wajib)

**Content-Type:** `multipart/form-data` (karena ada file avatar)

**Request Body (Form-Data):**

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `name` | string | Ya | max:255 |
| `email` | string | Ya | email, unique (kecuali email sendiri) |
| `avatar` | file | Tidak | image (jpeg/png/jpg), max:2048KB |

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Profil berhasil diperbarui.",
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi_new@example.com",
    "role": "reader",
    "avatar_url": "https://example.com/storage/avatars/abc123.jpg"
  }
}
```

**Catatan:** Avatar lama otomatis dihapus dari storage saat upload avatar baru. Avatar disimpan di `storage/app/public/avatars/`.

---

### 3.7 Change Password

**`PUT /auth/change-password`**

Ubah password user yang sedang login.

**Auth:** JWT Bearer Token (wajib)

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `current_password` | string | Ya | Harus cocok dengan password saat ini |
| `new_password` | string | Ya | min:8 |

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Password berhasil diubah."
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 422 | - | Password saat ini salah |

---

### 3.8 Forgot Password

**`POST /auth/forgot-password`**

Kirim link reset password ke email user.

**Auth:** Tidak diperlukan

**Request Body:**
```json
{
  "email": "budi@example.com"
}
```

**Response `200 OK`** (selalu 200, anti user-enumeration):
```json
{
  "status": "success",
  "message": "Jika email Anda terdaftar, kami telah mengirimkan link reset password. Periksa inbox Anda."
}
```

**Catatan:** Response selalu 200 meskipun email tidak terdaftar, untuk mencegah attacker mengetahui email mana yang valid. Token reset disimpan di tabel `password_reset_tokens` dan dikirim via email (`ResetPasswordMail`).

---

### 3.9 Reset Password

**`POST /auth/reset-password`**

Reset password menggunakan token yang diterima dari email.

**Auth:** Tidak diperlukan

**Request Body:**
```json
{
  "email": "budi@example.com",
  "token": "abc123def456...",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `email` | string | Ya | email |
| `token` | string | Ya | Harus valid dan belum expired |
| `password` | string | Ya | min:8 |
| `password_confirmation` | string | Ya | same:password |

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Password berhasil direset. Silakan login dengan password baru Anda."
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 422 | INVALID_TOKEN | Token tidak valid atau sudah expired |
| 422 | TOKEN_ALREADY_USED | Token sudah pernah digunakan |

**Catatan:** Setelah reset berhasil, **semua refresh token user di-revoke** (semua sesi berakhir). User harus login ulang di semua perangkat.

---

## 4. Beranda (Homepage)

### `GET /beranda`

Mengambil data lengkap untuk halaman beranda dalam satu request: artikel featured (headline), berita terbaru, artikel populer, dan daftar kategori dengan sub-kategorinya.

**Auth:** Tidak diperlukan

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Data beranda berhasil dimuat.",
  "data": {
    "featured": [
      {
        "id": "uuid",
        "title": "Judul Artikel Featured",
        "slug": "judul-artikel-featured",
        "excerpt": "Ringkasan singkat...",
        "featured_image_url": "https://...",
        "published_at": "2026-06-15T10:00:00.000000Z",
        "author": { "id": 1, "name": "Reporter A" },
        "category": { "id": "uuid", "name": "Politik", "slug": "politik" }
      }
    ],
    "latest": [ ... ],
    "popular": [ ... ],
    "categories": [
      {
        "id": "uuid",
        "name": "Teknologi",
        "slug": "teknologi",
        "children": [
          { "id": "uuid", "name": "Gadget", "slug": "gadget" }
        ]
      }
    ]
  }
}
```

**Penjelasan:**
- `featured` — artikel dengan `is_featured = true` dan status `published`
- `latest` — 6 artikel terbaru berdasarkan `published_at`
- `popular` — 5 artikel dengan `view_count` tertinggi
- `categories` — kategori utama dengan sub-kategori (hierarki parent-child)

---

## 5. Categories (Public)

### `GET /categories`

Mengambil semua kategori dalam struktur hierarki (parent → children).

**Auth:** Tidak diperlukan

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-1",
      "name": "Olahraga",
      "slug": "olahraga",
      "parent_id": null,
      "children": [
        { "id": "uuid-2", "name": "Sepak Bola", "slug": "sepak-bola", "parent_id": "uuid-1" },
        { "id": "uuid-3", "name": "Basket", "slug": "basket", "parent_id": "uuid-1" }
      ]
    }
  ]
}
```

---

## 6. Tags (Public)

### `GET /tags`

Mengambil semua tag.

**Auth:** Tidak diperlukan

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": [
    { "id": "uuid", "name": "Breaking News", "slug": "breaking-news" },
    { "id": "uuid", "name": "Viral", "slug": "viral" }
  ]
}
```

---

## 7. Articles (Public)

### 7.1 List Articles

**`GET /articles`**

Mengambil daftar artikel published dengan dukungan pencarian, filter, dan pagination.

**Auth:** Tidak diperlukan (opsional — header `X-Client: cms` untuk akses CMS)

**Query Parameters:**

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|-----------|
| `search` | string | - | Pencarian full-text (judul + konten + tags) |
| `category` | string | - | Filter berdasarkan slug kategori |
| `tag` | string | - | Filter berdasarkan slug tag |
| `featured` | boolean | - | Filter `is_featured` |
| `page` | integer | 1 | Halaman |
| `limit` | integer | 10 | Jumlah per halaman |
| `status` | string | `published` | Hanya berlaku jika `X-Client: cms` + JWT valid |
| `author_id` | string | - | Filter berdasarkan author (CMS only) |

**Header (Opsional):**

| Header | Nilai | Keterangan |
|--------|-------|-----------|
| `X-Client` | `cms` | Jika dikirim, server cek JWT untuk role-based filtering |

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "Judul Artikel",
        "slug": "judul-artikel",
        "excerpt": "Ringkasan...",
        "featured_image_url": "https://...",
        "status": "published",
        "published_at": "2026-06-15T10:00:00.000000Z",
        "view_count": 150,
        "author": { "id": 1, "name": "Reporter A" },
        "category": { "id": "uuid", "name": "Teknologi", "slug": "teknologi" },
        "tags": [
          { "id": "uuid", "name": "AI", "slug": "ai" }
        ]
      }
    ],
    "current_page": 1,
    "per_page": 10,
    "total": 50,
    "last_page": 5
  }
}
```

**Logika X-Client:**
- Tanpa header / `X-Client: public` → hanya artikel `published`
- `X-Client: cms` + JWT journalist → hanya artikel milik sendiri, semua status
- `X-Client: cms` + JWT editor/admin → semua artikel, semua status

---

### 7.2 Detail Article

**`GET /articles/{slug}`**

Mengambil satu artikel berdasarkan slug, lengkap dengan tags dan data author.

**Auth:** Tidak diperlukan

**Path Parameter:**

| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `slug` | string | Slug artikel (dari URL) |

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "title": "Judul Artikel",
    "slug": "judul-artikel",
    "excerpt": "Ringkasan artikel...",
    "content": "<p>Konten lengkap artikel dalam HTML...</p>",
    "featured_image_url": "https://...",
    "status": "published",
    "is_featured": true,
    "view_count": 250,
    "published_at": "2026-06-15T10:00:00.000000Z",
    "author": { "id": 1, "name": "Reporter A", "avatar_url": "..." },
    "category": { "id": "uuid", "name": "Teknologi", "slug": "teknologi" },
    "tags": [
      { "id": "uuid", "name": "AI", "slug": "ai" },
      { "id": "uuid", "name": "Startup", "slug": "startup" }
    ],
    "created_at": "2026-06-14T08:00:00.000000Z",
    "updated_at": "2026-06-15T09:00:00.000000Z"
  }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 404 | ARTICLE_NOT_FOUND | Slug tidak ditemukan |

---

### 7.3 Get Article Comments

**`GET /articles/{id}/comments`**

Mengambil semua komentar publik pada artikel (termasuk nested reply, max 2 level).

**Auth:** Tidak diperlukan

**Path Parameter:**

| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `id` | UUID | ID artikel |

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "comments": [
      {
        "id": "uuid",
        "content": "Artikel yang sangat informatif!",
        "status": "approved",
        "parent_id": null,
        "created_at": "2026-06-15T11:00:00.000000Z",
        "user": { "id": 5, "name": "Pembaca A" },
        "replies": [
          {
            "id": "uuid",
            "content": "Setuju sekali!",
            "status": "approved",
            "parent_id": "uuid-parent",
            "created_at": "2026-06-15T11:30:00.000000Z",
            "user": { "id": 6, "name": "Pembaca B" }
          }
        ]
      }
    ]
  }
}
```

---

## 8. Comments

### 8.1 Post Comment (via Article)

**`POST /articles/{id}/comments`**

Memberi komentar pada artikel (shortcut — article_id dari URL).

**Auth:** JWT Bearer Token (wajib)

**Path Parameter:**

| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `id` | UUID | ID artikel |

**Request Body:**
```json
{
  "content": "Artikel yang sangat informatif!",
  "parent_id": null
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `content` | string | Ya | max:1000 |
| `parent_id` | UUID | Tidak | UUID komentar yang direply (nullable) |

**Response `201 Created`:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "article_id": "uuid",
    "user_id": 5,
    "parent_id": null,
    "content": "Artikel yang sangat informatif!",
    "status": "approved",
    "created_at": "2026-06-15T11:00:00.000000Z",
    "user": { "id": 5, "name": "Pembaca A" }
  }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 429 | RATE_LIMIT_EXCEEDED | Melebihi 10 komentar per jam |
| 400 | MAX_NESTING | Kedalaman reply sudah 2 level (parent adalah reply, bukan top-level) |
| 400 | PARENT_MISMATCH | Parent comment tidak berada di artikel yang sama |

**Rate Limiting:**
- Maksimal 10 komentar per jam per user (tabel `comment_rate_limits`).
- Window reset otomatis setelah 1 jam dari `window_start`.

**Threading Rules:**
- Max 2 level: top-level comment → reply. Reply dari reply tidak diizinkan.
- Reply dari komentar yang sudah di-reply → error 400.

---

### 8.2 Post Comment (Direct)

**`POST /comments`**

Alternatif endpoint — article_id dikirim di body.

**Auth:** JWT Bearer Token (wajib)

**Request Body:**
```json
{
  "article_id": "uuid-artikel",
  "content": "Komentar saya",
  "parent_id": null
}
```

Response dan validasi sama dengan endpoint 8.1.

---

### 8.3 Delete Comment

**`DELETE /comments/{id}`**

Hapus komentar secara permanen (beserta reply-nya via cascade).

**Auth:** JWT Bearer Token (wajib)

**Role:** `editor`, `admin` saja

**Path Parameter:**

| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `id` | UUID | ID komentar |

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Komentar berhasil dihapus secara permanen."
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 403 | FORBIDDEN | Bukan editor/admin |
| 404 | COMMENT_NOT_FOUND | Komentar tidak ditemukan |

---

## 9. Bookmarks

### 9.1 List Bookmarks

**`GET /bookmarks`**

Ambil semua bookmark milik user yang sedang login.

**Auth:** JWT Bearer Token (wajib)

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "bookmarks": [
      {
        "id": "uuid",
        "article_id": "uuid-artikel",
        "created_at": "2026-06-15T10:00:00.000000Z"
      }
    ]
  }
}
```

---

### 9.2 Toggle Bookmark

**`POST /bookmarks`**

Toggle bookmark: tambahkan jika belum ada, hapus jika sudah ada.

**Auth:** JWT Bearer Token (wajib)

**Request Body:**
```json
{
  "article_id": "uuid-artikel"
}
```

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "bookmarked": true
  }
}
```

**Penjelasan:**
- Jika user belum bookmark → INSERT → return `bookmarked: true`
- Jika user sudah bookmark → DELETE → return `bookmarked: false`
- Unique constraint: satu user hanya bisa bookmark satu artikel satu kali.

---

## 10. Media

### 10.1 List Media Library

**`GET /media`**

Mengambil semua media dari galeri Media Tersimpan (`is_library = true`).

**Auth:** JWT Bearer Token (wajib)

**Role:** `journalist`, `editor`, `admin`

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "article_id": null,
      "uploaded_by": 3,
      "file_url": "/storage/media/img_abc123.jpg",
      "media_type": "image",
      "alt_text": "Foto gedung",
      "category_name": "Infrastruktur",
      "is_library": true,
      "created_at": "2026-06-15T10:00:00.000000Z"
    }
  ]
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 403 | - | Bukan journalist/editor/admin |

---

### 10.2 Upload Media

**`POST /media/upload`**

Upload gambar ke server.

**Auth:** JWT Bearer Token (wajib)

**Content-Type:** `multipart/form-data`

**Request Body (Form-Data):**

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|-----------|
| `image` | file | Ya | png/jpg/jpeg, max:5120KB | File gambar |
| `article_id` | string | Tidak | UUID artikel | Jika kosong = standalone (dari Media Tersimpan) |
| `alt_text` | string | Tidak | max:255 | Teks alternatif untuk aksesibilitas |
| `category_name` | string | Tidak | max:100 | Kategori media |
| `is_library` | boolean | Tidak | default: false | true = masuk galeri Media Tersimpan |

**Response `201 Created`:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "article_id": "uuid-artikel",
    "uploaded_by": 3,
    "file_url": "/storage/media/img_abc123.jpg",
    "media_type": "image",
    "alt_text": "Foto gedung",
    "category_name": "Infrastruktur",
    "is_library": true,
    "created_at": "2026-06-15T10:00:00.000000Z"
  }
}
```

**Penjelasan:**
- File disimpan di `storage/app/public/media/`.
- `is_library = true` → media muncul di galeri "Media Tersimpan" dan bisa dipakai ulang di artikel lain.
- `is_library = false` → media hanya terikat ke satu artikel, tidak muncul di galeri.
- `article_id = null` → media standalone (upload dari halaman Media Tersimpan tanpa artikel).

---

### 10.3 Delete Media

**`DELETE /media/{id}`**

Menghapus media dan file fisiknya dari storage.

**Auth:** JWT Bearer Token (wajib)

**Path Parameter:**

| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `id` | UUID | ID media |

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Media berhasil dihapus"
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 404 | - | Media tidak ditemukan |

---

## 11. Analytics

### `POST /analytics/track`

Mencatat kunjungan halaman (page view). Endpoint ini dipanggil secara otomatis oleh `AnalyticsTracker` component di frontend setiap navigasi halaman.

**Auth:** Tidak diperlukan

**Request Body:**
```json
{
  "path": "/artikel/kopi-malang-hits"
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `path` | string | Ya | max:255 |

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "View tracked successfully."
}
```

**Anti-Spam:**
- Dedup berdasarkan `ip_address` + `path` dalam window 5 menit.
- Jika ada catatan identik dalam 5 menit terakhir, request diabaikan (tidak INSERT duplikat).
- IP address dan user_agent dicatat otomatis dari request.

---

## 12. CMS Articles

Semua endpoint CMS Article memerlukan JWT dan role `journalist`, `editor`, atau `admin`.

### 12.1 List CMS Articles (Bank Berita)

**`GET /cms/articles`**

**Auth:** JWT (wajib) — **Role:** `journalist`, `editor`, `admin`

**Logika Filter Role:**
- **Journalist:** Hanya artikel milik sendiri (`author_id = user.id`)
- **Editor:** Semua artikel (untuk keperluan review)
- **Admin:** Semua artikel

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "title": "Judul Artikel",
      "slug": "judul-artikel",
      "status": "draft",
      "is_featured": false,
      "view_count": 0,
      "locked_by": null,
      "author": { "id": 3, "name": "Reporter A" },
      "category": { "id": "uuid", "name": "Teknologi" },
      "tags": [{ "id": "uuid", "name": "AI" }],
      "created_at": "2026-06-15T08:00:00.000000Z",
      "updated_at": "2026-06-15T09:00:00.000000Z"
    }
  ]
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 403 | FORBIDDEN_ROLE | Bukan journalist/editor/admin |

---

### 12.2 Get CMS Article Detail

**`GET /cms/articles/{id}`**

**Auth:** JWT (wajib) — **Role:** `journalist`, `editor`, `admin`

**Path Parameter:**

| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `id` | UUID | ID artikel |

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "author_id": 3,
    "published_by": null,
    "locked_by": null,
    "category_id": "uuid",
    "title": "Judul Artikel",
    "slug": "judul-artikel",
    "excerpt": "Ringkasan...",
    "content": "<p>Konten HTML lengkap...</p>",
    "featured_image_url": "https://...",
    "status": "draft",
    "is_featured": false,
    "view_count": 0,
    "published_at": null,
    "tag_ids": ["uuid-tag-1", "uuid-tag-2"],
    "created_at": "2026-06-15T08:00:00.000000Z"
  }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 404 | - | Artikel tidak ditemukan atau akses ditolak |

**Catatan:** Journalist hanya bisa melihat detail artikel miliknya sendiri.

---

### 12.3 Create Article (Tulis Berita)

**`POST /cms/articles`**

Buat artikel baru. Status otomatis `draft`.

**Auth:** JWT (wajib) — **Role:** `journalist`, `editor`, `admin`

**Request Body:**
```json
{
  "title": "Judul Artikel Baru",
  "content": "<p>Isi artikel dalam HTML...</p>",
  "category_id": "uuid-kategori",
  "slug": "judul-artikel-baru",
  "excerpt": "Ringkasan singkat...",
  "featured_image_url": "https://example.com/img.jpg",
  "tags": ["AI", "Teknologi", "Startup"],
  "change_note": "Draf pertama"
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `title` | string | Ya | max:500 |
| `content` | string | Ya | - |
| `category_id` | UUID | Tidak | exists di tabel categories |
| `slug` | string | Tidak | regex slug, auto-generate jika kosong |
| `excerpt` | string | Tidak | max:1000 |
| `featured_image_url` | URL | Tidak | max:2048 |
| `tags` | array | Tidak | array of string (nama tag), max:100 per item |
| `change_note` | string | Tidak | max:500, catatan revisi |

**Response `201 Created`:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "author_id": 3,
    "category_id": "uuid",
    "title": "Judul Artikel Baru",
    "slug": "judul-artikel-baru",
    "excerpt": "Ringkasan singkat...",
    "featured_image_url": "https://example.com/img.jpg",
    "status": "draft",
    "is_featured": false,
    "view_count": 0,
    "tag_ids": ["uuid-tag-1", "uuid-tag-2"],
    "published_at": null,
    "created_at": "2026-06-15T10:00:00.000000Z"
  }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 403 | FORBIDDEN_ROLE | Bukan journalist/editor/admin |
| 409 | SLUG_ALREADY_EXISTS | Slug sudah dipakai artikel lain |
| 422 | VALIDATION_ERROR | Field wajib tidak lengkap |

**Catatan:**
- Slug auto-generate dari judul jika tidak diisi (menggunakan `Str::slug`).
- Tags diproses berdasarkan nama: jika tag sudah ada → pakai, jika belum → buat baru.
- Artikel baru otomatis ter-index di `search_indexes`.

---

### 12.4 Update Article

**`PUT /cms/articles/{id}`**

Update artikel. Journalist hanya bisa update artikel miliknya sendiri.

**Auth:** JWT (wajib) — **Role:** `journalist`, `editor`, `admin`

**Path Parameter:** `id` (UUID)

**Request Body** (sama dengan Create, semua field opsional/sometimes):
```json
{
  "title": "Judul Diperbarui",
  "content": "<p>Konten baru...</p>",
  "category_id": "uuid-kategori",
  "slug": "judul-diperbarui",
  "excerpt": "Ringkasan baru...",
  "featured_image_url": "https://...",
  "tags": ["AI", "Machine Learning"],
  "change_note": "Revisi kedua"
}
```

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 403 | FORBIDDEN_ROLE | Bukan journalist/editor/admin |
| 403 | FORBIDDEN_OWNERSHIP | Journalist mencoba edit artikel orang lain |
| 403 | FORBIDDEN_STATUS | Mencoba edit artikel yang sedang review/scheduled/published |
| 404 | NOT_FOUND | Artikel tidak ditemukan |
| 409 | SLUG_ALREADY_EXISTS | Slug sudah dipakai |

**Aturan Edit:**
- **Journalist:** Hanya bisa edit artikel miliknya sendiri yang berstatus `draft`.
- **Editor/Admin:** Bisa edit semua artikel.
- Artikel berstatus `review`, `scheduled`, atau `published` hanya bisa diedit oleh editor/admin.
- Setiap update membuat snapshot di `article_revisions` (jika `change_note` diisi).
- Search index diperbarui setelah update.

---

### 12.5 Delete Article

**`DELETE /cms/articles/{id}`**

Hapus artikel. Hanya artikel berstatus `draft` yang bisa dihapus.

**Auth:** JWT (wajib) — **Role:** `journalist`, `editor`, `admin`

**Path Parameter:** `id` (UUID)

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Artikel berhasil dihapus."
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 403 | FORBIDDEN_ROLE | Bukan CMS role |
| 403 | FORBIDDEN_OWNERSHIP | Journalist mencoba hapus artikel orang lain |
| 403 | FORBIDDEN_STATUS | Mencoba hapus artikel non-draft |
| 403 | LOCKED_BY_OTHER | Artikel sedang dikunci editor lain |
| 404 | ARTICLE_NOT_FOUND | Artikel tidak ditemukan |

**Cascade Delete:** Saat artikel dihapus, data berikut ikut terhapus:
- `article_tags` (relasi tag)
- `comments` (dan reply-nya)
- `media` (file fisik juga dihapus)
- `search_indexes`
- `article_revisions`

---

### 12.6 Update Status Article (Review/Publish/Schedule/Reject)

**`PATCH /cms/articles/{id}/status`**

Mengubah status editorial artikel. Endpoint kunci dalam workflow redaksi.

**Auth:** JWT (wajib) — **Role:** `journalist`, `editor`, `admin`

**Path Parameter:** `id` (UUID)

**Request Body:**
```json
{
  "status": "published",
  "scheduled_at": null
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `status` | string | Ya | `draft`, `review`, `published`, `scheduled`, `archived` |
| `scheduled_at` | datetime | Jika status = `scheduled` | date, minimal 5 menit dari sekarang |

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "status": "published",
    "published_at": "2026-06-15T10:00:00.000000Z",
    "published_by": 2
  }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 400 | INVALID_STATUS_TRANSITION | Transisi status tidak valid (lihat State Machine di bawah) |
| 400 | SCHEDULED_TIME_TOO_SOON | `scheduled_at` kurang dari 5 menit dari sekarang |
| 403 | FORBIDDEN_ROLE | Bukan CMS role |
| 404 | NOT_FOUND | Artikel tidak ditemukan |

**State Machine — Transisi Status yang Diizinkan:**

```
draft     → review      (oleh journalist/editor/admin)
review    → published   (oleh editor/admin)
review    → scheduled   (oleh editor/admin, wajib isi scheduled_at)
review    → rejected    (oleh editor/admin)
review    → draft       (oleh editor/admin, kembalikan ke author)
scheduled → published   (oleh editor/admin atau otomatis via cron)
published → archived    (oleh editor/admin, satu arah)
```

**Transisi yang DILARANG:**
- `published` → `draft` / `review` / `scheduled` (tidak bisa kembali dari published)
- `archived` → apapun (arsip adalah status final)
- `draft` → `published` (harus melalui review terlebih dahulu)

**Aksi Otomatis:**
- Status → `published`: set `published_at = NOW()`, `published_by = user.id`, reindex search
- Status → `scheduled`: INSERT ke tabel `scheduled_articles`
- Status → `archived`: tidak ada aksi tambahan

---

### 12.7 Lock Article

**`POST /cms/articles/{id}/lock`**

Tandai artikel sebagai "sedang dikerjakan" (on progress) oleh editor.

**Auth:** JWT (wajib) — **Role:** `editor`, `admin`

**Path Parameter:** `id` (UUID)

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Artikel berhasil ditandai on progress."
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 403 | FORBIDDEN_ROLE | Bukan editor/admin |
| 403 | LOCKED_BY_OTHER | Sudah dikunci editor lain |
| 404 | ARTICLE_NOT_FOUND | Artikel tidak ditemukan |

**Penjelasan:**
- Set `articles.locked_by = user.id`
- Editor lain yang melihat akan tahu artikel sedang dikerjakan.
- Lock otomatis terlepas (`nullOnDelete`) jika user dihapus.

---

### 12.8 Unlock Article

**`POST /cms/articles/{id}/unlock`**

Lepas tanda "sedang dikerjakan" dari artikel.

**Auth:** JWT (wajib) — **Role:** `editor`, `admin`

**Path Parameter:** `id` (UUID)

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Tanda on progress berhasil dilepas."
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 403 | FORBIDDEN_ROLE | Bukan editor/admin |
| 404 | ARTICLE_NOT_FOUND | Artikel tidak ditemukan |

**Penjelasan:** Set `articles.locked_by = NULL`.

---

## 13. CMS Comments

### `GET /cms/comments`

Ambil semua komentar (semua status) untuk keperluan moderasi.

**Auth:** JWT (wajib) — **Role:** `editor`, `admin`

**Query Parameters:**

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|-----------|
| `page` | integer | 1 | Halaman |
| `limit` | integer | 20 | Jumlah per halaman |

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "data": [
      {
        "id": "uuid",
        "content": "Isi komentar...",
        "status": "pending",
        "parent_id": null,
        "created_at": "2026-06-15T10:00:00.000000Z",
        "article": {
          "id": "uuid",
          "title": "Judul Artikel",
          "slug": "judul-artikel"
        },
        "user": {
          "id": 5,
          "name": "Pembaca A"
        }
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 150,
    "last_page": 8
  }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 403 | FORBIDDEN_ROLE | Bukan editor/admin |

**Penjelasan:** Menampilkan komentar dari semua artikel dengan relasi `article` dan `user`. Editor/admin dapat melihat status komentar (pending/approved/rejected) dan mengambil tindakan (approve/reject/delete via endpoint `DELETE /comments/{id}`).

---

## 14. CMS Dashboard Statistics

### `GET /cms/statistics`

Menghasilkan statistik dashboard yang berbeda berdasarkan role.

**Auth:** JWT (wajib) — **Role:** `journalist`, `editor`, `admin`

**Response `200 OK` — Admin:**
```json
{
  "role": "admin",
  "topCards": {
    "totalBerita": 150,
    "totalUser": 25,
    "totalBeritaHariIni": 3
  },
  "summaryData": {
    "hari_ini": {
      "pageViews": "1,234",
      "totalBerita": "3",
      "userBaru": "1",
      "rawTotalBerita": 3,
      "rawUserBaru": 1
    },
    "7_hari": { ... },
    "30_hari": { ... },
    "1_tahun": { ... }
  },
  "sparklines": {
    "totalBerita": [{ "v": 2 }, { "v": 5 }, { "v": 1 }, { "v": 3 }, { "v": 0 }, { "v": 4 }, { "v": 2 }],
    "totalUser": [{ "v": 1 }, { "v": 0 }, { "v": 2 }, { "v": 0 }, { "v": 1 }, { "v": 0 }, { "v": 1 }],
    "beritaHariIni": [{ "v": 1 }, { "v": 0 }, { "v": 2 }, { "v": 0 }, { "v": 0 }, { "v": 0 }, { "v": 0 }]
  },
  "visitorData": {
    "hari_ini": [
      { "date": "00:00", "visitors": 45 },
      { "date": "04:00", "visitors": 12 },
      { "date": "08:00", "visitors": 89 },
      { "date": "12:00", "visitors": 156 },
      { "date": "16:00", "visitors": 201 },
      { "date": "20:00", "visitors": 78 }
    ],
    "7_hari": [
      { "date": "09 Jun", "visitors": 345 },
      { "date": "10 Jun", "visitors": 412 },
      ...
    ],
    "30_hari": [ ... ],
    "1_tahun": [
      { "date": "Jul", "visitors": 1200 },
      { "date": "Aug", "visitors": 1500 },
      ...
    ]
  },
  "categoryData": {
    "hari_ini": [
      { "name": "Teknologi", "value": 2, "color": "#2563eb", "percent": "67%" },
      { "name": "Olahraga", "value": 1, "color": "#16a34a", "percent": "33%" }
    ],
    "7_hari": [ ... ],
    "30_hari": [ ... ],
    "1_tahun": [ ... ]
  }
}
```

**Response `200 OK` — Editor/Journalist:**
```json
{
  "role": "journalist",
  "statCards": {
    "beritaPublish": 12,
    "draft": 5,
    "kategoriAktif": 3,
    "mediaTersimpan": 372
  },
  "yearlyData": [
    { "year": "2025", "berita": 10 },
    { "year": "2026", "berita": 7 }
  ],
  "categoryData": [
    { "name": "Teknologi", "value": 8, "color": "#7c3aed" },
    { "name": "Politik", "value": 5, "color": "#2563eb" }
  ]
}
```

**Penjelasan:**
- **Admin** mendapat data analitik lengkap dengan filter waktu (hari ini, 7 hari, 30 hari, 1 tahun), sparklines tren 7 hari, visitor data dari `page_views`, dan distribusi kategori.
- **Editor/Journalist** mendapat statistik personal: jumlah artikel published, draft, kategori aktif, serta data yearly dan category untuk grafik Recharts.
- Editor melihat artikel yang pernah di-review, di-publish, atau di-schedule olehnya.
- Journalist hanya melihat artikel miliknya.

---

## 15. CMS Categories

CRUD kategori. Semua endpoint memerlukan JWT + role `admin` (dan juga `editor`/`journalist` untuk GET).

### 15.1 List Categories (CMS)

**`GET /cms/categories`**

**Auth:** JWT (wajib)

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Olahraga",
      "slug": "olahraga",
      "parent_id": null,
      "children_count": 2
    },
    {
      "id": "uuid",
      "name": "Sepak Bola",
      "slug": "sepak-bola",
      "parent_id": "uuid-parent",
      "children_count": 0
    }
  ]
}
```

---

### 15.2 Create Category

**`POST /cms/categories`**

**Auth:** JWT (wajib)

**Request Body:**
```json
{
  "name": "Teknologi",
  "parent_id": null
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `name` | string | Ya | max:100, unique |
| `parent_id` | UUID | Tidak | exists di categories (untuk sub-kategori) |

**Response `201 Created`:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Teknologi",
    "slug": "teknologi",
    "parent_id": null
  },
  "message": "Kategori berhasil ditambahkan."
}
```

**Catatan:** Slug auto-generate dari nama. Jika slug duplikat, ditambahkan counter (`teknologi-1`, `teknologi-2`, dst.).

---

### 15.3 Update Category

**`PUT /cms/categories/{id}`**

**Auth:** JWT (wajib)

**Path Parameter:** `id` (UUID)

**Request Body:**
```json
{
  "name": "Teknologi Terbaru",
  "parent_id": "uuid-parent"
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `name` | string | Ya | max:100, unique (kecuali id sendiri) |
| `parent_id` | UUID | Tidak | exists di categories |

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Teknologi Terbaru",
    "slug": "teknologi-terbaru",
    "parent_id": "uuid-parent"
  },
  "message": "Kategori berhasil diperbarui."
}
```

---

### 15.4 Delete Category

**`DELETE /cms/categories/{id}`**

**Auth:** JWT (wajib)

**Path Parameter:** `id` (UUID)

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Kategori berhasil dihapus."
}
```

**Catatan:** Saat kategori dihapus:
- Sub-kategori (children) tidak ikut terhapus, tapi `parent_id` mereka di-set ke `null`.
- Artikel dengan `category_id` yang dihapus → `category_id` menjadi `null` (karena FK `RESTRICT` akan menolak jika masih ada artikel — pastikan pindahkan artikel dulu).

---

## 16. CMS Tags

CRUD tag. Semua endpoint memerlukan JWT.

### 16.1 List Tags (CMS)

**`GET /cms/tags`**

**Auth:** JWT (wajib)

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": [
    { "id": "uuid", "name": "Breaking News", "slug": "breaking-news" },
    { "id": "uuid", "name": "Viral", "slug": "viral" }
  ]
}
```

---

### 16.2 Create Tag

**`POST /cms/tags`**

**Auth:** JWT (wajib)

**Request Body:**
```json
{
  "name": "Breaking News"
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `name` | string | Ya | max:100, unique |

**Response `201 Created`:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Breaking News",
    "slug": "breaking-news"
  },
  "message": "Tag berhasil ditambahkan."
}
```

---

### 16.3 Update Tag

**`PUT /cms/tags/{id}`**

**Auth:** JWT (wajib)

**Path Parameter:** `id` (UUID)

**Request Body:**
```json
{
  "name": "Super Viral"
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `name` | string | Ya | max:100, unique (kecuali id sendiri) |

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Super Viral",
    "slug": "super-viral"
  },
  "message": "Tag berhasil diperbarui."
}
```

---

### 16.4 Delete Tag

**`DELETE /cms/tags/{id}`**

**Auth:** JWT (wajib)

**Path Parameter:** `id` (UUID)

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Tag berhasil dihapus."
}
```

**Catatan:** Menghapus tag juga menghapus relasi `article_tags` untuk tag tersebut (cascade delete). Artikel tetap ada, hanya kehilangan tag.

---

## 17. User Management (Admin)

Semua endpoint user management memerlukan JWT + middleware `admin` (role = `admin`).

### 17.1 List Users

**`GET /users`**

Ambil semua user.

**Auth:** JWT (wajib) — **Role:** `admin` — **Middleware:** `admin`

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Admin Utama",
        "email": "admin@klojen.com",
        "role": "admin",
        "is_active": true,
        "created_at": "2026-05-15T10:00:00.000000Z"
      }
    ],
    "total": 25
  }
}
```

---

### 17.2 Get User Detail

**`GET /users/{id}`**

Ambil detail satu user.

**Auth:** JWT (wajib) — **Role:** `admin`

**Path Parameter:** `id` (BIGINT — user ID)

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "id": 3,
    "name": "Reporter A",
    "email": "reporter@klojen.com",
    "role": "journalist",
    "is_active": true,
    "created_at": "2026-05-20T08:00:00.000000Z"
  }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 404 | USER_NOT_FOUND | User tidak ditemukan |

---

### 17.3 Create User

**`POST /users`**

Buat user baru (karyawan: journalist/editor/admin). Password di-generate otomatis dan dikirim via email.

**Auth:** JWT (wajib) — **Role:** `admin`

**Request Body:**
```json
{
  "name": "Reporter Baru",
  "email": "reporter.baru@klojen.com",
  "role": "journalist"
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `name` | string | Ya | max:255 |
| `email` | string | Ya | email, harus unik |
| `role` | string | Ya | `admin`, `editor`, `journalist`, `reader` |

**Response `201 Created`:**
```json
{
  "status": "success",
  "message": "User berhasil dibuat. Kredensial telah dikirim ke email reporter.baru@klojen.com.",
  "data": {
    "id": 26,
    "name": "Reporter Baru",
    "email": "reporter.baru@klojen.com",
    "role": "journalist",
    "is_active": true,
    "created_at": "2026-06-15T10:00:00.000000Z"
  }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 409 | EMAIL_ALREADY_EXISTS | Email sudah terdaftar |

**Catatan:** Password sementara di-generate random, di-hash, dan dikirim ke email user baru via `NewUserCredentials` Mailable. User harus mengganti password setelah login pertama.

---

### 17.4 Update User

**`PATCH /users/{id}`**

Update data user (role, status aktif, dll).

**Auth:** JWT (wajib) — **Role:** `admin`

**Path Parameter:** `id` (BIGINT)

**Request Body:**
```json
{
  "name": "Nama Baru",
  "email": "email.baru@klojen.com",
  "role": "editor",
  "is_active": false
}
```

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| `name` | string | Tidak | max:255 |
| `email` | string | Tidak | email, unique |
| `role` | string | Tidak | `admin`, `editor`, `journalist`, `reader` |
| `is_active` | boolean | Tidak | true/false |

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "User berhasil diperbarui.",
  "data": {
    "id": 3,
    "name": "Nama Baru",
    "email": "email.baru@klojen.com",
    "role": "editor",
    "is_active": false,
    "created_at": "2026-05-20T08:00:00.000000Z"
  }
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 404 | USER_NOT_FOUND | User tidak ditemukan |
| 403 | CANNOT_MODIFY_SELF | Admin tidak bisa mengubah akun sendiri di halaman ini |
| 409 | EMAIL_ALREADY_EXISTS | Email sudah terdaftar |

---

### 17.5 Delete User

**`DELETE /users/{id}`**

Hapus user secara permanen.

**Auth:** JWT (wajib) — **Role:** `admin`

**Path Parameter:** `id` (BIGINT)

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "User berhasil dihapus."
}
```

**Error Responses:**

| Code | Error | Keterangan |
|------|-------|-----------|
| 404 | USER_NOT_FOUND | User tidak ditemukan |
| 403 | CANNOT_MODIFY_SELF | Admin tidak bisa menghapus akun sendiri |

**Catatan:** Menghapus user akan cascade:
- Artikel yang ditulis user → `author_id` cascade delete (artikel ikut terhapus)
- Komentar user → cascade delete
- Refresh token user → cascade delete
- Bookmark user → cascade delete

---

## 18. SEO: Sitemap

### 18.1 XML Sitemap Data

**`GET /articles/sitemap`**

Mengembalikan semua artikel published untuk generate XML sitemap.

**Auth:** Tidak diperlukan

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": [
    {
      "slug": "judul-artikel-1",
      "published_at": "2026-06-15T10:00:00.000000Z",
      "updated_at": "2026-06-15T11:00:00.000000Z"
    },
    {
      "slug": "judul-artikel-2",
      "published_at": "2026-06-14T08:00:00.000000Z",
      "updated_at": "2026-06-14T08:00:00.000000Z"
    }
  ]
}
```

**Penjelasan:** Frontend (`sitemap.ts`) memanggil endpoint ini untuk men-generate XML sitemap yang bisa di-crawl oleh Googlebot. Hanya field `slug`, `published_at`, dan `updated_at` yang dikembalikan (ringan).

---

### 18.2 News Sitemap Data

**`GET /articles/news-sitemap`**

Mengembalikan artikel published dalam **48 jam terakhir** untuk Google News Sitemap.

**Auth:** Tidak diperlukan

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": [
    {
      "slug": "breaking-news-hari-ini",
      "title": "Breaking News Hari Ini",
      "published_at": "2026-06-15T10:00:00.000000Z"
    }
  ]
}
```

**Penjelasan:** Google News hanya menerima artikel maksimal 2 hari (48 jam) ke belakang. Frontend (`news-sitemap.xml/route.ts`) memanggil endpoint ini dan men-generate XML khusus news sitemap.

---

## 19. Error Codes Reference

Daftar semua error code yang digunakan di seluruh API:

| Error Code | HTTP Status | Keterangan |
|-----------|-------------|-----------|
| `INVALID_CREDENTIALS` | 401 | Email atau password salah saat login |
| `ACCOUNT_INACTIVE` | 403 | Akun nonaktif (`is_active = false`) |
| `TOKEN_REVOKED` | 401 | Refresh token sudah di-revoke |
| `TOKEN_EXPIRED` | 401 | JWT atau refresh token sudah kedaluwarsa |
| `TOKEN_NOT_FOUND` | 400 | Refresh token tidak ditemukan di DB |
| `FORBIDDEN_ROLE` | 403 | User tidak memiliki role yang diperlukan |
| `FORBIDDEN_OWNERSHIP` | 403 | Journalist mencoba akses artikel orang lain |
| `FORBIDDEN_STATUS` | 403 | Aksi tidak diizinkan pada status artikel saat ini |
| `LOCKED_BY_OTHER` | 403 | Artikel sedang dikunci editor lain |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `ARTICLE_NOT_FOUND` | 404 | Artikel tidak ditemukan |
| `COMMENT_NOT_FOUND` | 404 | Komentar tidak ditemukan |
| `USER_NOT_FOUND` | 404 | User tidak ditemukan |
| `SLUG_ALREADY_EXISTS` | 409 | Slug artikel sudah dipakai |
| `EMAIL_ALREADY_EXISTS` | 409 | Email sudah terdaftar |
| `CANNOT_MODIFY_SELF` | 403 | Admin tidak bisa edit/hapus akun sendiri |
| `INVALID_STATUS_TRANSITION` | 400 | Transisi status artikel tidak valid |
| `SCHEDULED_TIME_TOO_SOON` | 400 | `scheduled_at` kurang dari 5 menit |
| `RATE_LIMIT_EXCEEDED` | 429 | Melebihi batas 10 komentar/jam |
| `MAX_NESTING` | 400 | Reply sudah max 2 level |
| `PARENT_MISMATCH` | 400 | Parent comment bukan di artikel yang sama |
| `VALIDATION_ERROR` | 422 | Input tidak lolos validasi Laravel |
| `INTERNAL_ERROR` | 500 | Error internal server |

---

## Ringkasan Endpoint Cepat

| # | Method | Endpoint | Auth | Role | Fungsi |
|---|--------|----------|------|------|--------|
| 1 | GET | `/ping` | - | - | Health check |
| 2 | POST | `/auth/register` | - | Public | Registrasi |
| 3 | POST | `/auth/login` | - | Public | Login |
| 4 | POST | `/auth/refresh` | - | Public | Refresh access token |
| 5 | POST | `/auth/logout` | JWT | Any | Logout |
| 6 | GET | `/auth/me` | JWT | Any | Data user saat ini |
| 7 | PUT | `/auth/profile` | JWT | Any | Update profil |
| 8 | PUT | `/auth/change-password` | JWT | Any | Ganti password |
| 9 | POST | `/auth/forgot-password` | - | Public | Request reset password |
| 10 | POST | `/auth/reset-password` | - | Public | Reset password |
| 11 | GET | `/beranda` | - | Public | Data halaman beranda |
| 12 | GET | `/categories` | - | Public | Daftar kategori hierarki |
| 13 | GET | `/tags` | - | Public | Daftar tag |
| 14 | GET | `/articles` | - | Public | List artikel published |
| 15 | GET | `/articles/sitemap` | - | Public | Data XML sitemap |
| 16 | GET | `/articles/news-sitemap` | - | Public | Data news sitemap |
| 17 | GET | `/articles/{slug}` | - | Public | Detail artikel |
| 18 | GET | `/articles/{id}/comments` | - | Public | Komentar artikel |
| 19 | POST | `/articles/{id}/comments` | JWT | Any | Buat komentar |
| 20 | POST | `/comments` | JWT | Any | Buat komentar (direct) |
| 21 | DELETE | `/comments/{id}` | JWT | Editor/Admin | Hapus komentar |
| 22 | GET | `/bookmarks` | JWT | Any | Daftar bookmark |
| 23 | POST | `/bookmarks` | JWT | Any | Toggle bookmark |
| 24 | GET | `/media` | JWT | CMS roles | Daftar media library |
| 25 | POST | `/media/upload` | JWT | CMS roles | Upload media |
| 26 | DELETE | `/media/{id}` | JWT | CMS roles | Hapus media |
| 27 | POST | `/analytics/track` | - | Public | Track page view |
| 28 | GET | `/cms/articles` | JWT | CMS roles | List artikel CMS |
| 29 | POST | `/cms/articles` | JWT | CMS roles | Buat artikel baru |
| 30 | GET | `/cms/articles/{id}` | JWT | CMS roles | Detail artikel CMS |
| 31 | PUT | `/cms/articles/{id}` | JWT | CMS roles | Update artikel |
| 32 | DELETE | `/cms/articles/{id}` | JWT | CMS roles | Hapus artikel (draft only) |
| 33 | PATCH | `/cms/articles/{id}/status` | JWT | CMS roles | Ubah status artikel |
| 34 | POST | `/cms/articles/{id}/lock` | JWT | Editor/Admin | Kunci artikel |
| 35 | POST | `/cms/articles/{id}/unlock` | JWT | Editor/Admin | Buka kunci artikel |
| 36 | GET | `/cms/comments` | JWT | Editor/Admin | Komentar moderasi |
| 37 | GET | `/cms/statistics` | JWT | CMS roles | Dashboard statistics |
| 38 | GET | `/cms/categories` | JWT | CMS roles | List kategori CMS |
| 39 | POST | `/cms/categories` | JWT | Admin | Buat kategori |
| 40 | PUT | `/cms/categories/{id}` | JWT | Admin | Update kategori |
| 41 | DELETE | `/cms/categories/{id}` | JWT | Admin | Hapus kategori |
| 42 | GET | `/cms/tags` | JWT | CMS roles | List tag CMS |
| 43 | POST | `/cms/tags` | JWT | Admin | Buat tag |
| 44 | PUT | `/cms/tags/{id}` | JWT | Admin | Update tag |
| 45 | DELETE | `/cms/tags/{id}` | JWT | Admin | Hapus tag |
| 46 | GET | `/users` | JWT+admin | Admin | List semua user |
| 47 | POST | `/users` | JWT+admin | Admin | Buat user baru |
| 48 | GET | `/users/{id}` | JWT+admin | Admin | Detail user |
| 49 | PATCH | `/users/{id}` | JWT+admin | Admin | Update user |
| 50 | DELETE | `/users/{id}` | JWT+admin | Admin | Hapus user |

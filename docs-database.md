# 🗄️ Ringkasan Tabel Database — klojen.com

> Proyek ini menggunakan **Laravel** dengan **MySQL** (atau SQLite untuk development).  
> Semua tabel didefinisikan via file **migrations** di `backend/database/migrations/`.

---

## Daftar Tabel

| No | Nama Tabel                | Fungsi Singkat                                      |
|----|---------------------------|-----------------------------------------------------|
| 1  | `users`                   | Data pengguna (admin, editor, journalist, reader)   |
| 2  | `password_reset_tokens`   | Token untuk reset password                          |
| 3  | `sessions`                | Sesi login pengguna                                 |
| 4  | `personal_access_tokens`  | Token Sanctum untuk API authentication              |
| 5  | `categories`              | Kategori artikel (mendukung hierarki/parent-child)  |
| 6  | `tags`                    | Tag/label artikel                                   |
| 7  | `articles`                | Artikel utama (konten berita)                       |
| 8  | `article_tags`            | Relasi many-to-many artikel ↔ tag                   |
| 9  | `comments`                | Komentar pada artikel (mendukung reply/thread)      |
| 10 | `media`                   | File media (gambar, video, audio) untuk artikel     |
| 11 | `bookmarks`               | Artikel yang di-bookmark oleh user                  |
| 12 | `refresh_tokens`          | Token refresh untuk autentikasi JWT                 |
| 13 | `article_revisions`       | Riwayat revisi/histori perubahan artikel            |
| 14 | `scheduled_articles`      | Jadwal penerbitan artikel otomatis                  |
| 15 | `search_indexes`          | Indeks pencarian fulltext untuk artikel             |
| 16 | `comment_rate_limits`     | Pembatasan frekuensi komentar per user              |
| 17 | `page_views`              | Statistik kunjungan halaman                         |
| 18 | `cache`                   | Cache Laravel (tabel-based cache driver)            |
| 19 | `jobs`                    | Queue job Laravel                                   |

---

## Detail Tiap Tabel

---

### 1. `users`
> Menyimpan semua data pengguna sistem, termasuk CMS dan portal berita.

| Kolom              | Tipe               | Keterangan                                          |
|--------------------|--------------------|-----------------------------------------------------|
| `id`               | bigint (PK)        | Primary key auto increment                          |
| `name`             | string             | Nama lengkap pengguna                               |
| `email`            | string (unique)    | Email pengguna                                      |
| `role`             | enum               | `admin` / `editor` / `journalist` / `reader`        |
| `is_active`        | boolean            | Status aktif akun (default: `true`)                 |
| `avatar_url`       | string (nullable)  | URL foto profil                                     |
| `bio`              | text (nullable)    | Biografi singkat pengguna                           |
| `email_verified_at`| timestamp (null)   | Waktu verifikasi email                              |
| `password`         | string             | Password ter-hash                                   |
| `remember_token`   | string             | Token "remember me"                                 |
| `created_at`       | timestamp          | —                                                   |
| `updated_at`       | timestamp          | —                                                   |

---

### 2. `password_reset_tokens`
> Token sementara untuk proses reset password.

| Kolom        | Tipe            | Keterangan          |
|--------------|-----------------|---------------------|
| `email`      | string (PK)     | Email pengguna      |
| `token`      | string          | Token reset         |
| `created_at` | timestamp (null)| Waktu dibuat        |

---

### 3. `sessions`
> Sesi login berbasis database (Laravel session driver).

| Kolom           | Tipe              | Keterangan                       |
|-----------------|-------------------|----------------------------------|
| `id`            | string (PK)       | Session ID                       |
| `user_id`       | bigint (null, FK) | Relasi ke `users.id`             |
| `ip_address`    | string(45) (null) | IP address pengguna              |
| `user_agent`    | text (nullable)   | User agent browser               |
| `payload`       | longtext          | Data sesi ter-enkripsi           |
| `last_activity` | integer (index)   | Unix timestamp aktivitas terakhir|

---

### 4. `personal_access_tokens`
> Token API untuk Laravel Sanctum.

| Kolom            | Tipe              | Keterangan                          |
|------------------|-------------------|-------------------------------------|
| `id`             | bigint (PK)       | Primary key auto increment          |
| `tokenable_type` | string            | Morph type (e.g. `App\Models\User`) |
| `tokenable_id`   | bigint            | Morph ID                            |
| `name`           | text              | Nama token                          |
| `token`          | string(64) unique | Hash token                          |
| `abilities`      | text (nullable)   | Abilities/scope token               |
| `last_used_at`   | timestamp (null)  | Terakhir digunakan                  |
| `expires_at`     | timestamp (null)  | Waktu kedaluwarsa                   |
| `created_at`     | timestamp         | —                                   |
| `updated_at`     | timestamp         | —                                   |

---

### 5. `categories`
> Kategori artikel. Mendukung hierarki (parent-child) untuk sub-kategori.

| Kolom       | Tipe             | Keterangan                                       |
|-------------|------------------|--------------------------------------------------|
| `id`        | uuid (PK)        | Primary key UUID                                 |
| `parent_id` | uuid (null, FK)  | Referensi ke `categories.id` (self-referential)  |
| `name`      | string           | Nama kategori                                    |
| `slug`      | string (unique)  | URL-friendly identifier                          |

**Relasi:** `parent_id → categories.id` (nullOnDelete)

---

### 6. `tags`
> Label/tag yang bisa dipasang ke banyak artikel.

| Kolom  | Tipe            | Keterangan         |
|--------|-----------------|--------------------|
| `id`   | uuid (PK)       | Primary key UUID   |
| `name` | string (unique) | Nama tag           |
| `slug` | string (unique) | URL-friendly slug  |

---

### 7. `articles`
> Tabel utama konten berita/artikel. Kolom paling kompleks di sistem ini.

| Kolom               | Tipe               | Keterangan                                                |
|---------------------|--------------------|-----------------------------------------------------------|
| `id`                | uuid (PK)          | Primary key UUID                                          |
| `author_id`         | bigint (FK)        | Penulis → `users.id` (cascadeOnDelete)                    |
| `published_by`      | bigint (null, FK)  | Yang mempublikasikan → `users.id` (nullOnDelete)          |
| `locked_by`         | bigint (null, FK)  | Sedang diedit oleh → `users.id` (nullOnDelete)            |
| `category_id`       | uuid (null, FK)    | Kategori → `categories.id` (restrictOnDelete)             |
| `title`             | string             | Judul artikel                                             |
| `slug`              | string (unique)    | URL-friendly slug                                         |
| `excerpt`           | text (nullable)    | Ringkasan singkat                                         |
| `content`           | longtext           | Isi artikel (HTML/Markdown)                               |
| `featured_image_url`| string (nullable)  | URL gambar utama                                          |
| `status`            | enum               | `draft` / `review` / `scheduled` / `published` / `archived` |
| `is_featured`       | boolean            | Apakah artikel unggulan (default: `false`)                |
| `view_count`        | unsignedBigInteger | Jumlah tampilan (default: `0`)                            |
| `published_at`      | timestamp (null)   | Waktu dipublikasikan                                      |
| `created_at`        | timestamp          | —                                                         |
| `updated_at`        | timestamp          | —                                                         |

**Index:** `status`, `is_featured`, `view_count`, `published_at`

---

### 8. `article_tags`
> Tabel pivot many-to-many antara `articles` dan `tags`.

| Kolom        | Tipe      | Keterangan                                    |
|--------------|-----------|-----------------------------------------------|
| `article_id` | uuid (FK) | Referensi ke `articles.id` (cascadeOnDelete)  |
| `tag_id`     | uuid (FK) | Referensi ke `tags.id` (cascadeOnDelete)      |

**Primary Key:** Composite `(article_id, tag_id)`

---

### 9. `comments`
> Komentar pada artikel. Mendukung threading (reply ke komentar lain).

| Kolom        | Tipe              | Keterangan                                           |
|--------------|-------------------|------------------------------------------------------|
| `id`         | uuid (PK)         | Primary key UUID                                     |
| `article_id` | uuid (FK)         | Artikel yang dikomentari → `articles.id` (cascade)   |
| `user_id`    | bigint (FK)       | Pengguna yang berkomentar → `users.id` (cascade)     |
| `parent_id`  | uuid (null, FK)   | Komentar induk untuk thread → `comments.id` (null)   |
| `content`    | text              | Isi komentar                                         |
| `status`     | enum              | `pending` / `approved` / `rejected` (default: pending)|
| `created_at` | timestamp         | Waktu komentar dibuat                                |

**Index:** `(article_id, status)`

---

### 10. `media`
> File media (gambar, video, audio) yang bisa dikaitkan ke artikel atau menjadi library mandiri.

| Kolom           | Tipe              | Keterangan                                              |
|-----------------|-------------------|---------------------------------------------------------|
| `id`            | uuid (PK)         | Primary key UUID                                        |
| `article_id`    | uuid (null, FK)   | Artikel terkait → `articles.id` (nullOnDelete)          |
| `uploaded_by`   | bigint (null, FK) | Pengunggah → `users.id` (nullOnDelete)                  |
| `file_url`      | string            | URL file media                                          |
| `media_type`    | enum              | `image` / `video` / `audio`                             |
| `alt_text`      | string (nullable) | Teks alternatif (untuk aksesibilitas)                   |
| `category_name` | string (nullable) | Kategori media (untuk pengelompokan di library)         |
| `is_library`    | boolean           | `true` = masuk ke Media Tersimpan global (default: `false`) |
| `created_at`    | timestamp         | Waktu unggah                                            |

---

### 11. `bookmarks`
> Artikel yang disimpan/di-bookmark oleh pengguna.

| Kolom        | Tipe        | Keterangan                                            |
|--------------|-------------|-------------------------------------------------------|
| `id`         | uuid (PK)   | Primary key UUID                                      |
| `user_id`    | bigint (FK) | Pengguna → `users.id` (cascadeOnDelete)               |
| `article_id` | uuid (FK)   | Artikel → `articles.id` (cascadeOnDelete)             |
| `created_at` | timestamp   | Waktu bookmark dibuat                                 |

**Constraint:** `UNIQUE(user_id, article_id)` — satu user hanya bisa bookmark satu artikel sekali.

---

### 12. `refresh_tokens`
> Token refresh untuk mekanisme autentikasi JWT/Sanctum multi-device.

| Kolom        | Tipe              | Keterangan                                         |
|--------------|-------------------|----------------------------------------------------|
| `id`         | uuid (PK)         | Primary key UUID                                   |
| `user_id`    | bigint (FK)       | Pengguna → `users.id` (cascadeOnDelete)            |
| `token_hash` | string            | Hash dari refresh token                            |
| `device_info`| string (nullable) | Informasi perangkat                                |
| `ip_address` | string(45) (null) | IP address saat login                              |
| `is_revoked` | boolean           | Apakah sudah dicabut (default: `false`)            |
| `expires_at` | timestamp         | Waktu kedaluwarsa token                            |
| `created_at` | timestamp         | Waktu token dibuat                                 |

**Index:** `(user_id, is_revoked)`, `expires_at`

---

### 13. `article_revisions`
> Histori perubahan artikel. Menyimpan snapshot konten setiap kali artikel diedit.

| Kolom              | Tipe        | Keterangan                                          |
|--------------------|-------------|-----------------------------------------------------|
| `id`               | uuid (PK)   | Primary key UUID                                    |
| `article_id`       | uuid (FK)   | Artikel terkait → `articles.id` (cascadeOnDelete)   |
| `edited_by`        | bigint (FK) | Editor → `users.id` (restrictOnDelete)              |
| `title_snapshot`   | string      | Snapshot judul saat revisi                          |
| `content_snapshot` | longtext    | Snapshot isi artikel saat revisi                    |
| `change_note`      | string (null)| Catatan perubahan (opsional)                       |
| `created_at`       | timestamp   | Waktu revisi dibuat                                 |

---

### 14. `scheduled_articles`
> Jadwal penerbitan artikel otomatis pada waktu tertentu.

| Kolom          | Tipe              | Keterangan                                            |
|----------------|-------------------|-------------------------------------------------------|
| `id`           | uuid (PK)         | Primary key UUID                                      |
| `article_id`   | uuid (unique, FK) | Artikel → `articles.id` (cascadeOnDelete)             |
| `scheduled_by` | bigint (FK)       | Yang menjadwalkan → `users.id` (restrictOnDelete)     |
| `scheduled_at` | timestamp         | Waktu terjadwal untuk diterbitkan                     |
| `is_published` | boolean           | Sudah diterbitkan? (default: `false`)                 |
| `created_at`   | timestamp         | Waktu jadwal dibuat                                   |

**Constraint:** `article_id` unique — satu artikel hanya boleh punya satu jadwal aktif.  
**Index:** `(is_published, scheduled_at)`

---

### 15. `search_indexes`
> Indeks pencarian fulltext untuk artikel. Satu artikel → satu indeks.

| Kolom           | Tipe              | Keterangan                                          |
|-----------------|-------------------|-----------------------------------------------------|
| `id`            | uuid (PK)         | Primary key UUID                                    |
| `article_id`    | uuid (unique, FK) | Artikel → `articles.id` (cascadeOnDelete)           |
| `search_vector` | text              | Gabungan judul + konten + tags untuk FULLTEXT search |
| `tags_cache`    | text (nullable)   | Nama-nama tag dalam satu string (cache)             |
| `updated_at`    | timestamp         | Diperbarui otomatis saat ada perubahan              |

---

### 16. `comment_rate_limits`
> Pembatasan kecepatan komentar per pengguna untuk mencegah spam.

| Kolom           | Tipe              | Keterangan                                       |
|-----------------|-------------------|--------------------------------------------------|
| `id`            | uuid (PK)         | Primary key UUID                                 |
| `user_id`       | bigint (unique FK)| Pengguna → `users.id` (cascadeOnDelete)          |
| `comment_count` | unsignedInt       | Jumlah komentar dalam window saat ini (default 0)|
| `window_start`  | timestamp         | Awal periode pembatasan                          |
| `is_blocked`    | boolean           | Apakah user diblokir sementara (default: `false`)|
| `blocked_until` | timestamp (null)  | Sampai kapan user diblokir                       |

**Index:** `(user_id, is_blocked)`

---

### 17. `page_views`
> Statistik kunjungan halaman (analytics sederhana).

| Kolom        | Tipe              | Keterangan                     |
|--------------|-------------------|--------------------------------|
| `id`         | bigint (PK)       | Primary key auto increment     |
| `path`       | string (index)    | URL path yang dikunjungi       |
| `ip_address` | string(45) (null) | IP address pengunjung          |
| `user_agent` | text (nullable)   | Browser/device info            |
| `created_at` | timestamp         | —                              |
| `updated_at` | timestamp         | —                              |

---

## Diagram Relasi (ERD Ringkas)

```
users
  ├── articles (author_id, published_by, locked_by)
  ├── comments (user_id)
  ├── bookmarks (user_id)
  ├── refresh_tokens (user_id)
  ├── article_revisions (edited_by)
  ├── scheduled_articles (scheduled_by)
  ├── comment_rate_limits (user_id)
  └── media (uploaded_by)

articles
  ├── categories (category_id)
  ├── article_tags → tags
  ├── comments
  ├── bookmarks
  ├── media
  ├── article_revisions
  ├── scheduled_articles
  └── search_indexes

categories
  └── categories (parent_id - self-referential)

comments
  └── comments (parent_id - self-referential threading)
```

---

## Statistik

| Kategori                    | Jumlah |
|-----------------------------|--------|
| Total tabel                 | 17     |
| Tabel menggunakan UUID (PK) | 12     |
| Tabel menggunakan bigint (PK)| 5     |
| File migration              | 26     |
| Tabel pivot/relasi          | 1 (`article_tags`) |

---

*Dibuat otomatis dari analisis file migrations — `backend/database/migrations/`*

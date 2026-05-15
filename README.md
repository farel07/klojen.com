# klojen.com

Platform portal berita digital modern yang mendukung proses publikasi artikel, manajemen konten redaksi, moderasi komentar, serta interaksi pembaca secara real-time.

---

## 📌 Deskripsi Sistem

**klojen.com** merupakan sistem manajemen portal berita berbasis web yang dirancang untuk mendukung seluruh alur kerja tim redaksi, mulai dari penulisan artikel, proses editorial, hingga publikasi kepada pembaca secara real-time.

Sistem menyediakan berbagai fitur utama seperti:

- 🌐 Portal publik untuk pembaca
- 🛠️ Dashboard CMS untuk admin, editor, dan jurnalis
- 🏷️ Sistem kategori & tag
- 💬 Komentar bersarang (*threaded comments*)
- 🔖 Bookmark artikel
- 🖼️ Upload media
- 🔐 Role-based access control

---

# ✨ Fitur Utama

## 📰 Manajemen Artikel

- Create, update, delete artikel
- Status artikel:
  - Draft
  - Review
  - Published
  - Archived
- Featured article
- Scheduled publishing

---

## 👥 Role & Permission

Sistem memiliki 4 role utama:

| Role | Akses |
|---|---|
| Admin | Mengelola seluruh sistem |
| Editor | Review & publish artikel |
| Journalist | Menulis artikel |
| Reader | Membaca & berkomentar |

---

## 🗂️ Kategori & Tag

- Kategori bersarang (*nested category*)
- Sistem tag fleksibel
- URL SEO-friendly menggunakan slug

---

## 💬 Komentar

- Komentar artikel
- Moderasi komentar
- Reply komentar (*threaded comments*)

---

## 🔖 Bookmark

- Simpan artikel favorit
- Riwayat artikel tersimpan

---

## 🖼️ Media Management

- Upload gambar, video, dan audio
- Integrasi cloud storage
- Alt text untuk SEO & accessibility

---

# 🏗️ Arsitektur Sistem

## 🎨 Frontend

Portal publik dan dashboard CMS dibangun menggunakan:

- Next.js
- Tailwind CSS

---

## ⚙️ Backend

REST API digunakan untuk menangani seluruh proses bisnis sistem.

### Teknologi yang digunakan:

- Laravel
- JWT Authentication

---

## 🗄️ Database

Menggunakan relational database:

- MySQL

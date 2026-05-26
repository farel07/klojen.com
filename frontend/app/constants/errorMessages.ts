// constants/errorMessages.ts

export const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: 'Email sudah terdaftar, gunakan email lain',
  INVALID_CREDENTIALS: 'Email atau password salah',
  TOKEN_EXPIRED: 'Sesi telah berakhir, silakan login ulang',
  TOKEN_REVOKED: 'Sesi tidak valid, silakan login ulang',
  ACCOUNT_INACTIVE: 'Akun Anda telah dinonaktifkan, hubungi admin',
  FORBIDDEN: 'Anda tidak memiliki akses untuk aksi ini',
  ARTICLE_NOT_FOUND: 'Artikel tidak ditemukan',
  SLUG_ALREADY_EXISTS: 'Judul artikel sudah digunakan, coba judul lain',
  INVALID_STATUS_TRANSITION: 'Perubahan status ini tidak diizinkan',
  SCHEDULED_TIME_TOO_SOON: 'Waktu tayang minimal 5 menit dari sekarang',
  COMMENT_TOO_SHORT: 'Komentar minimal 3 karakter',
  COMMENT_TOO_LONG: 'Komentar maksimal 1000 karakter',
  COMMENT_RATE_LIMIT: 'Terlalu banyak komentar, coba lagi nanti',
  MAX_REPLY_DEPTH: 'Tidak bisa membalas komentar lebih dari 2 level',
  INVALID_FILE_TYPE: 'Format file tidak didukung (PNG, JPG, JPEG)',
  FILE_TOO_LARGE: 'Ukuran file maksimal 2 MB',
  NO_FILE_UPLOADED: 'Pilih file terlebih dahulu',
  CANNOT_MODIFY_SELF: 'Tidak bisa mengubah akun sendiri',
  USER_NOT_FOUND: 'Pengguna tidak ditemukan',
  INTERNAL_SERVER_ERROR: 'Terjadi kesalahan pada server, coba lagi',
};

export const getErrorMessage = (errorCode: string): string =>
  ERROR_MESSAGES[errorCode] ?? 'Terjadi kesalahan, coba lagi';

// lib/api/media.ts
import axiosInstance from '@/lib/axios';
import { ApiSuccess } from '@/app/types';

export interface MediaItem {
  id: string;
  article_id: string | null;
  uploaded_by: number | null;
  uploader_name: string | null;
  file_url: string;
  media_type: 'image';
  alt_text: string | null;
  category_name: string | null;
  article_title: string | null;
  created_at: string;
}

/**
 * GET /api/media
 * Ambil semua media (semua user yang login bisa lihat semua media)
 */
export const getMyMedia = () =>
  axiosInstance.get<ApiSuccess<MediaItem[]>>('/media');

/**
 * POST /api/media/upload
 * Upload gambar. article_id sekarang opsional.
 *
 * @param file          File gambar (PNG/JPG/JPEG, maks 5MB)
 * @param articleId     UUID artikel terkait (opsional)
 * @param altText       Teks alternatif / keterangan gambar (opsional)
 * @param categoryName  Kategori media (opsional)
 */
export const uploadMedia = (
  file: File | FormData,
  articleId?: string,
  altText?: string,
  categoryName?: string,
  isLibrary: boolean = false,
) => {
  let formData: FormData;
  if (file instanceof FormData) {
    formData = file;
  } else {
    formData = new FormData();
    formData.append('image', file);
    if (articleId) formData.append('article_id', articleId);
    if (altText) formData.append('alt_text', altText);
    if (categoryName) formData.append('category_name', categoryName);
    if (isLibrary) formData.append('is_library', '1');
  }

  return axiosInstance.post<ApiSuccess<MediaItem>>('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * DELETE /api/media/{id}
 * Hapus media berdasarkan ID
 */
export const deleteMedia = (id: string) =>
  axiosInstance.delete<ApiSuccess<null>>(`/media/${id}`);

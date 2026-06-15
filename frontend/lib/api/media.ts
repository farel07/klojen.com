// lib/api/media.ts
import axiosInstance from '@/lib/axios';
import { ApiSuccess } from '@/app/types';

export interface MediaItem {
  id: string;
  article_id: string;
  file_url: string;
  media_type: 'image';
  alt_text: string | null;
  created_at: string;
}

/**
 * POST /api/media/upload
 * Upload gambar. Butuh article_id yang valid.
 *
 * @param file       File gambar (PNG/JPG/JPEG, maks 2MB)
 * @param articleId  UUID artikel yang sudah ada di DB
 * @param altText    Teks alternatif / keterangan gambar (opsional)
 */
export const uploadMedia = (file: File, articleId: string, altText?: string) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('article_id', articleId);
  if (altText) formData.append('alt_text', altText);

  return axiosInstance.post<ApiSuccess<MediaItem>>('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// lib/api/tags.ts
import axiosInstance from '@/lib/axios';
import { Tag } from '@/app/types';

interface TagsResponse {
  status: string;
  data: Tag[];
}

/**
 * GET /api/tags
 * Ambil semua tag.
 * Response: { status: "success", data: Tag[] }
 */
export const getTags = () =>
  axiosInstance.get<TagsResponse>('/tags');

export const deleteTag = (id: string) => axiosInstance.delete(`/tags/${id}`);

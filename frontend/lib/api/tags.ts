// lib/api/tags.ts
import axiosInstance from '@/lib/axios';

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagsResponse {
  status: string;
  data: Tag[];
}

export const getTags = () => axiosInstance.get<TagsResponse>('/tags');

export const deleteTag = (id: string) => axiosInstance.delete(`/tags/${id}`);

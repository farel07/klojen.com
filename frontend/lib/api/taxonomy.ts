import axiosInstance from '@/lib/axios';
import { ApiSuccess } from '@/app/types';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  children_count?: number;
}

export interface TagItem {
  id: string;
  name: string;
  slug: string;
}

// ── Categories ────────────────────────────────────────────────────────────

export const getCmsCategories = () =>
  axiosInstance.get<ApiSuccess<CategoryItem[]>>('/cms/categories');

export const createCmsCategory = (data: { name: string; parent_id?: string | null }) =>
  axiosInstance.post<ApiSuccess<CategoryItem>>('/cms/categories', data);

export const updateCmsCategory = (id: string, data: { name: string; parent_id?: string | null }) =>
  axiosInstance.put<ApiSuccess<CategoryItem>>(`/cms/categories/${id}`, data);

export const deleteCmsCategory = (id: string) =>
  axiosInstance.delete<ApiSuccess<null>>(`/cms/categories/${id}`);

// ── Tags ──────────────────────────────────────────────────────────────────

export const getCmsTags = () =>
  axiosInstance.get<ApiSuccess<TagItem[]>>('/cms/tags');

export const createCmsTag = (data: { name: string }) =>
  axiosInstance.post<ApiSuccess<TagItem>>('/cms/tags', data);

export const updateCmsTag = (id: string, data: { name: string }) =>
  axiosInstance.put<ApiSuccess<TagItem>>(`/cms/tags/${id}`, data);

export const deleteCmsTag = (id: string) =>
  axiosInstance.delete<ApiSuccess<null>>(`/cms/tags/${id}`);

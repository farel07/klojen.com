// lib/api/categories.ts
import axiosInstance from '@/lib/axios';
import { Category } from '@/app/types';

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

interface CategoriesResponse {
  status: string;
  data: CategoryWithChildren[];
}

/**
 * GET /api/categories
 * Ambil semua kategori beserta sub-kategorinya.
 * Response: { status: "success", data: CategoryWithChildren[] }
 */
export const getCategories = () =>
  axiosInstance.get<CategoriesResponse>('/categories');

export const deleteCategory = (id: string) =>
  axiosInstance.delete(`/categories/${id}`);

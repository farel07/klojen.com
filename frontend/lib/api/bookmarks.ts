// lib/api/bookmarks.ts
import axiosInstance from '@/lib/axios';
import { ApiSuccess, Bookmark } from '@/app/types';

export const getBookmarks = () =>
  axiosInstance.get<ApiSuccess<{ bookmarks: Bookmark[] }>>('/bookmarks');

export const toggleBookmark = (articleId: string) =>
  axiosInstance.post<ApiSuccess<{ bookmarked: boolean }>>('/bookmarks', { article_id: articleId });

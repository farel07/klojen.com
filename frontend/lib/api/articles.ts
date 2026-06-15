// lib/api/articles.ts
import axiosInstance from '@/lib/axios';
import { ApiSuccess, Article, Comment, ArticleStatus, Pagination } from '@/app/types';

// ── ARTIKEL ─────────────────────────────────────────────────────────────────

export const getArticles = (params?: {
  status?: ArticleStatus;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}) =>
  axiosInstance.get<ApiSuccess<{ articles: Article[]; pagination: Pagination }>>(
    '/articles',
    { params },
  );

export const getCmsArticles = () =>
  axiosInstance.get<ApiSuccess<Article[]>>('/cms/articles');

export const getCmsArticleById = (id: string) =>
  axiosInstance.get<ApiSuccess<Article>>(`/cms/articles/${id}`);

export const getArticleBySlug = (slug: string) =>
  axiosInstance.get<ApiSuccess<Article>>(`/articles/${slug}`);

export const createArticle = (data: {
  title: string;
  content: string;
  category_id: string;
  tags?: string[];
  featured_image_url?: string;
}) =>
  axiosInstance.post<ApiSuccess<{ id: string; slug: string; status: ArticleStatus }>>(
    '/cms/articles',
    data,
  );

export const updateArticleStatus = (
  id: string,
  data: {
    status: ArticleStatus;
    scheduled_at?: string;
    change_note?: string;
  },
) =>
  axiosInstance.patch<
    ApiSuccess<{ id: string; status: ArticleStatus; published_at?: string }>
  >(`/cms/articles/${id}/status`, data);

export const updateArticle = (
  id: string,
  data: {
    title?: string;
    content?: string;
    category_id?: string;
    tags?: string[];
    featured_image_url?: string;
  }
) =>
  axiosInstance.put<ApiSuccess<Article>>(`/cms/articles/${id}`, data);

export const deleteArticle = (id: string) =>
  axiosInstance.delete<ApiSuccess<null>>(`/cms/articles/${id}`);

export const lockArticle = (id: string) =>
  axiosInstance.post<ApiSuccess<null>>(`/cms/articles/${id}/lock`);

export const unlockArticle = (id: string) =>
  axiosInstance.post<ApiSuccess<null>>(`/cms/articles/${id}/unlock`);

// ── KOMENTAR ─────────────────────────────────────────────────────────────────

export const getComments = (articleId: string) =>
  axiosInstance.get<ApiSuccess<{ comments: Comment[] }>>(`/articles/${articleId}/comments`);

export const postComment = (
  articleId: string,
  data: { content: string; parent_id?: string | null },
) =>
  axiosInstance.post<ApiSuccess<Comment>>(`/articles/${articleId}/comments`, data);

export const deleteComment = (commentId: string) =>
  axiosInstance.delete<ApiSuccess<null>>(`/comments/${commentId}`);

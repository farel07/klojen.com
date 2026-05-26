// types/index.ts

export type Role = 'reader' | 'journalist' | 'editor' | 'admin';
export type ArticleStatus =
  | 'draft'
  | 'review'
  | 'scheduled'
  | 'published'
  | 'archived';
export type MediaType = 'image';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Media {
  id: string;
  file_url: string;
  media_type: MediaType;
  alt_text: string | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image_url: string | null;
  status: ArticleStatus;
  is_featured: boolean;
  view_count: number;
  category: Category;
  tags: Tag[];
  author: Pick<User, 'id' | 'name'>;
  media: Media[];
  published_at: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  user: Pick<User, 'id' | 'name'>;
  parent_id: string | null;
  replies: Comment[];
  created_at: string;
}

export interface Bookmark {
  id: string;
  article: Pick<Article, 'id' | 'title' | 'slug' | 'featured_image_url'>;
  created_at: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiSuccess<T> {
  status: 'success';
  data: T;
}

export interface ApiError {
  status: 'error';
  code: number;
  error: string;
  message: string;
  field?: string;
}

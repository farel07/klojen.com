// lib/api/auth.ts
import axiosInstance from '@/lib/axios';
import { ApiSuccess } from '@/app/types';

export const forgotPassword = (email: string) =>
  axiosInstance.post<ApiSuccess<null>>('/auth/forgot-password', { email });

export const resetPassword = (data: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) => axiosInstance.post<ApiSuccess<null>>('/auth/reset-password', data);

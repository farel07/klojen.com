// lib/axios.ts
import axios from 'axios';
import { getAccessToken, setAccessToken, logoutStore } from '@/stores/authStore';
import { getRefreshToken, saveRefreshToken, clearRefreshToken } from '@/lib/auth';
import { ApiSuccess } from '@/app/types';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — sisipkan access token
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — silent refresh saat TOKEN_EXPIRED
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.data?.error === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;
      try {
        const res = await axiosInstance.post<ApiSuccess<{ access_token: string; refresh_token: string }>>(
          '/auth/refresh',
          { refresh_token: getRefreshToken() },
        );
        const newToken = res.data.data.access_token;
        const newRefresh = res.data.data.refresh_token;

        setAccessToken(newToken);
        if (newRefresh) saveRefreshToken(newRefresh);

        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(original);
      } catch {
        logoutStore();
        clearRefreshToken();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

import axiosInstance from '@/lib/axios';
import { ApiSuccess } from '@/app/types';

export const uploadMedia = (data: FormData) =>
  axiosInstance.post<ApiSuccess<{ id: string; file_url: string }>>('/media/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

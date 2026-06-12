// lib/validations.ts
import { z } from 'zod';

// Login
export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Register
export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// Artikel
export const articleSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(255, 'Judul maksimal 255 karakter'),
  content: z.string().min(1, 'Konten tidak boleh kosong'),
  category_id: z.string().uuid('Pilih kategori'),
  tags: z.array(z.string().uuid()).optional(),
  featured_image_url: z.string().url().optional().or(z.literal('')),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;

// Jadwal tayang
export const scheduleSchema = z.object({
  scheduled_at: z.string().refine((val) => {
    const diff = new Date(val).getTime() - Date.now();
    return diff >= 5 * 60 * 1000;
  }, 'Waktu tayang minimal 5 menit dari sekarang'),
});

// Komentar
export const commentSchema = z.object({
  content: z
    .string()
    .min(3, 'Komentar minimal 3 karakter')
    .max(1000, 'Komentar maksimal 1000 karakter'),
  parent_id: z.string().uuid().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  role: z.enum(['journalist', 'editor'], {
    message: 'Pilih role yang valid',
  }),
});

// Profile Update Schema
export const profileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Change Password Schema
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Password saat ini wajib diisi'),
    new_password: z.string().min(8, 'Password baru minimal 8 karakter'),
    new_password_confirmation: z.string().min(1, 'Konfirmasi password baru wajib diisi'),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: 'Konfirmasi password tidak cocok',
    path: ['new_password_confirmation'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password minimal 8 karakter'),
    password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi password tidak cocok',
    path: ['password_confirmation'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';

import { registerSchema, RegisterFormValues } from '@/lib/validations';
import { getErrorMessage } from '@/app/constants/errorMessages';
import { ApiError } from '@/app/types';
import axiosInstance from '@/lib/axios';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await axiosInstance.post('/auth/register', values);

      // Setelah sukses daftar, arahkan ke halaman login
      router.push('/login');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const backendMessage = axiosErr.response?.data?.message;
      const errorCode = axiosErr.response?.data?.error ?? 'INTERNAL_SERVER_ERROR';
      const message = backendMessage || getErrorMessage(errorCode);

      setError('root', { message });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[linear-gradient(to_bottom,#0F172A_30%,#FFFFFF_100%)] p-4 sm:p-8 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-[1100px] bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px]">

        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-10">Sign Up</h2>

          <form className="w-full max-w-md mx-auto" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Root error (dari API) */}
            {errors.root && (
              <div className="mb-6 bg-red-50 text-red-500 text-sm p-4 rounded-xl border border-red-100">
                {errors.root.message}
              </div>
            )}

            {/* Nama */}
            <div className="mb-5">
              <label htmlFor="name" className="block text-gray-900 font-semibold mb-2">Nama</label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className={`w-full bg-white rounded-2xl shadow-sm border px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow text-gray-900 ${
                  errors.name ? 'border-red-400' : 'border-gray-100'
                }`}
                placeholder="Masukkan nama Anda"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-gray-900 font-semibold mb-2">Email</label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className={`w-full bg-white rounded-2xl shadow-sm border px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow text-gray-900 ${
                  errors.email ? 'border-red-400' : 'border-gray-100'
                }`}
                placeholder="Masukkan email Anda"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-8">
              <label htmlFor="password" className="block text-gray-900 font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password')}
                  className={`w-full bg-white rounded-2xl shadow-sm border px-5 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow text-gray-900 ${
                    errors.password ? 'border-red-400' : 'border-gray-100'
                  }`}
                  placeholder="Buat password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-center mb-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`text-white rounded-full py-4 px-14 font-bold transition-colors shadow-md w-full sm:w-auto ${
                  isSubmitting ? 'bg-slate-600 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isSubmitting ? 'Memproses...' : 'Daftar'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                Sudah punya akun?{' '}
                <Link href="/login" className="font-bold text-gray-900 hover:text-blue-600 hover:underline transition-colors">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Visual Kanan */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12">
          <img src="/images/login.jpg" alt="Background" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 flex justify-end">
            <span className="text-white text-3xl font-bold tracking-wider drop-shadow-md">
              Klojen.com
            </span>
          </div>
          <div className="relative z-10 flex justify-end mt-auto">
            <h1 className="text-white text-4xl lg:text-5xl font-bold text-right leading-tight max-w-md drop-shadow-lg">
              Mulai Langkahmu Bersama Kami
            </h1>
          </div>
        </div>

      </div>
    </section>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';

import { forgotPasswordSchema, ForgotPasswordFormValues } from '@/lib/validations';
import { forgotPassword } from '@/lib/api/auth';
import { ApiError } from '@/app/types';

export default function LupaPassword() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(values.email);
      setSubmitted(true);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const message =
        axiosErr.response?.data?.message ||
        'Terjadi kesalahan. Silakan coba lagi.';
      setError('root', { message });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-900 p-4 sm:p-8 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-[1100px] bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px]">

        {/* Form Kiri */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">

          {submitted ? (
            /* ── State Sukses ──────────────────────────────── */
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Cek Inbox Anda!</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Jika email Anda terdaftar, kami telah mengirimkan link reset password.
                Periksa folder <strong>Inbox</strong> atau <strong>Spam</strong> Anda.
              </p>
              <Link
                href="/login"
                className="inline-block text-slate-900 font-semibold text-sm hover:underline transition-colors"
              >
                ← Kembali ke Login
              </Link>
            </div>
          ) : (
            /* ── Form ─────────────────────────────────────── */
            <>
              {/* Back link */}
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8 self-start"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Login
              </Link>

              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl mb-4">
                  <svg className="w-7 h-7 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Lupa Password?</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
                </p>
              </div>

              <form className="w-full max-w-md" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Root error */}
                {errors.root && (
                  <div className="mb-6 bg-red-50 text-red-500 text-sm p-4 rounded-xl border border-red-100">
                    {errors.root.message}
                  </div>
                )}

                {/* Email */}
                <div className="mb-8">
                  <label htmlFor="email" className="block text-gray-900 font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className={`w-full bg-white rounded-2xl shadow-sm border px-5 py-4 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow text-gray-900 ${
                      errors.email ? 'border-red-400' : 'border-gray-100'
                    }`}
                    placeholder="Masukkan email Anda"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  id="btn-kirim-reset"
                  disabled={isSubmitting}
                  className={`w-full text-white rounded-full py-4 px-14 font-bold transition-colors shadow-md ${
                    isSubmitting
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Visual Kanan */}
        <div className="hidden md:flex md:w-1/2 relative bg-slate-950 flex-col justify-between p-12">
          <div className="relative z-10 flex justify-end">
            <span className="text-white text-2xl font-bold tracking-wider">
              Klojen<span className="text-blue-500">.</span>
            </span>
          </div>
          <div className="relative z-10 flex flex-col justify-end mt-auto gap-4">
            {/* Dekorasi ikon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-blue-300 text-sm font-medium">Link berlaku selama 60 menit</p>
            </div>
            <h1 className="text-white text-4xl lg:text-5xl font-bold text-right leading-tight max-w-md">
              Temukan Cerita di Setiap Sudut Malang
            </h1>
          </div>
        </div>

      </div>
    </section>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';

import { resetPasswordSchema, ResetPasswordFormValues } from '@/lib/validations';
import { resetPassword } from '@/lib/api/auth';
import { ApiError } from '@/app/types';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Countdown redirect setelah sukses
  useEffect(() => {
    if (!success) return;
    if (countdown === 0) {
      router.push('/login');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [success, countdown, router]);

  // Jika tidak ada token/email di URL
  if (!token || !email) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Link Tidak Valid</h2>
        <p className="text-gray-500 text-sm mb-8">
          Link reset password tidak valid atau sudah kedaluwarsa.
        </p>
        <Link
          href="/lupa-password"
          className="inline-block bg-slate-900 text-white rounded-full py-3 px-8 font-bold hover:bg-slate-800 transition-colors"
        >
          Minta Link Baru
        </Link>
      </div>
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await resetPassword({
        email,
        token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      setSuccess(true);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const message =
        axiosErr.response?.data?.message ||
        'Terjadi kesalahan. Silakan coba lagi.';
      setError('root', { message });
    }
  };

  return (
    <>
      {success ? (
        /* ── State Sukses ──────────────────────────────── */
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Password Berhasil Direset!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            Password Anda telah berhasil diperbarui.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Mengalihkan ke halaman login dalam{' '}
            <span className="font-bold text-slate-700">{countdown}</span> detik...
          </p>
          <Link
            href="/login"
            className="inline-block bg-slate-900 text-white rounded-full py-3 px-8 font-bold hover:bg-slate-800 transition-colors"
          >
            Login Sekarang
          </Link>
        </div>
      ) : (
        /* ── Form Reset Password ───────────────────────── */
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Buat Password Baru</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Untuk akun <span className="font-medium text-slate-700">{email}</span>
            </p>
          </div>

          <form className="w-full max-w-md" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Root error */}
            {errors.root && (
              <div className="mb-6 bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.root.message}
              </div>
            )}

            {/* Password Baru */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-900 font-semibold mb-2">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password')}
                  className={`w-full bg-white rounded-2xl shadow-sm border px-5 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow text-gray-900 ${
                    errors.password ? 'border-red-400' : 'border-gray-100'
                  }`}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div className="mb-10">
              <label htmlFor="password_confirmation" className="block text-gray-900 font-semibold mb-2">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="password_confirmation"
                  {...register('password_confirmation')}
                  className={`w-full bg-white rounded-2xl shadow-sm border px-5 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow text-gray-900 ${
                    errors.password_confirmation ? 'border-red-400' : 'border-gray-100'
                  }`}
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showConfirm ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="mt-1.5 text-sm text-red-500">{errors.password_confirmation.message}</p>
              )}
            </div>

            <button
              type="submit"
              id="btn-reset-password"
              disabled={isSubmitting}
              className={`w-full text-white rounded-full py-4 px-14 font-bold transition-colors shadow-md ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {isSubmitting ? 'Memproses...' : 'Reset Password'}
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-900 p-4 sm:p-8 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-[1100px] bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px]">

        {/* Form Kiri */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <Suspense fallback={
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>

        {/* Visual Kanan */}
        <div className="hidden md:flex md:w-1/2 relative bg-slate-950 flex-col justify-between p-12">
          <div className="relative z-10 flex justify-end">
            <span className="text-white text-2xl font-bold tracking-wider">
              Klojen<span className="text-blue-500">.</span>
            </span>
          </div>
          <div className="relative z-10 flex flex-col justify-end mt-auto gap-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-blue-300 text-sm font-medium">Akun Anda aman bersama kami</p>
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

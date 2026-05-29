'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Mail, User, Shield, Info } from 'lucide-react';

export default function PenggunaBaruPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'journalist' | 'editor'>('journalist');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2)
      errs.name = 'Nama minimal 2 karakter';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Format email tidak valid';
    if (!role)
      errs.role = 'Pilih role yang valid';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    router.push('/cms/pengguna');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 pt-2">
        <Link
          href="/cms/pengguna"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white shadow-sm transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Pengguna Baru</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Buat akun untuk jurnalis atau editor baru.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex items-start gap-3">
        <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          Password akan digenerate otomatis dan dikirimkan ke email pengguna setelah akun dibuat.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6 space-y-5">

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <User size={14} className="inline mr-1.5 text-gray-400" />
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            id="pengguna-baru-nama"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
            placeholder="Contoh: Paulenta Sari"
            className={`
              w-full px-4 py-3 rounded-xl border outline-none text-sm text-gray-800
              focus:ring-2 transition-all duration-200
              ${errors.name
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
              }
            `}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Mail size={14} className="inline mr-1.5 text-gray-400" />
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="pengguna-baru-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
            placeholder="contoh@klojen.com"
            className={`
              w-full px-4 py-3 rounded-xl border outline-none text-sm text-gray-800
              focus:ring-2 transition-all duration-200
              ${errors.email
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
              }
            `}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <Shield size={14} className="inline mr-1.5 text-gray-400" />
            Role <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['journalist', 'editor'] as const).map((r) => (
              <button
                key={r}
                type="button"
                id={`role-option-${r}`}
                onClick={() => { setRole(r); setErrors((p) => ({ ...p, role: '' })); }}
                className={`
                  flex flex-col items-start gap-1 px-4 py-4 rounded-xl border-2
                  text-left transition-all duration-200
                  ${role === r
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                  }
                `}
              >
                <span className={`text-sm font-bold ${role === r ? 'text-blue-700' : 'text-gray-700'}`}>
                  {r === 'journalist' ? 'Jurnalis' : 'Editor'}
                </span>
                <span className="text-xs text-gray-400 leading-relaxed">
                  {r === 'journalist'
                    ? 'Menulis & mengajukan artikel untuk review'
                    : 'Mereview, publish, dan mengelola komentar'
                  }
                </span>
              </button>
            ))}
          </div>
          {errors.role && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.role}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/cms/pengguna"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 text-center hover:bg-gray-50 transition-colors"
          >
            Batal
          </Link>
          <button
            id="btn-simpan-pengguna-baru"
            type="submit"
            disabled={isSubmitting}
            className="
              flex-1 flex items-center justify-center gap-2 px-4 py-3
              bg-gradient-to-r from-blue-500 to-blue-700
              text-white text-sm font-semibold rounded-xl shadow-md
              hover:shadow-lg hover:-translate-y-0.5 transition-all
              disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
            "
          >
            <UserPlus size={16} />
            {isSubmitting ? 'Membuat Akun...' : 'Buat Akun'}
          </button>
        </div>
      </form>
    </div>
  );
}

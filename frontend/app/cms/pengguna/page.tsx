'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Role } from '@/app/types';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_USERS = [
  { id: 'u1', name: 'Paulenta Sari', email: 'paulenta@klojen.com', role: 'journalist' as Role, is_active: true, created_at: '10 Jan 2025' },
  { id: 'u2', name: 'Budi Santoso', email: 'budi@klojen.com', role: 'editor' as Role, is_active: true, created_at: '15 Jan 2025' },
  { id: 'u3', name: 'Rina Dewi', email: 'rina@klojen.com', role: 'journalist' as Role, is_active: true, created_at: '20 Feb 2025' },
  { id: 'u4', name: 'Ahmad Fauzi', email: 'ahmad@klojen.com', role: 'journalist' as Role, is_active: false, created_at: '5 Mar 2025' },
  { id: 'u5', name: 'Mega Sari', email: 'mega@klojen.com', role: 'editor' as Role, is_active: true, created_at: '12 Mar 2025' },
];

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  journalist: 'bg-green-100 text-green-700',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  journalist: 'Jurnalis',
};

// ─── Delete Dialog ────────────────────────────────────────────────────────────

function DeleteDialog({
  user,
  onConfirm,
  onCancel,
}: {
  user: (typeof MOCK_USERS)[0];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [inputName, setInputName] = useState('');
  const isMatch = inputName === user.name;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Hapus Pengguna?</h3>
            <p className="text-sm text-gray-400">Aksi ini permanen dan tidak bisa dibatalkan.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Ketik <span className="font-bold text-gray-900">{user.name}</span> untuk konfirmasi:
        </p>
        <input
          id="delete-user-confirm-input"
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Ketik nama pengguna..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none text-sm text-gray-700 mb-4 transition-all"
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            id="btn-confirm-delete-user"
            onClick={onConfirm}
            disabled={!isMatch}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Hapus Pengguna
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PenggunaPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState<(typeof MOCK_USERS)[0] | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u))
    );
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setToDelete(null);
  };

  const isSelf = (userId: string) => currentUser?.id === userId;

  return (
    <>
      {toDelete && (
        <DeleteDialog
          user={toDelete}
          onConfirm={() => handleDelete(toDelete.id)}
          onCancel={() => setToDelete(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {users.length} akun terdaftar di sistem.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5">
              <Shield size={16} className="text-purple-500" />
              <span className="text-sm text-purple-700 font-semibold">Hanya Admin</span>
            </div>
            <Link
              href="/cms/pengguna/baru"
              id="btn-tambah-pengguna"
              className="
                inline-flex items-center gap-2 px-5 py-2.5
                bg-gradient-to-r from-blue-500 to-blue-700
                text-white text-sm font-semibold rounded-xl shadow-md
                hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
              "
            >
              <Plus size={16} />
              Tambah Pengguna
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-5">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="pengguna-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau email pengguna..."
              className="
                w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200
                focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none
                text-sm text-gray-700 placeholder-gray-400 transition-all
              "
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Pengguna
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Role
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">
                    Status
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">
                    Bergabung
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                      Tidak ada pengguna ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const self = isSelf(u.id);
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-blue-50/20 transition-colors duration-150 group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center shrink-0">
                              <span className="text-white text-sm font-bold">
                                {u.name[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                {u.name}
                                {self && (
                                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md font-medium">
                                    Saya
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[u.role] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {ROLE_LABELS[u.role] ?? u.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              u.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                            {u.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-gray-400 text-xs">{u.created_at}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit */}
                            <Link
                              href={`/cms/pengguna/${u.id}`}
                              className="
                                inline-flex items-center gap-1.5 px-3 py-1.5
                                text-xs font-semibold text-blue-600 bg-blue-50
                                rounded-lg hover:bg-blue-100 transition-colors
                              "
                            >
                              <Edit3 size={12} />
                              Edit
                            </Link>

                            {/* Toggle Active */}
                            <button
                              id={`btn-toggle-active-${u.id}`}
                              onClick={() => handleToggleActive(u.id)}
                              disabled={self}
                              title={self ? 'Tidak bisa mengubah akun sendiri' : undefined}
                              className={`
                                inline-flex items-center gap-1.5 px-3 py-1.5
                                text-xs font-semibold rounded-lg transition-colors
                                disabled:opacity-40 disabled:cursor-not-allowed
                                ${u.is_active
                                  ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                                  : 'text-green-600 bg-green-50 hover:bg-green-100'
                                }
                              `}
                            >
                              {u.is_active ? (
                                <><UserX size={12} /> Nonaktifkan</>
                              ) : (
                                <><UserCheck size={12} /> Aktifkan</>
                              )}
                            </button>

                            {/* Delete */}
                            <button
                              id={`btn-delete-user-${u.id}`}
                              onClick={() => setToDelete(u)}
                              disabled={self}
                              title={self ? 'Tidak bisa mengubah akun sendiri' : undefined}
                              className="
                                inline-flex items-center gap-1.5 px-3 py-1.5
                                text-xs font-semibold text-red-500 bg-red-50
                                rounded-lg hover:bg-red-100 transition-colors
                                disabled:opacity-40 disabled:cursor-not-allowed
                              "
                            >
                              <Trash2 size={12} />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
            <span className="text-xs text-gray-400">
              Menampilkan {filtered.length} dari {users.length} pengguna
            </span>
            <div className="flex items-center gap-1">
              <button disabled className="p-2 rounded-lg text-gray-300 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold">1</button>
              <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

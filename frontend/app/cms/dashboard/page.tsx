'use client';

import { useAuthStore } from '@/stores/authStore';
import { canPublish } from '@/app/constants/roles';
import { Role } from '@/app/types';
import Link from 'next/link';
import AdminDashboard from '@/app/components/cms/AdminDashboard';
import {
  FileText,
  Clock,
  LayoutGrid,
  ImageIcon,
  TrendingUp,
  ArrowRight,
  Plus,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MONTHLY_DATA = [
  { month: 'Jan', berita: 8 },
  { month: 'Feb', berita: 12 },
  { month: 'Mar', berita: 9 },
  { month: 'Apr', berita: 15 },
  { month: 'Mei', berita: 18 },
  { month: 'Jun', berita: 22 },
];

const CATEGORY_DATA = [
  { name: 'Wisata', value: 21, color: '#7c3aed' },
  { name: 'Kuliner', value: 21, color: '#2563eb' },
  { name: 'Pendidikan', value: 21, color: '#f59e0b' },
  { name: 'Hotel', value: 21, color: '#10b981' },
];

const RECENT_ARTICLES = [
  {
    id: '1',
    title: 'Festival Kuliner Malang 2025 Resmi Dibuka di Alun-Alun Kota',
    category: 'Kuliner',
    status: 'published' as const,
    date: '29 Mei 2025',
  },
  {
    id: '2',
    title: 'Kampus Brawijaya Luncurkan Program Beasiswa Internasional',
    category: 'Pendidikan',
    status: 'review' as const,
    date: '28 Mei 2025',
  },
  {
    id: '3',
    title: 'Taman Sengkaling Hadirkan Wahana Baru Musim Panas',
    category: 'Wisata',
    status: 'draft' as const,
    date: '27 Mei 2025',
  },
  {
    id: '4',
    title: 'Hotel Bintang Lima Pertama di Malang Siap Beroperasi',
    category: 'Hotel',
    status: 'published' as const,
    date: '26 Mei 2025',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  published: { label: 'Tayang', className: 'bg-green-100 text-green-700' },
  review: { label: 'Review', className: 'bg-yellow-100 text-yellow-700' },
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  scheduled: { label: 'Terjadwal', className: 'bg-blue-100 text-blue-700' },
  archived: { label: 'Arsip', className: 'bg-red-100 text-red-700' },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 cursor-default">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <div className="text-3xl font-bold text-[#2563eb] leading-none mb-1">{value}</div>
        <div className="text-sm font-semibold text-gray-700">{label}</div>
      </div>
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
        <p className="text-lg font-bold text-blue-600">{payload[0].value} Berita</p>
      </div>
    );
  }
  return null;
};

// ─── Sub-views ────────────────────────────────────────────────────────────────

function EditorDashboardView() {
  const { user } = useAuthStore();
  const role = user?.role as Role | undefined;
  const isEditorOrAbove = role ? canPublish(role) : false;

  const totalThisYear = MONTHLY_DATA.reduce((s, d) => s + d.berita, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat datang, {user?.name?.split(' ')[0] ?? 'Jurnalis'} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Ini adalah ringkasan aktivitas redaksi Klojen hari ini.
          </p>
        </div>
        <Link
          href="/cms/artikel/baru"
          id="btn-tulis-berita-dashboard"
          className="
            flex items-center gap-2 px-5 py-2.5
            bg-gradient-to-r from-blue-500 to-blue-700
            text-white text-sm font-semibold rounded-xl shadow-md
            hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
          "
        >
          <Plus size={16} />
          Tulis Berita
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Berita Publish"
          value={31}
          icon={CheckCircle}
          color="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        <StatCard
          label="Draft"
          value={45}
          icon={FileText}
          color="bg-gradient-to-br from-orange-400 to-orange-600"
        />
        <StatCard
          label="Kategori Aktif"
          value={4}
          icon={LayoutGrid}
          color="bg-gradient-to-br from-purple-500 to-purple-700"
        />
        <StatCard
          label="Media Tersimpan"
          value={372}
          icon={ImageIcon}
          color="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar Chart Panel */}
        <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6 md:p-8 lg:col-span-2 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                Statistik Penulisan Berita
              </h2>
              <p className="text-sm text-gray-400 font-medium">
                Lihat perkembangan jumlah berita yang kamu tulis.
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors shrink-0">
              Tahun 2025
              <TrendingUp size={14} />
            </button>
          </div>

          {/* Summary box */}
          <div className="inline-flex mb-6">
            <div className="bg-[#f9f9f9] border border-gray-100 rounded-xl p-4 flex items-center gap-6">
              <div>
                <div className="text-xs text-gray-400 font-medium mb-1">Total berita tahun ini</div>
                <div className="text-4xl font-bold text-[#2563eb] leading-none">{totalThisYear}</div>
              </div>
              <FileText size={32} className="text-blue-200" />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                <Bar
                  dataKey="berita"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insight Banner */}
          <div className="mt-5 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="text-white" />
            </div>
            <p className="text-sm text-white font-medium">
              Jumlah berita bulan ini{' '}
              <span className="font-bold">meningkat 16,7%</span> dibanding bulan lalu.
            </p>
          </div>
        </div>

        {/* Donut Chart Panel */}
        <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6 md:p-8 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Distribusi Kategori Tahun Ini
          </h2>
          <div className="flex-1 flex items-center justify-center min-h-[280px]">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value, entry: any) => (
                    <span className="text-xs text-gray-600 font-medium">
                      {value} {entry.payload.value} (25%)
                    </span>
                  )}
                />
                <Tooltip
                  formatter={(value) => [`${value} Berita`, '']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Center label overlay via absolute won't work inside SVG, shown via legend */}
        </div>
      </div>

      {/* Recent Articles Table */}
      <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Artikel Terbaru</h2>
          <Link
            href="/cms/artikel"
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Lihat semua
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Judul
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">
                  Kategori
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">
                  Tanggal
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT_ARTICLES.map((article) => {
                const st = STATUS_CONFIG[article.status];
                return (
                  <tr
                    key={article.id}
                    className="hover:bg-blue-50/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800 line-clamp-1">
                        {article.title}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-gray-500">{article.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.className}`}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-gray-400 text-xs">{article.date}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/cms/artikel/${article.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-xs hover:underline transition-colors"
                      >
                        Edit
                      </Link>
                      {isEditorOrAbove && article.status === 'review' && (
                        <button className="ml-3 text-green-600 hover:text-green-700 font-medium text-xs hover:underline transition-colors">
                          Publish
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions (Editor+) */}
      {isEditorOrAbove && (
        <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-yellow-500" />
            <h2 className="text-base font-bold text-gray-900">Menunggu Review</h2>
            <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
              2 artikel
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Ada artikel dari jurnalis yang menunggu persetujuan Anda.
          </p>
          <Link
            href="/cms/artikel?status=review"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Tinjau sekarang <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Main Page Router ────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <EditorDashboardView />;
}

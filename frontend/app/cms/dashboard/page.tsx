'use client';

import { useAuthStore } from '@/stores/authStore';
import { canPublish } from '@/app/constants/roles';
import { Role } from '@/app/types';
import Link from 'next/link';
import AdminDashboard from '@/app/components/cms/AdminDashboard';
import axiosInstance from '@/lib/axios';
import { useEffect, useState } from 'react';
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
  ChevronDown,
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
  LabelList,
} from 'recharts';

// ─── Sub-components ───────────────────────────────────────────────────────────

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
  iconColor = "text-blue-500"
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  iconColor?: string;
}) {
  return (
    <div className="bg-white rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 py-6 px-4 flex items-center justify-center gap-5 hover:-translate-y-1 transition-transform duration-300">
      <Icon size={46} className={`${iconColor} shrink-0`} strokeWidth={1.5} />
      <div className="flex flex-col items-center justify-center">
        <div className="text-[44px] font-bold text-blue-600 leading-none tracking-tight mb-1">{value}</div>
        <div className="text-[13px] font-bold text-black">{label}</div>
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

  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [statCards, setStatCards] = useState({
    beritaPublish: 0,
    draft: 0,
    kategoriAktif: 0,
    mediaTersimpan: 0
  });

  useEffect(() => {
    axiosInstance.get('/cms/statistics')
      .then(res => {
        const data = res.data;
        setYearlyData(data.yearlyData || []);
        setCategoryData(data.categoryData || []);
        setStatCards(data.statCards || { beritaPublish: 0, draft: 0, kategoriAktif: 0, mediaTersimpan: 0 });
      })
      .catch(err => {
        console.error('Failed to load stats:', err);
      });
  }, []);

  const totalThisYear = yearlyData.reduce((s, d) => s + d.berita, 0);
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 pt-4">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Berita Publish" value={statCards.beritaPublish} icon={FileText} iconColor="text-blue-500" />
        <StatCard label="Draft" value={statCards.draft} icon={Clock} iconColor="text-orange-500" />
        <StatCard label="Kategori Aktif" value={statCards.kategoriAktif} icon={LayoutGrid} iconColor="text-purple-500" />
        <StatCard label="Media Tersimpan" value={statCards.mediaTersimpan} icon={ImageIcon} iconColor="text-emerald-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar Chart Panel */}
        <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6 md:p-8 lg:col-span-2 flex flex-col border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <h2 className="text-[22px] font-bold text-black mb-1">
                Statistik Penulisan Berita
              </h2>
              <p className="text-[15px] font-bold text-[#b5b5b5]">
                Lihat perkembangan jumlah berita yang kamu tulis.
              </p>
            </div>
            <div className="flex items-center px-4 py-2 bg-white border border-[#cdcdcd] rounded-sm text-sm font-bold text-black shrink-0">
              Tahun {currentYear}
            </div>
          </div>

          {/* Summary box */}
          <div className="inline-flex mb-8">
            <div className="bg-white border border-[#cdcdcd] p-4 flex items-center justify-between gap-10 min-w-[200px]">
              <div>
                <div className="text-[10px] font-bold text-[#868686] mb-1">Total berita tahun ini</div>
                <div className="text-[44px] font-bold text-blue-600 leading-none tracking-tight">{totalThisYear}</div>
              </div>
              <FileText size={28} className="text-blue-600" strokeWidth={2.5} />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex-1 min-h-[260px] relative">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yearlyData} margin={{ top: 25, right: 10, left: -25, bottom: 0 }} barCategoryGap="30%">
                <defs>
                  <linearGradient id="colorBerita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 13, fill: '#64748b', fontWeight: 'bold' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                <Bar
                  dataKey="berita"
                  radius={[6, 6, 0, 0]}
                >
                  {yearlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === yearlyData.length - 1 ? '#2563eb' : 'url(#colorBerita)'} />
                  ))}
                  <LabelList dataKey="berita" position="top" style={{ fill: '#1e3a8a', fontSize: 14, fontWeight: 'bold' }} dy={-10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insight Banner */}
          <div className="mt-8 bg-[#f5f8ff] rounded-xl px-6 py-4 flex items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <p className="text-[15px] text-[#4b5563]">
              Terus tingkatkan produktivitas menulismu di tahun <span className="font-bold text-[#1e3a8a]">{currentYear}</span>!
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
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value, entry: any) => (
                    <span className="text-xs text-gray-600 font-medium">
                      {value} {entry.payload.value}
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

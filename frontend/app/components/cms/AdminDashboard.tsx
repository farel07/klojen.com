'use client';

import { useAuthStore } from '@/stores/authStore';
import {
  FileText,
  Clock,
  User,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Image from 'next/image';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const VISITOR_DATA = [
  { date: '01 Mei', visitors: 3900 },
  { date: '04 Mei', visitors: 5200 },
  { date: '08 Mei', visitors: 6100 },
  { date: '11 Mei', visitors: 5400 },
  { date: '14 Mei', visitors: 5000 },
  { date: '16 Mei', visitors: 6500 },
  { date: '21 Mei', visitors: 8800 },
  { date: '24 Mei', visitors: 7800 },
  { date: '28 Mei', visitors: 5000 },
  { date: '31 Mei', visitors: 5800 },
];

const POPULAR_ARTICLES = [
  {
    id: '1',
    title: 'Tahu Walik Cemilan Khas Malang yang Selalu Dicari',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=100&h=70&fit=crop',
  },
  {
    id: '2',
    title: 'Coban Rais, Wisata Alam dengan Banyak Spot Foto',
    image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=100&h=70&fit=crop',
  },
  {
    id: '3',
    title: 'Grand Mercure Malang Mirama, Hotel Modern di Pusat Kota',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=70&fit=crop',
  },
  {
    id: '4',
    title: 'Sego Sambel Cak Uut Pedesnya nampol!',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=100&h=70&fit=crop',
  },
  {
    id: '5',
    title: 'Pantai 3 Warna Surga Tersembunyi di Malang',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=70&fit=crop',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 border border-gray-100 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Berita</span>
            <div className="w-10 h-10 rounded-xl bg-[#eef5ff] text-blue-500 flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">1.248</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-green-500">
              <TrendingUp size={12} />
              <span>12.5%</span>
              <span className="text-gray-400 font-medium">dari periode sebelumnya</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 border border-gray-100 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Berita Hari ini</span>
            <div className="w-10 h-10 rounded-xl bg-[#eef5ff] text-blue-500 flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">23</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 border border-gray-100 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Draft Berita</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">4</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 border border-gray-100 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna Baru</span>
            <div className="w-10 h-10 rounded-xl bg-[#eef5ff] text-blue-500 flex items-center justify-center">
              <User size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">10</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Visitor Chart */}
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 md:p-8 border border-gray-100 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Grafik Pengunjung</h2>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VISITOR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                  tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value} pengunjung`, 'Total']}
                  labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVisitors)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Articles */}
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 md:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Berita Terpopuler</h2>
          <div className="flex flex-col gap-6">
            {POPULAR_ARTICLES.map((article) => (
              <div key={article.id} className="flex gap-4 items-center group cursor-pointer">
                <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative shadow-sm">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    unoptimized
                  />
                </div>
                <h3 className="font-bold text-xs text-gray-900 leading-snug line-clamp-3 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

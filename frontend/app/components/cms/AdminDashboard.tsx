'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  FileText,
  Users,
  Megaphone,
  TrendingUp,
  Eye,
  UserPlus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const VISITOR_DATA = {
  hari_ini: [
    { date: '00:00', visitors: 120 },
    { date: '04:00', visitors: 80 },
    { date: '08:00', visitors: 1500 },
    { date: '12:00', visitors: 4200 },
    { date: '16:00', visitors: 3800 },
    { date: '20:00', visitors: 2400 },
  ],
  '7_hari': [
    { date: '14 Mei', visitors: 2800 },
    { date: '15 Mei', visitors: 5200 },
    { date: '16 Mei', visitors: 5100 },
    { date: '17 Mei', visitors: 9000 },
    { date: '18 Mei', visitors: 10000 },
    { date: '19 Mei', visitors: 4500 },
    { date: '20 Mei', visitors: 6200 },
  ],
  '30_hari': [
    { date: '01 Mei', visitors: 4000 },
    { date: '05 Mei', visitors: 6200 },
    { date: '10 Mei', visitors: 5100 },
    { date: '15 Mei', visitors: 12000 },
    { date: '20 Mei', visitors: 8000 },
    { date: '25 Mei', visitors: 9500 },
    { date: '30 Mei', visitors: 11000 },
  ]
};

const SPARKLINE_1 = [{ v: 2 }, { v: 3 }, { v: 3.5 }, { v: 5 }, { v: 4 }, { v: 6 }, { v: 8 }];
const SPARKLINE_2 = [{ v: 4 }, { v: 4.5 }, { v: 4 }, { v: 5.5 }, { v: 5 }, { v: 6.5 }, { v: 7 }];
const SPARKLINE_3 = [{ v: 3 }, { v: 2 }, { v: 4 }, { v: 3.5 }, { v: 5 }, { v: 4.5 }, { v: 6 }];
const SPARKLINE_4 = [{ v: 5 }, { v: 4.5 }, { v: 5.5 }, { v: 5 }, { v: 7 }, { v: 6 }, { v: 8 }];

// ─── Component ───────────────────────────────────────────────────────────────

const Sparkline = ({ data, color }: { data: any[], color: string }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} dot={false} isAnimationActive={false} />
    </LineChart>
  </ResponsiveContainer>
);

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [timeFilter, setTimeFilter] = useState<'hari_ini' | '7_hari' | '30_hari'>('7_hari');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filterOptions = {
    hari_ini: 'Hari Ini',
    '7_hari': '7 Hari Terakhir',
    '30_hari': '30 Hari Terakhir'
  };

  return (
    <div className="space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1: Total Berita */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 border border-gray-100 flex flex-col justify-between h-[150px]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] text-blue-600 flex items-center justify-center shrink-0">
              <FileText size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800 mb-0.5">Total Berita</div>
              <div className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">1.248</div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-green-500">12.5%</span>
              <span className="text-gray-500">bulan ini</span>
            </div>
            <div className="w-[80px] h-[30px]">
              <Sparkline data={SPARKLINE_1} color="#3b82f6" />
            </div>
          </div>
        </div>

        {/* Card 2: Total User */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 border border-gray-100 flex flex-col justify-between h-[150px]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ecfdf5] text-emerald-500 flex items-center justify-center shrink-0">
              <Users size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800 mb-0.5">Total User</div>
              <div className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">356</div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div className="text-[11px] font-bold text-gray-500">Pengguna Terdaftar</div>
            <div className="w-[80px] h-[30px]">
              <Sparkline data={SPARKLINE_2} color="#10b981" />
            </div>
          </div>
        </div>

        {/* Card 3: Total Berita Hari ini (User requested) */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 border border-gray-100 flex flex-col justify-between h-[150px]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#fffbeb] text-amber-500 flex items-center justify-center shrink-0">
              <FileText size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800 mb-0.5">Total Berita Hari ini</div>
              <div className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">18</div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div className="text-[11px] font-bold text-gray-500">Artikel</div>
            <div className="w-[80px] h-[30px]">
              <Sparkline data={SPARKLINE_3} color="#f59e0b" />
            </div>
          </div>
        </div>

        {/* Card 4: Iklan Aktif */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 border border-gray-100 flex flex-col justify-between h-[150px]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f5f3ff] text-purple-600 flex items-center justify-center shrink-0">
              <Megaphone size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800 mb-0.5">Iklan Aktif</div>
              <div className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">12</div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div className="text-[11px] font-bold text-gray-500">Penempatan</div>
            <div className="w-[80px] h-[30px]">
              <Sparkline data={SPARKLINE_4} color="#8b5cf6" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Visitor Chart (Left Column) */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 lg:p-8 border border-gray-100 xl:col-span-2">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-lg font-extrabold text-gray-900">Grafik Pengunjung</h2>
            <div className="relative">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-600">{filterOptions[timeFilter]}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-1.5 z-20 overflow-hidden">
                    {Object.entries(filterOptions).map(([key, label]) => (
                      <div
                        key={key}
                        onClick={() => { setTimeFilter(key as any); setIsDropdownOpen(false); }}
                        className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${timeFilter === key ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VISITOR_DATA[timeFilter]} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  dy={15}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value}`, 'Pengunjung']}
                  labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}
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

        {/* Ringkasan Bulan Ini (Right Column) */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 lg:p-8 border border-gray-100 flex flex-col">
          <h2 className="text-lg font-extrabold text-gray-900 mb-6">Ringkasan Bulan Ini</h2>

          <div className="flex flex-col border border-gray-100 rounded-2xl flex-1 justify-around">

            {/* Item 1 */}
            <div className="flex items-center gap-5 p-6 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-[#eff6ff] text-blue-600 flex items-center justify-center shrink-0">
                <Eye size={24} strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">Total Page View</div>
                <div className="text-2xl font-extrabold text-gray-900 leading-none">1.200.000</div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-5 p-6 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-[#ecfdf5] text-emerald-500 flex items-center justify-center shrink-0">
                <FileText size={24} strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">Total Berita Terbit</div>
                <div className="text-2xl font-extrabold text-gray-900 leading-none">132</div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-5 p-6">
              <div className="w-14 h-14 rounded-full bg-[#fffbeb] text-amber-500 flex items-center justify-center shrink-0">
                <UserPlus size={24} strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">User Baru</div>
                <div className="text-2xl font-extrabold text-gray-900 leading-none">34</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

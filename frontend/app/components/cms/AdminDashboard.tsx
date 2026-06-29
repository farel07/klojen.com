'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/lib/axios';
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
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────────────────────

// ─── Initial Mock Data For Types ─────────────────────────────────────────────

const INITIAL_SUMMARY_DATA: Record<string, any> = {
  hari_ini: { pageViews: '0', totalBerita: '0', userBaru: '0' },
  '7_hari': { pageViews: '0', totalBerita: '0', userBaru: '0' },
  '30_hari': { pageViews: '0', totalBerita: '0', userBaru: '0' },
  '1_tahun': { pageViews: '0', totalBerita: '0', userBaru: '0' },
};

const INITIAL_CATEGORY_DATA: Record<string, any[]> = {
  hari_ini: [],
  '7_hari': [],
  '30_hari': [],
  '1_tahun': [],
};

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
  ],
  '1_tahun': [
    { date: 'Jan', visitors: 120000 },
    { date: 'Feb', visitors: 150000 },
    { date: 'Mar', visitors: 130000 },
    { date: 'Apr', visitors: 180000 },
    { date: 'Mei', visitors: 175000 },
    { date: 'Jun', visitors: 190000 },
    { date: 'Jul', visitors: 210000 },
    { date: 'Ags', visitors: 200000 },
    { date: 'Sep', visitors: 230000 },
    { date: 'Okt', visitors: 250000 },
    { date: 'Nov', visitors: 240000 },
    { date: 'Des', visitors: 280000 },
  ]
};

const SPARKLINE_1 = [{ v: 2 }, { v: 3 }, { v: 3.5 }, { v: 5 }, { v: 4 }, { v: 6 }, { v: 8 }];
const SPARKLINE_2 = [{ v: 4 }, { v: 4.5 }, { v: 4 }, { v: 5.5 }, { v: 5 }, { v: 6.5 }, { v: 7 }];
const SPARKLINE_3 = [{ v: 3 }, { v: 2 }, { v: 4 }, { v: 3.5 }, { v: 5 }, { v: 4.5 }, { v: 6 }];

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
  const [timeFilter, setTimeFilter] = useState<'hari_ini' | '7_hari' | '30_hari' | '1_tahun'>('7_hari');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [summaryData, setSummaryData] = useState(INITIAL_SUMMARY_DATA);
  const [categoryData, setCategoryData] = useState(INITIAL_CATEGORY_DATA);
  const [topCards, setTopCards] = useState({
    totalBerita: 0,
    totalUser: 0,
    totalBeritaHariIni: 0,
  });
  const [sparklines, setSparklines] = useState({
    totalBerita: SPARKLINE_1,
    totalUser: SPARKLINE_2,
    beritaHariIni: SPARKLINE_3,
  });
  const [visitorData, setVisitorData] = useState(VISITOR_DATA);

  useEffect(() => {
    axiosInstance.get('/cms/statistics')
      .then(res => {
        const data = res.data;
        if (data.summaryData) setSummaryData(data.summaryData);
        if (data.categoryData) setCategoryData(data.categoryData);
        if (data.topCards) setTopCards(data.topCards);
        if (data.sparklines) setSparklines(data.sparklines);
        if (data.visitorData) setVisitorData(data.visitorData);
      })
      .catch(err => {
        console.error('Failed to load admin stats:', err);
      });
  }, []);

  const filterOptions = {
    hari_ini: 'Hari Ini',
    '7_hari': '7 Hari Terakhir',
    '30_hari': '30 Hari Terakhir',
    '1_tahun': '1 Tahun Terakhir'
  };

  const rawCategoryData = categoryData[timeFilter] || [];
  // Filter item placeholder dari backend (misal: "Belum ada data" dengan value dummy)
  const activeCategoryData = rawCategoryData.filter(
    (item: any) => item.name !== 'Belum ada data' && item.value > 0
  );
  const totalBerita = activeCategoryData.reduce((acc: any, item: any) => acc + item.value, 0);
  const activeSummaryData = summaryData[timeFilter] || INITIAL_SUMMARY_DATA[timeFilter];

  return (
    <div className="space-y-6">

      {/* Header Clean Look */}
      <div className="flex flex-col gap-1.5 mb-8 mt-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Selamat datang kembali! Berikut adalah ringkasan performa portal berita Anda hari ini.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        {/* Card 1: Total Berita */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 border border-gray-100 flex flex-col justify-between h-[150px]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] text-blue-600 flex items-center justify-center shrink-0">
              <FileText size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800 mb-0.5">Total Berita</div>
              <div className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">{topCards.totalBerita}</div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-green-500">12.5%</span>
              <span className="text-gray-500">bulan ini</span>
            </div>
            <div className="w-[80px] h-[30px]">
              <Sparkline data={sparklines.totalBerita} color="#3b82f6" />
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
              <div className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">{topCards.totalUser}</div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div className="text-[11px] font-bold text-gray-500">Pengguna Terdaftar</div>
            <div className="w-[80px] h-[30px]">
              <Sparkline data={sparklines.totalUser} color="#10b981" />
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
              <div className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">{topCards.totalBeritaHariIni}</div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div className="text-[11px] font-bold text-gray-500">Artikel</div>
            <div className="w-[80px] h-[30px]">
              <Sparkline data={sparklines.beritaHariIni} color="#f59e0b" />
            </div>
          </div>
        </div>

      </div>

      {/* Detail Analitik Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-10 mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Detail Analitik</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Data detail pengunjung, ringkasan performa, dan kategori.
          </p>
        </div>
        <div className="relative">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 border border-gray-200 bg-white rounded-xl flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
          >
            <span className="text-sm font-bold text-gray-700">{filterOptions[timeFilter]}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
              <path d="M1 1L5 5L9 1" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] py-2 z-20 overflow-hidden">
                {Object.entries(filterOptions).map(([key, label]) => (
                  <div
                    key={key}
                    onClick={() => { setTimeFilter(key as any); setIsDropdownOpen(false); }}
                    className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors ${timeFilter === key ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6">

        {/* Visitor Chart (Full Width) */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 lg:p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-lg font-extrabold text-gray-900">Grafik Pengunjung</h2>
          </div>

          <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorData[timeFilter]} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
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
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Ringkasan Statistik (Left Column) */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 lg:p-8 border border-gray-100 flex flex-col h-full">
          <h2 className="text-lg font-extrabold text-gray-900 mb-6">Ringkasan Statistik</h2>

          <div className="flex flex-col border border-gray-100 rounded-2xl flex-1 justify-around">

            {/* Item 1 */}
            <div className="flex items-center gap-5 p-6 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-[#eff6ff] text-blue-600 flex items-center justify-center shrink-0">
                <Eye size={24} strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">Total Page View</div>
                <div className="text-2xl font-extrabold text-gray-900 leading-none">{activeSummaryData.pageViews}</div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-5 p-6 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-[#ecfdf5] text-emerald-500 flex items-center justify-center shrink-0">
                <FileText size={24} strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">Total Berita Terbit</div>
                <div className="text-2xl font-extrabold text-gray-900 leading-none">{activeSummaryData.totalBerita}</div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-5 p-6">
              <div className="w-14 h-14 rounded-full bg-[#fffbeb] text-amber-500 flex items-center justify-center shrink-0">
                <UserPlus size={24} strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">User Baru</div>
                <div className="text-2xl font-extrabold text-gray-900 leading-none">{activeSummaryData.userBaru}</div>
              </div>
            </div>

          </div>
        </div>

        {/* Distribusi Kategori (Right Column) */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 lg:p-8 border border-gray-100 flex flex-col h-full">
          <h2 className="text-lg font-extrabold text-gray-900 mb-0">Distribusi Kategori</h2>
          <div className="flex flex-row items-center justify-center w-full flex-1 mt-6 gap-8">
            <div className="relative w-[190px] h-[190px] shrink-0">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-1 z-0">
                <span className="text-[32px] font-extrabold text-[#1e293b] leading-none mb-1">{totalBerita}</span>
                <span className="text-[13px] font-semibold text-[#475569]">Berita</span>
              </div>
              <div className="relative z-10 w-full h-full">
                {totalBerita === 0 ? (
                  /* Tampilan kosong saat belum ada berita */
                  <svg viewBox="0 0 190 190" width="190" height="190">
                    <circle cx="95" cy="95" r="80" fill="none" stroke="#f1f5f9" strokeWidth="30" />
                  </svg>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={4}
                      >
                        {activeCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-center gap-5 shrink-0 min-w-[130px] pr-2">
              {totalBerita === 0 ? (
                <span className="text-xs font-semibold text-gray-400">Belum ada data kategori.</span>
              ) : (
                activeCategoryData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center w-full gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-bold text-[#1e293b]">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-[#334155]">
                      {item.value} <span className="text-[#64748b]">({item.percent})</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

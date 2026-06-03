'use client';

import React, { useState } from 'react';
import { Calendar, FileText, User, LayoutGrid, Tag, ArrowUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const topNewsData = [
  { id: 1, title: 'Festival Budaya Malang 2026 Resmi Dibuka di Alun-Alun Kota', category: 'Pendidikan', views: '1.892', date: '14-05-2026' },
  { id: 2, title: 'Wisata Coban Rondo Jadi Destinasi Favorit Libur Panjang', category: 'Wisata', views: '1.402', date: '04-05-2026' },
  { id: 3, title: '5 Kuliner Legendaris Malang yang Wajib Dicoba Wisatawan', category: 'Kuliner', views: '998', date: '21-05-2026' },
  { id: 4, title: 'Hotel Baru Bernuansa Modern Hadir di Kawasan Batu', category: 'Hotel', views: '984', date: '08-05-2026' },
  { id: 5, title: 'UMKM Kuliner Malang Raih Omzet Tinggi Saat Festival Kota', category: 'Kuliner', views: '931', date: '19-05-2026' },
];

const generateFilteredData = (start: string, end: string) => {
  const s = start ? new Date(start) : new Date('2024-01-01');
  const e = end ? new Date(end) : new Date();
  const diffTime = Math.abs(e.getTime() - s.getTime());
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const baseBerita = Math.max(10, Math.floor(diffDays * 2.5));

  const newVisitorData = [];
  const calculatedTicks: string[] = [];
  const monthsStr = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const getNoise = (index: number, seed: number) => {
    return Math.abs(Math.sin(index * 13.579 + seed) * Math.cos(index * 7.123 + seed));
  };

  let totalPengunjung = 0;

  if (diffDays <= 31) {
    // Grouping Harian
    for (let i = 0; i <= diffDays; i++) {
      const d = new Date(s.getTime() + (1000 * 60 * 60 * 24) * i);
      const dateStr = `${d.getDate().toString().padStart(2, '0')} ${monthsStr[d.getMonth()]}`;
      const visitors = Math.floor(3000 + (diffDays * 5) + getNoise(i, diffDays) * 2000);
      totalPengunjung += visitors;
      newVisitorData.push({
        name: dateStr,
        visitors
      });
    }
    // Tampilkan semua label jika rentangnya pendek (<= 14 hari), jika panjang baru dibatasi maksimal 7
    const tickCount = newVisitorData.length <= 14 ? newVisitorData.length : 7;
    const step = Math.round((newVisitorData.length - 1) / (tickCount - 1));
    for (let i = 0; i < tickCount; i++) {
      let tickIndex = i * step;
      // Pastikan tick terakhir selalu persis di tanggal paling ujung
      if (i === tickCount - 1) tickIndex = newVisitorData.length - 1;

      if (tickIndex < newVisitorData.length) {
        if (!calculatedTicks.includes(newVisitorData[tickIndex].name)) {
          calculatedTicks.push(newVisitorData[tickIndex].name);
        }
      }
    }
  } else if (diffDays <= 90) {
    // Grouping Mingguan
    const weeks = Math.ceil(diffDays / 7);
    for (let i = 0; i < weeks; i++) {
      const d = new Date(s.getTime() + (1000 * 60 * 60 * 24 * 7) * i);
      const dateStr = `Mg ${i + 1} ${monthsStr[d.getMonth()]}`;
      const visitors = Math.floor((3000 * 7) + (diffDays * 5) + getNoise(i, diffDays) * 14000);
      totalPengunjung += visitors;
      newVisitorData.push({
        name: dateStr,
        visitors
      });
      calculatedTicks.push(dateStr);
    }
  } else {
    // Grouping Bulanan
    const startMonth = s.getMonth();
    const startYear = s.getFullYear();
    const endMonth = e.getMonth();
    const endYear = e.getFullYear();

    let totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
    if (totalMonths > 36) totalMonths = 36; // Cap for dummy data performance

    for (let i = 0; i < totalMonths; i++) {
      const d = new Date(startYear, startMonth + i, 1);
      const fullMonthsStr = ['Jan', 'Feb', 'Maret', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sept', 'Okt', 'Nov', 'Des'];
      const dateStr = fullMonthsStr[d.getMonth()];

      // Gunakan algoritma noise agar grafik terlihat sangat natural dan acak
      const base = 30000;
      const variance = Math.floor(getNoise(i, diffDays) * 60000);
      const visitors = base + variance;
      totalPengunjung += visitors;

      newVisitorData.push({
        name: dateStr,
        visitors
      });

      if (!calculatedTicks.includes(dateStr)) {
        calculatedTicks.push(dateStr);
      }
    }
  }

  const newCategoryData = [
    { name: 'Wisata', value: Math.floor(baseBerita * 0.35), color: '#2563eb', percent: '' },
    { name: 'Kuliner', value: Math.floor(baseBerita * 0.25), color: '#16a34a', percent: '' },
    { name: 'Pendidikan', value: Math.floor(baseBerita * 0.25), color: '#f59e0b', percent: '' },
    { name: 'Hotel', value: Math.floor(baseBerita * 0.15), color: '#a855f7', percent: '' },
  ];
  const totalCat = newCategoryData.reduce((acc, curr) => acc + curr.value, 0) || 1;
  newCategoryData.forEach(c => { c.percent = Math.round((c.value / totalCat) * 100) + '%' });

  return {
    totalBerita: totalCat,
    totalPengunjung,
    visitorData: newVisitorData,
    categoryData: newCategoryData,
    xAxisTicks: calculatedTicks,
  };
};

export default function StatistikPortalPage() {
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [startDate, setStartDate] = useState('2024-05-01');
  const [endDate, setEndDate] = useState('2024-05-31');

  // State for dynamic charts
  const [activeData, setActiveData] = useState(() => generateFilteredData('2024-05-01', '2024-05-31'));

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pt-2">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Statistik Portal Berita</h1>

        {/* Date Filter */}
        <div className="w-full md:w-auto flex flex-col gap-1 relative z-30">
          <span className="text-[11px] font-bold text-gray-700 ml-1">Date :</span>
          <button
            onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
            className="flex items-center justify-between w-full md:w-[260px] px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-gray-500" />
              <span className="truncate">
                {startDate && endDate
                  ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
                  : 'Pilih Tanggal'}
              </span>
            </div>
            <span className="text-gray-900 text-[10px]">▼</span>
          </button>

          {isDatePopoverOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl w-[320px] md:w-[480px] flex flex-col md:flex-row overflow-hidden z-50">

              {/* Presets Column */}
              <div className="w-full md:w-[160px] bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 p-4 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pilih Cepat</span>
                {[
                  { label: '7 Hari Terakhir', days: 7 },
                  { label: '30 Hari Terakhir', days: 30 },
                  { label: '3 Bulan Terakhir', days: 90 },
                  { label: 'Tahun Ini', isYear: true },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const end = new Date();
                      let start = new Date();
                      if (preset.days) {
                        start.setDate(end.getDate() - preset.days);
                      } else if (preset.isYear) {
                        start = new Date(end.getFullYear(), 0, 1);
                      }

                      const startStr = start.toISOString().split('T')[0];
                      const endStr = end.toISOString().split('T')[0];

                      setStartDate(startStr);
                      setEndDate(endStr);
                      setActiveData(generateFilteredData(startStr, endStr));
                      setIsDatePopoverOpen(false);
                    }}
                    className="text-left text-xs font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 py-2 px-3 rounded-xl transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}

                <div className="mt-1 border-t border-gray-100 pt-2">
                  <select
                    className="w-full text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-blue-500 rounded-xl py-2 px-3 outline-none cursor-pointer appearance-none text-left"
                    defaultValue=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const year = parseInt(e.target.value);
                      const startStr = `${year}-01-01`;
                      // Set end date to Dec 31 of that year, OR today if it's the current year
                      const currentYear = new Date().getFullYear();
                      const endStr = year === currentYear
                        ? new Date().toISOString().split('T')[0]
                        : `${year}-12-31`;

                      setStartDate(startStr);
                      setEndDate(endStr);
                      setActiveData(generateFilteredData(startStr, endStr));
                      setIsDatePopoverOpen(false);
                    }}
                  >
                    <option value="" disabled>Pilih Tahun ▾</option>
                    <option value="2026">Tahun 2026</option>
                    <option value="2025">Tahun 2025</option>
                    <option value="2024">Tahun 2024</option>
                    <option value="2023">Tahun 2023</option>
                    <option value="2022">Tahun 2022</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Column */}
              <div className="p-5 flex-1 flex flex-col gap-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Atau Pilih Kustom</span>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Mulai Tanggal</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex justify-between items-center mt-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setActiveData(generateFilteredData('2024-01-01', new Date().toISOString().split('T')[0]));
                      setIsDatePopoverOpen(false);
                    }}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      setActiveData(generateFilteredData(startDate, endDate));
                      setIsDatePopoverOpen(false);
                    }}
                    className="bg-blue-50 text-blue-600 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {/* Total Berita */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-400 mb-3">Total Berita</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{activeData.totalBerita.toLocaleString('id-ID')}</h3>
              <div className="flex items-center text-[10px] font-medium text-gray-400">
                <span className="flex items-center text-[#16a34a] font-bold mr-1">
                  <ArrowUp size={12} className="mr-0.5" strokeWidth={3} />
                  12.5%
                </span>
                dari periode sebelumnya
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] flex items-center justify-center text-[#3b82f6]">
              <FileText size={24} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Total Pengunjung */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-400 mb-3">Total Pengunjung</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{activeData.totalPengunjung.toLocaleString('id-ID')}</h3>
              <div className="flex items-center text-[10px] font-medium text-gray-400">
                <span className="flex items-center text-[#16a34a] font-bold mr-1">
                  <ArrowUp size={12} className="mr-0.5" strokeWidth={3} />
                  12.5%
                </span>
                dari periode sebelumnya
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] flex items-center justify-center text-[#3b82f6]">
              <User size={24} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Total Kategori */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-400 mb-3">Total Kategori</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">4</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] flex items-center justify-center text-[#3b82f6]">
              <LayoutGrid size={24} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Total Tag */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-400 mb-3">Total Tag</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">23</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] flex items-center justify-center text-[#3b82f6]">
              <Tag size={24} strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pt-2">
        <div className="lg:col-span-3 bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold text-gray-900 mb-8">Grafik Pengunjung</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeData.visitorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
                  dy={10}
                  ticks={activeData.xAxisTicks}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
                  tickFormatter={(val) => val === 0 ? '0' : `${val / 1000}k`}
                />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                  itemStyle={{ fontWeight: 'bold', color: '#2563eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  dot={false}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3 }}
                  style={{ filter: 'drop-shadow(0px 8px 8px rgba(59,130,246,0.3))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full">
          <h2 className="text-lg font-bold text-gray-900 mb-0">Distribusi Kategori</h2>
          <div className="flex flex-row items-center justify-center w-full flex-1 mt-6 gap-8">
            <div className="relative w-[190px] h-[190px] shrink-0">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-1 z-0">
                <span className="text-[32px] font-extrabold text-[#1e293b] leading-none mb-1">{activeData.totalBerita}</span>
                <span className="text-[13px] font-semibold text-[#475569]">Berita</span>
              </div>
              <div className="relative z-10 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeData.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={4}
                    >
                      {activeData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-5 shrink-0 min-w-[130px] pr-2">
              {activeData.categoryData.map((item, index) => (
                <div key={index} className="flex justify-between items-center w-full gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-bold text-[#1e293b]">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#334155]">
                    {item.value} <span className="text-[#64748b]">({item.percent})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Top 5 Berita Terpopuler (Tidak terpengaruh filter tanggal) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] mt-6 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Top 5 Berita Terpopuler</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#eff6ff] text-[13px] text-gray-900 border-b border-gray-100">
                <th className="py-4 px-6 font-bold w-16">No</th>
                <th className="py-4 px-6 font-bold">Judul</th>
                <th className="py-4 px-6 font-bold w-36">Kategori</th>
                <th className="py-4 px-6 font-bold w-32">Dilihat</th>
                <th className="py-4 px-6 font-bold w-40">Tanggal</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {topNewsData.map((news) => (
                <tr key={news.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors last:border-0">
                  <td className="py-5 px-6 font-bold text-gray-900">{news.id}.</td>
                  <td className="py-5 px-6 font-bold text-[#1e293b]">{news.title}</td>
                  <td className="py-5 px-6 font-bold text-gray-900">{news.category}</td>
                  <td className="py-5 px-6 font-medium text-gray-700">{news.views}</td>
                  <td className="py-5 px-6 font-bold text-gray-900">{news.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

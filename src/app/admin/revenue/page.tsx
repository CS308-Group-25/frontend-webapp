'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import {
  CalendarDays,
  LineChart,
  RefreshCw,
  ShieldX,
  TrendingUp,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Percent
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/features/auth';

const years = Array.from({ length: 15 }, (_, i) => 2026 + i);
const months = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

const renderDatePickerHeader = ({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: {
  date: Date;
  changeYear: (year: number) => void;
  changeMonth: (month: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}) => (
  <div className="flex items-center justify-between px-2 py-2">
    <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-50 transition-colors">
      <ChevronLeft className="h-5 w-5 text-slate-600" />
    </button>
    <div className="flex gap-2">
      <select
        value={months[date.getMonth()]}
        onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700 outline-none cursor-pointer hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      >
        {months.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select
        value={date.getFullYear()}
        onChange={({ target: { value } }) => changeYear(Number(value))}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700 outline-none cursor-pointer hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      >
        {years.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
    <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-50 transition-colors">
      <ChevronRight className="h-5 w-5 text-slate-600" />
    </button>
  </div>
);

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  profit: number;
}

export interface RevenueReportResponse {
  revenue: number;
  cost: number;
  profit: number;
  chart_data: RevenueDataPoint[];
}

const fetchRevenueReport = async (from: string, to: string) => {
  const safeFrom = from || '2026-01-01';
  const safeTo = to || new Date().toISOString().split('T')[0];
  return apiClient.get<RevenueReportResponse>('/v1/admin/reports/revenue', {
    params: {
      from_date: safeFrom,
      to_date: safeTo,
    }
  }) as unknown as RevenueReportResponse;
};

export default function AdminRevenuePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  // Set default dates inside useState to avoid impure function calls during render
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [appliedFromDate, setAppliedFromDate] = useState('2026-01-01');
  const [appliedToDate, setAppliedToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<RevenueReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const chartData = useMemo(() => {
    if (!reportData?.chart_data) return [];
    
    const sortedData = [...reportData.chart_data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sortedData.length === 0) return [];

    if (sortedData.length > 730) {
      const yearlyMap = new Map<string, { date: string, revenue: number, profit: number }>();
      sortedData.forEach(day => {
        const d = new Date(day.date);
        const yearKey = `${d.getFullYear()}-01-01`;
        if (!yearlyMap.has(yearKey)) {
          yearlyMap.set(yearKey, { date: yearKey, revenue: 0, profit: 0 });
        }
        const y = yearlyMap.get(yearKey)!;
        y.revenue += Number(day.revenue);
        y.profit += Number(day.profit);
      });
      
      return Array.from(yearlyMap.values()).map(year => ({
        ...year,
        formattedDate: new Date(year.date).getFullYear().toString()
      }));
    }

    if (sortedData.length > 60) {
      const monthlyMap = new Map<string, { date: string, revenue: number, profit: number }>();
      sortedData.forEach(day => {
        const d = new Date(day.date);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { date: monthKey, revenue: 0, profit: 0 });
        }
        const m = monthlyMap.get(monthKey)!;
        m.revenue += Number(day.revenue);
        m.profit += Number(day.profit);
      });
      
      return Array.from(monthlyMap.values()).map(month => ({
        ...month,
        formattedDate: new Date(month.date).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
      }));
    }

    return sortedData.map((day) => ({
      ...day,
      formattedDate: new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
    }));
  }, [reportData]);

  // Only Sales Manager is authorized for revenue report
  const isAuthorized = isAuthenticated && user?.role === 'sales_manager';

  useEffect(() => {
    if (!isAuthorized) return;

    let isMounted = true;
    fetchRevenueReport(appliedFromDate, appliedToDate)
      .then((data) => {
        if (isMounted) {
          setReportData(data);
          setFetchError(false);
        }
      })
      .catch(() => {
        if (isMounted) setFetchError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthorized, appliedFromDate, appliedToDate]);

  const refreshReport = () => {
    setLoading(true);
    setFetchError(false);
    fetchRevenueReport(appliedFromDate, appliedToDate)
      .then((data) => {
        setReportData(data);
        setFetchError(false);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  const applyFilters = () => {
    if (fromDate === appliedFromDate && toDate === appliedToDate) {
      return; // No changes to apply
    }
    setLoading(true);
    setFetchError(false);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  };

  const clearFilters = () => {
    const defaultFrom = '2026-01-01';
    const defaultTo = new Date().toISOString().split('T')[0];
    
    setFromDate(defaultFrom);
    setToDate(defaultTo);
    
    if (appliedFromDate === defaultFrom && appliedToDate === defaultTo) {
      return; // Already cleared, prevent infinite loading state
    }
    
    setLoading(true);
    setFetchError(false);
    setAppliedFromDate(defaultFrom);
    setAppliedToDate(defaultTo);
  };

  const rangeLabel = (() => {
    const formatDateLabel = (value: string) => {
      const parts = value.split('-');
      if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      return value;
    };
    if (!appliedFromDate && !appliedToDate) return 'Tüm zamanlar';
    if (appliedFromDate && appliedToDate) {
      return `${formatDateLabel(appliedFromDate)} - ${formatDateLabel(appliedToDate)}`;
    }
    if (appliedFromDate) return `${formatDateLabel(appliedFromDate)} sonrası`;
    return `${formatDateLabel(appliedToDate)} öncesi`;
  })();

  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-2xl bg-red-50 p-4">
            <ShieldX className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Yetkisiz Erişim</h2>
            <p className="mt-1 text-sm text-slate-500">
              Bu sayfaya erişim için yönetici yetkisi gereklidir.
            </p>
          </div>
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 text-sm text-slate-400">
            <Link href="/" className="transition-colors hover:text-indigo-600">
              Ana Sayfa
            </Link>
            <span className="mx-2">•</span>
            <span className="font-bold text-slate-700">Yönetim Paneli</span>
            <span className="mx-2">•</span>
            <span className="font-bold text-slate-700">Gelir Raporu</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-2">
              <LineChart className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Gelir Raporu
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Belirli bir tarih aralığındaki gelir ve kar istatistiklerini görüntüleyin.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={refreshReport}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
              Başlangıç Tarihi
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <DatePicker
                  selected={fromDate ? new Date(fromDate) : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      const formatted = format(date, 'yyyy-MM-dd');
                      setFromDate(formatted);
                      if (toDate && formatted > toDate) {
                        setToDate(formatted);
                      }
                    } else {
                      setFromDate('');
                    }
                  }}
                  minDate={new Date('2026-01-01')}
                  dateFormat="dd.MM.yyyy"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  wrapperClassName="w-full"
                  renderCustomHeader={renderDatePickerHeader}
                />
              </div>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
              Bitiş Tarihi
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <DatePicker
                  selected={toDate ? new Date(toDate) : null}
                  onChange={(date: Date | null) => setToDate(date ? format(date, 'yyyy-MM-dd') : '')}
                  minDate={fromDate ? new Date(Math.max(new Date(fromDate).getTime(), new Date('2026-01-01').getTime())) : new Date('2026-01-01')}
                  dateFormat="dd.MM.yyyy"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  wrapperClassName="w-full"
                  renderCustomHeader={renderDatePickerHeader}
                />
              </div>
            </label>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500">
              {rangeLabel}
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Temizle
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-colors hover:bg-indigo-700"
            >
              Uygula
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm font-medium text-slate-500">Rapor yükleniyor...</p>
          </div>
        </div>
      ) : fetchError ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-red-100">
          <div className="mb-4 rounded-2xl bg-red-50 p-4">
            <LineChart className="h-10 w-10 text-red-300" />
          </div>
          <p className="text-lg font-bold text-red-600">Rapor yüklenemedi.</p>
          <p className="mt-1 text-sm text-red-400">
            Lütfen bağlantınızı kontrol edip tekrar deneyin.
          </p>
          <button
            onClick={refreshReport}
            className="mt-4 text-sm font-medium text-indigo-600 hover:underline"
          >
            Tekrar Dene
          </button>
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Chart Section */}
            <div className="lg:col-span-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex flex-col">
              <h3 className="mb-6 text-lg font-bold text-slate-800">Gelir ve Kar Grafiği</h3>
              {chartData.length > 0 ? (
                <div className="h-[400px] w-full mt-auto overflow-x-auto overflow-y-hidden">
                  <div style={{ minWidth: chartData.length > 15 ? `${chartData.length * 45}px` : '100%', height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
                        barGap={2}
                        barCategoryGap="15%"
                        maxBarSize={40}
                      >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="formattedDate" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                        minTickGap={30}
                        interval="equidistantPreserveStart"
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value: number | string) => `${Number(value) >= 1000 ? (Number(value) / 1000).toFixed(0) + 'k' : value}`}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any, name: any) => [`${Number(value || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, name]} // eslint-disable-line @typescript-eslint/no-explicit-any
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                      <Bar 
                        dataKey="revenue" 
                        name="Gelir" 
                        fill="#16a34a" 
                        radius={[4, 4, 0, 0]}
                      >
                        <LabelList 
                          dataKey="revenue" 
                          content={(props: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            const { x, y, width, value } = props;
                            if (value === null || value === undefined) return null;
                            const formattedValue = Number(value) >= 1000 ? `${(Number(value) / 1000).toFixed(0)}k` : value;
                            return (
                              <text x={Number(x) + Number(width) / 2} y={Number(y) - 5} fill="#16a34a" fontSize={11} fontWeight={700} textAnchor="middle">
                                {formattedValue}
                              </text>
                            );
                          }}
                        />
                      </Bar>
                      <Bar 
                        dataKey="profit" 
                        name="Kar" 
                        fill="#4f46e5" 
                        radius={[4, 4, 0, 0]}
                      >
                        <LabelList 
                          dataKey="profit" 
                          content={(props: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            const { x, y, width, value } = props;
                            if (value === null || value === undefined) return null;
                            const formattedValue = Number(value) >= 1000 ? `${(Number(value) / 1000).toFixed(0)}k` : value;
                            return (
                              <text x={Number(x) + Number(width) / 2} y={Number(y) - 5} fill="#4f46e5" fontSize={11} fontWeight={700} textAnchor="middle">
                                {formattedValue}
                              </text>
                            );
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="flex h-[400px] flex-col items-center justify-center rounded-xl bg-slate-50 text-center mt-auto">
                  <LineChart className="mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">Görüntülenecek grafik verisi bulunamadı.</p>
                </div>
              )}
            </div>

            {/* Stat Cards */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-green-50 p-2 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">Toplam Gelir</p>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {Number(reportData.revenue).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </p>
              </div>
              
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-red-50 p-2 text-red-600">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">Toplam Maliyet</p>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {Number(reportData.cost).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                    <LineChart className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">Toplam Kar</p>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {Number(reportData.profit).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                    <Percent className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">Kar Marjı</p>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  %{reportData.revenue > 0 ? ((Number(reportData.profit) / Number(reportData.revenue)) * 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

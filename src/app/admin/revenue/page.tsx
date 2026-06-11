'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  LineChart,
  RefreshCw,
  ShieldX,
  TrendingUp,
  Banknote
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/features/auth';

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
  return apiClient.get<RevenueReportResponse>('/v1/admin/reports/revenue', {
    params: {
      from_date: from,
      to_date: to,
    }
  }) as unknown as RevenueReportResponse;
};

export default function AdminRevenuePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  // Set default dates inside useState to avoid impure function calls during render
  const [fromDate, setFromDate] = useState(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [appliedFromDate, setAppliedFromDate] = useState(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [appliedToDate, setAppliedToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<RevenueReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Only Sales Manager is authorized for revenue report
  const isAuthorized = isAuthenticated && user?.role === 'sales_manager';

  const loadReport = useCallback(() => {
    setFetchError(false);
    setLoading(true);
    fetchRevenueReport(appliedFromDate, appliedToDate)
      .then(setReportData)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [appliedFromDate, appliedToDate]);

  useEffect(() => {
    if (!isAuthorized) return;
    loadReport();
  }, [isAuthorized, loadReport]);

  const applyFilters = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  };

  const clearFilters = () => {
    const freshFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const freshTo = new Date().toISOString().split('T')[0];
    setFromDate(freshFrom);
    setToDate(freshTo);
    setAppliedFromDate(freshFrom);
    setAppliedToDate(freshTo);
  };

  const rangeLabel = `${appliedFromDate.replaceAll('-', '.')} - ${appliedToDate.replaceAll('-', '.')}`;

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
          onClick={loadReport}
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
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
              Bitiş Tarihi
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(event) => setToDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
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
            onClick={loadReport}
            className="mt-4 text-sm font-medium text-indigo-600 hover:underline"
          >
            Tekrar Dene
          </button>
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex items-start gap-4">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Toplam Gelir</p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {Number(reportData.revenue).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </p>
              </div>
            </div>
            
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex items-start gap-4">
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <Banknote className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Toplam Maliyet</p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {Number(reportData.cost).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex items-start gap-4">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <LineChart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Toplam Kar</p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {Number(reportData.profit).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </p>
              </div>
            </div>
          </div>

          {/* Daily Table */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-sm font-bold text-slate-800">Günlük Gelir Özeti</h3>
            </div>
            {reportData.chart_data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-bold">Tarih</th>
                      <th className="px-6 py-4 font-bold text-right">Gelir</th>
                      <th className="px-6 py-4 font-bold text-right">Kar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.chart_data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((day) => (
                      <tr key={day.date} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {new Date(day.date).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-600">
                          {Number(day.revenue).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">
                          {Number(day.profit).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <LineChart className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">Bu tarih aralığında veri bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

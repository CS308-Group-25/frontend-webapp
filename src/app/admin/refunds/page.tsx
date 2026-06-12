'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { RotateCcw, RefreshCw, ShieldX } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import RefundRequestsTable from '@/features/admin/refunds/components/RefundRequestsTable';
import {
  fetchAdminRefunds,
  updateRefundStatus,
} from '@/features/admin/refunds/api';
import {
  AdminRefundRequest,
  RefundStatus,
} from '@/features/admin/refunds/types';
import { useAuthStore } from '@/features/auth';

const STATUS_TABS: { value: RefundStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'requested', label: 'Talep Edildi' },
  { value: 'approved_waiting_return', label: 'İade Bekleniyor' },
  { value: 'returned_received', label: 'İade Alındı' },
  { value: 'refunded', label: 'Tamamlandı' },
  { value: 'rejected', label: 'Reddedildi' },
];

export default function AdminRefundsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [refunds, setRefunds] = useState<AdminRefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeTab, setActiveTab] = useState<RefundStatus | 'all'>('requested');

  const queryClient = useQueryClient();
  const isAuthorized = isAuthenticated && user?.role === 'sales_manager';

  const loadRefunds = () => {
    setFetchError(false);
    setLoading(true);
    fetchAdminRefunds()
      .then(setRefunds)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthorized) return;
    fetchAdminRefunds()
      .then(setRefunds)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [isAuthorized]);

  const filteredRefunds = useMemo(() => {
    if (activeTab === 'all') return refunds;
    return refunds.filter((r) => r.status === activeTab);
  }, [refunds, activeTab]);

  const counts = useMemo(
    () => ({
      all: refunds.length,
      requested: refunds.filter((r) => r.status === 'requested').length,
      approved_waiting_return: refunds.filter(
        (r) => r.status === 'approved_waiting_return'
      ).length,
      returned_received: refunds.filter((r) => r.status === 'returned_received')
        .length,
      refunded: refunds.filter((r) => r.status === 'refunded').length,
      rejected: refunds.filter((r) => r.status === 'rejected').length,
    }),
    [refunds]
  );

  const handleUpdateStatus = async (id: number, status: RefundStatus) => {
    const previous = refunds;
    setRefunds((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await updateRefundStatus(id, status);
      if (status === 'refunded') {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    } catch {
      setRefunds(previous);
    }
  };

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
            <h2 className="text-xl font-bold text-slate-900">
              Yetkisiz Erişim
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Bu sayfaya erişim için satış yöneticisi yetkisi gereklidir.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 text-sm text-slate-400">
            <Link href="/" className="transition-colors hover:text-indigo-600">
              Ana Sayfa
            </Link>
            <span className="mx-2">•</span>
            <span className="font-bold text-slate-700">Yönetim Paneli</span>
            <span className="mx-2">•</span>
            <span className="font-bold text-slate-700">İade Talepleri</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-2">
              <RotateCcw className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                İade Talepleri
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                İade taleplerini inceleyin ve işlemleri yönetin.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={loadRefunds}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          {
            label: 'Toplam',
            count: counts.all,
            color: 'bg-slate-100 text-slate-700',
          },
          {
            label: 'Talep',
            count: counts.requested,
            color: 'bg-amber-50 text-amber-700',
          },
          {
            label: 'İşlemde',
            count: counts.approved_waiting_return + counts.returned_received,
            color: 'bg-blue-50 text-blue-700',
          },
          {
            label: 'Tamamlandı',
            count: counts.refunded,
            color: 'bg-green-50 text-green-700',
          },
          {
            label: 'Reddedildi',
            count: counts.rejected,
            color: 'bg-red-50 text-red-700',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <span className="mb-1 text-xs font-semibold text-slate-500">
              {card.label}
            </span>
            <span
              className={`self-start rounded-lg px-2 py-0.5 text-2xl font-black ${card.color}`}
            >
              {card.count}
            </span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = counts[tab.value as keyof typeof counts];
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm font-medium text-slate-500">
              İade talepleri yükleniyor...
            </p>
          </div>
        </div>
      ) : fetchError ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-red-100">
          <div className="mb-4 rounded-2xl bg-red-50 p-4">
            <RotateCcw className="h-10 w-10 text-red-300" />
          </div>
          <p className="text-lg font-bold text-red-600">
            İade talepleri yüklenemedi.
          </p>
          <p className="mt-1 text-sm text-red-400">
            Lütfen bağlantınızı kontrol edip tekrar deneyin.
          </p>
          <button
            onClick={loadRefunds}
            className="mt-4 text-sm font-medium text-indigo-600 hover:underline"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <RefundRequestsTable
          refunds={filteredRefunds}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

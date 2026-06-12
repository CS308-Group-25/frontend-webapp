'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MessageSquare, Loader2, RefreshCw, ShieldX } from 'lucide-react';
import ReviewModerationTable from '@/features/admin/reviews/components/ReviewModerationTable';
import { fetchAdminReviews, moderateReview, deleteReview } from '@/features/admin/reviews/api';
import { AdminReview, ReviewApprovalStatus } from '@/features/admin/reviews/types';
import { useAuthStore } from '@/features/auth';

const STATUS_TABS: { value: ReviewApprovalStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'pending', label: 'Beklemede' },
  { value: 'approved', label: 'Onaylananlar' },
  { value: 'rejected', label: 'Reddedilenler' },
];

export default function AdminReviewsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const isAuthorized = isAuthenticated && user?.role === 'product_manager';

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<ReviewApprovalStatus | 'all'>('pending');

  const loadReviews = () => {
    setLoading(true);
    setError(false);
    fetchAdminReviews()
      .then(setReviews)
      .catch(() => {
        setReviews([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthorized) return;
    fetchAdminReviews()
      .then(setReviews)
      .catch(() => {
        setReviews([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [isAuthorized]);

  const filteredReviews = useMemo(() => {
    if (activeTab === 'all') return reviews;
    return reviews.filter((r) => r.approval_status === activeTab);
  }, [reviews, activeTab]);

  const counts = useMemo(() => ({
    all: reviews.length,
    pending: reviews.filter((r) => r.approval_status === 'pending').length,
    approved: reviews.filter((r) => r.approval_status === 'approved').length,
    rejected: reviews.filter((r) => r.approval_status === 'rejected').length,
  }), [reviews]);

  const handleApprove = async (id: number) => {
    await moderateReview(id, { approval_status: 'approved' });
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approval_status: 'approved' } : r))
    );
  };

  const handleReject = async (id: number) => {
    await moderateReview(id, { approval_status: 'rejected' });
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approval_status: 'rejected' } : r))
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
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
          <div className="p-4 bg-red-50 rounded-2xl">
            <ShieldX className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Yetkisiz Erişim</h2>
            <p className="mt-1 text-sm text-slate-500">
              Bu sayfaya erişim için ürün yöneticisi yetkisi gereklidir.
            </p>
          </div>
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
            Ana sayfaya dön
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
            <span className="font-bold text-slate-700">Yorum Yönetimi</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Yorum Moderasyonu
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Müşteri yorumlarını inceleyin, onaylayın veya reddedin.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadReviews}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Toplam', count: counts.all, color: 'bg-slate-100 text-slate-700' },
          { label: 'Beklemede', count: counts.pending, color: 'bg-amber-50 text-amber-700' },
          { label: 'Onaylanan', count: counts.approved, color: 'bg-green-50 text-green-700' },
          { label: 'Reddedilen', count: counts.rejected, color: 'bg-red-50 text-red-700' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 flex flex-col"
          >
            <span className="text-xs font-semibold text-slate-500 mb-1">{card.label}</span>
            <span className={`text-2xl font-black rounded-lg px-2 py-0.5 self-start ${card.color}`}>
              {card.count}
            </span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = counts[tab.value];
          return (
            <button
              key={tab.value}
              id={`tab-reviews-${tab.value}`}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-500">Yorumlar yükleniyor...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-red-100">
          <div className="mb-4 rounded-2xl bg-red-50 p-4">
            <MessageSquare className="h-10 w-10 text-red-300" />
          </div>
          <p className="text-lg font-bold text-red-600">Yorumlar yüklenemedi.</p>
          <p className="mt-1 text-sm text-red-400">Lütfen backend bağlantısını kontrol edip tekrar deneyin.</p>
        </div>
      ) : (
        <ReviewModerationTable
          reviews={filteredReviews}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

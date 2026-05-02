'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Star,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AdminReview, ReviewApprovalStatus } from '../types';

interface ReviewModerationTableProps {
  reviews: AdminReview[];
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const STATUS_CONFIG: Record<ReviewApprovalStatus, { label: string; className: string }> = {
  pending: { label: 'Beklemede', className: 'text-amber-700 bg-amber-50 border-amber-200' },
  approved: { label: 'Onaylandı', className: 'text-green-700 bg-green-50 border-green-200' },
  rejected: { label: 'Reddedildi', className: 'text-red-700 bg-red-50 border-red-200' },
};

function StatusBadge({ status }: { status: ReviewApprovalStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.className}`}>
      {config.label}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-slate-600">{rating}/5</span>
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  variant,
  children,
  title,
}: {
  onClick: () => void;
  disabled: boolean;
  variant: 'approve' | 'reject' | 'delete';
  children: React.ReactNode;
  title?: string;
}) {
  const styles = {
    approve:
      'flex items-center justify-center p-2 rounded-xl text-green-600 bg-green-50 border border-green-200 hover:bg-green-100 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90',
    reject:
      'flex items-center justify-center p-2 rounded-xl text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90',
    delete:
      'flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90',
  };

  return (
    <button onClick={onClick} disabled={disabled} className={styles[variant]} title={title}>
      {children}
    </button>
  );
}

function formatRelativeDate(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} dakika önce`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} saat önce`;
    const days = Math.floor(hrs / 24);
    return `${days} gün önce`;
  } catch {
    return dateStr;
  }
}

export default function ReviewModerationTable({
  reviews,
  onApprove,
  onReject,
  onDelete,
}: ReviewModerationTableProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const handleAction = async (id: number, action: () => Promise<void>) => {
    setLoadingId(id);
    try {
      await action();
    } finally {
      setLoadingId(null);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="p-4 bg-slate-50 rounded-2xl mb-4">
          <MessageSquare className="w-10 h-10 text-slate-300" />
        </div>
        <p className="text-lg font-bold text-slate-600">Bu filtrede yorum bulunamadı.</p>
        <p className="text-sm text-slate-400 mt-1">Farklı bir durum filtresi deneyin.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold">Yorum No</th>
              <th className="px-6 py-4 font-bold">Ürün</th>
              <th className="px-6 py-4 font-bold">Müşteri</th>
              <th className="px-6 py-4 font-bold">Puan</th>
              <th className="px-6 py-4 font-bold">Yorum</th>
              <th className="px-6 py-4 font-bold">Tarih</th>
              <th className="px-6 py-4 font-bold">Durum</th>
              <th className="px-6 py-4 font-bold">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviews.map((review) => {
              const isLoading = loadingId === review.id;
              const isPending = review.approval_status === 'pending';
              const isExpanded = expandedIds.has(review.id);

              return (
                <React.Fragment key={review.id}>
                  <tr
                    className={`transition-colors duration-150 hover:bg-slate-50/60 ${
                      isExpanded ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    {/* ID */}
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      #{review.id}
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 text-sm line-clamp-1 max-w-[140px] block">
                        {review.product_name ?? `Ürün #${review.product_id}`}
                      </span>
                      <span className="text-xs text-slate-400">ID: {review.product_id}</span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-sm">
                          {review.customer_name ?? `Kullanıcı #${review.user_id}`}
                        </span>
                        <span className="text-xs text-slate-400">{review.customer_email}</span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StarRating rating={review.rating} />
                    </td>

                    {/* Comment (Summary) */}
                    <td className="px-6 py-4 max-w-[200px]">
                      {review.comment ? (
                        <button
                          onClick={() => toggleExpand(review.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50/50 px-2 py-1 rounded-lg border border-indigo-100"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {isExpanded ? 'Kapat' : 'Yorumu Gör'}
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Yorum yok</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-500">{formatRelativeDate(review.created_at)}</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={review.approval_status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start gap-2">
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                        ) : (
                          <>
                            <ActionButton
                              variant="approve"
                              title="Onayla"
                              disabled={!isPending || isLoading}
                              onClick={() =>
                                handleAction(review.id, () => onApprove(review.id))
                              }
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </ActionButton>
                            <ActionButton
                              variant="reject"
                              title="Reddet"
                              disabled={!isPending || isLoading}
                              onClick={() =>
                                handleAction(review.id, () => onReject(review.id))
                              }
                            >
                              <XCircle className="w-4 h-4" />
                            </ActionButton>
                            <ActionButton
                              variant="delete"
                              title="Sil"
                              disabled={isLoading}
                              onClick={() =>
                                handleAction(review.id, () => onDelete(review.id))
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </ActionButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Content */}
                  {isExpanded && review.comment && (
                    <tr>
                      <td colSpan={8} className="px-6 py-0 border-none bg-indigo-50/20">
                        <div className="py-4 px-8 border-l-4 border-indigo-500 my-2 bg-white rounded-r-xl shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                          <h4 className="text-[10px] uppercase tracking-wider font-black text-indigo-400 mb-2">
                            Müşteri Yorumu
                          </h4>
                          <p className="text-sm text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                            &quot;{review.comment}&quot;
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

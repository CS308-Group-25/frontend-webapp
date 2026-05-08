'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AdminRefundRequest, RefundStatus } from '../types';

const STATUS_CONFIG: Record<RefundStatus, { label: string; className: string }> = {
  requested:                { label: 'Talep Edildi',      className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  approved_waiting_return:  { label: 'İade Bekleniyor',   className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  returned_received:        { label: 'İade Alındı',       className: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  refunded:                 { label: 'Tamamlandı',        className: 'bg-green-50 text-green-700 border border-green-200' },
  rejected:                 { label: 'Reddedildi',        className: 'bg-red-50 text-red-700 border border-red-200' },
};

const ADVANCE_ACTION: Partial<Record<RefundStatus, { label: string; next: RefundStatus }>> = {
  requested:               { label: 'Onayla',         next: 'approved_waiting_return' },
  approved_waiting_return: { label: 'İade Alındı',    next: 'returned_received' },
  returned_received:       { label: 'İadeyi Onayla',  next: 'refunded' },
};

interface Props {
  refunds: AdminRefundRequest[];
  onUpdateStatus: (id: number, status: RefundStatus) => Promise<void>;
}

export default function RefundRequestsTable({ refunds, onUpdateStatus }: Props) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleAction = async (id: number, status: RefundStatus) => {
    setLoadingId(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatAmount = (amount: number | string) =>
    `₺${Number(amount).toFixed(2)}`;

  if (refunds.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium text-slate-400">Bu filtrede iade talebi bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Müşteri</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Ürün</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Sipariş Tarihi</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Tutar</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Sebep</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Durum</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {refunds.map((refund) => {
              const isLoading = loadingId === refund.id;
              const isExpanded = expandedId === refund.id;
              const advance = ADVANCE_ACTION[refund.status];
              const isTerminal = refund.status === 'refunded' || refund.status === 'rejected';
              const statusConfig = STATUS_CONFIG[refund.status];

              return (
                <tr
                  key={refund.id}
                  className={`transition-colors hover:bg-slate-50/50 ${isLoading ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3 font-semibold text-slate-900">{refund.customer_name}</td>
                  <td className="px-4 py-3 max-w-[160px] truncate text-slate-600">{refund.product_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(refund.order_date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">{formatAmount(refund.refund_amount)}</td>
                  <td className="px-4 py-3 max-w-[200px]">
                    {refund.reason ? (
                      <div>
                        <p className={`text-xs text-slate-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {refund.reason}
                        </p>
                        {refund.reason.length > 80 && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : refund.id)}
                            className="mt-0.5 flex items-center gap-0.5 text-[10px] font-bold text-indigo-500 hover:text-indigo-700"
                          >
                            {isExpanded
                              ? <><ChevronUp className="h-3 w-3" /> Daha az</>
                              : <><ChevronDown className="h-3 w-3" /> Daha fazla</>
                            }
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs italic text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${statusConfig.className}`}>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!isTerminal && (
                      <div className="flex items-center gap-2">
                        {advance && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleAction(refund.id, advance.next)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {advance.label}
                          </button>
                        )}
                        <button
                          disabled={isLoading}
                          onClick={() => handleAction(refund.id, 'rejected')}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                        >
                          Reddet
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

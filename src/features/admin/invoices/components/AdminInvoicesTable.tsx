'use client';

import { Download, Eye, FileText } from 'lucide-react';
import { AdminInvoiceListItem } from '../types';

interface AdminInvoicesTableProps {
  invoices: AdminInvoiceListItem[];
  onViewInvoice: (invoice: AdminInvoiceListItem) => void;
  onDownloadPdf: (invoice: AdminInvoiceListItem) => void;
  downloadingId: number | null;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatAmount = (value: number | string) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(Number(value));

export default function AdminInvoicesTable({
  invoices,
  onViewInvoice,
  onDownloadPdf,
  downloadingId,
}: AdminInvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <FileText className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-400">
            Bu tarih aralığında fatura bulunmuyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/60">
            <tr>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Fatura No
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Müşteri
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Tarih
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Toplam
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((invoice) => {
              const isDownloading = downloadingId === invoice.id;

              return (
                <tr
                  key={invoice.id}
                  className={`transition-colors hover:bg-slate-50/50 ${
                    isDownloading ? 'opacity-60' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-slate-900">
                        {invoice.invoice_number}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {invoice.customer_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {formatDate(invoice.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-900">
                    {formatAmount(invoice.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onViewInvoice(invoice)}
                        title="Faturayı görüntüle"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadPdf(invoice)}
                        disabled={isDownloading}
                        title="PDF indir"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Download className={`h-4 w-4 ${isDownloading ? 'animate-pulse' : ''}`} />
                      </button>
                    </div>
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

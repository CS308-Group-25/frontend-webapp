'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Printer,
  RefreshCw,
  ShieldX,
  X,
} from 'lucide-react';
import { fetchAdminInvoices } from '@/features/admin/invoices/api';
import AdminInvoicesTable from '@/features/admin/invoices/components/AdminInvoicesTable';
import {
  AdminInvoiceListItem,
  PaginatedInvoiceResponse,
} from '@/features/admin/invoices/types';
import { useAuthStore } from '@/features/auth';
import InvoiceDocument from '@/features/orders/components/InvoiceDocument';
import { Invoice } from '@/features/orders/types';

const PAGE_SIZE = 20;

const initialResponse: PaginatedInvoiceResponse = {
  items: [],
  total: 0,
  page: 1,
  page_size: PAGE_SIZE,
};

export default function AdminInvoicesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedToDate, setAppliedToDate] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedInvoiceResponse>(initialResponse);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [invoiceForPdf, setInvoiceForPdf] = useState<{
    invoice: Invoice;
    invoiceNumber: string;
  } | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<{
    invoice: Invoice;
    invoiceNumber: string;
    source: AdminInvoiceListItem;
  } | null>(null);

  const isAuthorized = isAuthenticated && user?.role === 'sales_manager';
  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size));

  const loadInvoices = useCallback(() => {
    setFetchError(false);
    setLoading(true);
    fetchAdminInvoices({
      from: appliedFromDate || undefined,
      to: appliedToDate || undefined,
      page,
      page_size: PAGE_SIZE,
    })
      .then(setData)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [appliedFromDate, appliedToDate, page]);

  useEffect(() => {
    if (!isAuthorized) return;
    loadInvoices();
  }, [isAuthorized, loadInvoices]);

  const rangeLabel = useMemo(() => {
    const formatDateLabel = (value: string) => value.replaceAll('-', '.');

    if (!appliedFromDate && !appliedToDate) return 'Tüm faturalar';
    if (appliedFromDate && appliedToDate) {
      return `${formatDateLabel(appliedFromDate)} - ${formatDateLabel(appliedToDate)}`;
    }
    if (appliedFromDate) return `${formatDateLabel(appliedFromDate)} sonrası`;
    return `${formatDateLabel(appliedToDate)} öncesi`;
  }, [appliedFromDate, appliedToDate]);

  const applyFilters = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setPage(1);
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setAppliedFromDate('');
    setAppliedToDate('');
    setPage(1);
  };

  const buildInvoiceDocumentData = (invoice: AdminInvoiceListItem): Invoice => {
    const total = Number(invoice.total_amount ?? invoice.total ?? 0);
    const subtotal = Number(invoice.subtotal ?? invoice.total ?? total);
    const taxAmount = Number(invoice.tax_amount ?? 0);
    const items = invoice.items?.length
      ? invoice.items.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          unit_price: Number(item.unit_price ?? 0),
          total_price: Number(item.total_price ?? 0),
        }))
      : [
          {
            product_id: invoice.id,
            name: 'Fatura toplamı',
            quantity: 1,
            unit_price: total,
            total_price: total,
          },
        ];

    return {
      invoice_id: invoice.id,
      order_id: invoice.order_id ?? invoice.id,
      created_at: invoice.created_at,
      customer_name: invoice.customer_name,
      customer_email: invoice.customer_email ?? '',
      delivery_address: invoice.delivery_address ?? '',
      items,
      subtotal,
      tax_amount: taxAmount,
      total_amount: total,
      payment_method: invoice.payment_method ?? 'Kredi Kartı',
    };
  };

  const createInvoicePdf = async (invoice: AdminInvoiceListItem) => {
    setInvoiceForPdf({
      invoice: buildInvoiceDocumentData(invoice),
      invoiceNumber: invoice.invoice_number,
    });

    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const input = document.getElementById('admin-invoice-pdf-content');
    if (!input) throw new Error('Invoice document could not be rendered.');

    const dataUrl = await toPng(input, {
      quality: 1,
      pixelRatio: 2,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  const handleDownloadPdf = async (invoice: AdminInvoiceListItem) => {
    setDownloadError(null);
    setDownloadingId(invoice.id);

    try {
      const pdf = await createInvoicePdf(invoice);
      pdf.save(`${invoice.invoice_number}.pdf`);
    } catch {
      setDownloadError('Fatura PDF dosyası indirilemedi.');
    } finally {
      setDownloadingId(null);
      setInvoiceForPdf(null);
    }
  };

  const handleViewInvoice = (invoice: AdminInvoiceListItem) => {
    setPreviewInvoice({
      invoice: buildInvoiceDocumentData(invoice),
      invoiceNumber: invoice.invoice_number,
      source: invoice,
    });
  };

  const handlePrintInvoice = async (invoice: AdminInvoiceListItem) => {
    setDownloadError(null);

    try {
      const pdf = await createInvoicePdf(invoice);
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      // Create a hidden iframe to trigger the print dialog without opening a new tab
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          // Fallback: open in new tab if iframe print fails (e.g. cross-origin)
          window.open(blobUrl, '_blank');
        }

        // Clean up iframe and blob URL after a delay to let print dialog finish
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      };

      iframe.src = blobUrl;
    } catch {
      setDownloadError('Fatura yazdırma ekranı açılamadı.');
    } finally {
      setInvoiceForPdf(null);
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
            <h2 className="text-xl font-bold text-slate-900">Yetkisiz Erişim</h2>
            <p className="mt-1 text-sm text-slate-500">
              Bu sayfaya erişim için satış yöneticisi yetkisi gereklidir.
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
            <span className="font-bold text-slate-700">Faturalar</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-2">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Faturalar
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Tarih aralığına göre faturaları görüntüleyin ve PDF olarak indirin.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={loadInvoices}
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

      {downloadError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {downloadError}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">
          Toplam <span className="font-black text-slate-900">{data.total}</span> fatura
        </p>
        <p className="text-sm font-semibold text-slate-500">
          Sayfa <span className="font-black text-slate-900">{data.page}</span> / {totalPages}
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm font-medium text-slate-500">Faturalar yükleniyor...</p>
          </div>
        </div>
      ) : fetchError ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-red-100">
          <div className="mb-4 rounded-2xl bg-red-50 p-4">
            <FileText className="h-10 w-10 text-red-300" />
          </div>
          <p className="text-lg font-bold text-red-600">Faturalar yüklenemedi.</p>
          <p className="mt-1 text-sm text-red-400">
            Lütfen bağlantınızı kontrol edip tekrar deneyin.
          </p>
          <button
            onClick={loadInvoices}
            className="mt-4 text-sm font-medium text-indigo-600 hover:underline"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <AdminInvoicesTable
          invoices={data.items}
          onViewInvoice={handleViewInvoice}
          onDownloadPdf={handleDownloadPdf}
          downloadingId={downloadingId}
        />
      )}

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page <= 1 || loading}
          title="Önceki sayfa"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-16 rounded-xl bg-slate-50 px-4 py-2 text-center text-sm font-bold text-slate-700">
          {page}
        </span>
        <button
          type="button"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page >= totalPages || loading}
          title="Sonraki sayfa"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {invoiceForPdf && (
        <div className="fixed left-[-10000px] top-0 w-[896px] bg-white">
          <InvoiceDocument
            id="admin-invoice-pdf-content"
            invoice={invoiceForPdf.invoice}
            invoiceNumber={invoiceForPdf.invoiceNumber}
          />
        </div>
      )}

      {previewInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewInvoice(null)}
        >
          <div
            className="w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Fatura Önizleme
                </p>
                <p className="text-sm font-black text-slate-900">
                  {previewInvoice.invoiceNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintInvoice(previewInvoice.source)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Printer className="h-4 w-4" />
                  Yazdır
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(previewInvoice.source)}
                  disabled={downloadingId === previewInvoice.source.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  PDF İndir
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewInvoice(null)}
                  title="Kapat"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-130px)] overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <InvoiceDocument
                id="admin-invoice-preview-content"
                invoice={previewInvoice.invoice}
                invoiceNumber={previewInvoice.invoiceNumber}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

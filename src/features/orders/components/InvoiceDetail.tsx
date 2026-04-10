'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
  CreditCard,
  Building2,
  Banknote,
  Package,
} from 'lucide-react';
import type { Invoice, PaymentMethod, PaymentStatus } from '../types/order.types';
import { useAuthStore } from '@/features/auth';

interface InvoiceDetailProps {
  invoice: Invoice;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return (
    amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' TL'
  );
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, { label: string; Icon: React.ElementType }> = {
  credit_card: { label: 'Kredi Kartı', Icon: CreditCard },
  debit_card: { label: 'Banka Kartı', Icon: CreditCard },
  bank_transfer: { label: 'Havale / EFT', Icon: Building2 },
  cash_on_delivery: { label: 'Kapıda Ödeme', Icon: Banknote },
};

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; bg: string; text: string; Icon: React.ElementType }
> = {
  paid:     { label: 'Ödendi',     bg: 'bg-emerald-50', text: 'text-emerald-700', Icon: CheckCircle },
  pending:  { label: 'Beklemede', bg: 'bg-amber-50',   text: 'text-amber-700',   Icon: Clock },
  refunded: { label: 'İade Edildi', bg: 'bg-blue-50',  text: 'text-blue-700',    Icon: RefreshCcw },
  failed:   { label: 'Başarısız', bg: 'bg-rose-50',    text: 'text-rose-700',    Icon: XCircle },
};

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const { order } = invoice;
  const { user } = useAuthStore();
  const invoiceCardRef = useRef<HTMLDivElement>(null);

  // Use the logged-in user's name — fall back to billing address as stored in order
  const buyerName = user?.name ?? order.billingAddress.fullName;

  const paymentMethodCfg = PAYMENT_METHOD_LABELS[order.paymentMethod];
  const paymentStatusCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus];
  const PaymentIcon = paymentMethodCfg.Icon;
  const StatusIcon = paymentStatusCfg.Icon;

  const handlePrint = () => window.print();

  /**
   * Uses html-to-image (SVG foreignObject approach) which correctly handles
   * modern CSS color functions (oklch, lab, etc.) used by Tailwind.
   * Screenshots the rendered invoice card and embeds it in an A4 jsPDF.
   */
  const handleDownloadPDF = async () => {
    const card = invoiceCardRef.current;
    if (!card) return;

    try {
      const dataUrl = await toPng(card, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: { borderRadius: '0' },  // avoid clipping artifacts
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((res) => { img.onload = () => res(); });

      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 10;
      const usableW = pageW - margin * 2;
      const imgH = (img.height * usableW) / img.width;

      if (imgH <= pageH - margin * 2) {
        doc.addImage(dataUrl, 'PNG', margin, margin, usableW, imgH);
      } else {
        // Slice into pages
        const pageImgH = pageH - margin * 2;
        const totalPages = Math.ceil(imgH / pageImgH);
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) doc.addPage();
          doc.addImage(dataUrl, 'PNG', margin, margin - i * pageImgH, usableW, imgH);
        }
      }

      doc.save(`Fatura-${invoice.invoiceNo}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF oluşturulamadı. Lütfen Yazdır butonunu kullanarak PDF olarak kaydedin.');
    }
  };


  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-slate-400">
        <Link href="/" className="transition-colors hover:text-indigo-600">Ana Sayfa</Link>
        <span className="mx-2">•</span>
        <Link href="/orders" className="transition-colors hover:text-indigo-600">Siparişlerim</Link>
        <span className="mx-2">•</span>
        <span className="font-semibold text-slate-700">Fatura #{order.orderNumber}</span>
      </div>

      {/* Page Title */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Fatura Detayı</h1>
          <p className="mt-1 text-sm text-slate-500">Siparişinize ait resmi fatura bilgileri</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-95"
          >
            <Printer className="h-4 w-4" />
            Yazdır
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95"
          >
            <Download className="h-4 w-4" />
            PDF İndir
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div ref={invoiceCardRef} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

        {/* ── Gradient Header ── */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 px-8 py-7 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-base font-black tracking-widest text-indigo-100/90">
                SUpplements
              </p>
              <h2 className="text-3xl font-black tracking-tight">FATURA</h2>
            </div>
            <div className="text-right">
              <p className="text-xl font-black tabular-nums">{invoice.invoiceNo}</p>
              <p className="mt-1 text-sm text-indigo-200">Sipariş #{invoice.orderNumber}</p>
            </div>
          </div>
        </div>

        {/* ── Metadata strip (white, below gradient) ── */}
        <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
          {[
            {
              label: 'Fatura Tarihi',
              value: <span className="font-semibold text-slate-800">{formatDate(invoice.invoiceDate)}</span>,
            },
            {
              label: 'Sipariş Tarihi',
              value: <span className="font-semibold text-slate-800">{formatDate(order.orderDate)}</span>,
            },
            {
              label: 'Ödeme Yöntemi',
              value: (
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <PaymentIcon className="h-3.5 w-3.5 text-slate-400" />
                  {paymentMethodCfg.label}
                </span>
              ),
            },
            {
              label: 'Ödeme Durumu',
              value: (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${paymentStatusCfg.bg} ${paymentStatusCfg.text}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {paymentStatusCfg.label}
                </span>
              ),
            },
          ].map((cell) => (
            <div key={cell.label} className="flex flex-col gap-1 bg-white px-6 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {cell.label}
              </p>
              <div className="text-sm">{cell.value}</div>
            </div>
          ))}
        </div>

        {/* ── Billing Address ── */}
        <div className="border-t border-slate-100 px-8 py-6">
          <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Package className="h-3.5 w-3.5" />
            Fatura Adresi
          </h3>
          <div className="flex gap-4">
            {/* left accent bar */}
            <div className="w-0.5 shrink-0 rounded-full bg-indigo-100" />
            <div className="text-sm leading-loose text-slate-600">
              <p className="font-bold text-slate-900">{buyerName}</p>
              <p>{order.billingAddress.phone}</p>
              <p>{order.billingAddress.addressLine1}</p>
              {order.billingAddress.addressLine2 && <p>{order.billingAddress.addressLine2}</p>}
              <p>
                {order.billingAddress.district} / {order.billingAddress.city}
                {order.billingAddress.postalCode && `, ${order.billingAddress.postalCode}`}
              </p>
              <p>{order.billingAddress.country}</p>
            </div>
          </div>
        </div>

        {/* ── Product Line Items ── */}
        <div className="border-t border-slate-100 px-8 pb-0 pt-6">
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Sipariş Edilen Ürünler
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Ürün
                  </th>
                  <th className="pb-3 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Adet
                  </th>
                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Birim Fiyat
                  </th>
                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Tutar
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr
                    key={`${item.productId}-${idx}`}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                  >
                    <td className="py-3.5 pr-4 font-medium text-slate-800">{item.productName}</td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-xs font-bold text-indigo-600">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-slate-500">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="mt-4 border-t border-slate-100 py-6">
            <div className="ml-auto max-w-[260px] space-y-2.5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Ara Toplam</span>
                <span className="font-semibold text-slate-800">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Kargo</span>
                <span className="font-semibold">
                  {order.shippingCost === 0 ? (
                    <span className="font-bold text-emerald-600">Ücretsiz</span>
                  ) : (
                    <span className="text-slate-800">{formatCurrency(order.shippingCost)}</span>
                  )}
                </span>
              </div>
              {/* Divider */}
              <div className="h-px bg-slate-200" />
              {/* Total */}
              <div className="flex items-center justify-between rounded-xl bg-indigo-600 px-4 py-3 text-white">
                <span className="text-sm font-bold uppercase tracking-wide opacity-80">Toplam</span>
                <span className="text-lg font-black tabular-nums">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer note ── */}
        <div className="border-t border-slate-100 bg-slate-50 px-8 py-5">
          <p className="text-center text-[11px] leading-relaxed text-slate-500">
            Bu belge <span className="font-semibold text-slate-600">SUpplements</span> tarafından
            elektronik ortamda oluşturulmuştur. Resmi belge niteliği taşımaz;
            yasal fatura e‑posta adresinize ayrıca iletilmektedir.
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6 print:hidden">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Siparişlerime Dön
        </Link>
      </div>
    </div>
  );
}


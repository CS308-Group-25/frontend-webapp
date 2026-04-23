'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  ArrowLeft,
  FileText,
  Printer,
  Download,
  Loader2,
  AlertCircle,
  Building2,
  User,
  MapPin,
  Calendar,
  Hash,
  CreditCard,
  CheckCircle2,
  Package,
  Banknote,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { fetchInvoice } from '../api';
import { Invoice } from '../types';

interface InvoiceDetailPageProps {
  orderId: string;
}

function formatTurkishDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number) {
  const safeAmount = typeof amount === 'number' ? amount : 0;
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

export default function InvoiceDetailPage({ orderId }: InvoiceDetailPageProps) {
  const {
    data: invoice,
    isLoading,
    isError,
    error,
  } = useQuery<Invoice>({
    queryKey: ['invoice', orderId],
    queryFn: () => fetchInvoice(orderId),
    retry: 1,
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const input = document.getElementById('invoice-content');
    if (!input || !invoice) return;

    setIsGeneratingPdf(true);
    try {
      // We use html-to-image instead of html2canvas to avoid CSS parsing errors with Tailwind v4 (e.g. lab() colors)
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
      pdf.save(`Fatura_INV-${invoice.invoice_id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('PDF oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <ProtectedRoute>
      {/* Print-hide elements */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .invoice-container { box-shadow: none !important; border: none !important; }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        {/* Top bar – hidden on print */}
        <div className="no-print bg-white border-b border-slate-100 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/orders/${orderId}`}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
                aria-label="Siparişe Dön"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h1 className="text-base font-black text-slate-900">Fatura Detayı</h1>
              </div>
            </div>
            {invoice && (
              <div className="flex items-center gap-3">
                <button
                  id="btn-print-invoice"
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Yazdır
                </button>
                <button
                  id="btn-download-pdf"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm shadow-indigo-200"
                >
                  {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isGeneratingPdf ? 'İndiriliyor...' : 'PDF İndir'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Fatura yükleniyor...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
              </div>
              <p className="text-red-700 font-bold">Fatura bulunamadı</p>
              <p className="text-red-400 text-sm mt-1">
                {typeof error === 'string' ? error : 'Bu siparişe ait fatura henüz oluşturulmamış olabilir.'}
              </p>
              <Link
                href={`/orders/${orderId}`}
                className="inline-block mt-5 px-5 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-xl hover:bg-indigo-800 transition-colors"
              >
                Siparişe Dön
              </Link>
            </div>
          )}

          {/* Invoice */}
          {!isLoading && !isError && invoice && (
            <div id="invoice-content" className="invoice-container bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Invoice Header */}
              <div className="bg-[#5D5CFF] px-10 py-10 text-white rounded-t-2xl">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <p className="text-sm font-bold tracking-widest text-indigo-200 uppercase mb-2">Supplements</p>
                    <h2 className="text-4xl font-black tracking-tight">FATURA</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black">INV-{invoice.invoice_id}</p>
                    <p className="text-indigo-200 text-sm mt-1">Sipariş #{invoice.order_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-indigo-200 font-bold mb-2 uppercase tracking-wider">Tarih</p>
                    <p className="font-bold text-base">{formatTurkishDate(invoice.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-200 font-bold mb-2 uppercase tracking-wider">Ödeme Yöntemi</p>
                    <div className="flex items-center gap-1.5 text-base font-bold">
                      {invoice.payment_method?.includes('Nakit') || invoice.payment_method?.includes('Kapıda') ? (
                        <Banknote className="w-5 h-5" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                      {invoice.payment_method || 'Kredi Kartı'}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-200 font-bold mb-2 uppercase tracking-wider">Ödeme Durumu</p>
                    <div className="inline-flex items-center gap-1.5 bg-white text-emerald-600 px-3 py-1 rounded-full text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Ödendi
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-200 font-bold mb-2 uppercase tracking-wider">Sipariş Tarihi</p>
                    <p className="font-bold text-base">{formatTurkishDate(invoice.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="px-10 py-8 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-5">
                  <Package className="w-5 h-5 text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fatura Adresi</h3>
                </div>
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-900 text-lg">{invoice.customer_name}</p>
                  <p className="text-slate-600">+90 532 000 00 00</p>
                  <p className="text-slate-600">{invoice.delivery_address}</p>
                  <p className="text-slate-600">Türkiye</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="px-10 py-8">
                <div className="mb-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Ürünler</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="text-left pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ürün</th>
                      <th className="text-center pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Adet</th>
                      <th className="text-right pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32">Birim Fiyat</th>
                      <th className="text-right pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(invoice.items || []).map((item, index) => (
                      <tr key={`${item.product_id}-${index}`}>
                        <td className="py-5 pr-4">
                          <p className="font-semibold text-slate-900 text-base">{item.name}</p>
                        </td>
                        <td className="py-5 text-center">
                          <span className="inline-flex items-center justify-center bg-indigo-50 text-[#5D5CFF] font-bold px-3.5 py-1.5 rounded-xl text-sm">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-5 text-right text-slate-500 text-base">
                          {formatCurrency(item.unit_price || (item.total_price / item.quantity))} TL
                        </td>
                        <td className="py-5 text-right font-bold text-slate-900 text-base">
                          {formatCurrency(item.total_price)} TL
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="px-8 pb-8">
                <div className="ml-auto max-w-xs space-y-2 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Ara Toplam</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(invoice.subtotal)} TL</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">KDV (%1)</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(invoice.tax_amount)} TL</span>
                  </div>
                  {(invoice.payment_method?.includes('Nakit') || invoice.payment_method?.includes('Kapıda')) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Kapıda Ödeme Hizmet Bedeli</span>
                      <span className="font-semibold text-slate-800">59.90 TL</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-base font-black text-slate-900">Genel Toplam</span>
                    <span className="text-xl font-black text-indigo-700">{formatCurrency(invoice.total_amount)} TL</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-8 py-5">
                <p className="text-xs text-slate-400 text-center">
                  Bu fatura <span className="font-semibold text-slate-600">SUpplements</span> tarafından elektronik olarak düzenlenmiştir.
                  Herhangi bir sorunuz için lütfen <span className="font-semibold text-slate-600">supplements@cs308.com</span> adresiyle iletişime geçin.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

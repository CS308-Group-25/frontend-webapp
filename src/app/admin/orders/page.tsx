'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  FileText,
  Home,
  MapPin,
  Package,
  ShieldX,
  Truck,
  X,
} from 'lucide-react';
import DeliveryQueueTable from '@/features/admin/orders/components/DeliveryQueueTable';
import { fetchAdminOrders, updateOrderStatus } from '@/features/admin/orders/api';
import { AdminOrder, OrderStatus } from '@/features/admin/orders/types';
import { useAuthStore } from '@/features/auth';
import InvoiceDocument from '@/features/orders/components/InvoiceDocument';
import { Invoice } from '@/features/orders/types';
import { fetchProducts } from '@/features/products';
import type { Product } from '@/features/products';

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tüm Siparişler' },
  { value: 'confirmed', label: 'Onaylandı' },
  { value: 'processing', label: 'Hazırlanıyor' },
  { value: 'in_transit', label: 'Kargoya Verildi' },
  { value: 'delivered', label: 'Teslim Edildi' },
];

const TRACKER_STEPS = [
  { id: 'confirmed', label: 'Sipariş Alındı', icon: FileText },
  { id: 'processing', label: 'Hazırlanıyor', icon: Package },
  { id: 'in_transit', label: 'Kargoya Verildi', icon: Truck },
  { id: 'delivered', label: 'Teslim Edildi', icon: Home },
];

function formatDateTime(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatVariantName(value?: string | null) {
  if (!value) return '';

  try {
    const parsed = JSON.parse(value) as { flavor?: string; size?: string };
    return [parsed.flavor, parsed.size].filter(Boolean).join(' / ');
  } catch {
    return value;
  }
}

export default function AdminDeliveryQueuePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<{
    invoice: Invoice;
    invoiceNumber: string;
    source: AdminOrder;
  } | null>(null);
  const [invoiceForPdf, setInvoiceForPdf] = useState<{
    invoice: Invoice;
    invoiceNumber: string;
  } | null>(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<number | null>(null);

  const isAuthorized = isAuthenticated && user?.role === 'product_manager';

  const loadOrders = () => {
    setFetchError(false);
    setLoading(true);
    fetchAdminOrders()
      .then(setOrders)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthorized) return;
    fetchAdminOrders()
      .then(setOrders)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [isAuthorized]);

  const filteredOrders = useMemo(
    () => selectedStatus ? orders.filter((o) => o.status === selectedStatus) : orders,
    [orders, selectedStatus]
  );
  const { data: productsData } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => fetchProducts(),
    enabled: isAuthorized,
  });
  const cachedProducts: Product[] = productsData?.items ?? [];

  const handleViewOrder = (orderId: number) => {
    const order = orders.find((item) => item.order_id === orderId);
    if (order) setSelectedOrder(order);
  };

  const buildInvoiceDocumentData = (order: AdminOrder): Invoice => {
    const items = order.items.map((item) => ({
      product_id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      unit_price: Number(item.price),
      total_price: Number(item.price) * item.quantity,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = parseFloat((subtotal * 0.01).toFixed(2));
    const isCod = order.payment_method?.includes('Kapıda') || order.payment_method?.includes('Nakit');
    const serviceFee = isCod ? 59.9 : 0;

    return {
      invoice_id: order.invoice_id ?? order.order_id,
      invoice_number: order.invoice_number ?? `INV-${new Date(order.created_at).getFullYear()}-${String(order.order_id).padStart(5, '0')}`,
      order_id: order.order_id,
      created_at: order.created_at,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      delivery_address: order.delivery_address,
      items,
      subtotal,
      tax_amount: taxAmount,
      total_amount: parseFloat((subtotal + taxAmount + serviceFee).toFixed(2)),
      payment_method: order.payment_method ?? 'Kredi Kartı',
    };
  };

  const handleViewInvoice = (order: AdminOrder) => {
    setPreviewInvoice({
      invoice: buildInvoiceDocumentData(order),
      invoiceNumber: order.invoice_number ?? `INV-${new Date(order.created_at).getFullYear()}-${String(order.order_id).padStart(5, '0')}`,
      source: order,
    });
  };

  const handleDownloadInvoice = async (order: AdminOrder) => {
    const invoiceNumber = order.invoice_number ?? `INV-${new Date(order.created_at).getFullYear()}-${String(order.order_id).padStart(5, '0')}`;
    setDownloadingInvoiceId(order.order_id);
    try {
      setInvoiceForPdf({
        invoice: buildInvoiceDocumentData(order),
        invoiceNumber,
      });
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const input = document.getElementById('admin-order-invoice-pdf-content');
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
      pdf.save(`${invoiceNumber}.pdf`);
    } finally {
      setDownloadingInvoiceId(null);
      setInvoiceForPdf(null);
    }
  };

  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    const previous = orders;
    setOrders((prev) =>
      prev.map((order) =>
        order.order_id === orderId ? { ...order, status } : order
      )
    );

    try {
      await updateOrderStatus(orderId, status);
    } catch {
      setOrders(previous);
      setUpdateError('Durum güncellenemedi, lütfen tekrar deneyin.');
      setTimeout(() => setUpdateError(null), 3000);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
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
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-red-50 rounded-2xl">
            <ShieldX className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Siparişler Yüklenemedi</h2>
            <p className="mt-1 text-sm text-slate-500">
              Bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.
            </p>
          </div>
          <button
            onClick={loadOrders}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-2 text-sm text-slate-400">
          <Link href="/" className="transition-colors hover:text-indigo-600">Ana Sayfa</Link>
          <span className="mx-2">•</span>
          <span className="font-bold text-slate-700">Yönetim Paneli</span>
          <span className="mx-2">•</span>
          <span className="font-bold text-slate-700">Teslimat Kuyruğu</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Truck className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Teslimat Kuyruğu
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Siparişlerin teslimat durumlarını görüntüleyin ve yönetin.
            </p>
          </div>
        </div>
      </div>

      {updateError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {updateError}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => {
          const isActive = option.value === 'all' ? !selectedStatus : selectedStatus === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value === 'all' ? undefined : option.value as OrderStatus)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <DeliveryQueueTable orders={filteredOrders} onViewOrder={handleViewOrder} onUpdateStatus={handleUpdateStatus} />

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-7 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-6xl overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Sipariş Detayı
                </p>
                <h2 className="mt-1 text-3xl font-black text-slate-950">
                  #{selectedOrder.order_id}
                </h2>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleViewInvoice(selectedOrder)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700 transition-colors hover:bg-indigo-50"
                >
                  <FileText className="h-4 w-4" />
                  Fatura Görüntüle
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  disabled={downloadingInvoiceId === selectedOrder.order_id}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  PDF İndir
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  title="Kapat"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_520px]">
              <div className="divide-y divide-slate-100 lg:border-r lg:border-slate-100">
                <section className="px-7 py-7">
                  <h3 className="mb-8 text-sm font-black uppercase tracking-[0.22em] text-slate-800">
                    Teslimat Durumu
                  </h3>
                  <div className="relative flex items-start justify-between px-3">
                    <div className="absolute left-12 right-12 top-7 h-1.5 rounded-full bg-slate-100" />
                    {TRACKER_STEPS.map((step) => {
                      const activeIndex = Math.max(
                        0,
                        TRACKER_STEPS.findIndex((item) => item.id === selectedOrder.status),
                      );
                      const index = TRACKER_STEPS.findIndex((item) => item.id === step.id);
                      const isActive = index <= activeIndex;
                      const Icon = step.icon;
                      return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
                          <div className={`flex h-14 w-14 items-center justify-center rounded-full border-4 transition-colors ${
                            isActive
                              ? 'border-indigo-100 bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                              : 'border-white bg-slate-50 text-slate-300 ring-1 ring-slate-200'
                          }`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className={`text-sm font-black ${
                            isActive ? 'text-slate-900' : 'text-slate-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="px-7 py-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-500">Sipariş No</span>
                      <span className="font-black text-slate-900">#{selectedOrder.order_id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-500">Sipariş Tarihi</span>
                      <span className="font-bold text-slate-900">{formatDateTime(selectedOrder.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-500">Sipariş Tutarı</span>
                      <span className="font-black text-slate-900">
                        {Number(selectedOrder.total).toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} TL / {selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)} ürün
                      </span>
                    </div>
                  </div>
                </section>

                <section className="px-7 py-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500">
                    <MapPin className="h-4 w-4" />
                    Teslimat Adresi
                  </h3>
                  <p className="text-sm font-medium leading-6 text-slate-700">
                    {selectedOrder.delivery_address}
                  </p>
                </section>
              </div>

              <aside className="border-t border-slate-100 px-7 py-7 lg:border-t-0">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="space-y-5 border-b border-slate-100 pb-6">
                    {selectedOrder.items.map((item, index) => {
                      const product = cachedProducts.find((p) => p.id === String(item.product_id));
                      const imageSrc = product?.image ?? '/placeholder.png';
                      const variantName = formatVariantName(item.variant_name);

                      return (
                        <div
                          key={`${item.product_id}-${index}`}
                          className="grid grid-cols-[64px_minmax(0,1fr)_104px] items-start gap-4"
                        >
                          <div className="relative">
                            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                              <Image
                                src={imageSrc}
                                alt={item.name}
                                fill
                                className="object-contain p-1.5"
                                sizes="64px"
                              />
                            </div>
                            <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-black leading-5 text-slate-900">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs font-bold leading-4 text-slate-400">
                              {variantName || `${item.quantity} ürün`}
                            </p>
                          </div>
                          <p className="whitespace-nowrap text-right text-sm font-black leading-5 text-slate-950">
                            {(item.price * item.quantity).toLocaleString('tr-TR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })} TL
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-b border-slate-100 py-6 text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-slate-950">Toplam</span>
                      <span className="text-2xl font-black tracking-tight text-slate-950">
                        {Number(selectedOrder.total).toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} TL
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      Vergi {(Number(selectedOrder.total) * 0.01).toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} TL
                    </p>
                    {(selectedOrder.payment_method?.includes('Kapıda') || selectedOrder.payment_method?.includes('Nakit')) && (
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        Kapıda Ödeme Hizmet Bedeli 59.90 TL
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-5">
                    <Package className="h-5 w-5 text-slate-400" />
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-black text-blue-700">
                      Oluşturuldu
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {previewInvoice && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewInvoice(null)}
        >
          <div className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
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
                  onClick={() => handleDownloadInvoice(previewInvoice.source)}
                  disabled={downloadingInvoiceId === previewInvoice.source.order_id}
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
                id="admin-order-invoice-preview-content"
                invoice={previewInvoice.invoice}
                invoiceNumber={previewInvoice.invoiceNumber}
              />
            </div>
          </div>
        </div>
      )}

      {invoiceForPdf && (
        <div className="fixed left-[-10000px] top-0 w-[896px] bg-white">
          <InvoiceDocument
            id="admin-order-invoice-pdf-content"
            invoice={invoiceForPdf.invoice}
            invoiceNumber={invoiceForPdf.invoiceNumber}
          />
        </div>
      )}
    </div>
  );
}

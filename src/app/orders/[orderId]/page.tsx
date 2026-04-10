
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  PackageSearch,
  XCircle,
} from 'lucide-react';
import { findOrderByNumber, OrderStatus } from '@/features/orders';
import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge';
import OrderProductRow from '@/features/orders/components/OrderProductRow';
import { mockProducts } from '@/features/products';
import BuyerName from './BuyerName';

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  return {
    title: `Sipariş #${orderId} | SUpplements`,
  };
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatCurrency(amount: number) {
  return (
    amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' TL'
  );
}

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ElementType }[] = [
  { key: 'processing', label: 'Hazırlanıyor', icon: Clock },
  { key: 'shipped',    label: 'Kargoya Verildi', icon: Truck },
  { key: 'delivered',  label: 'Teslim Edildi', icon: CheckCircle2 },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  processing: 0,
  shipped: 1,
  delivered: 2,
  cancelled: -1,
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const order = findOrderByNumber(orderId);

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
            <Package className="h-10 w-10 text-slate-300" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-800">Sipariş bulunamadı</p>
            <p className="mt-1 text-sm text-slate-400">
              #{orderId} numaralı siparişe erişilemiyor.
            </p>
          </div>
          <Link
            href="/orders"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Siparişlerime Dön
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_ORDER[order.status];
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Left Back Button */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Siparişlerime Dön
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Sipariş #{order.orderNumber}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              {formatDate(order.orderDate)}
            </span>
            <OrderStatusBadge status={order.status} size="sm" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/orders/${order.orderNumber}/invoice`}
            className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition-all hover:bg-indigo-600 hover:text-white active:scale-95"
          >
            <FileText className="h-4 w-4" />
            Faturayı Görüntüle
          </Link>
          {order.trackingNumber && (
            <Link
              href={`https://www.ptt.gov.tr/ara?barkod=${order.trackingNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-95"
            >
              <Truck className="h-4 w-4" />
              Kargo Takibi
            </Link>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 px-8 py-6">
        <h2 className="mb-5 text-xs font-bold uppercase tracking-wider text-slate-400">
          Sipariş Durumu
        </h2>

        {isCancelled ? (
          <div className="flex items-center gap-3 rounded-xl bg-rose-50 px-5 py-4 ring-1 ring-rose-200">
            <XCircle className="h-5 w-5 flex-shrink-0 text-rose-500" />
            <div>
              <p className="font-bold text-rose-800">Sipariş İptal Edildi</p>
              <p className="mt-0.5 text-sm text-rose-600">
                Bu sipariş iptal edilmiştir.
                {order.paymentStatus === 'refunded' && ' İadesi hesabınıza yansıtılmıştır.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative flex items-start justify-between gap-2">
            {/* Progress line */}
            <div className="absolute left-0 right-0 top-5 mx-auto h-0.5 bg-slate-100" style={{ width: 'calc(100% - 40px)', left: '20px' }}>
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-white text-slate-300'
                    } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-center text-xs font-bold ${
                      isCompleted ? 'text-indigo-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {order.estimatedDelivery && !isCancelled && order.status !== 'delivered' && (
          <p className="mt-5 text-center text-xs text-slate-500">
            Tahmini Teslimat:{' '}
            <span className="font-bold text-slate-700">{formatDate(order.estimatedDelivery)}</span>
          </p>
        )}
        {order.trackingNumber && !isCancelled && (
          <p className="mt-2 text-center text-xs text-slate-400">
            Kargo Takip No:{' '}
            <span className="font-mono font-semibold text-slate-600">{order.trackingNumber}</span>
          </p>
        )}
      </div>

      {/* Products */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-100 px-8 py-4">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <PackageSearch className="h-4 w-4" />
            Sipariş Edilen Ürünler
          </h2>
        </div>
        <div className="divide-y divide-slate-50 px-8">
          {order.items.map((item, idx) => {
            const product = mockProducts.find((p) => p.id === item.productId);
            return (
              <OrderProductRow
                key={`${item.productId}-${idx}`}
                orderId={order.orderNumber}
                orderStatus={order.status}
                userId="current-user"
                item={item}
                productImage={product?.image}
              />
            );
          })}
        </div>

        {/* Pricing summary */}
        <div className="border-t border-slate-100 bg-slate-50 px-8 py-5">
          <div className="ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Ara Toplam</span>
              <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Kargo</span>
              <span className="font-semibold">
                {order.shippingCost === 0 ? (
                  <span className="font-bold text-emerald-600">Ücretsiz</span>
                ) : (
                  formatCurrency(order.shippingCost)
                )}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-slate-900">
              <span>Toplam</span>
              <span className="text-indigo-700">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 px-8 py-6">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <MapPin className="h-4 w-4" />
          Teslimat / Fatura Adresi
        </h2>
        <div className="text-sm leading-relaxed text-slate-700">
          <BuyerName fallback={order.billingAddress.fullName} />
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

      {/* Payment info */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 px-8 py-6">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <CreditCard className="h-4 w-4" />
          Ödeme Bilgileri
        </h2>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-xs text-slate-400">Yöntem</p>
            <p className="mt-0.5 font-semibold text-slate-800">
              {order.paymentMethod === 'credit_card' && 'Kredi Kartı'}
              {order.paymentMethod === 'debit_card' && 'Banka Kartı'}
              {order.paymentMethod === 'bank_transfer' && 'Havale / EFT'}
              {order.paymentMethod === 'cash_on_delivery' && 'Kapıda Ödeme'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Durum</p>
            <p className={`mt-0.5 font-bold ${
              order.paymentStatus === 'paid' ? 'text-emerald-600' :
              order.paymentStatus === 'refunded' ? 'text-blue-600' :
              order.paymentStatus === 'failed' ? 'text-rose-600' : 'text-amber-600'
            }`}>
              {order.paymentStatus === 'paid' && 'Ödendi'}
              {order.paymentStatus === 'pending' && 'Beklemede'}
              {order.paymentStatus === 'refunded' && 'İade Edildi'}
              {order.paymentStatus === 'failed' && 'Başarısız'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

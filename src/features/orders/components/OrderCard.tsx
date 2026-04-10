'use client';

import Link from 'next/link';
import { Calendar, PackageSearch, FileText, Truck, ChevronRight } from 'lucide-react';
import type { Order } from '../types/order.types';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderCardProps {
  order: Order;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' TL';
}

export default function OrderCard({ order }: OrderCardProps) {
  const previewItems = order.items.slice(0, 3);
  const overflow = order.items.length - previewItems.length;

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md hover:ring-indigo-100">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <PackageSearch className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sipariş
            </p>
            <p className="text-base font-extrabold text-slate-900">
              #{order.orderNumber}
            </p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Card Body */}
      <div className="px-6 py-5">
        {/* Meta row */}
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            {formatDate(order.orderDate)}
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-bold text-slate-900">
            {formatCurrency(order.total)}
          </span>
          {order.shippingCost === 0 && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
              Ücretsiz Kargo
            </span>
          )}
        </div>

        {/* Product Summary */}
        <div className="mb-5 space-y-1.5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Ürünler
          </p>
          {previewItems.map((item) => (
            <div key={item.productId} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-xs font-bold text-indigo-600">
                  {item.quantity}
                </span>
                {item.productName}
              </span>
              <span className="shrink-0 text-sm font-semibold text-slate-600">
                {formatCurrency(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
          {overflow > 0 && (
            <p className="text-xs font-semibold text-indigo-500">
              +{overflow} ürün daha
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Link
            href={`/orders/${order.orderNumber}`}
            className="flex flex-1 min-w-[130px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            Sipariş Detayı
          </Link>

          <Link
            href={`/orders/${order.orderNumber}/invoice`}
            className="flex flex-1 min-w-[130px] items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 transition-all hover:bg-indigo-600 hover:text-white active:scale-95"
          >
            <FileText className="h-3.5 w-3.5" />
            Fatura
          </Link>

          {order.trackingNumber ? (
            <Link
              href={`https://www.ptt.gov.tr/ara?barkod=${order.trackingNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 min-w-[130px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100 active:scale-95"
            >
              <Truck className="h-3.5 w-3.5" />
              Kargo Takibi
            </Link>
          ) : (
            <button
              disabled
              className="flex flex-1 min-w-[130px] cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-400"
            >
              <Truck className="h-3.5 w-3.5" />
              Kargo Takibi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

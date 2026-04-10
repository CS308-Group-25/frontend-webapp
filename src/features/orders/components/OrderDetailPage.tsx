'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Loader2,
  ChevronDown,
  Package,
  MapPin,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { fetchOrderById } from '../api';
import { Order, OrderItem } from '../types';
import OrderStatusBadge from './OrderStatusBadge';
import { mockProducts } from '@/features/products';

interface OrderDetailPageProps {
  orderId: string;
  isNewOrder?: boolean;
}

function formatTurkishDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function OrderItemRow({ item }: { item: OrderItem }) {
  const product = mockProducts.find((p) => p.id === String(item.product_id));
  const imageSrc = product?.image ?? '/placeholder.png';
  const name = product?.name ?? item.name;

  return (
    <div className="flex items-start gap-3">
      <div className="relative shrink-0">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-contain p-1"
            sizes="64px"
          />
        </div>
        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-indigo-700 text-white text-[10px] font-bold flex items-center justify-center">
          {item.quantity}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 line-clamp-2">{name}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {item.quantity} Paket
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-slate-900">{item.price * item.quantity} TL</p>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          {icon}
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-slate-100">{children}</div>}
    </div>
  );
}

export default function OrderDetailPage({ orderId, isNewOrder }: OrderDetailPageProps) {
  const {
    data: order,
    isLoading,
    isError,
  } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId),
    retry: 1,
  });

  const totalItems = order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const taxAmount = order
    ? parseFloat((order.total * 0.01 / 1.01).toFixed(2))
    : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Sipariş bilgileri yükleniyor...</p>
              </div>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto">
              <p className="text-red-600 font-bold">Sipariş bulunamadı.</p>
              <p className="text-red-400 text-sm mt-1">Sipariş numarasını kontrol edin.</p>
              <Link
                href="/orders"
                className="inline-block mt-4 px-5 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-xl hover:bg-indigo-800 transition-colors"
              >
                Siparişlerime Dön
              </Link>
            </div>
          )}

          {!isLoading && !isError && order && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
              {/* Left: Order info */}
              <div className="space-y-4">
                {/* Thank you / Status header */}
                {isNewOrder ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                      </div>
                      <h1 className="text-xl font-black text-slate-900">
                        Siparişiniz için teşekkür ederiz!
                      </h1>
                    </div>
                    <p className="text-sm text-slate-600">
                      Siparişiniz bize ulaşmıştır. Siparişiniz kargoya verildiğinde sizi
                      e-posta ile bilgilendireceğiz.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-black text-slate-900">Sipariş Detayı</h1>
                    <OrderStatusBadge status={order.status} />
                  </div>
                )}

                {/* Order meta */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Sipariş No</span>
                    <span className="font-bold text-slate-800">#{order.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Sipariş Tarihi</span>
                    <span className="font-semibold text-slate-800">{formatTurkishDate(order.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Sipariş Tutarı</span>
                    <span className="font-bold text-slate-800">
                      {order.total} TL / {totalItems} ürün
                    </span>
                  </div>
                </div>

                {/* Shipping Summary */}
                <CollapsibleSection
                  title="Teslimat Özeti"
                  icon={<MapPin className="w-4 h-4 text-slate-500" />}
                >
                  <p className="text-sm text-slate-700">{order.delivery_address}</p>
                </CollapsibleSection>

                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <p className="text-sm text-slate-500">
                    Yardıma mı ihtiyacınız var?{' '}
                    <a href="#" className="text-indigo-600 font-semibold hover:underline">
                      Bizimle iletişime geçin
                    </a>
                  </p>
                  <Link
                    href="/search"
                    className="px-6 py-3 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors text-sm"
                  >
                    Alışverişe Dön
                  </Link>
                </div>
              </div>

              {/* Right: Order Summary Panel */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
                <div className="flex flex-col gap-4 pb-4 border-b border-slate-100">
                  {order.items.map((item, index) => (
                    <OrderItemRow key={`${item.product_id}-${index}`} item={item} />
                  ))}
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-lg font-black text-slate-900">Toplam</span>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">{order.total} TL</p>
                    <p className="text-xs text-slate-400 font-medium">Vergi {taxAmount} TL</p>
                  </div>
                </div>
                {!isNewOrder && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400 shrink-0" />
                    <OrderStatusBadge status={order.status} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

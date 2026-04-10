'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { Order } from '../types';
import OrderStatusBadge from './OrderStatusBadge';
import { mockProducts } from '@/features/products';

interface OrderCardProps {
  order: Order;
}

function formatTurkishDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function OrderCard({ order }: OrderCardProps) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Try to get a product image for the first item
  const firstItem = order.items[0];
  const productImage = firstItem
    ? mockProducts.find((p) => p.id === String(firstItem.product_id))?.image ??
      firstItem.product_image ??
      null
    : null;

  const firstItemName = firstItem
    ? mockProducts.find((p) => p.id === String(firstItem.product_id))?.name ??
      firstItem.product_name
    : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Product Image */}
      <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
        {productImage ? (
          <Image
            src={productImage}
            alt={firstItemName}
            fill
            className="object-contain p-1"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-slate-300" />
          </div>
        )}
      </div>

      {/* Order Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <OrderStatusBadge status={order.status} />
        </div>
        <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">
          {firstItemName}
          {order.items.length > 1 && (
            <span className="text-slate-400 font-medium"> +{order.items.length - 1} ürün daha</span>
          )}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {formatTurkishDate(order.created_at)} Tarihinde Sipariş Verildi
        </p>
        <p className="text-xs text-slate-400">
          {order.order_number} numaralı sipariş
        </p>
      </div>

      {/* Total */}
      <div className="text-right shrink-0">
        <p className="font-black text-slate-900">{order.total_amount} TL</p>
        <p className="text-xs text-slate-400">{totalItems} ürün</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0 w-full sm:w-auto">
        <button
          onClick={() => {}}
          className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          Yeniden Sipariş Ver
        </button>
        <Link
          href={`/orders/${order.id}`}
          className="flex-1 sm:flex-none px-4 py-2 bg-indigo-700 text-white text-sm font-semibold rounded-xl hover:bg-indigo-800 transition-colors text-center"
        >
          Detayı Görüntüle
        </Link>
      </div>
    </div>
  );
}

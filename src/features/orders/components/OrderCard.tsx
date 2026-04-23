'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, FileText, Loader2 } from 'lucide-react';
import { Order } from '../types';
import OrderStatusBadge from './OrderStatusBadge';
import { mockProducts } from '@/features/products';
import { useCartStore } from '@/features/cart';
import { toast } from 'sonner';

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
  const [isReordering, setIsReordering] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleReorder = async () => {
    setIsReordering(true);
    try {
      for (const item of order.items) {
        await addItem(String(item.product_id), item.quantity);
      }
      toast.success('Siparişinizdeki ürünler sepete eklendi!');
      openDrawer();
    } catch (error) {
      console.error('Failed to reorder:', error);
      toast.error('Ürünler sepete eklenirken bir hata oluştu.');
    } finally {
      setIsReordering(false);
    }
  };

  // Try to get a product image for the first item
  const firstItem = order.items[0];
  const productImage = firstItem
    ? mockProducts.find((p) => p.id === String(firstItem.product_id))?.image ?? null
    : null;

  const firstItemName = firstItem
    ? mockProducts.find((p) => p.id === String(firstItem.product_id))?.name ?? firstItem.name
    : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Left Section: Image & Info */}
      <div className="flex flex-1 items-center gap-4 min-w-0 w-full">
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
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <OrderStatusBadge status={order.status} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">
            {firstItemName}
            {order.items.length > 1 && (
              <span className="text-slate-400 font-medium"> +{order.items.length - 1} ürün daha</span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {formatTurkishDate(order.created_at)} Tarihinde Sipariş Verildi
          </p>
          <p className="text-xs text-slate-400 truncate">
            #{order.id} numaralı sipariş
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="text-left shrink-0 w-[100px] sm:mr-8">
        <p className="font-black text-slate-900 text-[17px]">{order.total} TL</p>
        <p className="text-xs text-slate-400">{totalItems} ürün</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
        <button
          onClick={handleReorder}
          disabled={isReordering}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isReordering && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Yeniden Sipariş Ver
        </button>
        
        {order.invoice_id != null ? (
          <Link
            href={`/orders/${order.id}/invoice`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-indigo-200 text-indigo-700 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Fatura
          </Link>
        ) : (
          <button 
            disabled
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-100 text-slate-400 text-sm font-semibold rounded-xl bg-slate-50 cursor-not-allowed opacity-70"
          >
            <FileText className="w-4 h-4" />
            Fatura
          </button>
        )}

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

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package, Star } from 'lucide-react';
import type { OrderStatus } from '../types/order.types';
import { useReviewStore, ReviewModal } from '@/features/reviews';

interface OrderProductRowProps {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  userId: string;
  item: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  };
  productImage?: string;
}

function formatCurrency(amount: number) {
  return (
    amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' TL'
  );
}

export default function OrderProductRow({
  orderId,
  orderStatus,
  userId,
  item,
  productImage,
}: OrderProductRowProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const existingReview = useReviewStore((state) => state.getReview(orderId, item.productId));

  const isDelivered = orderStatus === 'delivered';

  return (
    <>
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100">
            {productImage ? (
              <Image
                src={productImage}
                alt={item.productName}
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-5 w-5 text-slate-300" />
              </div>
            )}
          </div>
          {/* Name & quantity */}
          <div>
            <span className="font-medium leading-snug text-slate-800">{item.productName}</span>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-600">
                ×{item.quantity}
              </span>
              
              {isDelivered && (
                existingReview ? (
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200 transition-all hover:bg-emerald-100 active:scale-95"
                    title="Değerlendirmeyi Düzenle"
                  >
                    <Star className="h-3 w-3 fill-emerald-500" />
                    Değerlendirdin
                  </button>
                ) : (
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-amber-600 ring-1 ring-inset ring-amber-200 transition-all hover:bg-amber-50 active:scale-95"
                  >
                    <Star className="h-3 w-3 fill-amber-400" />
                    Değerlendir
                  </button>
                )
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold text-slate-900">
            {formatCurrency(item.unitPrice * item.quantity)}
          </p>
          {item.quantity > 1 && (
            <p className="text-xs text-slate-400">{formatCurrency(item.unitPrice)} / adet</p>
          )}
        </div>
      </div>

      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          orderId={orderId}
          productId={item.productId}
          productName={item.productName}
          userId={userId}
          existingReview={existingReview}
        />
      )}
    </>
  );
}

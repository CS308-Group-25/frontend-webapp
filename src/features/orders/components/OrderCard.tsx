'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, FileText, Loader2, XCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Order } from '../types';
import OrderStatusBadge from './OrderStatusBadge';
import { useCartStore } from '@/features/cart';
import { cancelOrder } from '../api';
import { toast } from 'sonner';
import { fetchProducts } from '@/features/products';

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

const CANCELLABLE_STATUSES = new Set(['created', 'processing', 'pending', 'confirmed']);

export default function OrderCard({ order }: OrderCardProps) {
  const [isReordering, setIsReordering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);

  // Look up product images from the catalogue cache
  const { data } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => fetchProducts(200),
  });
  const cachedProducts = data?.items ?? [];

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCancelConfirm = async () => {
    setIsCancelling(true);
    try {
      await cancelOrder(order.id);
      toast.success('Siparişiniz iptal edildi.');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch {
      toast.error('Sipariş iptal edilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const handleReorder = async () => {
    setIsReordering(true);
    try {
      for (const item of order.items) {
        const cachedProduct = cachedProducts.find((p) => p.id === String(item.product_id));
        await addItem(String(item.product_id), item.quantity, undefined, {
          name: cachedProduct?.name ?? item.name,
          price: cachedProduct?.price ?? item.price,
          image: cachedProduct?.image || (cachedProduct?.images && cachedProduct.images[0]) || '/placeholder.png'
        });
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

  const firstItem = order.items[0];
  const firstItemName = firstItem?.name ?? '';
  // Try to find the product image from cache; fallback to Package icon
  const cachedProduct = firstItem
    ? cachedProducts.find((p) => p.id === String(firstItem.product_id))
    : undefined;
  const productImage: string | null = cachedProduct?.image ?? null;


  const safeStatus = String(order.status || '').trim().toLowerCase();
  const canCancel = CANCELLABLE_STATUSES.has(safeStatus);
  const showCancelButton = safeStatus !== 'cancelled' && safeStatus !== 'returned';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-5">
      {/* Top Header: Status, ID & Price */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <span className="text-[11px] text-slate-400 font-bold tracking-tighter uppercase whitespace-nowrap">
            #{order.id} nolu sipariş
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">TOPLAM TUTAR</p>
          <p className="font-black text-slate-900 text-lg sm:text-xl leading-none whitespace-nowrap">
            {order.total} TL
          </p>
        </div>
      </div>

      {/* Middle Row: Product Image & Info */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
          {productImage ? (
            <Image
              src={productImage}
              alt={firstItemName}
              fill
              className="object-contain p-2"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug break-words">
            {firstItemName || 'Ürün Bilgisi'}
            {order.items.length > 1 && (
              <span className="text-indigo-600 ml-1.5 whitespace-nowrap">
                +{order.items.length - 1} ürün
              </span>
            )}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 mt-2">
            <p className="text-[12px] text-slate-500 font-medium">
              {formatTurkishDate(order.created_at)} Tarihinde Sipariş Verildi
            </p>
            <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></span>
            <p className="text-[12px] text-slate-500 font-semibold">
              {totalItems} Adet Ürün
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t border-slate-50">
        <button
          onClick={handleReorder}
          disabled={isReordering}
          className="flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isReordering && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Yeniden Sipariş Ver
        </button>

        {order.status !== 'cancelled' ? (
          <Link
            href={`/orders/${order.id}/invoice`}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-indigo-200 text-indigo-700 text-xs sm:text-sm font-bold rounded-xl hover:bg-indigo-50 transition-colors whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            Fatura
          </Link>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-100 text-slate-400 text-xs sm:text-sm font-bold rounded-xl bg-slate-50 cursor-not-allowed opacity-70"
          >
            <FileText className="w-4 h-4" />
            Fatura
          </button>
        )}

        {showCancelButton && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            disabled={!canCancel || showCancelConfirm}
            title={!canCancel ? 'Bu sipariş artık iptal edilemez' : undefined}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border text-xs sm:text-sm font-bold rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-50 border-red-200 text-red-600 hover:bg-red-50 disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent whitespace-nowrap"
          >
            <XCircle className="w-4 h-4" />
            İptal Et
          </button>
        )}

        <Link
          href={`/orders/${order.id}`}
          className="px-3 py-2.5 bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-indigo-800 transition-colors text-center whitespace-nowrap"
        >
          Detayı Görüntüle
        </Link>
      </div>

      {/* Inline cancel confirmation */}
      {showCancelConfirm && (
        <div className="flex items-center gap-3 pt-3 border-t border-red-100">
          <p className="flex-1 text-sm text-red-700 font-medium">
            Siparişi iptal etmek istediğinize emin misiniz?
          </p>
          <button
            onClick={() => setShowCancelConfirm(false)}
            disabled={isCancelling}
            className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Vazgeç
          </button>
          <button
            onClick={handleCancelConfirm}
            disabled={isCancelling}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Evet, İptal Et
          </button>
        </div>
      )}
    </div>
  );
}

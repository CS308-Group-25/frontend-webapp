'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '@/features/auth';
import type { PaginatedProductResponse } from '@/features/products';

export const CartDrawer = () => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateItem,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Read the already-fetched product catalogue from the React Query cache.
  // This avoids an extra API call since the search page already populated the cache.
  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData<PaginatedProductResponse>(['products', 'all']);
  const cachedProducts = cachedData?.items ?? [];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Prevent scrolling on body when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen || !mounted) return null;

  // Enrich cart items with product details.
  // Prefer values persisted in localStorage (item.name/price/image),
  // fall back to the React Query product cache if not available.
  const cartDetails = items.map((cartItem) => {
    const product = cachedProducts.find((p) => p.id === cartItem.productId);
    return {
      ...cartItem,
      productName: cartItem.name || product?.name || 'Ürün',
      productPrice: cartItem.price ?? product?.price ?? 0,
      productImage: cartItem.image || product?.image || '/placeholder.png',
    };
  });


  const totalAmount = cartDetails.reduce(
    (total, item) => total + item.productPrice * item.quantity,
    0
  );

  const handleCheckout = () => {
    closeDrawer();
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      router.push('/checkout'); // Or wherever the future order page will be
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform transform translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2 text-indigo-900">
            <ShoppingBag className="h-6 w-6" />
            <h2 className="text-lg font-black uppercase tracking-tight">
              Sepetim ({items.length})
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Banner Mock */}
        <div className="bg-indigo-50 px-6 py-3 text-center text-xs font-semibold text-indigo-900">
          Toplam <span className="font-bold">250 TL</span> ve üzeri siparişlerde kargo bedava!
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-70">
              <ShoppingBag className="mb-4 h-16 w-16 text-slate-300" />
              <p className="text-lg font-bold text-slate-500">
                Sepetinizde Ürün Bulunmamaktadır
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cartDetails.map((item) => (
                <div key={item.productId} className="flex gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  {/* Product Image */}
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-contain p-2"
                      sizes="96px"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col py-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight">
                        {item.productName}
                      </h3>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-slate-400 transition-colors hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity Selector */}
                      <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                        <button
                          onClick={() => updateItem(item.productId, item.quantity - 1)}
                          className="p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600 focus:outline-none"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-slate-700">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.productId, item.quantity + 1)}
                          className="p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600 focus:outline-none"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-slate-900">
                          {item.productPrice * item.quantity} TL
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 bg-white p-6 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
            <div className="mb-4 flex items-center justify-between text-lg font-black text-slate-900">
              <span>Toplam</span>
              <span>{totalAmount} TL</span>
            </div>
            <button
              onClick={handleCheckout}
              className="flex w-full items-center justify-center rounded-xl bg-indigo-700 py-4 font-bold uppercase tracking-wide text-white transition-all hover:bg-indigo-800 active:scale-[0.98] shadow-lg shadow-indigo-200"
            >
              Devam Et
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Tag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/features/cart';
import { fetchProducts } from '@/features/products';
import type { PaymentMethod } from '../types';

const FREE_SHIPPING_THRESHOLD = 250;
const STANDARD_SHIPPING = 59.9;
const COD_FEE = 59;

interface OrderSummaryPanelProps {
  paymentMethod?: PaymentMethod;
}

export default function OrderSummaryPanel({ paymentMethod = 'credit_card' }: OrderSummaryPanelProps) {
  const { items } = useCartStore();
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  // Always use useQuery so that if cache is cold (e.g. direct /checkout visit), products are fetched
  const { data } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => fetchProducts(200),
  });
  const cachedProducts = data?.items ?? [];

  const cartDetails = items.map((cartItem) => {
    const product = cachedProducts.find((p) => p.id === cartItem.productId);
    return {
      ...cartItem,
      productName: product?.name ?? 'Ürün',
      productPrice: product?.price ?? 0,
      originalPrice: product?.originalPrice,
      productImage: product?.image ?? '/placeholder.png',
    };
  });

  const subtotal = cartDetails.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : STANDARD_SHIPPING;
  const isCod = paymentMethod === 'cod_cash' || paymentMethod === 'cod_card';
  const codFee = isCod ? COD_FEE : 0;
  const total = subtotal + shippingCost + codFee;
  const taxAmount = parseFloat((total * 0.01 / 1.01).toFixed(2));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
      {/* Items */}
      <div className="flex flex-col gap-4 pb-4 border-b border-slate-100">
        {cartDetails.map((item) => (
          <div key={item.productId} className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                <Image
                  src={item.productImage}
                  alt={item.productName}
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
              <p className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">
                {item.productName}
              </p>
              {item.variantId && (
                <p className="text-xs text-slate-400 mt-0.5">1 Paket</p>
              )}
            </div>
            <div className="text-right shrink-0">
              {item.originalPrice && (
                <p className="text-xs text-slate-400 line-through">
                  {item.originalPrice} TL
                </p>
              )}
              <p className="text-sm font-bold text-slate-900">
                {item.productPrice * item.quantity} TL
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="py-4 border-b border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            Ara Toplam
          </span>
          <span className="font-semibold text-slate-800">{subtotal} TL</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 font-medium">Teslimat / Kargo</span>
          <span className={`font-semibold ${isFreeShipping ? 'text-green-600' : 'text-slate-800'}`}>
            {isFreeShipping ? 'Ücretsiz' : `${STANDARD_SHIPPING} TL`}
          </span>
        </div>
        {isCod && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Kapıda Ödeme Ücreti</span>
            <span className="font-semibold text-slate-800">{COD_FEE} TL</span>
          </div>
        )}
      </div>

      {/* Promo Code */}
      <div className="py-3 border-b border-slate-100">
        <button
          onClick={() => setPromoOpen(!promoOpen)}
          className="flex items-center justify-between w-full text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Promosyon Kodu Kullan
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${promoOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {promoOpen && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Promosyon kodunuz"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-slate-50"
            />
            <button className="px-4 py-2 bg-indigo-700 text-white text-sm font-bold rounded-lg hover:bg-indigo-800 transition-colors">
              Uygula
            </button>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="pt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-black text-slate-900">Toplam</span>
          <div className="text-right">
            <p className="text-xl font-black text-slate-900">{total} TL</p>
            <p className="text-xs text-slate-400 font-medium">Vergi {taxAmount} TL</p>
          </div>
        </div>
      </div>
    </div>
  );
}

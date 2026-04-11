'use client';

import React from 'react';
import { Truck, CheckCircle2 } from 'lucide-react';
import { AddressFormData } from '../types';
import { useCartStore } from '@/features/cart';
import { mockProducts } from '@/features/products';

const FREE_SHIPPING_THRESHOLD = 250;

interface ShippingStepProps {
  addressData: AddressFormData;
  onBack: () => void;
  onComplete: () => void;
}

export default function ShippingStep({ addressData, onBack, onComplete }: ShippingStepProps) {
  const { items } = useCartStore();

  const subtotal = items.reduce((sum, item) => {
    const product = mockProducts.find((p) => p.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="space-y-4">
      {/* Address Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Teslimat Adresi
          </span>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Düzenle
          </button>
        </div>
        <p className="font-semibold text-slate-800">
          {addressData.firstName} {addressData.lastName}
        </p>
        <p className="text-sm text-slate-500 mt-0.5">
          {addressData.address}
          {addressData.apartment && `, ${addressData.apartment}`}
        </p>
        <p className="text-sm text-slate-500">
          {addressData.district}/{addressData.city}
        </p>
        <p className="text-sm text-slate-500">+90 {addressData.phone}</p>
      </div>

      {/* Shipping Option */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Kargo Seçeneği</h3>
        <label className="flex items-center gap-4 p-3 rounded-xl border-2 border-indigo-600 bg-indigo-50 cursor-pointer">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-600 flex items-center justify-center shrink-0">
            <div className="w-2 h-2 rounded-full bg-indigo-600" />
          </div>
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Truck className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isFreeShipping ? 'Ücretsiz Kargo' : 'Standart Kargo'}
              </p>
              <p className="text-xs text-slate-500">
                16:00&apos;dan önceki siparişler aynı gün kargoya verilir
              </p>
            </div>
          </div>
          <span className={`text-sm font-bold shrink-0 ${isFreeShipping ? 'text-green-600' : 'text-slate-800'}`}>
            {isFreeShipping ? 'Ücretsiz' : '59.90 TL'}
          </span>
        </label>

        {isFreeShipping && (
          <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-xs font-medium text-green-700">
              Siparişiniz ücretsiz kargo limitini aşıyor.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onComplete}
        className="w-full py-4 bg-indigo-700 text-white font-bold rounded-xl uppercase tracking-wide hover:bg-indigo-800 transition-colors active:scale-[0.99] shadow-lg shadow-indigo-200"
      >
        Ödeme ile Devam Et
      </button>
    </div>
  );
}

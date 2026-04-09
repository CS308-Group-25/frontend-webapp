'use client';

import { Check } from 'lucide-react';
import { ProductSize } from '../types/product.types';

interface SizeSelectorProps {
  sizes: ProductSize[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function SizeSelector({ sizes, selectedId, onSelect }: SizeSelectorProps) {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-900">
        Boyut:
      </h3>
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => {
          const isActive = size.id === selectedId;
          const hasDiscount = size.originalPrice && size.originalPrice > size.price;
          const discountPercent = hasDiscount
            ? Math.round(((size.originalPrice! - size.price) / size.originalPrice!) * 100)
            : 0;

          return (
            <button
              key={size.id}
              onClick={() => onSelect(size.id)}
              className={`relative flex flex-col items-center rounded-2xl border-2 px-5 py-3 transition-all duration-200 ${
                isActive
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-200/40'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              {/* Discount badge */}
              {hasDiscount && (
                <div className="absolute -right-2 -top-2 z-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                  %{discountPercent} İNDİRİM
                </div>
              )}

              {/* Active checkmark */}
              {isActive && (
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 shadow-sm">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              )}

              <span className={`text-sm font-extrabold ${isActive ? 'text-indigo-700' : 'text-slate-800'}`}>
                {size.label}
              </span>
              <span className={`text-xs font-medium ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}>
                ({size.servings} servis)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (qty: number) => void;
  max?: number;
}

export default function QuantitySelector({ quantity, onChange, max = 99 }: QuantitySelectorProps) {
  const decrement = () => {
    if (quantity > 1) onChange(quantity - 1);
  };

  const increment = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  return (
    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        onClick={decrement}
        disabled={quantity <= 1}
        className="flex h-11 w-11 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Minus className="h-4 w-4" strokeWidth={2.5} />
      </button>
      <div className="flex h-11 w-12 items-center justify-center border-x border-slate-200 text-sm font-bold text-slate-900">
        {quantity}
      </div>
      <button
        onClick={increment}
        disabled={quantity >= max}
        className="flex h-11 w-11 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

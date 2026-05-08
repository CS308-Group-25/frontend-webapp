'use client';

import { Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (qty: number) => void;
  max?: number;
}

export default function QuantitySelector({ quantity, onChange, max = 99 }: QuantitySelectorProps) {
  const [inputValue, setInputValue] = useState(String(quantity));
  const safeMax = Math.max(1, max);

  useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

  const commitQuantity = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
      onChange(1);
      setInputValue('1');
      return;
    }

    const nextQuantity = Math.min(Math.floor(parsed), safeMax);
    onChange(nextQuantity);
    setInputValue(String(nextQuantity));
  };

  const decrement = () => {
    if (quantity > 1) onChange(quantity - 1);
  };

  const increment = () => {
    if (quantity < safeMax) onChange(quantity + 1);
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
      <input
        inputMode="numeric"
        value={inputValue}
        onChange={(event) => {
          const value = event.target.value.replace(/\D/g, '');
          setInputValue(value);
          if (value) commitQuantity(value);
        }}
        onBlur={() => commitQuantity(inputValue)}
        aria-label="Ürün adedi"
        className="h-11 w-12 border-x border-slate-200 text-center text-sm font-bold text-slate-900 outline-none"
      />
      <button
        onClick={increment}
        disabled={quantity >= safeMax}
        className="flex h-11 w-11 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

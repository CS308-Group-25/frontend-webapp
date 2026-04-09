'use client';

import { ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
  disabled?: boolean;
}

export default function AddToCartButton({ disabled = false }: AddToCartButtonProps) {
  const handleClick = () => {
    // TODO: integrate with cart state/API
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-extrabold uppercase tracking-wider shadow-lg transition-all duration-200 ${
        disabled
          ? 'cursor-not-allowed bg-slate-200 text-slate-400'
          : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-500/30 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-[0.98]'
      }`}
    >
      <ShoppingCart className="h-5 w-5" />
      {disabled ? 'Stokta Yok' : 'Sepete Ekle'}
    </button>
  );
}

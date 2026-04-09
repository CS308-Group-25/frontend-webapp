'use client';

import { ShoppingCart } from 'lucide-react';

export default function AddToCartButton() {
  const handleClick = () => {
    // TODO: integrate with cart state/API
  };

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-4 text-base font-extrabold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-[0.98]"
    >
      <ShoppingCart className="h-5 w-5" />
      Sepete Ekle
    </button>
  );
}

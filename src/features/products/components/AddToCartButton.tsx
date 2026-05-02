'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/features/cart';

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  variantId?: string;
  disabled?: boolean;
  /** Product display name — stored in localStorage so the cart shows it instantly */
  name?: string;
  /** Product price — stored in localStorage for offline cart total display */
  price?: number;
  /** Product image URL — stored in localStorage so the image shows before products are fetched */
  image?: string;
  /** Selected flavor name to display in the cart */
  flavor?: string;
  /** Selected size name to display in the cart */
  size?: string;
  /** Optional click handler to perform validation. Call e.preventDefault() to stop adding to cart. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function AddToCartButton({
  productId,
  quantity = 1,
  variantId,
  disabled = false,
  name,
  price,
  image,
  flavor,
  size,
  onClick,
}: AddToCartButtonProps) {
  const { addItem, openDrawer } = useCartStore();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
      if (e.defaultPrevented) return;
    }
    addItem(productId, quantity, variantId, { name, price, image, flavor, size });
    openDrawer();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-extrabold uppercase tracking-wider shadow-lg transition-all duration-200 ${disabled
          ? 'cursor-not-allowed bg-slate-200 text-slate-400'
          : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-500/30 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-[0.98]'
        }`}
    >
      <ShoppingCart className="h-5 w-5" />
      {disabled ? 'Stokta Yok' : 'Sepete Ekle'}
    </button>
  );
}

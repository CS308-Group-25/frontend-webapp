'use client';

import { Heart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlist.store';

interface WishlistButtonProps {
  productId: string;
  /** Visual size: 'sm' for product cards, 'md' for detail page (matches AddToCartButton height) */
  size?: 'sm' | 'md';
  className?: string;
}

export default function WishlistButton({
  productId,
  size = 'sm',
  className = '',
}: WishlistButtonProps) {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const saved = isInWishlist(productId);

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';

  return (
    <button
      id={`wishlist-btn-${productId}`}
      aria-label={saved ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleItem(productId);
      }}
      className={`group/heart flex items-center justify-center transition-all duration-200 active:scale-90 ${
        size === 'sm'
          ? 'h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-red-50 border border-slate-100 hover:border-red-200'
          : 'h-12 w-12 rounded-xl bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 shadow-sm'
      } ${className}`}
    >
      <Heart
        className={`${iconSize} transition-all duration-200 ${
          saved
            ? 'fill-red-500 text-red-500 scale-110'
            : 'fill-transparent text-slate-400 group-hover/heart:text-red-400 group-hover/heart:scale-110'
        }`}
      />
    </button>
  );
}


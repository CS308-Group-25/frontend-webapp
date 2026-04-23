'use client';

import { Heart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlist.store';

interface WishlistButtonProps {
  productId: string;
  /** Visual size: 'sm' for product cards, 'md' for detail page */
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

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <button
      id={`wishlist-btn-${productId}`}
      aria-label={saved ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(productId);
      }}
      className={`group/heart flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
        size === 'sm'
          ? 'h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-red-50 border border-slate-100 hover:border-red-200'
          : 'h-10 w-10 bg-slate-100 hover:bg-red-50 border border-transparent hover:border-red-200'
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

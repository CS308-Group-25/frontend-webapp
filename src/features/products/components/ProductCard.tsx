import Image from 'next/image';
import { Star } from 'lucide-react';
import { Product } from '../types/product.types';
import StockBadge from './StockBadge';

interface ProductCardProps {
  product: Product;
}

function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : half
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'fill-slate-200 text-slate-200'
              }`}
            />
          );
        })}
      </div>
      <span className="text-xs font-medium text-slate-400">
        {reviewCount > 0 ? `${reviewCount} Yorum` : 'Henüz yorum yok'}
      </span>
    </div>
  );
}

function DiscountBadge({ price, originalPrice }: { price: number; originalPrice: number }) {
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  return (
    <div className="absolute -right-2 -top-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
      <div className="text-center leading-tight">
        <span className="block text-xs font-extrabold text-white">%{discount}</span>
        <span className="block text-[9px] font-bold uppercase text-red-100">İndirim</span>
      </div>
    </div>
  );
}

function NewBadge() {
  return (
    <div className="absolute -left-2 top-3 z-10">
      <div className="rounded-r-full rounded-tl-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/30">
        Yeni
      </div>
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockStatus === 'out_of_stock';

  return (
    <div
      id={`product-card-${product.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 ${
        isOutOfStock ? 'opacity-75' : ''
      }`}
    >
      {/* Badges */}
      {product.isNew && <NewBadge />}
      {product.originalPrice && (
        <DiscountBadge price={product.price} originalPrice={product.originalPrice} />
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-contain p-4 transition-transform duration-500 group-hover:scale-110 ${
            isOutOfStock ? 'grayscale' : ''
          }`}
        />

        {/* Hover Overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-indigo-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button className="mb-4 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50 active:scale-95">
              İncele
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4 pt-3">
        {/* Name & Description */}
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-slate-400 line-clamp-1">
            {product.description}
          </p>
        </div>

        {/* Rating */}
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />

        {/* Price & Stock */}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-lg font-extrabold ${isOutOfStock ? 'text-slate-400' : 'text-indigo-600'}`}>
              {product.price} TL
            </span>
            {product.originalPrice && (
              <span className="text-sm font-semibold text-red-400 line-through">
                {product.originalPrice} TL
              </span>
            )}
          </div>
          <StockBadge status={product.stockStatus} count={product.stockCount} />
        </div>
      </div>
    </div>
  );
}

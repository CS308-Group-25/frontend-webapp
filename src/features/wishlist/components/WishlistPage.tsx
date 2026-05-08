'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Trash2,
  Star,
  ArrowRight,
  PackageSearch,
  AlertCircle,
} from 'lucide-react';
import { useWishlistStore } from '@/features/wishlist';

import { useAuthStore } from '@/features/auth';
import { fetchProductDetail } from '@/features/products/api/products.api';
import { Product } from '@/features/products';
import StockBadge from '@/features/products/components/StockBadge';
import { toast } from 'sonner';

/* ── helpers ── */
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

/** Skeleton card shown while product details are loading */
function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse">
      <div className="aspect-square bg-slate-100" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 rounded-lg bg-slate-100" />
        <div className="h-3 w-1/2 rounded-lg bg-slate-100" />
        <div className="h-3 w-1/3 rounded-lg bg-slate-100" />
        <div className="mt-2 h-9 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

/* ── main page ── */
export default function WishlistPage() {
  const { removeItem, clearWishlist, fetchServerWishlist } = useWishlistStore();

  const { isAuthenticated } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  /* ── Load products once on mount (or when auth changes) ── */
  const loadProducts = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setProducts([]);
      setIsInitialLoading(false);
      return;
    }

    setIsInitialLoading(true);
    setFetchError(false);

    // Fetch all products in parallel
    const results = await Promise.allSettled(
      ids.map((id) => fetchProductDetail(id)),
    );

    const loaded: Product[] = [];
    let hadError = false;

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        loaded.push(result.value);
      } else {
        console.error(`[WishlistPage] Failed to fetch product ${ids[idx]}:`, result.reason);
        hadError = true;
      }
    });

    setProducts(loaded);
    setFetchError(hadError && loaded.length === 0);
    setIsInitialLoading(false);
  }, []);


  /* ── On mount: sync with server then load product details ── */
  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        await fetchServerWishlist();
      }
      // Read latest IDs directly from store after server sync
      const latestIds = useWishlistStore.getState().items;
      await loadProducts(latestIds);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Handlers ── */

  const handleRemove = async (productId: string, productName: string) => {
    // Optimistically remove from UI
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(productId)));
    await removeItem(productId);
    toast.info(`${productName} favorilerden çıkarıldı.`);
  };

  const handleClearAll = async () => {
    // Clear UI immediately, then sync with store
    setProducts([]);
    await clearWishlist();
    toast.info('Tüm favoriler temizlendi.');
  };

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* ── Page Header ── */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg shadow-red-400/30">
                <Heart className="h-5 w-5 fill-white text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Favorilerim
                </h1>
                <p className="text-sm font-medium text-slate-400">
                  {isInitialLoading
                    ? 'Yükleniyor...'
                    : products.length === 0
                    ? 'Henüz ürün eklenmedi'
                    : `${products.length} kayıtlı ürün`}
                </p>
              </div>
            </div>

            {!isInitialLoading && products.length > 0 && (
              <button
                id="wishlist-clear-all"
                onClick={handleClearAll}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                Tümünü Temizle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Loading skeletons */}
        {isInitialLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Fetch error */}
        {!isInitialLoading && fetchError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-700 mb-2">Ürünler yüklenemedi</h2>
            <p className="text-sm text-slate-400 mb-6">Bağlantınızı kontrol edip tekrar deneyin.</p>
            <button
              onClick={() => loadProducts(useWishlistStore.getState().items)}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isInitialLoading && !fetchError && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                <PackageSearch className="h-10 w-10 text-slate-300" />
              </div>
              <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow shadow-red-300/40">
                <Heart className="h-4 w-4 fill-white text-white" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-extrabold text-slate-700">
              Favori listeniz boş
            </h2>
            <p className="mb-8 max-w-sm text-sm font-medium text-slate-400">
              Beğendiğiniz ürünleri kaydedin, fiyat değişikliklerini ve
              indirimleri takip edin.
            </p>
            <Link
              href="/search"
              id="wishlist-browse-products"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-400/30 transition-all hover:bg-indigo-700 hover:shadow-indigo-400/40 active:scale-95"
            >
              Ürünleri Keşfet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Product Grid — same design as ProductCard */}
        {!isInitialLoading && !fetchError && products.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const isOutOfStock =
                product.stockStatus === 'out_of_stock' || product.stockCount === 0;

              return (
                <div
                  key={product.id}
                  id={`wishlist-item-${product.id}`}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 ${
                    isOutOfStock ? 'opacity-75' : ''
                  }`}
                >
                  {/* Discount badge — same circular badge as ProductCard */}
                  {product.originalPrice && (
                    <DiscountBadge price={product.price} originalPrice={product.originalPrice} />
                  )}

                  {/* Image Container */}
                  <Link href={`/product/${product.id}`} tabIndex={-1}>
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className={`object-contain p-4 transition-transform duration-500 group-hover:scale-110 ${
                            isOutOfStock ? 'grayscale' : ''
                          }`}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <PackageSearch className="h-12 w-12 text-slate-300" />
                        </div>
                      )}

                      {/* Remove from wishlist button (heart) */}
                      <div className="absolute bottom-3 right-3 z-10">
                        <button
                          id={`wishlist-remove-${product.id}`}
                          aria-label="Favorilerden çıkar"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemove(product.id, product.name);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:border-red-300 hover:bg-red-50 active:scale-90"
                        >
                          <Heart className="h-4 w-4 fill-red-400 text-red-400" />
                        </button>
                      </div>

                      {/* Hover overlay with İncele button */}
                      {!isOutOfStock && (
                        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-indigo-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <span className="mb-4 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-indigo-600 shadow-lg">
                            İncele
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-2 p-4 pt-3">
                    {/* Name & Description */}
                    <div>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="text-sm font-extrabold uppercase tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="mt-0.5 text-xs font-medium text-slate-400 line-clamp-1">
                        {product.description}
                      </p>
                    </div>

                    {/* Rating */}
                    <RatingStars rating={product.rating} reviewCount={product.reviewCount} />

                    {/* Price & Stock — same layout as ProductCard */}
                    <div className="mt-auto flex items-end justify-between pt-2">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-lg font-extrabold ${
                            isOutOfStock ? 'text-slate-400' : 'text-indigo-600'
                          }`}
                        >
                          {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm font-semibold text-red-400 line-through">
                            {product.originalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                          </span>
                        )}
                      </div>
                      <StockBadge status={product.stockStatus} count={product.stockCount} />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

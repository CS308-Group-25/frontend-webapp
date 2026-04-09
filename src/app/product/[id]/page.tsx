'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Star, Truck, ShieldCheck, Clock, Leaf, WheatOff, Package } from 'lucide-react';
import { mockProducts } from '@/features/products/data/mock-products';
import ProductImageGallery from '@/features/products/components/ProductImageGallery';
import FlavorSelector from '@/features/products/components/FlavorSelector';
import SizeSelector from '@/features/products/components/SizeSelector';
import QuantitySelector from '@/features/products/components/QuantitySelector';
import AddToCartButton from '@/features/products/components/AddToCartButton';
import ProductAccordion from '@/features/products/components/ProductAccordion';
import StockBadge from '@/features/products/components/StockBadge';


/* ──────────────────────── Tag Badge Mapping ──────────────────────── */

const tagIcons: Record<string, React.ReactNode> = {
  Vejetaryen: <Leaf className="h-3.5 w-3.5" />,
  Vegan: <Leaf className="h-3.5 w-3.5" />,
  Glutensiz: <WheatOff className="h-3.5 w-3.5" />,
};

/* ──────────────────────── Rating Stars (shared) ──────────────────── */

function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <Star
              key={i}
              className={`h-5 w-5 ${
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
      <span className="text-sm font-bold text-slate-700">
        {reviewCount > 0 ? `${reviewCount.toLocaleString('tr-TR')} Yorum` : 'Henüz yorum yok'}
      </span>
    </div>
  );
}

/* ══════════════════════════ PAGE ══════════════════════════════════ */

export default function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const product = mockProducts.find((p) => p.id === params.id);
  const isOutOfStock = product?.stockStatus === 'out_of_stock';

  /* ── State ────────────────────────────────────────────────────── */

  const [selectedFlavor, setSelectedFlavor] = useState(product?.flavors?.[0]?.id ?? '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);

  /* Resolve price from selected size variant (or fall back to base price) */
  const activeSizeVariant = useMemo(
    () => product?.sizes?.find((s) => s.id === selectedSize),
    [product, selectedSize],
  );

  const displayPrice = activeSizeVariant?.price ?? product?.price ?? 0;
  const displayOriginal = activeSizeVariant?.originalPrice ?? product?.originalPrice;
  const servings = activeSizeVariant?.servings;
  const perServing = servings ? (displayPrice / servings).toFixed(2) : null;

  /* ── 404 guard ────────────────────────────────────────────────── */

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Package className="h-16 w-16 text-slate-300" />
        <h1 className="text-2xl font-extrabold text-slate-900">Ürün Bulunamadı</h1>
        <p className="text-slate-500">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
        <Link
          href="/search"
          className="mt-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95"
        >
          Ürünlere Dön
        </Link>
      </div>
    );
  }

  /* ── Accordion content ────────────────────────────────────────── */

  const accordionItems = [
    ...(product.features
      ? [
          {
            title: 'Özellikler',
            content: (
              <ul className="list-inside list-disc space-y-2">
                {product.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
    ...(product.nutritionFacts
      ? [
          {
            title: 'Besin İçeriği',
            content: (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 font-bold text-slate-800">Besin Değeri</th>
                    <th className="py-2 font-bold text-slate-800">Porsiyon Başına</th>
                    {product.nutritionFacts.some((nf) => nf.per100g) && (
                      <th className="py-2 font-bold text-slate-800">100g Başına</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {product.nutritionFacts.map((nf, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 text-slate-600">{nf.label}</td>
                      <td className="py-2 font-semibold text-slate-800">{nf.perServing}</td>
                      {product.nutritionFacts!.some((n) => n.per100g) && (
                        <td className="py-2 text-slate-600">{nf.per100g ?? '—'}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ),
          },
        ]
      : []),
    ...(product.ingredients
      ? [
          {
            title: 'İçindekiler',
            content: <p>{product.ingredients}</p>,
          },
        ]
      : []),
    ...(product.usage
      ? [
          {
            title: 'Kullanım Şekli',
            content: <p>{product.usage}</p>,
          },
        ]
      : []),
  ];

  /* ── Discount percent ─────────────────────────────────────────── */
  const discountPercent =
    displayOriginal && displayOriginal > displayPrice
      ? Math.round(((displayOriginal - displayPrice) / displayOriginal) * 100)
      : 0;

  /* ════════════════════════ RENDER ════════════════════════════════ */

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="transition-colors hover:text-indigo-600">
          Anasayfa
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <button
          onClick={() => {
            const lastQ = sessionStorage.getItem('lastSearchQuery');
            // If we applied a filter while on "All Products" (lastQ is empty),
            // use history.back() to ensure filters are preserved when returning.
            // If we arrived from another category page, navigate cleanly to /search.
            if (window.history.length > 2 && !lastQ) {
              window.history.back();
            } else {
              router.push('/search');
            }
          }}
          className="transition-colors hover:text-indigo-600 focus:outline-none"
        >
          Tüm Ürünler
        </button>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <button
              onClick={() => {
                const lastQ = sessionStorage.getItem('lastSearchQuery');
                if (window.history.length > 2) {
                  // If lastQ is empty (arrived from "All Products" section),
                  // navigate directly to a fresh `q=Category` search page
                  // instead of returning to the previous `?tags=Category` state.
                  if (!lastQ) {
                    router.push(`/search?q=${encodeURIComponent(product.category!)}`);
                  } else {
                    // If arrived from a specific category where sub-filters (like 'Kreatin') were chosen,
                    // use history.back() to prevent those filters from resetting.
                    window.history.back();
                  }
                } else {
                  router.push(`/search?q=${encodeURIComponent(product.category!)}`);
                }
              }}
              className="transition-colors hover:text-indigo-600 focus:outline-none"
            >
              {product.category}
            </button>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-700">{product.name}</span>
      </nav>

      {/* ── Two-column main section ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* LEFT: Image Gallery */}
        <ProductImageGallery
          images={product.images ?? [product.image]}
          productName={product.name}
        />

        {/* RIGHT: Product Info */}
        <div className="flex flex-col gap-5">
          {/* Name + Description */}
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-1 text-base font-medium uppercase tracking-wide text-slate-400">
              {product.description}
            </p>
          </div>

          {/* Rating */}
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600"
                >
                  {tagIcons[tag] ?? null}
                  {tag.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <hr className="border-slate-100" />

          {/* Flavor Selector */}
          {product.flavors && product.flavors.length > 0 && (
            <FlavorSelector
              flavors={product.flavors}
              selectedId={selectedFlavor}
              onSelect={setSelectedFlavor}
            />
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <SizeSelector
              sizes={product.sizes}
              selectedId={selectedSize}
              onSelect={setSelectedSize}
            />
          )}

          {/* Divider */}
          <hr className="border-slate-100" />

          {/* Price + Stock Row */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className={`text-4xl font-extrabold ${isOutOfStock ? 'text-slate-400' : 'text-slate-900'}`}>
                  {displayPrice.toLocaleString('tr-TR')} TL
                </span>
                {displayOriginal && displayOriginal > displayPrice && (
                  <span className="text-lg font-semibold text-red-400 line-through">
                    {displayOriginal.toLocaleString('tr-TR')} TL
                  </span>
                )}
              </div>
              {perServing && (
                <p className="mt-0.5 text-sm font-semibold text-slate-400">
                  {perServing} TL / Servis
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1">
              {discountPercent > 0 && (
                <span className="rounded-full bg-gradient-to-r from-red-500 to-red-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                  %{discountPercent} İNDİRİM
                </span>
              )}
              {product.stockStatus && (
                <StockBadge status={product.stockStatus} count={product.stockCount} />
              )}
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4">
            {!isOutOfStock && (
              <QuantitySelector
                quantity={quantity}
                onChange={setQuantity}
                max={product.stockCount || 99}
              />
            )}
            <div className="flex-1">
              <AddToCartButton disabled={isOutOfStock} />
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold leading-tight text-slate-600">
                Hızlı Kargo
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold leading-tight text-slate-600">
                Memnuniyet Garantisi
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold leading-tight text-slate-600">
                Aynı Gün Kargo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Accordion Sections (below the fold) ────────────────── */}
      {accordionItems.length > 0 && (
        <div className="mt-12">
          <ProductAccordion items={accordionItems} />
        </div>
      )}
    </div>
  );
}

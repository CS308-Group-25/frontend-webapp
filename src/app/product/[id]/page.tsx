'use client';

import { use, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Truck, ShieldCheck, Clock, Leaf, WheatOff, Package } from 'lucide-react';
import {
  fetchProductReviews,
  fetchProductDetail,
  submitProductReview,
  ProductImageGallery,
  FlavorSelector,
  SizeSelector,
  QuantitySelector,
  AddToCartButton,
  ProductAccordion,
  StockBadge
} from '@/features/products';
import type { ProductReview } from '@/features/products/api/products.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import WishlistButton from '@/features/wishlist/components/WishlistButton';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth';
import { fetchOrders } from '@/features/orders/api';
import type { Order } from '@/features/orders/types';


/* ──────────────────────── Tag Badge Mapping ──────────────────────── */

const tagIcons: Record<string, React.ReactNode> = {
  Vejetaryen: <Leaf className="h-3.5 w-3.5" />,
  Vegan: <Leaf className="h-3.5 w-3.5" />,
  Glutensiz: <WheatOff className="h-3.5 w-3.5" />,
};

/* ──────────────────────── Rating Stars (shared) ──────────────────── */

function RatingStars({
  rating,
  reviewCount,
  commentCount,
}: {
  rating: number;
  reviewCount: number;
  commentCount: number;
}) {
  const hasRating = rating > 0 && reviewCount > 0;
  const hasComments = commentCount > 0;

  return (
    <div className="flex items-center gap-2">
      {hasRating && (
        <span className="text-sm font-extrabold text-slate-900">
          {rating.toFixed(1)}
        </span>
      )}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <Star
              key={i}
              className={`h-5 w-5 ${filled
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
        {hasRating || hasComments
          ? `· ${reviewCount.toLocaleString('tr-TR')} Değerlendirme ${commentCount.toLocaleString('tr-TR')} Yorum`
          : 'Henüz değerlendirme yok'}
      </span>
    </div>
  );
}

function ReviewForm({
  productId,
  isAuthenticated,
  onSubmitted,
}: {
  productId: string;
  isAuthenticated: boolean;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const ratingMutation = useMutation({
    mutationFn: () => submitProductReview(productId, { rating }),
    onSuccess: () => {
      toast.success('Değerlendirmeniz alındı.');
      setRating(0);
      setHoverRating(0);
      onSubmitted();
    },
    onError: (error) => {
      toast.error(typeof error === 'string' ? error : 'Değerlendirme gönderilemedi.');
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => submitProductReview(productId, {
      comment: comment.trim(),
    }),
    onSuccess: () => {
      toast.success('Yorumunuz alındı. Onaydan sonra yayınlanacaktır.');
      setComment('');
      onSubmitted();
    },
    onError: (error) => {
      toast.error(typeof error === 'string' ? error : 'Yorum gönderilemedi.');
    },
  });

  const activeRating = hoverRating || rating;

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900">Ürünü Değerlendir</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Değerlendirme yapmak ve yorum yazmak için giriş yapmanız gerekiyor.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900">Ürünü Değerlendir</h2>
        <p className="text-sm font-medium text-slate-500">
          Yıldız puanınız hemen değerlendirmeye eklenir. Yorumu ayrıca gönderebilirsiniz.
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Puan Ver</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Sadece yıldız puanı gönderilir.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onFocus={() => setHoverRating(star)}
                  onBlur={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="rounded-md p-0.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  aria-label={`${star} yıldız ver`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= activeRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="min-w-14 text-sm font-bold text-slate-500">
              {rating > 0 ? `${rating} / 5` : 'Seç'}
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => ratingMutation.mutate()}
            disabled={rating === 0 || ratingMutation.isPending}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ratingMutation.isPending ? 'Gönderiliyor...' : 'Puanı Gönder'}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <label className="block text-sm font-extrabold text-slate-900" htmlFor="product-review-comment">
          Yorum Yaz
        </label>
        <p className="mt-0.5 text-xs font-medium text-slate-500">
          Sadece yorum gönderilir ve onaydan sonra yayınlanır.
        </p>
        <textarea
          id="product-review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Ürün hakkındaki düşüncelerinizi paylaşabilirsiniz..."
          className="mt-3 h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          maxLength={500}
        />
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-slate-400">{comment.length}/500</span>
          <button
            type="button"
            onClick={() => commentMutation.mutate()}
            disabled={!comment.trim() || commentMutation.isPending}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {commentMutation.isPending ? 'Gönderiliyor...' : 'Yorumu Gönder'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewAccessNotice({
  isAuthenticated,
  isLoading,
}: {
  isAuthenticated: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900">Ürünü Değerlendir</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Siparişleriniz kontrol ediliyor...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900">Ürünü Değerlendir</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Değerlendirme yapmak ve yorum yazmak için giriş yapmanız gerekiyor.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-extrabold text-slate-900">Ürünü Değerlendir</h2>
      <p className="mt-2 text-sm font-medium text-slate-500">
        Bu ürünü değerlendirmek için ürünün teslim edildiği bir siparişiniz olmalı.
      </p>
    </div>
  );
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < rating;
        return (
          <Star
            key={index}
            className={`h-4 w-4 ${
              filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
            }`}
          />
        );
      })}
    </div>
  );
}

function formatReviewDate(date: string) {
  try {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

function ApprovedReviewsList({
  reviews,
  isLoading,
}: {
  reviews: ProductReview[];
  isLoading: boolean;
}) {
  const visibleReviews = reviews.filter((review) => review.comment?.trim());

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Yorumlar</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Sadece onaylanmış yorumlar burada yayınlanır.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {visibleReviews.length} Yorum
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {isLoading ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
            Yorumlar yükleniyor...
          </div>
        ) : visibleReviews.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
            Henüz onaylanmış yorum yok.
          </div>
        ) : (
          visibleReviews.map((review) => {
            const reviewRating = review.rating;
            const hasRating = typeof reviewRating === 'number';
            const reviewerName = review.customer_name?.trim() || `Kullanıcı #${review.user_id}`;

            return (
              <article
                key={review.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {hasRating ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-800">
                        {reviewerName}
                      </span>
                      <div className="flex items-center gap-2">
                        <ReviewStars rating={reviewRating} />
                        <span className="text-sm font-extrabold text-slate-800">
                          {reviewRating} / 5
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm font-extrabold text-slate-800">
                      {reviewerName}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-400">
                    {formatReviewDate(review.created_at)}
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700">
                  {review.comment}
                </p>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════ PAGE ══════════════════════════════════ */

export default function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => fetchProductDetail(params.id),
    enabled: !!params.id,
  });
  const { data: approvedReviews = [], isLoading: isReviewsLoading } = useQuery({
    queryKey: ['product-reviews', params.id],
    queryFn: () => fetchProductReviews(params.id),
    enabled: !!params.id,
  });
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: isAuthenticated,
    retry: 1,
  });

  const isOutOfStock = product?.stockStatus === 'out_of_stock' || product?.stockCount === 0;
  // Accessories use the 'flavors' field to store colors — detect by category
  const isAccessory = product?.category?.toLowerCase().includes('aksesuar') ?? false;

  /* ── State ────────────────────────────────────────────────────── */

  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Auto-select if there is exactly 1 option
  useEffect(() => {
    if (product) {
      if (product.flavors?.length === 1 && !selectedFlavor) {
        // eslint-disable-next-line
        setSelectedFlavor(product.flavors[0].id);
      }
      if (product.sizes?.length === 1 && !selectedSize) {
        setSelectedSize(product.sizes[0].id);
      }
    }
  }, [product, selectedFlavor, selectedSize]);

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

  /* ── 404 guard and Loading state ────────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="font-medium animate-pulse">Ürün Detayları Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
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
  const canReviewProduct = orders.some(
    (order) =>
      order.status === 'delivered' &&
      order.items.some((item) => String(item.product_id) === product.id),
  );

  /* ════════════════════════ RENDER ════════════════════════════════ */

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="transition-colors hover:text-indigo-600">
          Anasayfa
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href="/search"
          className="transition-colors hover:text-indigo-600 focus:outline-none"
        >
          Tüm Ürünler
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/search?q=${encodeURIComponent(product.category)}`}
              className="transition-colors hover:text-indigo-600 focus:outline-none"
            >
              {product.category}
            </Link>
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
          <RatingStars
            rating={product.rating}
            reviewCount={product.reviewCount}
            commentCount={product.commentCount ?? 0}
          />

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

          {/* Flavor / Color Selector */}
          {product.flavors && product.flavors.length > 0 && (
            <FlavorSelector
              flavors={product.flavors}
              selectedId={selectedFlavor}
              onSelect={setSelectedFlavor}
              label={isAccessory ? 'Renk:' : 'Aroma:'}
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

          {/* Quantity + Add to Cart + Wishlist */}
          <div className="flex items-center gap-3">
            {!isOutOfStock && (
              <QuantitySelector
                quantity={quantity}
                onChange={setQuantity}
                max={product.stockCount || 99}
              />
            )}
            <div className="flex-1">
              <AddToCartButton
                productId={product.id}
                quantity={quantity}
                variantId={[selectedFlavor, selectedSize].filter(Boolean).join('-')}
                disabled={isOutOfStock}
                name={product.name}
                price={product.price}
                image={product.image || (product.images && product.images[0]) || '/placeholder.png'}
                stockCount={product.stockCount}
                flavor={product.flavors?.find(f => f.id === selectedFlavor)?.name}
                size={product.sizes?.find(s => s.id === selectedSize)?.label}
                onClick={(e) => {
                  if (product.flavors && product.flavors.length > 1 && !selectedFlavor) {
                    toast.error(isAccessory ? 'Lütfen bir renk seçiniz.' : 'Lütfen bir aroma seçiniz.');
                    e.preventDefault();
                    return;
                  }
                  if (product.sizes && product.sizes.length > 1 && !selectedSize) {
                    toast.error('Lütfen bir boyut seçiniz.');
                    e.preventDefault();
                    return;
                  }
                }}
              />
            </div>
            <WishlistButton
              productId={product.id}
              size="md"
              className="shrink-0"
            />
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

      <div className="mt-8">
        {canReviewProduct ? (
          <ReviewForm
            productId={product.id}
            isAuthenticated={isAuthenticated}
            onSubmitted={() => {
              queryClient.invalidateQueries({ queryKey: ['product', params.id] });
              queryClient.invalidateQueries({ queryKey: ['products'] });
              queryClient.invalidateQueries({ queryKey: ['product-reviews', params.id] });
            }}
          />
        ) : (
          <ReviewAccessNotice
            isAuthenticated={isAuthenticated}
            isLoading={isOrdersLoading}
          />
        )}
      </div>

      <div className="mt-8">
        <ApprovedReviewsList
          reviews={approvedReviews}
          isLoading={isReviewsLoading}
        />
      </div>
    </div>
  );
}

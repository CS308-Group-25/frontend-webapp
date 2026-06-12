'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Percent, Trash2, Pencil, X, Check } from 'lucide-react';
import { fetchProducts, PaginatedProductResponse, Product } from '@/features/products';
import { fetchDiscounts, postDiscount, deleteDiscount } from '../api';
import type { Discount } from '../types';

const PRODUCTS_QUERY_KEY = ['admin', 'products'] as const;
const DISCOUNTS_QUERY_KEY = ['admin', 'discounts'] as const;

// Derives the original (pre-discount) price from the current price and rate.
// Used when the backend doesn't return original_price in the product response.
function deriveOriginalPrice(product: Product, discountRate: number): number {
  if (product.originalPrice && product.originalPrice > product.price) {
    return product.originalPrice;
  }
  return Math.round((product.price / (1 - discountRate / 100)) * 100) / 100;
}

export default function DiscountManagementPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rate, setRate] = useState<number | ''>('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRate, setEditRate] = useState<number | ''>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const { data: productsData, isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: () => fetchProducts(200),
  });

  const { data: discounts = [], isLoading: discountsLoading } = useQuery({
    queryKey: DISCOUNTS_QUERY_KEY,
    queryFn: fetchDiscounts,
  });

  const products = useMemo(() => productsData?.items ?? [], [productsData]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const productMap = useMemo(
    () => new Map(products.map((p) => [Number(p.id), p.name])),
    [products]
  );

  // Map: productId → active Discount object (for deriving original price in the list).
  const discountByProductId = useMemo(
    () =>
      new Map<number, Discount>(
        discounts.flatMap((d) => d.product_ids.map((pid) => [pid, d]))
      ),
    [discounts]
  );

  const discountedProductIds = useMemo(
    () => new Set(discounts.flatMap((d) => d.product_ids)),
    [discounts]
  );

  const toggleSelect = (id: string) => {
    if (discountedProductIds.has(Number(id))) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ── Apply: one POST per product ──────────────────────────────────────────
  const handleApply = async () => {
    if (!selectedIds.length || rate === '') return;
    setApplyError(null);
    setIsApplying(true);
    try {
      const results = await Promise.all(
        selectedIds.map((id) =>
          postDiscount({ ids: [id], discount_rate: rate as number })
        )
      );

      const newEntries: Discount[] = results.map((discount, i) => ({
        ...discount,
        product_ids: [Number(selectedIds[i])],
      }));

      queryClient.setQueryData<Discount[]>(DISCOUNTS_QUERY_KEY, (old = []) => [
        ...newEntries,
        ...old,
      ]);

      // Optimistic update: apply immediately for instant UI feedback; background
      // invalidations below will sync with the authoritative backend state.
      // ['products','all'] is seeded from admin cache when empty (first visit to search page).
      const applyPriceUpdate = (old: PaginatedProductResponse | undefined) => {
        const base = old ?? queryClient.getQueryData<PaginatedProductResponse>(PRODUCTS_QUERY_KEY);
        if (!base) return old;
        return {
          ...base,
          items: base.items.map((p) => {
            if (!selectedIds.includes(p.id)) return p;
            const basePrice = p.originalPrice ?? p.price;
            return {
              ...p,
              originalPrice: basePrice,
              price: Math.round(basePrice * (1 - (rate as number) / 100) * 100) / 100,
            };
          }),
        };
      };
      queryClient.setQueryData<PaginatedProductResponse>(['products', 'all'], applyPriceUpdate);
      queryClient.setQueryData<PaginatedProductResponse>(PRODUCTS_QUERY_KEY, applyPriceUpdate);

      setSelectedIds([]);
      setRate('');
      toast.success('İndirim başarıyla uygulandı.');
      queryClient.invalidateQueries({ queryKey: DISCOUNTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    } catch (err) {
      setApplyError(err as string);
    } finally {
      setIsApplying(false);
    }
  };

  // ── Edit: DELETE old + POST new ──────────────────────────────────────────
  const handleEditSave = async (discount: Discount) => {
    if (editRate === '') return;
    setIsEditing(true);
    setEditError(null);
    try {
      await deleteDiscount(discount.id);
      const newDiscount = await postDiscount({
        ids: [String(discount.product_ids[0])],
        discount_rate: editRate as number,
      });

      const updated: Discount = { ...newDiscount, product_ids: [discount.product_ids[0]] };

      queryClient.setQueryData<Discount[]>(DISCOUNTS_QUERY_KEY, (old = []) =>
        old.map((d) => (d.id === discount.id ? updated : d))
      );

      // Recompute cached product price: derive true original, then apply new rate.
      const editPriceUpdate = (old: PaginatedProductResponse | undefined) => {
        const base = old ?? queryClient.getQueryData<PaginatedProductResponse>(PRODUCTS_QUERY_KEY);
        if (!base) return old;
        return {
          ...base,
          items: base.items.map((p) => {
            if (p.id !== String(discount.product_ids[0])) return p;
            const trueOriginal = deriveOriginalPrice(p, discount.discount_rate);
            return {
              ...p,
              originalPrice: trueOriginal,
              price: Math.round(trueOriginal * (1 - (editRate as number) / 100) * 100) / 100,
            };
          }),
        };
      };
      queryClient.setQueryData<PaginatedProductResponse>(['products', 'all'], editPriceUpdate);
      queryClient.setQueryData<PaginatedProductResponse>(PRODUCTS_QUERY_KEY, editPriceUpdate);

      setEditingId(null);
      setEditRate('');
      toast.success('İndirim oranı güncellendi.');
      queryClient.invalidateQueries({ queryKey: DISCOUNTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    } catch (err) {
      setEditError(err as string);
    } finally {
      setIsEditing(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deleteDiscount,
    onSuccess: (_, id) => {
      const removed = discounts.find((d) => d.id === id);
      if (removed) {
        const restorePriceUpdate = (old: PaginatedProductResponse | undefined) => {
          const base = old ?? queryClient.getQueryData<PaginatedProductResponse>(PRODUCTS_QUERY_KEY);
          if (!base) return old;
          return {
            ...base,
            items: base.items.map((p) => {
              if (!removed.product_ids.includes(Number(p.id))) return p;
              const originalPrice = deriveOriginalPrice(p, removed.discount_rate);
              return { ...p, price: originalPrice, originalPrice: undefined };
            }),
          };
        };
        queryClient.setQueryData<PaginatedProductResponse>(['products', 'all'], restorePriceUpdate);
        queryClient.setQueryData<PaginatedProductResponse>(PRODUCTS_QUERY_KEY, restorePriceUpdate);
      }
      queryClient.setQueryData<Discount[]>(DISCOUNTS_QUERY_KEY, (old = []) =>
        old.filter((d) => d.id !== id)
      );
      setDeleteError(null);
      setDeletingId(null);
      toast.success('İndirim kaldırıldı.');
      queryClient.invalidateQueries({ queryKey: DISCOUNTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
    onError: (err: string) => {
      setDeleteError(err);
      setDeletingId(null);
    },
  });

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setDeleteError(null);
    deleteMutation.mutate(id);
  };

  const canApply = selectedIds.length > 0 && rate !== '' && !isApplying;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-2 text-sm text-slate-400">
          <span>Ana Sayfa</span>
          <span className="mx-2">•</span>
          <span className="font-bold text-slate-700">İndirim Yönetimi</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          İndirim Yönetimi
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ürünlere indirim uygulayın ve aktif indirimleri yönetin.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── Left: Apply discount ─────────────────────────────── */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
            <Percent className="h-4 w-4 text-indigo-500" />
            İndirim Uygula
          </h2>

          <input
            type="text"
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />

          <div className="mb-4 max-h-72 overflow-y-auto rounded-xl border border-slate-100">
            {productsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              </div>
            ) : productsError ? (
              <p className="py-6 text-center text-sm text-red-500">
                Ürünler yüklenirken hata oluştu.
              </p>
            ) : filteredProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Ürün bulunamadı.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pl-3 text-left">Seç</th>
                    <th className="py-2 text-left">Ürün Adı</th>
                    <th className="py-2 pr-3 text-right">Fiyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => {
                    const isDiscounted = discountedProductIds.has(Number(product.id));
                    const activeDiscount = discountByProductId.get(Number(product.id));
                    const originalPrice = activeDiscount
                      ? deriveOriginalPrice(product, activeDiscount.discount_rate)
                      : null;

                    return (
                      <tr
                        key={product.id}
                        onClick={() => toggleSelect(product.id)}
                        className={`transition-colors ${
                          isDiscounted
                            ? 'cursor-not-allowed bg-slate-50'
                            : 'cursor-pointer hover:bg-indigo-50'
                        }`}
                      >
                        <td className="py-2.5 pl-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(product.id)}
                            onChange={() => toggleSelect(product.id)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={isDiscounted}
                            className="h-4 w-4 rounded border-slate-300 accent-indigo-600 disabled:opacity-40"
                          />
                        </td>
                        <td className="py-2.5 font-medium text-slate-700">
                          {product.name}
                          {isDiscounted && (
                            <span className="ml-2 inline-block rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-600">
                              İndirim Aktif
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 text-right">
                          {originalPrice !== null ? (
                            <span className="flex flex-col items-end gap-0.5">
                              <span className="text-xs text-slate-400 line-through">
                                {originalPrice.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                })}
                              </span>
                              <span className="font-semibold text-green-600">
                                {product.price.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                })}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              {product.price.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {selectedIds.length > 0 && (
            <p className="mb-3 text-xs font-semibold text-indigo-600">
              {selectedIds.length} ürün seçildi
            </p>
          )}

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={100}
              placeholder="İndirim Oranı (%)"
              value={rate}
              onChange={(e) => {
                const v = e.target.value;
                setRate(v === '' ? '' : Math.min(100, Math.max(1, Number(v))));
              }}
              className="w-44 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleApply}
              disabled={!canApply}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isApplying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Percent className="h-4 w-4" />
              )}
              İndirim Uygula
            </button>
          </div>

          {applyError && (
            <p className="mt-3 text-xs font-medium text-red-500">{applyError}</p>
          )}
        </section>

        {/* ── Right: Active discounts ──────────────────────────── */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
            <Trash2 className="h-4 w-4 text-red-400" />
            Aktif İndirimler
          </h2>

          {discountsLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : discounts.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-400">Henüz aktif indirim yok.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="py-2 pl-3 text-left">Ürün</th>
                      <th className="py-2 text-center">Oran</th>
                      <th className="py-2 text-left">Tarih</th>
                      <th className="py-2 pr-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {discounts.map((discount) => {
                      const productName =
                        productMap.get(discount.product_ids[0]) ?? `#${discount.product_ids[0]}`;
                      const isThisDeleting =
                        deletingId === discount.id && deleteMutation.isPending;
                      const isThisEditing = editingId === discount.id;

                      return (
                        <tr key={discount.id} className="transition-colors hover:bg-slate-50">
                          <td className="py-3 pl-3 font-medium text-slate-700">
                            {productName}
                          </td>

                          {/* Rate cell: input when editing, badge otherwise */}
                          <td className="py-3 text-center">
                            {isThisEditing ? (
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={editRate}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setEditRate(
                                    v === '' ? '' : Math.min(100, Math.max(1, Number(v)))
                                  );
                                }}
                                autoFocus
                                className="w-20 rounded-lg border border-indigo-300 px-2 py-1 text-center text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                            ) : (
                              <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600">
                                %{discount.discount_rate}
                              </span>
                            )}
                          </td>

                          <td className="py-3 text-xs text-slate-500">
                            {new Date(discount.created_at).toLocaleDateString('tr-TR')}
                          </td>

                          {/* Action buttons */}
                          <td className="py-3 pr-3">
                            {isThisEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleEditSave(discount)}
                                  disabled={isEditing || editRate === ''}
                                  className="flex items-center gap-1 rounded-lg border border-green-200 px-2.5 py-1.5 text-xs font-bold text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
                                >
                                  {isEditing ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                  Kaydet
                                </button>
                                <button
                                  onClick={() => { setEditingId(null); setEditRate(''); setEditError(null); }}
                                  disabled={isEditing}
                                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
                                >
                                  <X className="h-3 w-3" />
                                  İptal
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingId(discount.id);
                                    setEditRate(discount.discount_rate);
                                    setEditError(null);
                                  }}
                                  disabled={isThisDeleting}
                                  className="flex items-center gap-1 rounded-lg border border-indigo-200 px-2.5 py-1.5 text-xs font-bold text-indigo-500 transition-colors hover:bg-indigo-50 disabled:opacity-50"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Düzenle
                                </button>
                                <button
                                  onClick={() => handleDelete(discount.id)}
                                  disabled={isThisDeleting}
                                  className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                                >
                                  {isThisDeleting ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                  Kaldır
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {editError && (
                <p className="mt-3 text-xs font-medium text-red-500">{editError}</p>
              )}
              {deleteError && (
                <p className="mt-3 text-xs font-medium text-red-500">{deleteError}</p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

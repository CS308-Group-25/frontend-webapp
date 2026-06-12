'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { fetchProducts, ProductGrid } from '@/features/products';
import { useQuery } from '@tanstack/react-query';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'reviews';

const sortLabels: Record<SortOption, string> = {
  default: 'Varsayılan',
  'price-asc': 'Fiyat: Düşükten Yükseğe',
  'price-desc': 'Fiyat: Yüksekten Düşüğe',
  rating: 'En Yüksek Puan',
  reviews: 'En Popüler',
};

const normalizeFilterValue = (value?: string) =>
  value?.trim().toLocaleLowerCase('tr-TR') ?? '';

const categoryFilterGroups = [
  {
    label: 'Protein Tozu',
    aliases: ['protein', 'protein tozu'],
    subcategories: [
      'Whey Protein Tozu',
      'Vegan Protein Tozu',
      'Kazein Protein Tozu',
      'İzolat Protein Tozu',
      'Hidrolize Protein Tozu',
    ],
  },
  {
    label: 'Spor Gıdaları',
    aliases: ['spor', 'spor gıdaları'],
    subcategories: [
      'Pre-Workout',
      'Kreatin',
      'Gainer',
      'Enerji Jeli',
      'Karbonhidrat Tozu',
    ],
  },
  {
    label: 'Vitamin',
    aliases: ['vitamin'],
    subcategories: ['Multivitamin', 'B12', 'D3', 'C Vitamini', 'Omega-3'],
  },
  {
    label: 'Amino Asit',
    aliases: ['amino', 'amino asit'],
    subcategories: ['BCAA', 'Glutamin', 'L-Karnitin', 'EAA', 'Beta Alanin'],
  },
  {
    label: 'Sağlık',
    aliases: ['sağlık', 'saglik'],
    subcategories: [
      'Probiyotik',
      'Kolajen',
      'Çinko',
      'Magnezyum',
      'Balık Yağı',
    ],
  },
  {
    label: 'Bar & Atıştırmalık',
    aliases: ['bar', 'atıştırmalık', 'bar & atıştırmalık'],
    subcategories: [
      'Protein Bar',
      'Enerji Bar',
      'Granola Bar',
      'Fıstık Ezmeli',
      'Brownie',
    ],
  },
  {
    label: 'Aksesuar',
    aliases: ['aksesuar'],
    subcategories: ['Shaker', 'Eldiven', 'Kemer', 'Çanta', 'Bileklik'],
  },
];

const mainCategories = [
  'Protein Tozu',
  'Spor Gıdaları',
  'Vitamin',
  'Amino Asit',
  'Sağlık',
  'Bar & Atıştırmalık',
  'Aksesuar',
];

// Number of product cards shown per page
const ITEMS_PER_PAGE = 24;

function getFilterTags(
  query: string,
  dynamicSubTypesByCategory: Record<string, string[]>
): string[] {
  // No query → always show the static top-level category list
  if (!query.trim()) return mainCategories;

  const q = normalizeFilterValue(query);

  // Find the hardcoded group that matches the query (used for alias resolution & fallback)
  const matchedGroup = categoryFilterGroups.find((group) => {
    const groupTerms = [
      group.label,
      ...group.aliases,
      ...group.subcategories,
    ].map(normalizeFilterValue);
    return groupTerms.some((term) => q.includes(term) || term.includes(q));
  });

  if (matchedGroup) {
    // Collect all dynamic subTypes stored under any alias/label key of this group
    const allKeys = [matchedGroup.label, ...matchedGroup.aliases].map(
      normalizeFilterValue
    );
    const relevantSet = new Set<string>();
    allKeys.forEach((key) => {
      (dynamicSubTypesByCategory[key] ?? []).forEach((st) =>
        relevantSet.add(st)
      );
    });
    const relevant = Array.from(relevantSet).sort();
    // Fall back to hardcoded list only if backend has nothing for this category
    return relevant.length > 0 ? relevant : matchedGroup.subcategories;
  }

  // Query doesn't match any known group → show static main categories
  return mainCategories;
}

/* ══════════════════════════════════════════════════════════════════ */

function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // We use the URL as a single "Source of Truth".
  // This technique makes it technically impossible for state mismatches to occur.
  const query = searchParams.get('q') || '';
  const sortBy = (searchParams.get('sort') || 'default') as SortOption;
  const tagsParam = searchParams.get('tags');
  const selectedTags = tagsParam ? tagsParam.split(',') : [];
  const [showFiltersState, setShowFiltersState] = useState(
    () => selectedTags.length > 0
  );
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const filterKey = `${query}|${sortBy}|${tagsParam}`;
  const activePage = currentPage;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterKey]);

  // Fetch ALL products once for correct client-side filtering
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => fetchProducts(200),
  });

  // Extract products array from API format, fallback to empty array.
  const allProducts = useMemo(() => data?.items ?? [], [data?.items]);

  // Build a category-name → brands[] map from real product data.
  const dynamicBrandsByCategory = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    allProducts.forEach((p) => {
      if (!p.brand) return;
      const catKey = normalizeFilterValue(p.category);
      if (catKey) {
        if (!map[catKey]) map[catKey] = new Set();
        map[catKey].add(p.brand);
      }
    });
    return Object.fromEntries(
      Object.entries(map).map(([k, v]) => [k, Array.from(v).sort()])
    );
  }, [allProducts]);

  // Build a category-name → subTypes[] map from real product data.
  // This lets getFilterTags find ALL subTypes for a category, including newly added ones.
  const dynamicSubTypesByCategory = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    allProducts.forEach((p) => {
      if (!p.subType) return;
      // Index by the product's own category name (normalised)
      const catKey = normalizeFilterValue(p.category);
      if (catKey) {
        if (!map[catKey]) map[catKey] = new Set();
        map[catKey].add(p.subType);
      }
    });
    return Object.fromEntries(
      Object.entries(map).map(([k, v]) => [k, Array.from(v).sort()])
    );
  }, [allProducts]);

  // Compute which brands to show in the filter panel based on the current query.
  // When a category group is matched, only show brands of products in that category.
  // Falls back to ALL brands when there is no specific category query.
  const visibleBrands = useMemo(() => {
    if (!query.trim()) {
      // No query: show all brands
      const all = new Set<string>();
      Object.values(dynamicBrandsByCategory).forEach((brands) =>
        brands.forEach((b) => all.add(b))
      );
      return Array.from(all).sort();
    }
    const q = normalizeFilterValue(query);
    const matchedGroup = categoryFilterGroups.find((group) => {
      const groupTerms = [
        group.label,
        ...group.aliases,
        ...group.subcategories,
      ].map(normalizeFilterValue);
      return groupTerms.some((term) => q.includes(term) || term.includes(q));
    });
    if (matchedGroup) {
      const allKeys = [matchedGroup.label, ...matchedGroup.aliases].map(
        normalizeFilterValue
      );
      const relevantSet = new Set<string>();
      allKeys.forEach((key) => {
        (dynamicBrandsByCategory[key] ?? []).forEach((b) => relevantSet.add(b));
      });
      // If we found category-specific brands, use them; else fall back to all
      if (relevantSet.size > 0) return Array.from(relevantSet).sort();
    }
    // Unknown query or no category match: show all brands
    const all = new Set<string>();
    Object.values(dynamicBrandsByCategory).forEach((brands) =>
      brands.forEach((b) => all.add(b))
    );
    return Array.from(all).sort();
  }, [query, dynamicBrandsByCategory]);

  useEffect(() => {
    sessionStorage.setItem('lastSearchQuery', query);
  }, [query]);

  const updateFilters = (newSort: SortOption, newTags: string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    // Clean up residual showFilters if it was previously set in the URL by older code
    params.delete('showFilters');

    if (newSort === 'default') params.delete('sort');
    else params.set('sort', newSort);

    if (newTags.length === 0) params.delete('tags');
    else params.set('tags', newTags.join(','));

    // By using router.replace, we edit the current state instead of adding a new page to the history stack.
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (val: SortOption) => {
    setShowSortMenu(false);
    updateFilters(val, selectedTags);
  };

  const handleToggleTag = (tag: string) => {
    let newTags: string[];
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter((t) => t !== tag);
    } else {
      newTags = [...selectedTags, tag];
    }
    updateFilters(sortBy, newTags);
  };

  const clearTags = () => {
    updateFilters(sortBy, []);
  };

  const handleToggleFiltersPanel = () => {
    setShowFiltersState((prev) => !prev);
  };

  /* ── Filtered + sorted products ────────────────────────────── */

  let filtered = [...allProducts];

  if (query.trim()) {
    const q = normalizeFilterValue(query);
    filtered = filtered.filter(
      (p) =>
        normalizeFilterValue(p.name).includes(q) ||
        normalizeFilterValue(p.description).includes(q) ||
        normalizeFilterValue(p.category).includes(q) ||
        normalizeFilterValue(p.subType).includes(q) ||
        p.tags?.some((tag) => normalizeFilterValue(tag).includes(q))
    );
  }

  if (selectedTags.length > 0) {
    const allBrandsSet = new Set(
      Object.values(dynamicBrandsByCategory).flatMap((brands) =>
        brands.map(normalizeFilterValue)
      )
    );
    const selectedBrands = selectedTags.filter((tag) =>
      allBrandsSet.has(normalizeFilterValue(tag))
    );
    const selectedCategoryTags = selectedTags.filter(
      (tag) => !allBrandsSet.has(normalizeFilterValue(tag))
    );

    filtered = filtered.filter((p) => {
      const productFilterTags = [p.category, p.subType, ...(p.tags ?? [])].map(
        normalizeFilterValue
      );

      const matchesCategory =
        selectedCategoryTags.length === 0 ||
        selectedCategoryTags.some((tag) =>
          productFilterTags.includes(normalizeFilterValue(tag))
        );

      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.some(
          (brand) =>
            normalizeFilterValue(p.brand) === normalizeFilterValue(brand)
        );

      return matchesCategory && matchesBrand;
    });
  }

  switch (sortBy) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'reviews':
      filtered.sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0));
      break;
  }

  /* ── Pagination calculation ─────────────────────────────────── */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safePage = Math.min(activePage, totalPages || 1);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filtered.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll back to top of grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Pagination button range ────────────────────────────────── */
  // Show at most 5 page buttons centred around the current page
  const getPageNumbers = () => {
    const delta = 2;
    const pages: (number | '...')[] = [];
    const left = Math.max(1, safePage - delta);
    const right = Math.min(totalPages, safePage + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push('...');
    }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className={`font-extrabold tracking-tight text-slate-900 ${query ? 'text-lg sm:text-xl' : 'text-3xl sm:text-4xl'}`}
        >
          {query
            ? `"${query.charAt(0).toLocaleUpperCase('tr-TR') + query.slice(1)}" için sonuçlar`
            : 'Ürünleri Keşfet'}
        </h1>
        <p className="mt-1 text-base text-slate-500">
          {isLoading ? (
            <span className="inline-block h-4 w-32 animate-pulse rounded bg-slate-200" />
          ) : (
            <>
              {filtered.length} ürün listeleniyor
              {totalPages > 1 && (
                <span className="ml-2 text-slate-400">
                  · Sayfa {safePage}/{totalPages}
                </span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Filter & Sort Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          id="filter-toggle"
          onClick={handleToggleFiltersPanel}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
            showFiltersState || selectedTags.length > 0
              ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
              : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-600'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtreler
          {selectedTags.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
              {selectedTags.length}
            </span>
          )}
        </button>

        {/* CUSTOM DROPDOWN TO FIX BROWSER SELECT BUGS AND IMPROVE UI */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] transition-all focus:ring-2 focus:ring-indigo-100 focus:outline-none ${
              sortBy !== 'default' || showSortMenu
                ? 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:border-indigo-300'
                : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-600 focus:border-indigo-500'
            }`}
          >
            {sortLabels[sortBy]}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showSortMenu
                  ? 'rotate-180 text-indigo-600'
                  : sortBy !== 'default'
                    ? 'text-indigo-600'
                    : 'text-slate-500'
              }`}
            />
          </button>

          {showSortMenu && (
            <>
              {/* Invisible backdrop to click away */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="animate-in fade-in zoom-in-95 absolute right-0 z-20 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] duration-200">
                {Object.entries(sortLabels).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => handleSortChange(value as SortOption)}
                    className={`block w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                      sortBy === value
                        ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter Panel (collapsible) */}
      {(showFiltersState || selectedTags.length > 0) && (
        <div className="animate-in fade-in slide-in-from-top-2 mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm duration-300">
          {/* Two-column layout: Kategoriler | Markalar */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Left column — Categories */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Kategoriler</p>
                {/* Mobile clear button */}
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearTags}
                    className="flex items-center gap-1 text-xs font-semibold text-red-500 transition-colors hover:text-red-600 sm:hidden"
                  >
                    <X className="h-3 w-3" />
                    Temizle
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {getFilterTags(query, dynamicSubTypesByCategory).map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
                        isActive
                          ? 'border-indigo-400 bg-indigo-600 text-white shadow-md shadow-indigo-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right column — Brands */}
            <div className="sm:border-l sm:border-slate-100 sm:pl-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Markalar</p>
                {/* Desktop clear button */}
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearTags}
                    className="hidden items-center gap-1 text-xs font-semibold text-red-500 transition-colors hover:text-red-600 sm:flex"
                  >
                    <X className="h-3 w-3" />
                    Temizle
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleBrands.length === 0 && isLoading && (
                  <span className="text-sm text-slate-400">Yükleniyor...</span>
                )}
                {visibleBrands.map((brand) => {
                  const isActive = selectedTags.includes(brand);
                  return (
                    <button
                      key={brand}
                      onClick={() => handleToggleTag(brand)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
                        isActive
                          ? 'border-violet-400 bg-violet-600 text-white shadow-md shadow-violet-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600'
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid or Loading States */}
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="animate-pulse font-medium">Ürünler Yükleniyor...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <p className="text-xl font-bold text-slate-900">Bir Hata Oluştu</p>
          <p className="text-slate-500">
            Ürünleri çekerken sunucu bağlantısı başarısız oldu.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <p className="mb-2 text-2xl font-bold text-slate-900">
            Ürün Bulunamadı
          </p>
          <p className="max-w-sm text-slate-500">
            Bu filtrelere uygun bir ürün stoklarımızda kalmamış olabilir.
            Aramanızı genişletmeyi deneyin!
          </p>
        </div>
      ) : (
        <>
          <ProductGrid products={paginatedProducts} />

          {/* ── Pagination Controls ──────────────────────────────── */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4">
              {/* Info text */}
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">
                  {startIndex + 1}–
                  {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
                </span>{' '}
                / {filtered.length} ürün gösteriliyor
              </p>

              {/* Page Buttons */}
              <div className="flex items-center gap-1.5">
                {/* Prev */}
                <button
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Önceki sayfa"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex h-10 w-10 items-center justify-center text-sm text-slate-400"
                    >
                      ···
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition-all ${
                        safePage === page
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Sonraki sayfa"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

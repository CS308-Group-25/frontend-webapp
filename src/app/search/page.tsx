'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { mockProducts } from '@/features/products/data/mock-products';
import ProductGrid from '@/features/products/components/ProductGrid';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'reviews';

const sortLabels: Record<SortOption, string> = {
  default: 'Önerilen',
  'price-asc': 'Fiyat: Düşükten Yükseğe',
  'price-desc': 'Fiyat: Yüksekten Düşüğe',
  rating: 'En Yüksek Puan',
  reviews: 'En Çok Yorumlanan',
};
/**
 * Sub-category filters per main category.
 * When a header category is active, these tags are shown in the filter panel.
 * When "Tüm Ürünler" is active (no query), main categories are shown instead.
 */
const categoryFilters: Record<string, string[]> = {
  protein: ['Whey', 'Vegan Protein', 'Kazein', 'İzolat', 'Protein Bar'],
  spor: ['Pre-Workout', 'Kreatin', 'BCAA', 'Gainer', 'Enerji Jeli'],
  vitamin: ['Multivitamin', 'B12', 'D3', 'C Vitamini', 'Omega-3'],
  amino: ['BCAA', 'Glutamin', 'L-Karnitin', 'EAA', 'Beta Alanin'],
  sağlık: ['Probiyotik', 'Kolajen', 'Çinko', 'Magnezyum', 'Balık Yağı'],
  bar: ['Protein Bar', 'Enerji Bar', 'Granola Bar', 'Fıstık Ezmeli', 'Brownie'],
  aksesuar: ['Shaker', 'Eldiven', 'Kemer', 'Çanta', 'Bileklik'],
};

const mainCategories = ['Protein', 'Spor Gıdaları', 'Vitamin', 'Amino Asit', 'Sağlık', 'Bar & Atıştırmalık', 'Aksesuar'];

/** Returns the appropriate filter tags based on the current search query */
function getFilterTags(query: string): string[] {
  if (!query.trim()) return mainCategories;
  const q = query.toLowerCase();
  // Find matching category key
  const matchedKey = Object.keys(categoryFilters).find((key) => q.includes(key));
  return matchedKey ? categoryFilters[matchedKey] : mainCategories;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearAllTags = () => setSelectedTags([]);

  const filtered = useMemo(() => {
    let result = [...mockProducts];

    // Search filter from URL query
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }

    // Category tag filter
    if (selectedTags.length > 0) {
      result = result.filter((p) => {
        const text = `${p.name} ${p.description}`.toLowerCase();
        return selectedTags.some((tag) => text.includes(tag.toLowerCase()));
      });
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return result;
  }, [query, sortBy, selectedTags]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {query ? `"${query}" için sonuçlar` : 'Ürünleri Keşfet'}
        </h1>
        <p className="mt-1 text-base text-slate-500">
          {filtered.length} ürün listeleniyor
        </p>
      </div>

      {/* Filter & Sort Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          id="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
            showFilters || selectedTags.length > 0
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

        <div className="relative">
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition-all hover:border-indigo-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {/* Filter Panel (collapsible) */}
      {showFilters && (
        <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700">Kategoriler</span>
            {selectedTags.length > 0 && (
              <button
                onClick={clearAllTags}
                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
                Temizle
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {getFilterTags(query).map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
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
      )}

      {/* Product Grid */}
      <ProductGrid products={filtered} />
    </div>
  );
}

/**
 * Reads the query param and passes it as a key to SearchContent.
 * When the key changes, React remounts the component, resetting all local state.
 */
function SearchPageInner() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  return <SearchContent key={query} />;
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}

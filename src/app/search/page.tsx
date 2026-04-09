'use client';

import { Suspense, useState } from 'react';
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

const categoryFilters: Record<string, string[]> = {
  protein: ['Whey', 'Vegan Protein', 'Kazein', 'İzolat', 'Protein Bar'],
  spor: ['Pre-Workout', 'Kreatin', 'BCAA', 'Gainer', 'Enerji Jeli'],
  vitamin: ['Multivitamin', 'B12', 'D3', 'C Vitamini', 'Omega-3'],
  amino: ['BCAA', 'Glutamin', 'L-Karnitin', 'EAA', 'Beta Alanin'],
  sağlık: ['Probiyotik', 'Kolajen', 'Çinko', 'Magnezyum', 'Balık Yağı'],
  bar: ['Protein Bar', 'Enerji Bar', 'Granola Bar', 'Fıstık Ezmeli', 'Brownie'],
  aksesuar: ['Shaker', 'Eldiven', 'Kemer', 'Çanta', 'Bileklik'],
};

import { useRouter, usePathname } from 'next/navigation';

const mainCategories = ['Protein', 'Spor Gıdaları', 'Vitamin', 'Amino Asit', 'Sağlık', 'Bar & Atıştırmalık', 'Aksesuar'];

function getFilterTags(query: string): string[] {
  if (!query.trim()) return mainCategories;
  const q = query.toLowerCase();
  const matchedKey = Object.keys(categoryFilters).find((key) => q.includes(key));
  return matchedKey ? categoryFilters[matchedKey] : mainCategories;
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
  const showFilters = searchParams.get('showFilters') === 'true';
  const [showSortMenu, setShowSortMenu] = useState(false);

  const updateFilters = (newSort: SortOption, newTags: string[], newShow: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSort === 'default') params.delete('sort');
    else params.set('sort', newSort);

    if (newTags.length === 0) params.delete('tags');
    else params.set('tags', newTags.join(','));

    if (newShow) params.set('showFilters', 'true');
    else params.delete('showFilters');

    // By using router.replace, we edit the current state instead of adding a new page to the history stack.
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (val: SortOption) => {
    setShowSortMenu(false);
    updateFilters(val, selectedTags, showFilters);
  };

  const handleToggleTag = (tag: string) => {
    let newTags: string[];
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter((t) => t !== tag);
    } else {
      newTags = [...selectedTags, tag];
    }
    updateFilters(sortBy, newTags, showFilters);
  };

  const clearTags = () => {
    updateFilters(sortBy, [], showFilters);
  };
  
  const handleToggleFiltersPanel = () => {
    updateFilters(sortBy, selectedTags, !showFilters);
  };

  /* ── Filtered + sorted products ────────────────────────────── */

  let filtered = [...mockProducts];

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)),
    );
  }

  if (selectedTags.length > 0) {
    filtered = filtered.filter((p) => {
      const text = `${p.name} ${p.description} ${p.category || ''}`.toLowerCase();
      return selectedTags.some((tag) => text.includes(tag.toLowerCase()));
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
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {query
            ? `"${query.charAt(0).toLocaleUpperCase('tr-TR') + query.slice(1)}" için sonuçlar`
            : 'Ürünleri Keşfet'}
        </h1>
        <p className="mt-1 text-base text-slate-500">
          {filtered.length} ürün listeleniyor
        </p>
      </div>

      {/* Filter & Sort Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          id="filter-toggle"
          onClick={handleToggleFiltersPanel}
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

        {/* CUSTOM DROPDOWN TO FIX BROWSER SELECT BUGS AND IMPROVE UI */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
              sortBy !== 'default' || showSortMenu
                ? 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:border-indigo-300'
                : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-600 focus:border-indigo-500'
            }`}
          >
            {sortLabels[sortBy]}
            <ChevronDown className={`h-4 w-4 transition-transform ${
              showSortMenu ? 'rotate-180 text-indigo-600' : (sortBy !== 'default' ? 'text-indigo-600' : 'text-slate-500')
            }`} />
          </button>
          
          {showSortMenu && (
            <>
              {/* Invisible backdrop to click away */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSortMenu(false)} 
              />
              <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] animate-in fade-in zoom-in-95 duration-200">
                {Object.entries(sortLabels).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => handleSortChange(value as SortOption)}
                    className={`block w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                      sortBy === value 
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200' 
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
      {(showFilters || selectedTags.length > 0) && (
        <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700">Kategoriler</span>
            {selectedTags.length > 0 && (
              <button
                onClick={clearTags}
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
      )}

      {/* Product Grid */}
      <ProductGrid products={filtered} />
    </div>
  );
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
      <SearchContent />
    </Suspense>
  );
}

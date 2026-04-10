'use client';

import { useState, useMemo } from 'react';
import { FolderPlus, ArrowDownUp, Search, Tag, Layers, Package, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';

import { mockCategories } from '@/features/admin/categories/data/mock-categories';
import type { Category, CategoryFormData, CategorySortOption } from '@/features/admin/categories/types/category.types';
import CategoryTable from '@/features/admin/categories/components/CategoryTable';
import CategoryModal from '@/features/admin/categories/components/CategoryModal';
import DeleteConfirmModal from '@/features/admin/categories/components/DeleteConfirmModal';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<CategorySortOption>('name_asc');
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSave = (data: CategoryFormData) => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id ? { ...c, ...data } : c,
        ),
      );
    } else {
      const newCategory: Category = {
        ...data,
        id: `cat-${Date.now()}`,
        productCount: 0,
        createdAt: new Date().toISOString(),
      };
      setCategories((prev) => [newCategory, ...prev]);
    }
    setIsModalOpen(false);
    setEditingCategory(undefined);
  };

  const handleDeleteRequest = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleDeleteConfirm = () => {
    if (!deletingCategory) return;
    setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
    setDeletingCategory(null);
  };

  // ─── Derived: filtered + sorted ────────────────────────────────────────────

  const processedCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? categories.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query),
        )
      : categories;

    const sorted = [...filtered];
    switch (sortBy) {
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        break;
      case 'name_desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
        break;
      case 'most_products':
        sorted.sort((a, b) => b.productCount - a.productCount);
        break;
      case 'least_products':
        sorted.sort((a, b) => a.productCount - b.productCount);
        break;
    }
    return sorted;
  }, [categories, searchQuery, sortBy]);

  const existingNames = useMemo(() => categories.map((c) => c.name), [categories]);

  const totalProducts = useMemo(
    () => categories.reduce((sum, c) => sum + c.productCount, 0),
    [categories],
  );

  const isSearchActive = searchQuery.trim().length > 0;
  const isFiltered = isSearchActive && processedCategories.length === 0;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/admin" className="transition-colors hover:text-indigo-600">
          Yönetim Paneli
        </Link>
        <span className="select-none">/</span>
        <Link href="/admin/products" className="transition-colors hover:text-indigo-600">
          Ürünler
        </Link>
        <span className="select-none">/</span>
        <span className="font-semibold text-slate-700">Kategoriler</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Kategori Yönetimi
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ürün kategorilerini görüntüleyin, ekleyin ve yönetin.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 sm:w-auto"
        >
          <FolderPlus className="h-5 w-5" />
          Yeni Kategori
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/* Total categories */}
        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50">
            <Layers className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Toplam Kategori
            </p>
            <p className="mt-0.5 text-3xl font-extrabold text-slate-900">{categories.length}</p>
          </div>
        </div>

        {/* Total products */}
        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <Package className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Toplam Ürün
            </p>
            <p className="mt-0.5 text-3xl font-extrabold text-slate-900">{totalProducts}</p>
          </div>
        </div>

        {/* Filtered results */}
        <div className="col-span-2 flex items-center gap-4 rounded-2xl bg-indigo-600 p-5 shadow-md shadow-indigo-500/20 sm:col-span-1">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500">
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">
              {isSearchActive ? 'Bulunan Sonuç' : 'Gösterilen'}
            </p>
            <p className="mt-0.5 text-3xl font-extrabold text-white">
              {processedCategories.length}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar: search + sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kategori adı veya açıklamayla ara…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Aramayı temizle"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative flex items-center sm:w-56">
          <ArrowDownUp className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as CategorySortOption)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-colors hover:border-indigo-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="name_asc">İsim (A–Z)</option>
            <option value="name_desc">İsim (Z–A)</option>
            <option value="most_products">En Fazla Ürün</option>
            <option value="least_products">En Az Ürün</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Category table */}
      <CategoryTable
        categories={processedCategories}
        onEdit={openEditModal}
        onDelete={handleDeleteRequest}
        onAddNew={openAddModal}
        isFiltered={isSearchActive && processedCategories.length === 0}
      />

      {/* No search results inline hint (when table is not empty but we want extra context) */}
      {isFiltered && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-amber-50 px-5 py-3.5 text-sm text-amber-700 ring-1 ring-amber-200">
          <Tag className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>&quot;{searchQuery}&quot;</strong> için sonuç bulunamadı.{' '}
            <button
              onClick={() => setSearchQuery('')}
              className="underline underline-offset-2 transition-colors hover:text-amber-900"
            >
              Aramayı temizle
            </button>{' '}
            ve tüm kategorileri görüntüleyin.
          </span>
        </div>
      )}

      {/* Add / Edit modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSave}
        initialData={editingCategory}
        existingNames={existingNames}
      />

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        category={deletingCategory}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}

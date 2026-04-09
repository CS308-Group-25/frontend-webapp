'use client';

import { useState, useMemo } from 'react';
import { PackagePlus, ArrowDownUp } from 'lucide-react';
import { mockProducts } from '@/features/products/data/mock-products';
import type { Product } from '@/features/products/types/product.types';
import ProductTable from '@/features/admin/products/components/ProductTable';
import ProductModal from '@/features/admin/products/components/ProductModal';
import Link from 'next/link';

type SortOption = 'urgency' | 'name_asc' | 'price_asc' | 'price_desc' | 'stock_desc' | 'newest' | 'rating_asc' | 'rating_desc';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('urgency');

  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: Math.random().toString(36).substr(2, 9), // simple unique ID for local state
      rating: 0,
      reviewCount: 0,
      isNew: true,
    };
    
    setProducts((prev) => [newProduct, ...prev]);
    setIsModalOpen(false);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const sortedProducts = useMemo(() => {
    const list = [...products];

    switch (sortBy) {
      case 'urgency': {
        const urgencyMap = { out_of_stock: 0, low_stock: 1, in_stock: 2 };
        return list.sort((a, b) => {
          const urgencyDiff = urgencyMap[a.stockStatus] - urgencyMap[b.stockStatus];
          if (urgencyDiff !== 0) return urgencyDiff;
          // secondary sort by stock count if same urgency
          return (a.stockCount || 0) - (b.stockCount || 0);
        });
      }
      case 'name_asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'stock_desc':
        return list.sort((a, b) => (b.stockCount || 0) - (a.stockCount || 0));
      case 'rating_asc':
        return list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case 'rating_desc':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        // list uses insertion order natively (we prepend new products). 
        // We can just return it to respect literal newest-first.
        // For mock items, pushing 'isNew' items up inside existing order visually helps.
        return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      default:
        return list;
    }
  }, [products, sortBy]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 text-sm text-slate-400">
            <Link href="/" className="transition-colors hover:text-indigo-600">Ana Sayfa</Link>
            <span className="mx-2">•</span>
            <span className="font-bold text-slate-700">Yönetim Paketi</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Ürün Yönetimi
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Katalogdaki tüm ürünleri kolayca görüntüleyin, ekleyin ve düzenleyin.
          </p>
        </div>
        <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative flex items-center w-full sm:w-auto">
            <div className="absolute left-3 text-slate-400">
              <ArrowDownUp className="h-4 w-4" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-colors hover:border-indigo-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:w-48"
            >
              <option value="urgency">Stok Aciliyeti (Önerilen)</option>
              <option value="newest">En Yeni Eklenenler</option>
              <option value="name_asc">İsim (A&apos;dan Z&apos;ye)</option>
              <option value="price_asc">Fiyat (Düşükten Yükseğe)</option>
              <option value="price_desc">Fiyat (Yüksekten Düşüğe)</option>
              <option value="stock_desc">Stok (En Çok)</option>
              <option value="rating_desc">Rating (En Yüksek)</option>
              <option value="rating_asc">Rating (En Düşük)</option>
            </select>
          </div>
          <button
            onClick={openAddModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 sm:w-auto"
          >
            <PackagePlus className="h-5 w-5" />
            Yeni Ürün
          </button>
        </div>
      </div>

      {/* Content */}
      <ProductTable
        products={sortedProducts}
        onEdit={openEditModal}
        onDelete={handleDeleteProduct}
      />

      {/* Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProduct}
        onSave={(data) => {
          if (editingProduct) {
            handleEditProduct(data as Product);
          } else {
            handleAddProduct(data as Omit<Product, 'id'>);
          }
        }}
      />
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { PackagePlus, ArrowDownUp, Loader2 } from 'lucide-react';
import { Product, fetchProducts, PaginatedProductResponse } from '@/features/products';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import ProductTable from '@/features/admin/products/components/ProductTable';
import ProductModal from '@/features/admin/products/components/ProductModal';
import { patchProduct, ProductUpdatePayload } from '@/features/admin/products/api';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth';

const QUERY_KEY = ['admin', 'products'] as const;

type SortOption = 'urgency' | 'name_asc' | 'price_asc' | 'price_desc' | 'stock_desc' | 'newest' | 'rating_asc' | 'rating_desc';

function buildPayload(product: Product): ProductUpdatePayload {
  return {
    name: product.name,
    description: product.description,
    original_price: product.originalPrice,
    images: product.image ? [product.image] : undefined,
    stock: product.stockCount,
    stock_status: product.stockStatus,
    is_new: product.isNew,
    brand: product.brand,
    model: product.model,
    serial_no: product.serialNumber,
    warranty: product.warrantyStatus,
    distributor: product.distributor,
    sub_type: product.subType,
    ingredients: product.ingredients,
    nutrition_facts: product.nutritionFacts,
    usage_info: product.usage,
    features: product.features,
    flavors_json: product.flavors,
    sizes_json: product.sizes,
  };
}

export default function AdminProductsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('urgency');

  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchProducts(200),
  });

  const products = useMemo(() => data?.items ?? [], [data]);

  const updateCache = (updater: (prev: Product[]) => Product[]) => {
    queryClient.setQueryData<PaginatedProductResponse>(QUERY_KEY, (old) =>
      old ? { ...old, items: updater(old.items) } : old
    );
  };

  const editMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductUpdatePayload }) =>
      patchProduct(id, payload),
    onSuccess: (_, { id, payload }) => {
      updateCache((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                name: payload.name ?? p.name,
                description: payload.description ?? p.description,
                originalPrice: payload.original_price ?? p.originalPrice,
                image: payload.images?.[0] ?? p.image,
                stockCount: payload.stock ?? p.stockCount,
                stockStatus: (payload.stock_status as Product['stockStatus']) ?? p.stockStatus,
                isNew: payload.is_new ?? p.isNew,
                ingredients: payload.ingredients ?? p.ingredients,
                nutritionFacts: payload.nutrition_facts ?? p.nutritionFacts,
                usage: payload.usage_info ?? p.usage,
                features: payload.features ?? p.features,
                flavors: payload.flavors_json ?? p.flavors,
                sizes: payload.sizes_json ?? p.sizes,
              }
            : p
        )
      );
      toast.success('Ürün başarıyla güncellendi.');
      setIsModalOpen(false);
    },
    onError: (err: string) => {
      toast.error(err);
    },
  });

  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: Math.random().toString(36).substr(2, 9),
      rating: 0,
      reviewCount: 0,
      isNew: true,
    };
    updateCache((prev) => [newProduct, ...prev]);
    setIsModalOpen(false);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    editMutation.mutate({ id: updatedProduct.id, payload: buildPayload(updatedProduct) });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      updateCache((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSetPrice = (id: string, newPrice: number) => {
    updateCache((prev) => prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p)));
  };

  const sortedProducts = useMemo(() => {
    const list = [...products];

    switch (sortBy) {
      case 'urgency': {
        const urgencyMap = { out_of_stock: 0, low_stock: 1, in_stock: 2 };
        return list.sort((a, b) => {
          const urgencyDiff = urgencyMap[a.stockStatus] - urgencyMap[b.stockStatus];
          if (urgencyDiff !== 0) return urgencyDiff;
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
          {user?.role === 'product_manager' && (
            <button
              onClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 sm:w-auto"
            >
              <PackagePlus className="h-5 w-5" />
              Yeni Ürün
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : isError ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-red-500">Ürünler yüklenirken bir hata oluştu.</p>
        </div>
      ) : (
        <ProductTable
          products={sortedProducts}
          onEdit={user?.role === 'product_manager' ? (product) => { setEditingProduct(product); setIsModalOpen(true); } : undefined}
          onDelete={user?.role === 'product_manager' ? handleDeleteProduct : undefined}
          onSetPrice={user?.role === 'sales_manager' ? handleSetPrice : undefined}
        />
      )}

      {/* Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProduct}
        isSaving={editMutation.isPending}
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

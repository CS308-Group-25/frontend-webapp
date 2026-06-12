'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PackagePlus, ArrowDownUp, ShieldX } from 'lucide-react';
import {
  AdminProductPayload,
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  fetchCategories,
  fetchAdminProductDetail,
  PaginatedProductResponse,
  Product,
  updateAdminProduct,
} from '@/features/products';
import { useAuthStore } from '@/features/auth';
import ProductTable from '@/features/admin/products/components/ProductTable';
import ProductModal from '@/features/admin/products/components/ProductModal';
import DeleteProductModal from '@/features/admin/products/components/DeleteProductModal';
import { fetchAdminCategories } from '@/features/admin/categories/api/categories.api';
import Link from 'next/link';
import { toast } from 'sonner';

type SortOption =
  | 'urgency'
  | 'name_asc'
  | 'stock_desc'
  | 'newest'
  | 'rating_asc'
  | 'rating_desc';
type CategoryFieldObject = {
  id?: unknown;
  category_id?: unknown;
  categoryId?: unknown;
  category?: unknown;
  name?: unknown;
  title?: unknown;
  label?: unknown;
  value?: unknown;
  brand?: unknown;
  brands?: unknown;
  brand_names?: unknown;
  brandNames?: unknown;
  subcategory?: unknown;
  sub_category?: unknown;
  subCategory?: unknown;
  subTypes?: unknown;
  sub_types?: unknown;
  subType?: unknown;
  subcategories?: unknown;
  sub_categories?: unknown;
  subCategories?: unknown;
  children?: unknown;
};
type CategoryFieldItem = string | CategoryFieldObject;
type CategoryOptionSet = { brands: string[]; subTypes: string[] };
type ProductListingMetadata = {
  categories?: unknown;
  category_options?: unknown;
  categoryOptions?: unknown;
  filters?: {
    categories?: unknown;
    category_options?: unknown;
    categoryOptions?: unknown;
  };
  filter_options?: {
    categories?: unknown;
    category_options?: unknown;
    categoryOptions?: unknown;
  };
  filterOptions?: {
    categories?: unknown;
    category_options?: unknown;
    categoryOptions?: unknown;
  };
  facets?: {
    categories?: unknown;
    category_options?: unknown;
    categoryOptions?: unknown;
  };
};
const CATALOG_CATEGORY_FALLBACKS: Record<string, CategoryOptionSet> = {
  'protein tozu': {
    brands: [],
    subTypes: [
      'Whey Protein Tozu',
      'Vegan Protein Tozu',
      'Kazein Protein Tozu',
      'İzolat Protein Tozu',
      'Hidrolize Protein Tozu',
    ],
  },
  'spor gıdaları': {
    brands: [],
    subTypes: [
      'Pre-Workout',
      'Kreatin',
      'Gainer',
      'Enerji Jeli',
      'Karbonhidrat Tozu',
    ],
  },
  vitamin: {
    brands: [],
    subTypes: ['Multivitamin', 'B12', 'D3', 'C Vitamini', 'Omega-3'],
  },
  'amino asit': {
    brands: [],
    subTypes: ['BCAA', 'Glutamin', 'L-Karnitin', 'EAA', 'Beta Alanin'],
  },
  sağlık: {
    brands: [],
    subTypes: ['Probiyotik', 'Kolajen', 'Çinko', 'Magnezyum', 'Balık Yağı'],
  },
  'bar & atıştırmalık': {
    brands: [],
    subTypes: [
      'Protein Bar',
      'Enerji Bar',
      'Granola Bar',
      'Fıstık Ezmeli',
      'Brownie',
    ],
  },
  aksesuar: {
    brands: [],
    subTypes: ['Shaker', 'Eldiven', 'Kemer', 'Çanta', 'Bileklik'],
  },
};

function productToAdminPayload(
  product: Omit<Product, 'id'> | Product
): AdminProductPayload {
  const stockValue = product.stockCount as unknown;
  const stock = Number(stockValue);

  if (
    stockValue === '' ||
    stockValue === undefined ||
    stockValue === null ||
    !Number.isFinite(stock) ||
    stock < 0
  ) {
    throw new Error('Stok sayısı zorunludur.');
  }

  return {
    name: product.name,
    description: product.description || null,
    stock,
    brand: product.brand || null,
    model: product.model || null,
    serial_no: product.serialNumber || null,
    warranty: product.warrantyStatus || null,
    distributor: product.distributor || null,
    sub_type: product.subType || null,
    flavor: product.flavors?.[0]?.name || null,
    serving_size: product.sizes?.[0]?.label || null,
    goal_tags: product.tags?.length ? product.tags.join(',') : null,
    category_id: product.categoryId ?? null,
    images: product.images?.length
      ? product.images
      : product.image
        ? [product.image]
        : null,
    tags_json: product.tags?.length ? product.tags : null,
    flavors_json: product.flavors?.length ? product.flavors : null,
    sizes_json: product.sizes?.length ? product.sizes : null,
    features: product.features?.length ? product.features : null,
    ingredients: product.ingredients || null,
    nutrition_facts: product.nutritionFacts?.length
      ? product.nutritionFacts
      : null,
    usage_info: product.usage || null,
  };
}

function getCategoryFieldNames(value: unknown): string[] {
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(value)) return [];

  return value
    .flatMap((item: CategoryFieldItem) => {
      if (typeof item === 'string') {
        return item
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean);
      }
      if (!item || typeof item !== 'object') return '';

      const name =
        item.name ??
        item.title ??
        item.label ??
        item.value ??
        item.brand ??
        item.subcategory ??
        item.sub_category;
      if (typeof name === 'string') return name;
      if (
        name &&
        typeof name === 'object' &&
        'name' in name &&
        typeof name.name === 'string'
      )
        return name.name;

      return '';
    })
    .filter(Boolean);
}

function getNestedCategoryFieldNames(
  value: unknown,
  fields: Array<keyof CategoryFieldObject>
): string[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item: CategoryFieldItem) => {
    if (!item || typeof item !== 'object') return [];

    return fields.flatMap((field) => getCategoryFieldNames(item[field]));
  });
}

function normalizeCategoryName(value?: string): string {
  return value?.trim().toLocaleLowerCase('tr-TR') ?? '';
}

function getParentCategoryKeys(product: Product): string[] {
  const productCategory = normalizeCategoryName(product.category);
  const productSubType = normalizeCategoryName(product.subType);
  const keys = new Set<string>();

  Object.entries(CATALOG_CATEGORY_FALLBACKS).forEach(
    ([parentCategory, options]) => {
      const subTypeNames = options.subTypes.map(normalizeCategoryName);

      if (
        productCategory === parentCategory ||
        productSubType === parentCategory ||
        subTypeNames.includes(productCategory) ||
        subTypeNames.includes(productSubType)
      ) {
        keys.add(parentCategory);
      }
    }
  );

  return Array.from(keys);
}

function getFirstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }

  return undefined;
}

function getCatalogCategoryEntries(
  productsData: ProductListingMetadata | undefined
): CategoryFieldItem[] {
  const categorySources = [
    productsData?.categories,
    productsData?.category_options,
    productsData?.categoryOptions,
    productsData?.filters?.categories,
    productsData?.filters?.category_options,
    productsData?.filters?.categoryOptions,
    productsData?.filter_options?.categories,
    productsData?.filter_options?.category_options,
    productsData?.filter_options?.categoryOptions,
    productsData?.filterOptions?.categories,
    productsData?.filterOptions?.category_options,
    productsData?.filterOptions?.categoryOptions,
    productsData?.facets?.categories,
    productsData?.facets?.category_options,
    productsData?.facets?.categoryOptions,
  ];

  return (
    categorySources.find((source): source is CategoryFieldItem[] =>
      Array.isArray(source)
    ) ?? []
  );
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const isAuthorized =
    isAuthenticated &&
    (user?.role === 'product_manager' || user?.role === 'sales_manager');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('urgency');
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: productsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['products', 'admin'],
    queryFn: () => fetchAdminProducts(1000),
    enabled: isAuthorized,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: subCategories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchAdminCategories,
  });

  const createProductMutation = useMutation({
    mutationFn: (product: Omit<Product, 'id'>) =>
      createAdminProduct(productToAdminPayload(product)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Ürün oluşturuldu.');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(String(error));
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (product: Product) =>
      updateAdminProduct(product.id, productToAdminPayload(product)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Ürün güncellendi.');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(String(error));
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Ürün silindi.');
    },
    onError: (error) => {
      toast.error(String(error));
    },
  });

  const products = useMemo(() => productsData?.items ?? [], [productsData]);
  const productCategoryOptions = useMemo(() => {
    const optionsById: Record<number, CategoryOptionSet> = {};
    const optionsByName: Record<string, CategoryOptionSet> = {};

    products.forEach((product) => {
      const categoryName = normalizeCategoryName(product.category);
      const parentCategoryNames = getParentCategoryKeys(product);
      const targetOptions = [
        product.categoryId
          ? (optionsById[product.categoryId] ??= {
              brands: [],
              subTypes: [],
            })
          : undefined,
        categoryName
          ? (optionsByName[categoryName] ??= {
              brands: [],
              subTypes: [],
            })
          : undefined,
        ...parentCategoryNames.map(
          (parentCategoryName) =>
            (optionsByName[parentCategoryName] ??= {
              brands: [],
              subTypes: [],
            })
        ),
      ].filter((option): option is CategoryOptionSet => Boolean(option));

      if (targetOptions.length === 0) return;

      if (product.brand) {
        targetOptions.forEach((option) =>
          option.brands.push(product.brand as string)
        );
      }

      if (product.subType) {
        targetOptions.forEach((option) =>
          option.subTypes.push(product.subType as string)
        );
      }
    });

    return {
      optionsById: Object.fromEntries(
        Object.entries(optionsById).map(([categoryId, values]) => [
          Number(categoryId),
          {
            brands: values.brands,
            subTypes: values.subTypes,
          },
        ])
      ),
      optionsByName: Object.fromEntries(
        Object.entries(optionsByName).map(([categoryName, values]) => [
          categoryName,
          {
            brands: values.brands,
            subTypes: values.subTypes,
          },
        ])
      ),
    };
  }, [products]);
  const listingCategoryOptions = useMemo(() => {
    const optionsById: Record<number, CategoryOptionSet> = {};
    const optionsByName: Record<string, CategoryOptionSet> = {};

    const catalogEntries = getCatalogCategoryEntries(
      productsData as ProductListingMetadata | undefined
    );
    for (const category of catalogEntries) {
      if (!category || typeof category !== 'object') continue;

      const idValue =
        category.id ?? category.category_id ?? category.categoryId;
      const categoryId =
        typeof idValue === 'number' ? idValue : Number(idValue);
      const categoryName = getFirstString(
        category.name,
        category.title,
        category.label,
        category.value,
        category.category
      );
      const options = {
        brands: [] as string[],
        subTypes: [] as string[],
      };

      Object.assign(options, {
        brands: [
          ...getCategoryFieldNames(category.brands),
          ...getCategoryFieldNames(category.brand_names),
          ...getCategoryFieldNames(category.brandNames),
          ...getNestedCategoryFieldNames(category.subcategories, [
            'brands',
            'brand_names',
            'brandNames',
          ]),
          ...getNestedCategoryFieldNames(category.sub_categories, [
            'brands',
            'brand_names',
            'brandNames',
          ]),
          ...getNestedCategoryFieldNames(category.subCategories, [
            'brands',
            'brand_names',
            'brandNames',
          ]),
          ...getNestedCategoryFieldNames(category.children, [
            'brands',
            'brand_names',
            'brandNames',
          ]),
        ],
        subTypes: [
          ...getCategoryFieldNames(category.subTypes),
          ...getCategoryFieldNames(category.sub_types),
          ...getCategoryFieldNames(category.subType),
          ...getCategoryFieldNames(category.subcategories),
          ...getCategoryFieldNames(category.sub_categories),
          ...getCategoryFieldNames(category.subCategories),
          ...getCategoryFieldNames(category.children),
          ...getCategoryFieldNames(category.subcategory),
          ...getCategoryFieldNames(category.sub_category),
          ...getCategoryFieldNames(category.subCategory),
        ],
      });

      if (options.brands.length === 0 && options.subTypes.length === 0)
        continue;
      if (Number.isFinite(categoryId)) {
        optionsById[categoryId] = options;
      }
      if (categoryName) {
        optionsByName[normalizeCategoryName(categoryName)] = options;
      }
    }

    return { optionsById, optionsByName };
  }, [productsData]);
  const categoryOptions = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => {
          const listingOptions =
            listingCategoryOptions.optionsById[category.id] ??
            listingCategoryOptions.optionsByName[
              normalizeCategoryName(category.name)
            ];
          const productOptions =
            productCategoryOptions.optionsById[category.id] ??
            productCategoryOptions.optionsByName[
              normalizeCategoryName(category.name)
            ];
          const catalogFallback =
            CATALOG_CATEGORY_FALLBACKS[normalizeCategoryName(category.name)];
          const brands = [
            ...getCategoryFieldNames(category.brands),
            ...getCategoryFieldNames(category.brand_names),
            ...getCategoryFieldNames(category.brandNames),
          ];
          const subTypes = [
            ...getCategoryFieldNames(category.subTypes),
            ...getCategoryFieldNames(category.sub_types),
            ...getCategoryFieldNames(category.subType),
            ...getCategoryFieldNames(category.subcategories),
            ...getCategoryFieldNames(category.sub_categories),
            ...getCategoryFieldNames(category.subCategories),
            ...getCategoryFieldNames(category.children),
          ];

          return [
            category.id,
            {
              brands: [
                ...(listingOptions?.brands ?? []),
                ...brands,
                ...(productOptions?.brands ?? []),
                ...(catalogFallback?.brands ?? []),
              ],
              subTypes: [
                ...(listingOptions?.subTypes ?? []),
                ...subTypes,
                ...(productOptions?.subTypes ?? []),
                ...(catalogFallback?.subTypes ?? []),
              ],
            },
          ];
        })
      ),
    [categories, listingCategoryOptions, productCategoryOptions]
  );
  const brandOptions = useMemo(
    () =>
      Array.from(
        new Set(
          products.flatMap((product) => (product.brand ? [product.brand] : []))
        )
      ).sort(),
    [products]
  );
  const isSaving =
    createProductMutation.isPending || updateProductMutation.isPending;

  const handleSetPrice = (id: string, newPrice: number) => {
    queryClient.setQueryData<PaginatedProductResponse>(
      ['products', 'admin'],
      (old) =>
        old
          ? {
              ...old,
              items: old.items.map((p) =>
                p.id === id ? { ...p, price: newPrice } : p
              ),
            }
          : old
    );
  };

  const handleDeleteProduct = (id: string) => {
    const product = productsData?.items.find(
      (p) => String(p.id) === String(id)
    );
    setPendingDelete({ id, name: product?.name ?? 'Ürün' });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteProductMutation.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  };

  const openAddModal = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = async (product: Product) => {
    try {
      const productDetail = await fetchAdminProductDetail(product.id);
      setEditingProduct({ ...product, ...productDetail });
    } catch (error) {
      toast.error(String(error));
      setEditingProduct(product);
    }

    setIsModalOpen(true);
  };

  const sortedProducts = useMemo(() => {
    const list = [...products];

    switch (sortBy) {
      case 'urgency': {
        const urgencyMap = { out_of_stock: 0, low_stock: 1, in_stock: 2 };
        return list.sort((a, b) => {
          const urgencyDiff =
            urgencyMap[a.stockStatus] - urgencyMap[b.stockStatus];
          if (urgencyDiff !== 0) return urgencyDiff;
          // secondary sort by stock count if same urgency
          return (a.stockCount || 0) - (b.stockCount || 0);
        });
      }
      case 'name_asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
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

  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-2xl bg-red-50 p-4">
            <ShieldX className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Yetkisiz Erişim
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Bu sayfaya erişim için yönetici yetkisi gereklidir.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 text-sm text-slate-400">
            <Link href="/" className="transition-colors hover:text-indigo-600">
              Ana Sayfa
            </Link>
            <span className="mx-2">•</span>
            <span className="font-bold text-slate-700">Yönetim Paketi</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Ürün Yönetimi
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Katalogdaki tüm ürünleri kolayca görüntüleyin, ekleyin ve
            düzenleyin.
          </p>
        </div>
        <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative flex w-full items-center sm:w-auto">
            <div className="absolute left-3 text-slate-400">
              <ArrowDownUp className="h-4 w-4" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-10 text-sm font-semibold text-slate-700 shadow-sm transition-colors outline-none hover:border-indigo-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:w-48"
            >
              <option value="urgency">Stok Aciliyeti (Önerilen)</option>
              <option value="newest">En Yeni Eklenenler</option>
              <option value="name_asc">İsim (A&apos;dan Z&apos;ye)</option>
              <option value="stock_desc">Stok (En Çok)</option>
              <option value="rating_desc">Rating (En Yüksek)</option>
              <option value="rating_asc">Rating (En Düşük)</option>
            </select>
          </div>
          {user?.role === 'product_manager' && (
            <button
              onClick={openAddModal}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 sm:w-auto"
            >
              <PackagePlus className="h-5 w-5" />
              Yeni Ürün
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            Ürünler yükleniyor...
          </p>
        </div>
      ) : isError ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-red-100">
          <p className="text-lg font-bold text-red-600">Ürünler yüklenemedi.</p>
          <p className="mt-1 text-sm text-red-400">
            Backend bağlantısını kontrol edip tekrar deneyin.
          </p>
        </div>
      ) : (
        <ProductTable
          products={sortedProducts}
          onEdit={user?.role === 'product_manager' ? openEditModal : undefined}
          onDelete={
            user?.role === 'product_manager' ? handleDeleteProduct : undefined
          }
          onSetPrice={
            user?.role === 'sales_manager' ? handleSetPrice : undefined
          }
        />
      )}

      {/* Modal */}
      <DeleteProductModal
        productName={pendingDelete?.name ?? null}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProduct}
        categories={categories}
        subCategories={subCategories}
        brandOptions={brandOptions}
        categoryOptions={categoryOptions}
        isSaving={isSaving}
        onSave={(data) => {
          if (editingProduct) {
            updateProductMutation.mutate({
              ...editingProduct,
              ...(data as Product),
            });
          } else {
            createProductMutation.mutate(data as Omit<Product, 'id'>);
          }
        }}
      />
    </div>
  );
}

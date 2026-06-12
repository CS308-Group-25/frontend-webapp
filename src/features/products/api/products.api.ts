import apiClient from '@/lib/api-client';
import type { Product, StockStatus, ProductFlavor, ProductSize, NutritionRow } from '../types/product.types';

export interface PaginatedProductResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  categories?: unknown;
  category_options?: unknown;
  categoryOptions?: unknown;
  filters?: unknown;
  filter_options?: unknown;
  filterOptions?: unknown;
  facets?: unknown;
}

export interface ProductReviewPayload {
  rating?: number;
  comment?: string;
}

export interface ProductReview {
  id: number;
  product_id: number;
  user_id: number;
  rating: number | null;
  comment: string | null;
  approval_status: string;
  created_at: string;
  customer_name?: string | null;
}

export interface CategoryOption {
  id: number;
  name: string;
  description?: string | null;
  brands?: unknown;
  brand_names?: unknown;
  brandNames?: unknown;
  subTypes?: unknown;
  sub_types?: unknown;
  subType?: unknown;
  subcategories?: unknown;
  sub_categories?: unknown;
  subCategories?: unknown;
  children?: unknown;
}

export interface AdminProductPayload {
  name: string;
  model?: string | null;
  serial_no?: string | null;
  description?: string | null;
  stock: number;
  warranty?: string | null;
  distributor?: string | null;
  brand?: string | null;
  sub_type?: string | null;
  flavor?: string | null;
  form?: string | null;
  serving_size?: string | null;
  goal_tags?: string | null;
  category_id?: number | null;
  images?: string[] | null;
  tags_json?: string[] | null;
  flavors_json?: ProductFlavor[] | null;
  sizes_json?: ProductSize[] | null;
  features?: string[] | null;
  ingredients?: string | null;
  nutrition_facts?: NutritionRow[] | null;
  usage_info?: string | null;
}

// Raw response shape as returned by the FastAPI backend (snake_case)
interface BackendProductRaw {
  id: number;
  name: string;
  model: string | null;
  serial_no: string | null;
  description: string | null;
  price: string | null;
  warranty: string | null;
  distributor: string | null;
  original_price: string | null;
  stock: number;
  stock_status: string | null;
  is_new: boolean | null;
  rating: string | null;
  review_count: number | null;
  comment_count: number | null;
  brand: string | null;
  brand_name?: string | null;
  manufacturer?: string | null;
  manufacturer_name?: string | null;
  sub_type: string | null;
  goal_tags: string | null;
  images: string[] | null;
  tags_json: string[] | null;
  flavors_json: ProductFlavor[] | null;
  sizes_json: ProductSize[] | null;
  ingredients: string | null;
  nutrition_facts: NutritionRow[] | null;
  usage_info: string | null;
  features: string[] | null;
  category_id?: number | null;
  category: { id: number; name: string } | null;
}

const getStockStatus = (stock: number): StockStatus => {
  if (stock <= 0) return 'out_of_stock';
  if (stock < 15) return 'low_stock';
  return 'in_stock';
};

// Convert from python snake_case & flat backend array formats to rich UI frontend types
const mapBackendToProduct = (item: BackendProductRaw): Product => ({
  id: String(item.id),
  name: item.name,
  description: item.description || '',
  price: Number(item.price) || 0,
  originalPrice: item.original_price ? Number(item.original_price) : undefined,
  image: (item.images && item.images.length > 0) ? item.images[0] : '/placeholder.png',
  images: item.images || [],
  rating: Number(item.rating) || 0,
  reviewCount: item.review_count || 0,
  commentCount: item.comment_count || 0,
  stockStatus: getStockStatus(item.stock),
  stockCount: item.stock,
  isNew: item.is_new ?? undefined,
  category: item.category?.name,
  categoryId: item.category?.id ?? item.category_id ?? undefined,
  brand: item.brand ?? item.brand_name ?? item.manufacturer ?? item.manufacturer_name ?? undefined,
  model: item.model ?? undefined,
  serialNumber: item.serial_no ?? undefined,
  warrantyStatus: item.warranty ?? undefined,
  distributor: item.distributor ?? undefined,
  subType: item.sub_type ?? undefined,
  tags: item.tags_json || (item.goal_tags ? item.goal_tags.split(',') : []),
  flavors: item.flavors_json ?? undefined,
  sizes: item.sizes_json ?? undefined,
  ingredients: item.ingredients ?? undefined,
  nutritionFacts: item.nutrition_facts ?? undefined,
  usage: item.usage_info ?? undefined,
  features: item.features ?? undefined,
});

// Raw paginated wrapper from the backend
interface BackendPaginatedResponse {
  items: BackendProductRaw[];
  total: number;
  page: number;
  page_size: number;
  categories?: unknown;
  category_options?: unknown;
  categoryOptions?: unknown;
  filters?: unknown;
  filter_options?: unknown;
  filterOptions?: unknown;
  facets?: unknown;
}

export const fetchAdminProducts = async (pageSize = 1000): Promise<PaginatedProductResponse> => {
  const data = await apiClient.get<BackendPaginatedResponse>('/v1/admin/products', {
    params: { page_size: pageSize },
  }) as unknown as BackendPaginatedResponse;
  return {
    total: data.total,
    page: data.page,
    page_size: data.page_size,
    categories: data.categories,
    category_options: data.category_options,
    categoryOptions: data.categoryOptions,
    filters: data.filters,
    filter_options: data.filter_options,
    filterOptions: data.filterOptions,
    facets: data.facets,
    items: data.items.map(mapBackendToProduct),
  };
};

export const fetchProducts = async (pageSize = 60): Promise<PaginatedProductResponse> => {
  const data = await apiClient.get<BackendPaginatedResponse>('/v1/products', {
    params: { page_size: pageSize },
  }) as unknown as BackendPaginatedResponse;
  return {
    total: data.total,
    page: data.page,
    page_size: data.page_size,
    categories: data.categories,
    category_options: data.category_options,
    categoryOptions: data.categoryOptions,
    filters: data.filters,
    filter_options: data.filter_options,
    filterOptions: data.filterOptions,
    facets: data.facets,
    items: data.items.map(mapBackendToProduct),
  };
};

export const fetchCategories = async (): Promise<CategoryOption[]> => {
  return apiClient.get<CategoryOption[]>('/v1/categories') as unknown as CategoryOption[];
};

export const createAdminProduct = async (
  payload: AdminProductPayload,
): Promise<Product> => {
  const data = await apiClient.post<BackendProductRaw>(
    '/v1/admin/products',
    payload,
  ) as unknown as BackendProductRaw;

  return mapBackendToProduct(data);
};

export const updateAdminProduct = async (
  id: string | number,
  payload: Partial<AdminProductPayload>,
): Promise<Product> => {
  const data = await apiClient.patch<BackendProductRaw>(
    `/v1/admin/products/${id}`,
    payload,
  ) as unknown as BackendProductRaw;

  return mapBackendToProduct(data);
};

export const deleteAdminProduct = async (id: string | number): Promise<void> => {
  await apiClient.delete(`/v1/admin/products/${id}`);
};

export const fetchProductDetail = async (id: string | number): Promise<Product> => {
  const data = await apiClient.get<BackendProductRaw>(`/v1/products/${id}`) as unknown as BackendProductRaw;
  return mapBackendToProduct(data);
};

export const fetchAdminProductDetail = async (id: string | number): Promise<Product> => {
  const data = await apiClient.get<BackendProductRaw>(`/v1/admin/products/${id}`) as unknown as BackendProductRaw;
  return mapBackendToProduct(data);
};

export const submitProductReview = async (
  productId: string | number,
  payload: ProductReviewPayload,
) => {
  return apiClient.post(`/v1/products/${productId}/reviews`, payload);
};

export const fetchProductReviews = async (
  productId: string | number,
): Promise<ProductReview[]> => {
  const reviews = await apiClient.get(`/v1/products/${productId}/reviews`) as unknown as ProductReview[];
  return [...reviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};

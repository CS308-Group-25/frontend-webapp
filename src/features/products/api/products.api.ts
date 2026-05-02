import apiClient from '@/lib/api-client';
import type { Product, StockStatus, ProductFlavor, ProductSize, NutritionRow } from '../types/product.types';

export interface PaginatedProductResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}

// Raw response shape as returned by the FastAPI backend (snake_case)
interface BackendProductRaw {
  id: number;
  name: string;
  description: string | null;
  price: string | null;
  original_price: string | null;
  stock: number;
  stock_status: string | null;
  is_new: boolean | null;
  rating: string | null;
  review_count: number | null;
  brand: string | null;
  goal_tags: string | null;
  images: string[] | null;
  tags_json: string[] | null;
  flavors_json: ProductFlavor[] | null;
  sizes_json: ProductSize[] | null;
  ingredients: string | null;
  nutrition_facts: NutritionRow[] | null;
  usage_info: string | null;
  features: string[] | null;
  category: { id: number; name: string } | null;
}

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
  stockStatus: (item.stock_status as StockStatus) || 'in_stock',
  stockCount: item.stock,
  isNew: item.is_new ?? undefined,
  category: item.category?.name,
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
}

export const fetchProducts = async (pageSize = 60): Promise<PaginatedProductResponse> => {
  const data = await apiClient.get<BackendPaginatedResponse>('/v1/products', {
    params: { page_size: pageSize },
  }) as unknown as BackendPaginatedResponse;
  return {
    total: data.total,
    page: data.page,
    page_size: data.page_size,
    items: data.items.map(mapBackendToProduct),
  };
};

export const fetchProductDetail = async (id: string | number): Promise<Product> => {
  const data = await apiClient.get<BackendProductRaw>(`/v1/products/${id}`) as unknown as BackendProductRaw;
  return mapBackendToProduct(data);
};


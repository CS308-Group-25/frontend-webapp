import apiClient from '@/lib/api-client';
import { Product } from '../types/product.types';

/**
 * GET /api/v1/products/{product_id}
 * Fetches a single product by its numeric ID.
 * The backend returns a ProductDetailResponse which we map to our frontend Product type.
 */
export const fetchProduct = async (productId: string): Promise<Product> => {
  return apiClient.get(`/v1/products/${productId}`) as unknown as Promise<Product>;
};

/**
 * GET /api/v1/products
 * Fetches all products (optional, used for listing pages in the future).
 */
export const fetchProducts = async (): Promise<Product[]> => {
  return apiClient.get('/v1/products') as unknown as Promise<Product[]>;
};

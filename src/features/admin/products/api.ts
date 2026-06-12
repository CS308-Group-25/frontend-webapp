import apiClient from '@/lib/api-client';
import type { ProductFlavor, ProductSize, NutritionRow } from '@/features/products';

export const patchProductPrice = async (id: string, price: number): Promise<void> =>
  apiClient.patch(`/v1/admin/products/${id}/price`, { price });

export interface ProductUpdatePayload {
  name?: string;
  description?: string;
  original_price?: number;
  images?: string[];
  stock?: number;
  stock_status?: string;
  is_new?: boolean;
  brand?: string;
  model?: string;
  serial_no?: string;
  warranty?: string;
  distributor?: string;
  sub_type?: string;
  ingredients?: string;
  nutrition_facts?: NutritionRow[];
  usage_info?: string;
  features?: string[];
  flavors_json?: ProductFlavor[];
  sizes_json?: ProductSize[];
}

export const patchProduct = async (id: string, payload: ProductUpdatePayload): Promise<void> =>
  apiClient.patch(`/v1/admin/products/${id}`, payload);

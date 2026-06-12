import apiClient from '@/lib/api-client';
import { Discount } from './types';

export const fetchDiscounts = async (): Promise<Discount[]> =>
  apiClient.get('/v1/admin/discounts');

export interface PostDiscountPayload {
  ids: string[];
  discount_rate: number;
}

export const postDiscount = async ({ ids, discount_rate }: PostDiscountPayload): Promise<Discount> =>
  apiClient.post('/v1/admin/discounts', {
    product_ids: ids.map(Number),
    discount_rate,
  });

export const deleteDiscount = async (id: number): Promise<void> =>
  apiClient.delete(`/v1/admin/discounts/${id}`);

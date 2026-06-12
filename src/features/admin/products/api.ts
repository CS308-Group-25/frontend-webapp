import apiClient from '@/lib/api-client';

export const patchProductPrice = async (id: string, price: number): Promise<void> =>
  apiClient.patch(`/v1/admin/products/${id}/price`, { price });

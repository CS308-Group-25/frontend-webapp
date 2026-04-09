import apiClient from '@/lib/api-client';

/**
 * POST /api/v1/cart/items
 * Adds a single item to the server-side cart.
 */
export const addCartItem = async (productId: string, quantity: number) => {
  return apiClient.post('/api/v1/cart/items', {
    product_id: parseInt(productId),
    quantity
  });
};

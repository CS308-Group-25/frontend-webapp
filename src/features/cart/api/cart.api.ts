import apiClient from '@/lib/api-client';

export interface BulkCartItem {
  product_id: number;
  quantity: number;
  variant_name?: string;
}

export interface BulkCartAddResponse {
  added: { id: number; cart_id: number; product_id: number; quantity: number }[];
  rejected: { product_id: number; reason: string }[];
}

/**
 * POST /api/v1/cart/items
 * Adds a single item to the server-side cart.
 */
export const addCartItem = async (productId: string, quantity: number, variantName?: string) => {
  return apiClient.post('/v1/cart/items', {
    product_id: parseInt(productId),
    quantity,
    variant_name: variantName,
  });
};

/**
 * POST /api/v1/cart/items/bulk
 * Adds multiple items to the cart in a single request.
 */
export const bulkAddCartItems = async (items: BulkCartItem[]): Promise<BulkCartAddResponse> => {
  return apiClient.post('/v1/cart/items/bulk', { items }) as unknown as BulkCartAddResponse;
};

/**
 * GET /v1/cart/items
 * Fetches the user's current server-side cart.
 */
export const fetchCartItems = async () => {
  return apiClient.get('/v1/cart/items');
};

/**
 * PATCH /v1/cart/items/{id}
 * Updates the quantity of a specific cart item on the server.
 */
export const updateCartItem = async (cartItemId: number, quantity: number) => {
  return apiClient.patch(`/v1/cart/items/${cartItemId}`, { quantity });
};

/**
 * DELETE /v1/cart/items/{id}
 * Removes a specific cart item from the server.
 */
export const removeCartItem = async (cartItemId: number) => {
  return apiClient.delete(`/v1/cart/items/${cartItemId}`);
};

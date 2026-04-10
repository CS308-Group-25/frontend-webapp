import apiClient from '@/lib/api-client';

/**
 * POST /api/v1/cart/items
 * Adds a single item to the server-side cart.
 */
export const addCartItem = async (productId: string, quantity: number) => {
  return apiClient.post('/v1/cart/items', {
    product_id: parseInt(productId),
    quantity
  });
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


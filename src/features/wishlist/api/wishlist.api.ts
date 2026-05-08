import apiClient from '@/lib/api-client';

/**
 * GET /api/v1/wishlist/items
 * Returns the authenticated user's wishlist items.
 * Each item: { id, user_id, product_id, created_at }
 */
export const fetchWishlistItems = async () => {
  return apiClient.get('/v1/wishlist/items');
};

/**
 * POST /api/v1/wishlist/items
 * Adds a product to the server-side wishlist.
 */
export const addWishlistItem = async (productId: string) => {
  return apiClient.post('/v1/wishlist/items', {
    product_id: parseInt(productId),
  });
};

/**
 * DELETE /api/v1/wishlist/items/{product_id}
 * Removes a product from the server-side wishlist by product_id.
 */
export const removeWishlistItem = async (productId: string) => {
  return apiClient.delete(`/v1/wishlist/items/${productId}`);
};

/**
 * DELETE /api/v1/wishlist/items
 * Removes all products from the server-side wishlist.
 */
export const clearWishlistItems = async () => {
  return apiClient.delete('/v1/wishlist/items');
};

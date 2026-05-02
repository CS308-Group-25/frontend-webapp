import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addCartItem, bulkAddCartItems, fetchCartItems, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem } from '../api/cart.api';
import { useAuthStore } from '@/features/auth';
import { toast } from 'sonner';

/**
 * Represents a single item in the cart.
 */
export interface CartItem {
  /** Unique identifier of the product */
  productId: string;
  /** Quantity of the product */
  quantity: number;
  /** Variant identifier (e.g., size, color) */
  variantId?: string;
  /** Remote Cart Item ID (only available when authenticated and synced) */
  cartItemId?: number;
  /** Product display name — persisted so it shows before products are fetched */
  name?: string;
  /** Product price at time of adding — persisted for offline display */
  price?: number;
  /** Product image URL — persisted so cart shows image instantly */
  image?: string;
  /** Selected flavor name */
  flavor?: string;
  /** Selected size name */
  size?: string;
}

/** Zustand state for the guest cart */
interface CartState {
  /** All items currently in the cart */
  items: CartItem[];
  /** Flag to track if a merge is currently in progress */
  isMerging: boolean;
  /** Persistent flag to avoid redundant merge attempts for the same set of items */
  mergeAttempted: boolean;
  /** Add a product (or increase quantity) */
  addItem: (productId: string, quantity?: number, variantId?: string, meta?: { name?: string; price?: number; image?: string; flavor?: string; size?: string }) => Promise<void>;
  /** Update quantity of a product */
  updateItem: (productId: string, quantity: number, cartItemId?: number) => Promise<void>;
  /** Remove a product from the cart */
  removeItem: (productId: string, cartItemId?: number) => Promise<void>;
  /** Clear the entire cart */
  clearCart: () => void;
  /** Merges the local guest cart with the server cart after login */
  mergeWithServer: () => Promise<void>;
  /** Fetches the server cart and overrides local state */
  fetchServerCart: () => Promise<void>;
  /** Flag to manage the visibility of the sliding cart drawer */
  isDrawerOpen: boolean;
  /** Opens the cart drawer */
  openDrawer: () => void;
  /** Closes the cart drawer */
  closeDrawer: () => void;
}

/**
 * Expected shape of a cart item from the backend API.
 */
interface CartItemServerResponse {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  variant_name: string | null;
  product_name?: string;
  product_price?: number;
  product_image?: string;
}




export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isMerging: false, // Volatile state
      mergeAttempted: false, // Persisted state
      isDrawerOpen: false,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      fetchServerCart: async () => {
        const isAuth = useAuthStore.getState().isAuthenticated;
        if (!isAuth) return;

        try {
          const serverItems = (await fetchCartItems()) as unknown as CartItemServerResponse[];
          const mappedItems: CartItem[] = serverItems.map((item) => {
            let flavor, size, variantId;
            if (item.variant_name) {
              try {
                // Try parsing as JSON first (robust variant storage)
                const parsed = JSON.parse(item.variant_name);
                flavor = parsed.flavor;
                size = parsed.size;
                variantId = parsed.variantId;
              } catch {
                // Fallback for old string format like "Çikolata / 400g"
                const parts = item.variant_name.split(' / ');
                flavor = parts[0];
                size = parts[1];
              }
            }
            
            return {
              productId: String(item.product_id),
              quantity: item.quantity,
              cartItemId: item.id,
              variantId: variantId,
              name: item.product_name || `Ürün ${item.product_id}`,
              price: item.product_price || 0,
              image: item.product_image || '/placeholder.png',
              flavor,
              size,
            };
          });
          
          set({ items: mappedItems, mergeAttempted: true });
        } catch (error) {
          console.error('[CartStore] Failed to fetch server cart:', error);
          // If fetch fails, we retain local items. 
          // They might not have cartItemId, but they won't magically disappear.
        }
      },

      addItem: async (productId, quantity = 1, variantId, meta) => {
        const { items } = get();
        const isAuth = useAuthStore.getState().isAuthenticated;
        
        const existing = items.find(
          (i) => i.productId === productId && i.variantId === variantId,
        );

        const previousItems = [...items]; // Save for rollback

        // Optimistic State Update
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity: i.quantity + quantity, ...meta }
                : i,
            ),
            mergeAttempted: false,
          });
        } else {
          set({
            items: [...items, { productId, quantity, variantId, ...meta }],
            mergeAttempted: false,
          });
        }

        // Server Sync
        if (isAuth) {
          try {
            if (existing && existing.cartItemId) {
              // Item exists on server, update its quantity
              const newQuantity = existing.quantity + quantity;
              await apiUpdateCartItem(existing.cartItemId, newQuantity);
            } else {
              // Item is completely new on server
              const variantNamePayload = (meta?.flavor || meta?.size || variantId) 
                ? JSON.stringify({ flavor: meta?.flavor, size: meta?.size, variantId }) 
                : undefined;
              const response = (await addCartItem(productId, quantity, variantNamePayload)) as unknown as CartItemServerResponse;
              // Add the new cartItemId to our optimistically created local item
              set({
                items: get().items.map((i) => 
                  i.productId === productId && i.variantId === variantId
                    ? { ...i, cartItemId: response.id }
                    : i
                )
              });
            }
          } catch (error) {
            console.error('[CartStore] Failed to add item to server:', error);
            toast.error('Ürün sepete eklenemedi.', {
              description: 'Lütfen bağlantınızı kontrol edin.'
            });
            // Rollback on failure
            set({ items: previousItems });
          }
        }
      },

      updateItem: async (productId, quantity, cartItemId?: number) => {
        if (quantity <= 0) {
          await get().removeItem(productId, cartItemId);
          return;
        }

        const { items } = get();
        const isAuth = useAuthStore.getState().isAuthenticated;
        
        // Find specific target (prioritize exact cartItemId if we have duplicates)
        const targetItem = cartItemId 
          ? items.find((i) => i.cartItemId === cartItemId)
          : items.find((i) => i.productId === productId);
          
        if (!targetItem) return;

        const previousItems = [...items]; // Save for rollback

        // Optimistic Update: Only update the SPECIFIC item we clicked on
        set({
          items: items.map((i) =>
            i === targetItem ? { ...i, quantity } : i,
          ),
          mergeAttempted: false,
        });

        // Server Sync
        if (isAuth && targetItem.cartItemId) {
          try {
            await apiUpdateCartItem(targetItem.cartItemId, quantity);
          } catch (error) {
            console.error('[CartStore] Failed to update item on server:', error);
            toast.error('Stok miktarı güncellenemedi.');
            set({ items: previousItems }); // Rollback
          }
        } else if (isAuth && !targetItem.cartItemId) {
          try {
             const response = (await addCartItem(productId, quantity)) as unknown as CartItemServerResponse;
             set({
                items: get().items.map((i) => 
                  i === targetItem
                    ? { ...i, cartItemId: response.id }
                    : i
                )
              });
          } catch (error) {
            console.error('[CartStore] Failed to add item during update:', error);
            set({ items: previousItems }); // Rollback
          }
        }
      },

      removeItem: async (productId, cartItemId?: number) => {
        const { items } = get();
        const isAuth = useAuthStore.getState().isAuthenticated;
        
        const targetItem = cartItemId 
          ? items.find((i) => i.cartItemId === cartItemId)
          : items.find((i) => i.productId === productId);

        if (!targetItem) return;
        
        const previousItems = [...items]; // Save for rollback

        // Optimistic Delete: Only delete the SPECIFIC item
        set({
          items: items.filter((i) => i !== targetItem),
          mergeAttempted: false,
        });

        // Server Sync
        if (isAuth && targetItem?.cartItemId) {
          try {
            await apiRemoveCartItem(targetItem.cartItemId);
          } catch (error) {
            // If 404 → item already gone from server, keep local delete (don't rollback)
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 404) {
              console.warn('[CartStore] Cart item already removed from server, keeping local delete.');
              return;
            }
            console.error('[CartStore] Failed to remove item from server:', error);
            toast.error('Ürün silinemedi.');
            set({ items: previousItems }); // Rollback only on non-404 errors
          }
        }
      },

      clearCart: () => set({ items: [], mergeAttempted: false }),

      mergeWithServer: async () => {
        const { items, isMerging, mergeAttempted, fetchServerCart } = get();

        // Always attempt fetch if skipping merge while authenticated
        if (isMerging || items.length === 0 || mergeAttempted) {
          if (useAuthStore.getState().isAuthenticated) {
            await fetchServerCart();
          }
          return;
        }

        set({ isMerging: true });

        try {
          // Build bulk payload from local guest cart
          const bulkItems = items
            .map((item) => ({
              product_id: parseInt(item.productId),
              quantity: item.quantity,
              variant_name: (item.flavor || item.size || item.variantId) 
                ? JSON.stringify({ flavor: item.flavor, size: item.size, variantId: item.variantId }) 
                : undefined,
            }))
            .filter((i) => !isNaN(i.product_id) && i.product_id > 0);

          const result = await bulkAddCartItems(bulkItems);

          // Map server-assigned IDs back to local items
          const updatedLocalItems = items.map((localItem) => {
            const added = result.added.find(
              (a) => String(a.product_id) === localItem.productId
            );
            return added ? { ...localItem, cartItemId: added.id } : localItem;
          });

          set({ items: updatedLocalItems, mergeAttempted: true });

          const rejectedCount = result.rejected.length;
          const addedCount = result.added.length;

          if (rejectedCount > 0 && addedCount > 0) {
            toast.warning(`${addedCount} ürün hesabınıza aktarıldı.`, {
              description: `${rejectedCount} ürün aktarılamadı (stok yetersiz olabilir).`,
            });
          } else if (addedCount > 0) {
            toast.success('Misafir sepetiniz hesabınızla birleştirildi!');
          }

          // Fetch the final state from server as absolute source of truth
          await fetchServerCart();

        } catch (error) {
          console.error('[CartStore] Fatal merge error:', error);
        } finally {
          set({ isMerging: false });
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        mergeAttempted: state.mergeAttempted,
      }),
    },
  ),
);

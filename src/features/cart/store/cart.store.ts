import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addCartItem, fetchCartItems, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem } from '../api/cart.api';
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
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  /** Update quantity of a product */
  updateItem: (productId: string, quantity: number) => Promise<void>;
  /** Remove a product from the cart */
  removeItem: (productId: string) => Promise<void>;
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
  product_id: number;
  quantity: number;
}

/**
 * Expected shape of an error response from the backend.
 */
interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
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
          const mappedItems: CartItem[] = serverItems.map((item) => ({
            productId: String(item.product_id),
            quantity: item.quantity,
            cartItemId: item.id, // Store the server ID
          }));
          
          set({ items: mappedItems, mergeAttempted: true });
        } catch (error) {
          console.error('[CartStore] Failed to fetch server cart:', error);
          // If fetch fails, we retain local items. 
          // They might not have cartItemId, but they won't magically disappear.
        }
      },

      addItem: async (productId, quantity = 1, variantId) => {
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
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            ),
            mergeAttempted: false,
          });
        } else {
          set({
            items: [...items, { productId, quantity, variantId }],
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
              const response = (await addCartItem(productId, quantity)) as unknown as CartItemServerResponse;
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

      updateItem: async (productId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        const { items } = get();
        const isAuth = useAuthStore.getState().isAuthenticated;
        const targetItem = items.find((i) => i.productId === productId);
        const previousItems = [...items]; // Save for rollback

        // Optimistic Update
        set({
          items: items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
          mergeAttempted: false,
        });

        // Server Sync
        if (isAuth && targetItem?.cartItemId) {
          try {
            await apiUpdateCartItem(targetItem.cartItemId, quantity);
          } catch (error) {
            console.error('[CartStore] Failed to update item on server:', error);
            toast.error('Stok miktarı güncellenemedi.');
            set({ items: previousItems }); // Rollback
          }
        } else if (isAuth && !targetItem?.cartItemId) {
          // Recovery edge-case: item is local but missing ID, so we add it directly
          try {
             const response = (await addCartItem(productId, quantity)) as unknown as CartItemServerResponse;
             set({
                items: get().items.map((i) => 
                  i.productId === productId
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

      removeItem: async (productId) => {
        const { items } = get();
        const isAuth = useAuthStore.getState().isAuthenticated;
        const targetItem = items.find((i) => i.productId === productId);
        const previousItems = [...items]; // Save for rollback

        // Optimistic Delete
        set({
          items: items.filter((i) => i.productId !== productId),
          mergeAttempted: false,
        });

        // Server Sync
        if (isAuth && targetItem?.cartItemId) {
          try {
            await apiRemoveCartItem(targetItem.cartItemId);
          } catch (error) {
            console.error('[CartStore] Failed to remove item from server:', error);
            toast.error('Ürün silinemedi.');
            set({ items: previousItems }); // Rollback
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

        const succeeded: string[] = [];
        const failed: { productId: string; reason: string }[] = [];
        const updatedLocalItems: CartItem[] = [];

        try {
          for (const item of items) {
            try {
              const response = (await addCartItem(item.productId, item.quantity)) as unknown as CartItemServerResponse;
              succeeded.push(item.productId);
              // Store cart_item_id locally immediately, so if fetch fails we are safe
              updatedLocalItems.push({ ...item, cartItemId: response.id });
            } catch (error) {
              let reason = 'Bilinmeyen bir hata oluştu';
              const apiError = error as ApiError;
              if (apiError.response?.data?.detail) {
                reason = apiError.response.data.detail;
              }
              failed.push({ productId: item.productId, reason });
              // Keep failed items exactly as they were
              updatedLocalItems.push(item);
            }
          }

          // Always set items to updated array with new cartItemIds
          set({ items: updatedLocalItems, mergeAttempted: true });

          if (failed.length > 0 && succeeded.length > 0) {
            toast.warning(`${succeeded.length} ürün hesabınıza aktarıldı.`, {
              description: `${failed.length} ürün aktarılamadı ve sepetinizde kaldı.`,
            });
          } else if (succeeded.length > 0) {
            toast.success('Misafir sepetiniz hesabınızla birleştirildi!');
          }

          // Fetch the final state of the server cart as absolute source of truth
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

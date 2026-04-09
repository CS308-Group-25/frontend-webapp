import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addCartItem } from '../api/cart.api';
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
  addItem: (productId: string, quantity?: number, variantId?: string) => void;
  /** Update quantity of a product */
  updateItem: (productId: string, quantity: number) => void;
  /** Remove a product from the cart */
  removeItem: (productId: string) => void;
  /** Clear the entire cart */
  clearCart: () => void;
  /** Merges the local guest cart with the server cart after login */
  mergeWithServer: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isMerging: false, // Volatile state
      mergeAttempted: false, // Persisted state

      addItem: (productId, quantity = 1, variantId) => {
        const { items } = get();
        const existing = items.find(
          (i) => i.productId === productId && i.variantId === variantId,
        );

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            ),
            mergeAttempted: false, // Reset flag so we can try merging the new quantity
          });
        } else {
          set({
            items: [...items, { productId, quantity, variantId }],
            mergeAttempted: false, // Reset flag for the new item
          });
        }
      },

      updateItem: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
          mergeAttempted: false,
        });
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((i) => i.productId !== productId),
          mergeAttempted: false,
        });
      },

      clearCart: () => set({ items: [], mergeAttempted: false }),

      mergeWithServer: async () => {
        const { items, isMerging, mergeAttempted, clearCart } = get();

        // Guard: Don't merge if already in progress, empty, or already attempted for these items
        if (isMerging || items.length === 0 || mergeAttempted) {
          return;
        }

        set({ isMerging: true });

        const succeeded: string[] = [];
        const failed: { productId: string; reason: string }[] = [];

        try {
          // Sequential loop to avoid race conditions and ensure clear state transitions
          for (const item of items) {
            try {
              await addCartItem(item.productId, item.quantity);
              succeeded.push(item.productId);
            } catch (error) {
              const axiosError = error as any; // Temporary cast to access response, or use a proper type if available
              const reason =
                axiosError.response?.data?.detail || 'Bilinmeyen bir hata oluştu';
              failed.push({ productId: item.productId, reason });
              console.warn(`[CartStore] Failed to merge item ${item.productId}:`, reason);
            }
          }

          if (failed.length > 0) {
            // Keep failed items in the local cart so they don't get lost
            const failedIds = failed.map((f) => f.productId);
            const remainingItems = items.filter((item) =>
              failedIds.includes(item.productId),
            );

            set({
              items: remainingItems,
              mergeAttempted: true,
            });

            if (succeeded.length > 0) {
              toast.warning(`${succeeded.length} ürün hesabınıza aktarıldı.`, {
                description: `${failed.length} ürün (örneğin stok bittiği için) aktarılamadı ve sepetinizde kaldı.`,
              });
            } else {
              toast.error('Sepet senkronize edilemedi.', {
                description: 'Ürünlerin stokta olduğundan emin olun veya bağlantınızı kontrol edin.',
              });
            }
          } else {
            // Full success: All items were moved to the server
            clearCart();
            set({ mergeAttempted: true });
            if (succeeded.length > 0) {
              toast.success('Misafir sepetiniz hesabınızla birleştirildi!');
            }
          }
        } catch (error) {
          console.error('[CartStore] Fatal merge error:', error);
        } finally {
          set({ isMerging: false });
        }
      },
    }),
    {
      name: 'cart-storage',
      // Persist items and the mergeAttempted flag
      partialize: (state) => ({
        items: state.items,
        mergeAttempted: state.mergeAttempted,
      }),
    },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  /** Add a product (or increase quantity) */
  addItem: (productId: string, quantity?: number, variantId?: string) => void;
  /** Update quantity of a product */
  updateItem: (productId: string, quantity: number) => void;
  /** Remove a product from the cart */
  removeItem: (productId: string) => void;
  /** Clear the entire cart */
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId, quantity = 1, variantId) => {
        const existing = get().items.find(
          (i) => i.productId === productId && i.variantId === variantId,
        );
        if (existing) {
          // Increase quantity if already present with same variant
          set({
            items: get().items.map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            ),
          });
        } else {
          set({
            items: [...get().items, { productId, quantity, variantId }],
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
        });
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage', // key in localStorage
      // Persist only the minimal cart data
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

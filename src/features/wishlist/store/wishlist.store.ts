import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchWishlistItems, addWishlistItem, removeWishlistItem } from '../api/wishlist.api';
import { useAuthStore } from '@/features/auth';
import { toast } from 'sonner';

/**
 * Server response shape from GET /v1/wishlist/items
 */
interface WishlistItemServerResponse {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
}

interface WishlistState {
  /** Product IDs saved to the wishlist (local + synced) */
  items: string[];

  /** True while a login-time merge is in progress */
  isMerging: boolean;

  /** Prevents re-merging the same items after login */
  mergeAttempted: boolean;

  /** Add a product — optimistic locally, synced to server if authenticated */
  addItem: (productId: string) => Promise<void>;

  /** Remove a product — optimistic locally, synced to server if authenticated */
  removeItem: (productId: string) => Promise<void>;

  /** Toggle add/remove */
  toggleItem: (productId: string) => Promise<void>;

  /** Check membership */
  isInWishlist: (productId: string) => boolean;

  /** Clear all items locally (does NOT call server) */
  clearWishlist: () => void;

  /** Fetch server wishlist and override local state */
  fetchServerWishlist: () => Promise<void>;

  /** Merge localStorage items into server after login, then fetch */
  mergeWithServer: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isMerging: false,
      mergeAttempted: false,

      // ─── Read ────────────────────────────────────────────────────────────
      isInWishlist: (productId) => get().items.includes(productId),

      // ─── Add ─────────────────────────────────────────────────────────────
      addItem: async (productId) => {
        const { items } = get();
        if (items.includes(productId)) return; // already saved

        const isAuth = useAuthStore.getState().isAuthenticated;
        const previousItems = [...items];

        // Optimistic update
        set({ items: [...items, productId], mergeAttempted: false });

        if (isAuth) {
          try {
            await addWishlistItem(productId);
          } catch (error) {
            console.error('[WishlistStore] Failed to add item:', error);
            toast.error('Ürün favorilere eklenemedi.');
            set({ items: previousItems }); // rollback
          }
        }
      },

      // ─── Remove ──────────────────────────────────────────────────────────
      removeItem: async (productId) => {
        const { items } = get();
        const isAuth = useAuthStore.getState().isAuthenticated;
        const previousItems = [...items];

        // Optimistic update
        set({ items: items.filter((id) => id !== productId), mergeAttempted: false });

        if (isAuth) {
          try {
            await removeWishlistItem(productId);
          } catch (error) {
            console.error('[WishlistStore] Failed to remove item:', error);
            toast.error('Ürün favorilerden çıkarılamadı.');
            set({ items: previousItems }); // rollback
          }
        }
      },

      // ─── Toggle ──────────────────────────────────────────────────────────
      toggleItem: async (productId) => {
        const { items, addItem, removeItem } = get();
        if (items.includes(productId)) {
          await removeItem(productId);
        } else {
          await addItem(productId);
        }
      },

      // ─── Clear (local only) ───────────────────────────────────────────────
      clearWishlist: () => set({ items: [], mergeAttempted: false }),

      // ─── Fetch server state ───────────────────────────────────────────────
      fetchServerWishlist: async () => {
        const isAuth = useAuthStore.getState().isAuthenticated;
        if (!isAuth) return;

        try {
          const serverItems = (await fetchWishlistItems()) as unknown as WishlistItemServerResponse[];
          const productIds = serverItems.map((item) => String(item.product_id));
          set({ items: productIds, mergeAttempted: true });
        } catch (error) {
          console.error('[WishlistStore] Failed to fetch server wishlist:', error);
          // Keep local items on failure — don't wipe user data
        }
      },

      // ─── Merge after login ────────────────────────────────────────────────
      mergeWithServer: async () => {
        const { items, isMerging, mergeAttempted, fetchServerWishlist } = get();

        // If nothing local to merge, just fetch server state
        if (isMerging || mergeAttempted || items.length === 0) {
          if (useAuthStore.getState().isAuthenticated) {
            await fetchServerWishlist();
          }
          return;
        }

        set({ isMerging: true });

        try {
          // Push each local item to server — 409 / duplicate errors are safe to ignore
          const results = await Promise.allSettled(
            items.map((productId) => addWishlistItem(productId)),
          );

          const failed = results.filter((r) => r.status === 'rejected').length;
          const succeeded = results.filter((r) => r.status === 'fulfilled').length;

          set({ mergeAttempted: true });

          if (succeeded > 0 && failed === 0) {
            toast.success('Favori listeniz hesabınızla senkronize edildi!');
          } else if (succeeded > 0 && failed > 0) {
            toast.warning(`${succeeded} ürün aktarıldı, ${failed} ürün aktarılamadı.`);
          }

          // Fetch the authoritative server list
          await fetchServerWishlist();
        } catch (error) {
          console.error('[WishlistStore] Fatal merge error:', error);
        } finally {
          set({ isMerging: false });
        }
      },
    }),
    {
      name: 'wishlist-storage',
      // Only persist the item list and merge flag — volatile flags stay in memory
      partialize: (state) => ({
        items: state.items,
        mergeAttempted: state.mergeAttempted,
      }),
    },
  ),
);

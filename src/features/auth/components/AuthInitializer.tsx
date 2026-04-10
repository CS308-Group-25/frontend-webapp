'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth.store';
import { fetchCurrentUser } from '../api/auth.api';
import { useCartStore } from '@/features/cart';

/**
 * AuthInitializer
 *
 * Runs once on app mount to rehydrate auth state from the HttpOnly cookie.
 * Calls GET /v1/auth/me — if the cookie is valid, sets the user in Zustand.
 * If not (401), the user remains a guest.
 *
 * This component renders nothing — it's a side-effect-only component.
 */
export default function AuthInitializer() {
  const hasChecked = useRef(false);

  useEffect(() => {
    // Prevent double-check in React Strict Mode
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkAuth = async () => {
      try {
        const user = await fetchCurrentUser();
        useAuthStore.getState().setUser(user);

        // Trigger cart merge if there are guest items
        const { items, mergeWithServer, fetchServerCart } = useCartStore.getState();
        if (items.length > 0) {
          mergeWithServer();
        } else {
          // If no guest items to merge, simply load the server cart
          fetchServerCart();
        }
      } catch {
        // 401 or network error — user is not authenticated
        useAuthStore.getState().clearUser();
      }
    };

    checkAuth();
  }, []);

  return null;
}

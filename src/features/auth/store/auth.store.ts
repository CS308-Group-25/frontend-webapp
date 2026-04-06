import { create } from 'zustand';
import { User } from '../types/auth.types';

interface AuthState {
  /** Current user profile, null when not authenticated */
  user: User | null;

  /** Convenience flag derived from user presence */
  isAuthenticated: boolean;

  /** True while the initial /auth/me check is in progress */
  isLoading: boolean;

  /** Set user after login or /auth/me rehydration */
  setUser: (user: User) => void;

  /** Clear user on logout or 401 */
  clearUser: () => void;

  /** Control the loading state */
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as true — AuthInitializer will set to false after /me check

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),

  setLoading: (loading) => set({ isLoading: loading }),
}));

import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/auth.store';

/**
 * Centralized Axios API Client instance.
 * Uses the URL from the .env file.
 *
 * withCredentials: true ensures the browser sends/receives
 * the HttpOnly `access_token` cookie with every request.
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response Interceptor: Executed when a response is received from the server
apiClient.interceptors.response.use(
  (response) => response.data, // Return only the data payload
  (error) => {
    // On 401 Unauthorized, clear the auth state (session expired / invalid cookie)
    if (error.response?.status === 401) {
      // Only clear if user was previously authenticated to avoid loops
      const { isAuthenticated, clearUser } = useAuthStore.getState();
      if (isAuthenticated) {
        clearUser();
      }
    }

    // Standardize all API errors
    const customError =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Bilinmeyen bir hata oluştu';
    return Promise.reject(customError);
  }
);

export default apiClient;

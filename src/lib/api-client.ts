import axios from 'axios';

/**
 * Centralized Axios API Client instance.
 * Uses the URL from the .env file (to be added in core feature T-013).
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Executed before each request is sent
apiClient.interceptors.request.use(
  (config) => {
    // In the future, we can read the Auth Token from zustand or cookies and attach it here.
    // Example:
    // const token = localStorage.getItem('token');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Executed when a response is received from the server
apiClient.interceptors.response.use(
  (response) => response.data, // Now returning only data
  (error) => {
    // Standardize all API errors here:
    const customError = error.response?.data?.message || error.message || 'An unknown error occurred';
    return Promise.reject(customError);
  }
);

export default apiClient;

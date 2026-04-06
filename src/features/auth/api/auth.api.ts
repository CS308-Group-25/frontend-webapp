import apiClient from '@/lib/api-client';
import { RegistrationFormValues } from '../schemas/registration.schema';
import { LoginFormValues } from '../schemas/login.schema';
import { User } from '../types/auth.types';

/**
 * POST /v1/auth/register
 * Creates a new user account.
 */
export const registerUser = async (data: RegistrationFormValues) => {
  const payload = {
    name: `${data.firstName} ${data.lastName}`.trim(),
    email: data.email,
    password: data.password,
  };
  return apiClient.post('/v1/auth/register', payload);
};

/**
 * POST /v1/auth/login
 * Authenticates the user. The backend sets an HttpOnly `access_token` cookie.
 * Returns the user's public profile.
 */
export const loginUser = async (data: LoginFormValues): Promise<User> => {
  return apiClient.post('/v1/auth/login', data);
};

/**
 * POST /v1/auth/logout
 * Clears the HttpOnly `access_token` cookie on the server.
 */
export const logoutUser = async (): Promise<void> => {
  return apiClient.post('/v1/auth/logout');
};

/**
 * GET /v1/auth/me
 * Returns the current user's profile by reading the `access_token` cookie.
 * Used for rehydrating auth state on page load.
 */
export const fetchCurrentUser = async (): Promise<User> => {
  return apiClient.get('/v1/auth/me');
};

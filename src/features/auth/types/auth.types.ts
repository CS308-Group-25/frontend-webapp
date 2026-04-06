/**
 * User profile returned by the backend (UserPublicResponse schema).
 * Used across the app for UI rendering and role-based logic.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

/**
 * @fileoverview Authentication Types
 * 
 * Type definitions for authentication-related data structures.
 * Separated from hooks to prevent Fast Refresh issues.
 */

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (_email: string, _password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<void>;
}
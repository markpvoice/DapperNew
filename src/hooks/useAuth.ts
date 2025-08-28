/**
 * @fileoverview Authentication Hook
 * 
 * Custom React hook for managing authentication state and operations.
 * Provides login, logout, and current user information.
 */

import { useState, useEffect, useCallback } from 'react';

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

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (_email: string, _password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: _email, password: _password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setError(null);
        return true;
      } else {
        setError(data.error || 'Login failed');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error during login');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  const verifyAuth = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
        // Don't set error for failed verification - user just isn't logged in
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      setUser(null);
      setError(null); // Don't show error for network issues during verification
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    verifyAuth,
  };
}
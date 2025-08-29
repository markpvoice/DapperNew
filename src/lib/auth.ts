/**
 * @fileoverview Enhanced Authentication utilities with refresh token support
 * 
 * Implements JWT access/refresh token pattern for better security:
 * - Short-lived access tokens (1 hour)
 * - Long-lived refresh tokens (7 days)
 * - Automatic token refresh
 * - Secure token storage
 */

import { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { db } from './db';

interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
  needsRefresh?: boolean;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  refreshTokenExpires: number;
}

const JWT_SECRET = process.env.NEXTAUTH_SECRET;
const ACCESS_TOKEN_EXPIRES = '1h';
const REFRESH_TOKEN_EXPIRES = '7d';

if (!JWT_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required');
}

/**
 * Generate access and refresh token pair
 */
export function generateTokenPair(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}): TokenPair {
  const accessTokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    type: 'access',
  };

  const refreshTokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    type: 'refresh',
  };

  const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
    issuer: 'dapper-squad-api',
    audience: 'dapper-squad-admin',
  });

  const refreshToken = jwt.sign(refreshTokenPayload, JWT_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
    issuer: 'dapper-squad-api',
    audience: 'dapper-squad-admin',
  });

  const now = Date.now();
  const accessTokenExpires = now + (60 * 60 * 1000); // 1 hour
  const refreshTokenExpires = now + (7 * 24 * 60 * 60 * 1000); // 7 days

  return {
    accessToken,
    refreshToken,
    accessTokenExpires,
    refreshTokenExpires,
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
      issuer: 'dapper-squad-api',
      audience: 'dapper-squad-admin',
    }) as TokenPayload;

    if (decoded.type !== 'access') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
      issuer: 'dapper-squad-api',
      audience: 'dapper-squad-admin',
    }) as TokenPayload;

    if (decoded.type !== 'refresh') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Enhanced authentication verification with refresh token support
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Try access token first
    const accessToken = request.cookies.get('access-token')?.value;
    
    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      if (decoded) {
        // Verify user still exists and is active
        const user = await db.adminUser.findUnique({
          where: { id: parseInt(decoded.userId) },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        });

        if (user && user.isActive) {
          return {
            success: true,
            user: {
              id: String(user.id),
              email: user.email,
              name: user.name,
              role: user.role,
            },
          };
        }
      }
    }

    // Access token invalid/expired, try refresh token
    const refreshToken = request.cookies.get('refresh-token')?.value;
    
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded) {
        // Verify user still exists and is active
        const user = await db.adminUser.findUnique({
          where: { id: parseInt(decoded.userId) },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        });

        if (user && user.isActive) {
          return {
            success: true,
            user: {
              id: String(user.id),
              email: user.email,
              name: user.name,
              role: user.role,
            },
            needsRefresh: true,
          };
        }
      }
    }

    return {
      success: false,
      error: 'Authentication required',
    };

  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}

/**
 * Legacy single-token verification for backward compatibility
 * TODO: Remove this when all endpoints use the new auth system
 */
export async function verifyAuthLegacy(request: NextRequest): Promise<AuthResult> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token provided',
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET!, {
      issuer: 'dapper-squad-api',
      audience: 'dapper-squad-admin',
    }) as any;

    const user = await db.adminUser.findUnique({
      where: { id: parseInt(decoded.userId) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return {
        success: false,
        error: 'User not found or inactive',
      };
    }

    return {
      success: true,
      user: {
        id: String(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };

  } catch (error) {
    return {
      success: false,
      error: 'Invalid or expired token',
    };
  }
}
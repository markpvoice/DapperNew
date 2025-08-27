/**
 * @fileoverview Authentication utilities and middleware
 * 
 * Provides authentication helpers and JWT verification utilities
 */

import { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { db } from './db';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Verify authentication token from request
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, error: 'No authentication token provided' };
    }

    // Verify JWT secret exists
    const jwtSecret = process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      console.error('NEXTAUTH_SECRET environment variable is not set');
      return { success: false, error: 'Server configuration error' };
    }

    // Verify and decode token
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret, {
        issuer: 'dapper-squad-api',
        audience: 'dapper-squad-admin',
      });
    } catch (jwtError) {
      return { success: false, error: 'Invalid or expired token' };
    }

    // Verify user still exists and is active
    const adminUser = await db.adminUser.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!adminUser || !adminUser.isActive) {
      return { success: false, error: 'User not found or inactive' };
    }

    return {
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    };

  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * Create authentication response for unauthorized requests
 */
export function createUnauthorizedResponse(message = 'Authentication required') {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcryptjs');
  return bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, hash);
}
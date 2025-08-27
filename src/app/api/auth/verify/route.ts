/**
 * @fileoverview Admin Authentication - Token Verification API
 * GET /api/auth/verify
 * 
 * Verifies JWT token and returns current user information
 */

import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify JWT secret exists
    const jwtSecret = process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      console.error('NEXTAUTH_SECRET environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify and decode token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, jwtSecret, {
        issuer: 'dapper-squad-api',
        audience: 'dapper-squad-admin',
      }) as JWTPayload;
    } catch (jwtError) {
      // Token is invalid or expired
      const response = NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
      
      // Clear invalid cookie
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      
      return response;
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
        lastLogin: true,
      },
    });

    if (!adminUser) {
      const response = NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
      
      // Clear cookie for non-existent user
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      
      return response;
    }

    if (!adminUser.isActive) {
      const response = NextResponse.json(
        { success: false, error: 'User account is deactivated' },
        { status: 401 }
      );
      
      // Clear cookie for inactive user
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      
      return response;
    }

    // Return user information
    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        lastLogin: adminUser.lastLogin,
      },
      tokenValid: true,
    });

  } catch (error) {
    console.error('Token verification API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
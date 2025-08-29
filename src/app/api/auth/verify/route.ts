/**
 * @fileoverview Admin Authentication - Token Verification API
 * GET /api/auth/verify
 * 
 * Verifies JWT token and returns current user information
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for API routes that use request.cookies
export const dynamic = 'force-dynamic';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Use the new auth system with access/refresh tokens
    const authResult = await verifyAuth(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentication required' },
        { status: 401 }
      );
    }

    // If auth needs refresh, handle token refresh automatically
    if (authResult.needsRefresh) {
      // The verifyAuth function already validated the refresh token
      // We can generate new tokens and set them
      const { generateTokenPair } = await import('@/lib/auth');
      const tokens = generateTokenPair({
        id: authResult.user.id,
        email: authResult.user.email,
        name: authResult.user.name,
        role: authResult.user.role,
      });

      const response = NextResponse.json({
        success: true,
        user: authResult.user,
        tokenRefreshed: true,
      });

      // Set new tokens
      response.cookies.set('access-token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });

      response.cookies.set('refresh-token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      // Keep legacy token for backward compatibility
      response.cookies.set('auth-token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });

      return response;
    }

    // Return user information
    return NextResponse.json({
      success: true,
      user: authResult.user,
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
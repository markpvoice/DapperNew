/**
 * @fileoverview Token Refresh API
 * POST /api/auth/refresh
 * 
 * Refreshes access token using valid refresh token
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for API routes that use request.cookies
export const dynamic = 'force-dynamic';

import { verifyRefreshToken, generateTokenPair } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refresh-token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      // Clear invalid refresh token cookie
      const response = NextResponse.json(
        { success: false, error: 'Invalid refresh token' },
        { status: 401 }
      );
      
      response.cookies.set('refresh-token', '', {
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
      where: { id: parseInt(decoded.userId) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!adminUser || !adminUser.isActive) {
      // Clear refresh token for non-existent/inactive user
      const response = NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 401 }
      );
      
      response.cookies.set('refresh-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      
      return response;
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      id: String(adminUser.id),
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    });

    // Update last login time
    await db.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLogin: new Date() },
    });

    // Set new cookies
    const response = NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
      expiresAt: new Date(tokens.accessTokenExpires).toISOString(),
    });

    // Set access token cookie (short-lived)
    response.cookies.set('access-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    // Set refresh token cookie (long-lived)
    response.cookies.set('refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Token refresh failed' 
      },
      { status: 500 }
    );
  }
}
/**
 * @fileoverview Admin Authentication - Logout API
 * POST /api/auth/logout
 * 
 * Handles admin user logout by clearing authentication token
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for API routes that use request.cookies
export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

    // Clear all authentication cookies with proper path scoping
    response.cookies.set('access-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Consistent security settings
      maxAge: 0, // Expire immediately
      path: '/', // Match the path where it is set
    });

    response.cookies.set('refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Consistent security settings
      maxAge: 0, // Expire immediately
      path: '/api', // Match the path where it is set
    });

    // Clear legacy auth-token as well
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Consistent security settings
      maxAge: 0, // Expire immediately
      path: '/', // Legacy cookie is global
    });

    return response;

  } catch (error) {
    console.error('Logout API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for logout as well (for convenience)
export async function GET(request: NextRequest) {
  return POST(request);
}

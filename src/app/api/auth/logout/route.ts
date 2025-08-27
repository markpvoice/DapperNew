/**
 * @fileoverview Admin Authentication - Logout API
 * POST /api/auth/logout
 * 
 * Handles admin user logout by clearing authentication token
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

    // Clear the authentication cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
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
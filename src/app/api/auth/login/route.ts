/**
 * @fileoverview Admin Authentication - Login API
 * POST /api/auth/login
 * 
 * Handles admin user login with email/password authentication
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for API routes that use request.cookies
export const dynamic = 'force-dynamic';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { checkLoginRateLimit, clearLoginRateLimit } from '@/lib/rate-limiter';
import { generateTokenPair } from '@/lib/auth';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    // Check rate limiting
    const rateLimit = await checkLoginRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimit.retryAfter,
          remaining: rateLimit.remaining,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || 900), // Default 15 minutes
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(Math.floor(rateLimit.resetTime / 1000)),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find admin user by email
    const adminUser = await db.adminUser.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        isActive: true,
        lastLogin: true,
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!adminUser.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset rate limiting on successful login
    await clearLoginRateLimit(clientIp);

    // Generate access and refresh tokens
    const tokens = generateTokenPair({
      id: String(adminUser.id),
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    });

    // Update last login
    await db.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLogin: new Date() },
    });

    // Set HTTP-only cookies for both access and refresh tokens
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        lastLogin: adminUser.lastLogin,
      },
      expiresAt: new Date(tokens.accessTokenExpires).toISOString(),
    });

    // Set access token cookie (short-lived, admin-scoped)
    response.cookies.set('access-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Enhanced CSRF protection
      maxAge: 60 * 60, // 1 hour
      path: '/admin', // Scope to admin routes only
    });

    // Set refresh token cookie (long-lived, auth-scoped)
    response.cookies.set('refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Enhanced CSRF protection
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/api/auth', // Scope to auth endpoints only
    });

    // Keep legacy auth-token for backward compatibility (can be removed later)
    response.cookies.set('auth-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Enhanced CSRF protection
      maxAge: 60 * 60, // 1 hour
      path: '/', // Keep global for legacy compatibility
    });

    return response;

  } catch (error) {
    console.error('Login API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
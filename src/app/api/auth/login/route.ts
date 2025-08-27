/**
 * @fileoverview Admin Authentication - Login API
 * POST /api/auth/login
 * 
 * Handles admin user login with email/password authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Rate limiting (simple in-memory store for development)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(clientIp: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(clientIp);
  
  if (!attempts) {
    loginAttempts.set(clientIp, { count: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.set(clientIp, { count: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  // Check if over the limit
  if (attempts.count >= MAX_ATTEMPTS) {
    const resetTime = attempts.lastAttempt + LOCKOUT_DURATION;
    return { allowed: false, resetTime };
  }
  
  // Increment attempts
  attempts.count++;
  attempts.lastAttempt = now;
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    // Check rate limiting
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      const resetIn = rateLimit.resetTime ? Math.ceil((rateLimit.resetTime - Date.now()) / 1000) : 0;
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts. Please try again later.',
          resetIn,
        },
        { status: 429 }
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
    loginAttempts.delete(clientIp);

    // Generate JWT token
    const jwtSecret = process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      console.error('NEXTAUTH_SECRET environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const tokenPayload = {
      userId: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    };

    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: '24h',
      issuer: 'dapper-squad-api',
      audience: 'dapper-squad-admin',
    });

    // Update last login
    await db.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLogin: new Date() },
    });

    // Set HTTP-only cookie
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
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
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
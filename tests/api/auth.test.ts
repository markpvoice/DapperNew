/**
 * @fileoverview Authentication API Tests
 * Tests for login, logout, and token verification endpoints
 */

import { NextRequest } from 'next/server';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import { POST as logoutPOST } from '@/app/api/auth/logout/route';
import { GET as verifyGET } from '@/app/api/auth/verify/route';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    adminUser: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('Authentication API', () => {
  const mockAdminUser = {
    id: 1,
    email: 'admin@dappersquad.com',
    name: 'Admin User',
    role: 'admin',
    passwordHash: '$2b$12$hashedPassword',
    isActive: true,
    lastLogin: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXTAUTH_SECRET = 'test-secret-key';
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Mock database and bcrypt
      const { db } = await import('@/lib/db');
      const bcrypt = await import('bcryptjs');
      const jwt = await import('jsonwebtoken');

      (db.adminUser.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');
      (db.adminUser.update as jest.Mock).mockResolvedValue(mockAdminUser);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@dappersquad.com',
          password: 'admin123!',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Login successful');
      expect(data.user).toEqual({
        id: mockAdminUser.id,
        email: mockAdminUser.email,
        name: mockAdminUser.name,
        role: mockAdminUser.role,
        lastLogin: mockAdminUser.lastLogin,
      });

      // Check that password was verified
      expect(bcrypt.compare).toHaveBeenCalledWith('admin123!', mockAdminUser.passwordHash);
      
      // Check that JWT was created
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockAdminUser.id,
          email: mockAdminUser.email,
          name: mockAdminUser.name,
          role: mockAdminUser.role,
        },
        'test-secret-key',
        expect.objectContaining({
          expiresIn: '24h',
          issuer: 'dapper-squad-api',
          audience: 'dapper-squad-admin',
        })
      );

      // Check that last login was updated
      expect(db.adminUser.update).toHaveBeenCalledWith({
        where: { id: mockAdminUser.id },
        data: { lastLogin: expect.any(Date) },
      });
    });

    it('should reject login with invalid email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'admin123!',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toContainEqual(
        expect.objectContaining({
          message: 'Invalid email format',
        })
      );
    });

    it('should reject login with missing password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@dappersquad.com',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject login for non-existent user', async () => {
      const { db } = await import('@/lib/db');
      (db.adminUser.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid credentials');
    });

    it('should reject login for inactive user', async () => {
      const { db } = await import('@/lib/db');
      (db.adminUser.findUnique as jest.Mock).mockResolvedValue({
        ...mockAdminUser,
        isActive: false,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@dappersquad.com',
          password: 'admin123!',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Account is deactivated');
    });

    it('should reject login with wrong password', async () => {
      const { db } = await import('@/lib/db');
      const bcrypt = await import('bcryptjs');

      (db.adminUser.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@dappersquad.com',
          password: 'wrongpassword',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST',
      });

      const response = await logoutPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Logout successful');

      // Check that cookie is cleared
      const cookieHeader = response.headers.get('Set-Cookie');
      expect(cookieHeader).toContain('auth-token=;');
      expect(cookieHeader).toContain('Max-Age=0');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify valid token successfully', async () => {
      const { db } = await import('@/lib/db');
      const jwt = await import('jsonwebtoken');

      // Mock JWT verification
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: mockAdminUser.id,
        email: mockAdminUser.email,
        name: mockAdminUser.name,
        role: mockAdminUser.role,
      });

      // Mock user lookup
      (db.adminUser.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);

      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-jwt-token',
        },
      });

      const response = await verifyGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toEqual({
        id: mockAdminUser.id,
        email: mockAdminUser.email,
        name: mockAdminUser.name,
        role: mockAdminUser.role,
        lastLogin: mockAdminUser.lastLogin,
      });
      expect(data.tokenValid).toBe(true);
    });

    it('should reject request without token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'GET',
      });

      const response = await verifyGET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('No authentication token provided');
    });

    it('should reject invalid token', async () => {
      const jwt = await import('jsonwebtoken');
      
      // Mock JWT verification failure
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=invalid-token',
        },
      });

      const response = await verifyGET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid or expired token');
    });

    it('should reject token for non-existent user', async () => {
      const { db } = await import('@/lib/db');
      const jwt = await import('jsonwebtoken');

      // Mock JWT verification success
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: 999,
        email: 'deleted@example.com',
        name: 'Deleted User',
        role: 'admin',
      });

      // Mock user not found
      (db.adminUser.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-jwt-token',
        },
      });

      const response = await verifyGET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User not found');
    });
  });
});
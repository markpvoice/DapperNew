/**
 * @fileoverview Rate Limiter Tests
 * Tests for database-backed rate limiting with different modes
 */

import { 
  checkRateLimit, 
  checkLoginRateLimit, 
  clearRateLimit,
  clearLoginRateLimit 
} from '@/lib/rate-limiter';

// Mock the database connection
jest.mock('@/lib/db', () => ({
  db: {
    rateLimitAttempt: {
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('Rate Limiter', () => {
  const { db } = require('@/lib/db');
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.ENABLE_RATE_LIMIT = 'true';
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('checkRateLimit - enabled mode (ENABLE_RATE_LIMIT=true)', () => {
    it('should allow requests within limit', async () => {
      db.rateLimitAttempt.count.mockResolvedValue(0);
      db.rateLimitAttempt.findFirst.mockResolvedValue(null);
      db.rateLimitAttempt.create.mockResolvedValue({
        id: 'test-1',
        identifier: '192.168.1.1',
        action: 'test-action',
        createdAt: new Date(),
      });

      const result = await checkRateLimit({
        identifier: '192.168.1.1',
        action: 'test-action',
        maxAttempts: 5,
        windowMs: 900000,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(db.rateLimitAttempt.create).toHaveBeenCalled();
    });

    it('should block requests when limit exceeded', async () => {
      const oldestAttempt = new Date(Date.now() - 300000); // 5 minutes ago
      
      db.rateLimitAttempt.count.mockResolvedValue(5);
      db.rateLimitAttempt.findFirst.mockResolvedValue({
        createdAt: oldestAttempt,
      });

      const result = await checkRateLimit({
        identifier: '192.168.1.1',
        action: 'test-action',
        maxAttempts: 5,
        windowMs: 900000, // 15 minutes
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should calculate correct retryAfter time', async () => {
      const oldestAttempt = new Date(Date.now() - 300000); // 5 minutes ago
      
      db.rateLimitAttempt.count.mockResolvedValue(5);
      db.rateLimitAttempt.findFirst.mockResolvedValue({
        createdAt: oldestAttempt,
      });

      const result = await checkRateLimit({
        identifier: '192.168.1.1',
        action: 'test-action',
        maxAttempts: 5,
        windowMs: 900000, // 15 minutes
      });

      expect(result.retryAfter).toBeCloseTo(600, -1); // ~10 minutes remaining
    });
  });

  describe('checkRateLimit - log-only mode (ENABLE_RATE_LIMIT=log)', () => {
    beforeEach(() => {
      process.env.ENABLE_RATE_LIMIT = 'log';
    });

    it('should never block requests in log mode', async () => {
      db.rateLimitAttempt.count.mockResolvedValue(10); // Way over limit
      db.rateLimitAttempt.findFirst.mockResolvedValue({
        createdAt: new Date(),
      });

      const result = await checkRateLimit({
        identifier: '192.168.1.1',
        action: 'test-action',
        maxAttempts: 5,
        windowMs: 900000,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[rate-limit] exceeded (log-only)',
        expect.objectContaining({
          identifier: '192.168.1.1',
          action: 'test-action',
        })
      );
    });
  });

  describe('checkRateLimit - disabled mode', () => {
    beforeEach(() => {
      process.env.ENABLE_RATE_LIMIT = 'false';
    });

    it('should always allow requests when disabled', async () => {
      const result = await checkRateLimit({
        identifier: '192.168.1.1',
        action: 'test-action',
        maxAttempts: 5,
        windowMs: 900000,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(db.rateLimitAttempt.count).not.toHaveBeenCalled();
      expect(db.rateLimitAttempt.create).not.toHaveBeenCalled();
    });
  });

  describe('checkRateLimit - error handling', () => {
    it('should fail open on database errors', async () => {
      db.rateLimitAttempt.count.mockRejectedValue(new Error('Database connection failed'));

      const result = await checkRateLimit({
        identifier: '192.168.1.1',
        action: 'test-action',
        maxAttempts: 5,
        windowMs: 900000,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Rate limit check failed:',
        expect.any(Error)
      );
    });
  });

  describe('checkLoginRateLimit', () => {
    it('should use correct parameters for login rate limiting', async () => {
      db.rateLimitAttempt.count.mockResolvedValue(0);
      db.rateLimitAttempt.findFirst.mockResolvedValue(null);
      db.rateLimitAttempt.create.mockResolvedValue({
        id: 'test-1',
        identifier: '192.168.1.1',
        action: 'login',
        createdAt: new Date(),
      });

      const result = await checkLoginRateLimit('192.168.1.1');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // 5 - 1 = 4
      expect(db.rateLimitAttempt.count).toHaveBeenCalledWith({
        where: {
          identifier: '192.168.1.1',
          action: 'login',
          createdAt: { gte: expect.any(Date) },
        },
      });
    });
  });

  describe('clearRateLimit', () => {
    it('should clear rate limit attempts', async () => {
      db.rateLimitAttempt.deleteMany.mockResolvedValue({ count: 3 });

      await clearRateLimit('192.168.1.1', 'test-action');

      expect(db.rateLimitAttempt.deleteMany).toHaveBeenCalledWith({
        where: {
          identifier: '192.168.1.1',
          action: 'test-action',
        },
      });
    });

    it('should not clear when rate limiting is disabled', async () => {
      process.env.ENABLE_RATE_LIMIT = 'false';

      await clearRateLimit('192.168.1.1', 'test-action');

      expect(db.rateLimitAttempt.deleteMany).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      db.rateLimitAttempt.deleteMany.mockRejectedValue(new Error('Delete failed'));

      // Should not throw
      await expect(clearRateLimit('192.168.1.1', 'test-action')).resolves.toBeUndefined();

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to clear rate limit:',
        expect.any(Error)
      );
    });
  });

  describe('clearLoginRateLimit', () => {
    it('should clear login rate limit for the IP', async () => {
      db.rateLimitAttempt.deleteMany.mockResolvedValue({ count: 2 });

      await clearLoginRateLimit('192.168.1.1');

      expect(db.rateLimitAttempt.deleteMany).toHaveBeenCalledWith({
        where: {
          identifier: '192.168.1.1',
          action: 'login',
        },
      });
    });
  });
});
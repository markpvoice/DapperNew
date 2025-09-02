/**
 * @fileoverview Unit tests for rate limiter
 */

import { checkRateLimit, clearRateLimit } from '@/lib/rate-limiter';

const mockDb = {
  rateLimitAttempt: {
    count: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock('@/lib/db', () => ({
  db: mockDb,
}));

const ENV = process.env;

describe('rate-limiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ENV }; // shallow copy
  });

  afterAll(() => {
    process.env = ENV;
  });

  it('allows when disabled (no DB calls)', async () => {
    delete process.env.ENABLE_RATE_LIMIT; // disabled
    const res = await checkRateLimit({ maxAttempts: 3, windowMs: 60000, identifier: 'ip', action: 'login' });
    expect(res.allowed).toBe(true);
    expect(mockDb.rateLimitAttempt.count).not.toHaveBeenCalled();
  });

  it('log mode does not block but reports remaining 0', async () => {
    process.env.ENABLE_RATE_LIMIT = 'log';
    mockDb.rateLimitAttempt.count.mockResolvedValue(3);
    mockDb.rateLimitAttempt.findFirst.mockResolvedValue({ createdAt: new Date(Date.now() - 1000) });
    const res = await checkRateLimit({ maxAttempts: 3, windowMs: 60000, identifier: 'ip', action: 'login' });
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(0);
    expect(typeof res.retryAfter === 'number').toBe(true);
  });

  it('blocks when exceeded in enforced mode', async () => {
    process.env.ENABLE_RATE_LIMIT = 'true';
    mockDb.rateLimitAttempt.count.mockResolvedValue(3);
    // oldest attempt was 5 seconds ago; window 60s -> retryAfter ~55s
    mockDb.rateLimitAttempt.findFirst.mockResolvedValue({ createdAt: new Date(Date.now() - 5000) });
    const res = await checkRateLimit({ maxAttempts: 3, windowMs: 60000, identifier: 'ip', action: 'login' });
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.retryAfter).toBeGreaterThan(0);
  });

  it('records attempt and allows when under limit', async () => {
    process.env.ENABLE_RATE_LIMIT = 'true';
    mockDb.rateLimitAttempt.count.mockResolvedValue(1);
    mockDb.rateLimitAttempt.findFirst.mockResolvedValue({ createdAt: new Date(Date.now() - 10000) });
    const res = await checkRateLimit({ maxAttempts: 3, windowMs: 60000, identifier: 'ip', action: 'login' });
    expect(res.allowed).toBe(true);
    expect(mockDb.rateLimitAttempt.create).toHaveBeenCalled();
  });

  it('fails open on DB error', async () => {
    process.env.ENABLE_RATE_LIMIT = 'true';
    mockDb.rateLimitAttempt.count.mockRejectedValue(new Error('db down'));
    const res = await checkRateLimit({ maxAttempts: 3, windowMs: 60000, identifier: 'ip', action: 'login' });
    expect(res.allowed).toBe(true);
  });

  it('clearRateLimit deletes attempts when enabled', async () => {
    process.env.ENABLE_RATE_LIMIT = 'true';
    await clearRateLimit('ip', 'login');
    expect(mockDb.rateLimitAttempt.deleteMany).toHaveBeenCalledWith({ where: { identifier: 'ip', action: 'login' } });
  });
});


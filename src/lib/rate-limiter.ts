/**
 * @fileoverview Production-ready rate limiting with database persistence
 * 
 * This module provides rate limiting functionality using the database
 * to track attempts, making it suitable for production with multiple
 * server instances or container restarts.
 */

import { db } from './db';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  identifier: string;
  action: string;
}

/**
 * Check and update rate limit for a given identifier and action
 */
export async function checkRateLimit({
  maxAttempts,
  windowMs,
  identifier,
  action,
}: RateLimitOptions): Promise<RateLimitResult> {
  // Feature flag controls
  // ENABLE_RATE_LIMIT:
  //  - 'true'  => enforce
  //  - 'log'   => evaluate but do not block (log-only)
  //  - other   => disabled
  const mode = (process.env.ENABLE_RATE_LIMIT || 'false').toLowerCase();
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  // Disabled: allow without DB calls
  if (mode !== 'true' && mode !== 'log') {
    return {
      allowed: true,
      remaining: Math.max(0, maxAttempts - 1),
      resetTime: now.getTime() + windowMs,
    };
  }

  try {
    // Count attempts in the window
    const [currentAttempts, oldestInWindow] = await Promise.all([
      db.rateLimitAttempt.count({
        where: {
          identifier,
          action,
          createdAt: { gte: windowStart },
        },
      }),
      db.rateLimitAttempt.findFirst({
        where: {
          identifier,
          action,
          createdAt: { gte: windowStart },
        },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
    ]);

    const remainingBefore = Math.max(0, maxAttempts - currentAttempts);
    const resetTime = now.getTime() + windowMs;

    // Under the limit: record this attempt and allow
    if (currentAttempts < maxAttempts) {
      // Record the attempt (best-effort)
      await db.rateLimitAttempt.create({
        data: {
          identifier,
          action,
          // createdAt defaults to now()
        },
      });

      return {
        allowed: true,
        remaining: Math.max(0, remainingBefore - 1), // subtract current attempt
        resetTime,
      };
    }

    // Over the limit – compute retryAfter
    const retryAfter = oldestInWindow
      ? Math.max(1, Math.ceil((oldestInWindow.createdAt.getTime() + windowMs - now.getTime()) / 1000))
      : Math.ceil(windowMs / 1000);

    // Log-only mode: don't block, just report remaining as 0
    if (mode === 'log') {
      // eslint-disable-next-line no-console
      console.warn('[rate-limit] exceeded (log-only)', { identifier, action, retryAfter });
      return {
        allowed: true,
        remaining: 0,
        resetTime,
        retryAfter,
      };
    }

    // Enforced mode: block
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter,
    };

  } catch (error) {
    console.error('Rate limit check failed:', error);
    
    // Fail open - allow the request if rate limiting fails
    // This prevents legitimate users from being blocked due to DB issues
    return {
      allowed: true,
      remaining: Math.max(0, maxAttempts - 1),
      resetTime: now.getTime() + windowMs,
    };
  }
}

/**
 * Clear rate limit attempts for a specific identifier and action
 * Useful for clearing successful login attempts, etc.
 */
export async function clearRateLimit(_identifier: string, _action: string): Promise<void> {
  try {
    const mode = (process.env.ENABLE_RATE_LIMIT || 'false').toLowerCase();
    if (mode !== 'true' && mode !== 'log') {
      return; // disabled
    }
    await db.rateLimitAttempt.deleteMany({
      where: {
        identifier: _identifier,
        action: _action,
      },
    });
  } catch (error) {
    console.error('Failed to clear rate limit:', error);
    // Don't throw - this is not critical for functionality
  }
}

/**
 * Login-specific rate limiting helper
 */
export async function checkLoginRateLimit(clientIp: string): Promise<RateLimitResult> {
  return checkRateLimit({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    identifier: clientIp,
    action: 'login',
  });
}

/**
 * Clear login rate limit after successful authentication
 */
export async function clearLoginRateLimit(clientIp: string): Promise<void> {
  return clearRateLimit(clientIp, 'login');
}

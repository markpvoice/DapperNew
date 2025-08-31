/**
 * @fileoverview Contact Form API
 * POST /api/contact - Submit contact form
 * GET /api/contact - List contact submissions (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import { createContactSubmission } from '@/lib/database';
import { checkRateLimit } from '@/lib/rate-limiter';

// Validation schema for contact form submissions
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format').max(255),
  phone: z.string().max(20).optional(),
  subject: z.string().max(255).optional(),
  message: z.string().min(1, 'Message is required').max(5000),
});

// Query parameters for listing contacts (admin)
const listContactsSchema = z.object({
  isRead: z.string().transform(str => str === 'true').optional(),
  limit: z.string().transform(str => parseInt(str) || 50).optional(),
  offset: z.string().transform(str => parseInt(str) || 0).optional(),
});

/**
 * POST /api/contact - Submit contact form
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: rate limiting (feature-flagged in the limiter)
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     '127.0.0.1';
    const rl = await checkRateLimit({
      maxAttempts: 10,
      windowMs: 10 * 60 * 1000, // 10 minutes
      identifier: clientIp,
      action: 'contact',
    });
    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: rl.retryAfter,
          remaining: rl.remaining,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rl.retryAfter || 600),
            'X-RateLimit-Remaining': String(rl.remaining),
            'X-RateLimit-Reset': String(Math.floor(rl.resetTime / 1000)),
          },
        }
      );
    }
    // Parse and validate request body
    const body = await request.json();
    const validation = contactSchema.safeParse(body);
    
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

    const contactData = validation.data;

    // Create contact submission
    const result = await createContactSubmission(contactData);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // TODO: Send email notification to admin
    // TODO: Send auto-reply to client

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      submissionId: result.contact?.id,
    }, { status: 201 });

  } catch (error) {
    console.error('Contact form API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contact - List contact submissions (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validation = listContactsSchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { isRead, limit = 50, offset = 0 } = validation.data;

    // Get contact submissions
    const { db } = await import('@/lib/db');
    const contacts = await db.contactSubmission.findMany({
      where: isRead !== undefined ? { isRead } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        source: true,
        isRead: true,
        createdAt: true,
      },
      orderBy: [
        { isRead: 'asc' }, // Unread first
        { createdAt: 'desc' }, // Most recent first
      ],
      take: limit,
      skip: offset,
    });

    // Get counts for summary
    const [totalCount, unreadCount] = await Promise.all([
      db.contactSubmission.count(),
      db.contactSubmission.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({
      success: true,
      contacts,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: contacts.length === limit,
      },
      summary: {
        total: totalCount,
        unread: unreadCount,
        read: totalCount - unreadCount,
      },
    });

  } catch (error) {
    console.error('List contacts API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

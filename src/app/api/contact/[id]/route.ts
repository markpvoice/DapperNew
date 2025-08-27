/**
 * @fileoverview Individual Contact Submission Management API
 * GET /api/contact/[id] - Get specific contact submission
 * PUT /api/contact/[id] - Update contact submission (mark as read/responded)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';

// Validation schema for updating contact submissions
const updateContactSchema = z.object({
  isRead: z.boolean().optional(),
});

/**
 * GET /api/contact/[id] - Get specific contact submission
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contact ID' },
        { status: 400 }
      );
    }

    // Get contact submission
    const { db } = await import('@/lib/db');
    const contact = await db.contactSubmission.findUnique({
      where: { id },
    });
    
    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      contact,
    });

  } catch (error) {
    console.error('Get contact API error:', error);
    
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
 * PUT /api/contact/[id] - Update contact submission (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contact ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateContactSchema.safeParse(body);
    
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

    const updateData = validation.data;

    // Update contact submission
    const { db } = await import('@/lib/db');
    const updatedContact = await db.contactSubmission.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Contact submission updated successfully',
      contact: updatedContact,
    });

  } catch (error) {
    console.error('Update contact API error:', error);
    
    // Check if it's a "not found" error from Prisma
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { success: false, error: 'Contact submission not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
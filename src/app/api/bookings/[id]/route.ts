/**
 * @fileoverview Individual Booking Management API
 * GET /api/bookings/[id] - Get specific booking
 * PUT /api/bookings/[id] - Update booking
 * DELETE /api/bookings/[id] - Delete/cancel booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import { updateBookingStatus, deleteBooking, getBookingById } from '@/lib/database';

// Validation schema for updating bookings
const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  clientName: z.string().min(1).max(255).optional(),
  clientEmail: z.string().email().max(255).optional(),
  clientPhone: z.string().min(1).max(20).optional(),
  eventDate: z.string().transform(str => new Date(str)).optional(),
  eventStartTime: z.string().transform(str => new Date(str)).optional(),
  eventEndTime: z.string().transform(str => new Date(str)).optional(),
  eventType: z.string().min(1).max(100).optional(),
  services: z.array(z.string()).min(1).optional(),
  venueName: z.string().max(255).optional(),
  venueAddress: z.string().optional(),
  guestCount: z.coerce.number().int().positive().optional(),
  specialRequests: z.string().optional(),
  totalAmount: z.coerce.number().positive().optional(),
  depositAmount: z.coerce.number().positive().optional(),
  paymentStatus: z.enum(['UNPAID', 'DEPOSIT_PAID', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED']).optional(),
});

/**
 * GET /api/bookings/[id] - Get specific booking
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get booking with details
    const booking = await getBookingById(id);
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error('Get booking API error:', error);
    
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
 * PUT /api/bookings/[id] - Update booking (admin only)
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

    const { id } = params;

    // Parse and validate request body
    const body = await request.json();
    const validation = updateBookingSchema.safeParse(body);
    
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

    // Check if booking exists
    const existingBooking = await getBookingById(id);
    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // If only updating status, use the optimized function
    if (Object.keys(updateData).length === 1 && updateData.status) {
      const result = await updateBookingStatus(id, updateData.status);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Booking status updated successfully',
        booking: result.booking,
      });
    }

    // For more complex updates, use direct database access
    const { db } = await import('@/lib/db');
    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking,
    });

  } catch (error) {
    console.error('Update booking API error:', error);
    
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
 * DELETE /api/bookings/[id] - Delete/cancel booking (admin only)
 */
export async function DELETE(
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

    const { id } = params;

    // Delete booking
    const result = await deleteBooking(id);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });

  } catch (error) {
    console.error('Delete booking API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
/**
 * @fileoverview Booking Management API
 * GET /api/bookings - List all bookings (admin)
 * POST /api/bookings - Create new booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import { createBooking, getBookingsByDateRange } from '@/lib/database';
import { sendBookingConfirmation, sendAdminNotification, type BookingEmailData } from '@/lib/email';

// Validation schema for creating bookings
const createBookingSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(255),
  clientEmail: z.string().email('Invalid email format').max(255),
  clientPhone: z.string().min(1, 'Phone number is required').max(20),
  eventDate: z.string().transform(str => new Date(str)),
  eventStartTime: z.string().transform(str => new Date(str)).optional(),
  eventEndTime: z.string().transform(str => new Date(str)).optional(),
  eventType: z.string().min(1, 'Event type is required').max(100),
  services: z.array(z.string()).min(1, 'At least one service is required'),
  venueName: z.string().max(255).optional(),
  venueAddress: z.string().optional(),
  guestCount: z.number().int().positive().optional(),
  specialRequests: z.string().optional(),
  totalAmount: z.number().positive().optional(),
  depositAmount: z.number().positive().optional(),
});

// Query parameters schema for listing bookings
const listBookingsSchema = z.object({
  status: z.string().optional(),
  dateFrom: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  dateTo: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  limit: z.string().transform(str => parseInt(str) || 50).optional(),
  offset: z.string().transform(str => parseInt(str) || 0).optional(),
});

/**
 * GET /api/bookings - List bookings (admin only)
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
    
    const validation = listBookingsSchema.safeParse(queryParams);
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

    const { status, dateFrom, dateTo, limit = 50, offset = 0 } = validation.data;

    // Get bookings based on filters
    let bookings;
    if (dateFrom && dateTo) {
      const result = await getBookingsByDateRange(dateFrom, dateTo);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }
      bookings = result.bookings || [];
    } else {
      // Use query helpers for optimized listing
      const { queryHelpers } = await import('@/lib/db');
      bookings = await queryHelpers.getBookingsList({
        status,
        dateFrom,
        dateTo,
        limit,
        offset,
      });
    }

    // Get total count for pagination
    const totalCount = bookings.length;

    return NextResponse.json({
      success: true,
      bookings,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: totalCount === limit,
      },
    });

  } catch (error) {
    console.error('List bookings API error:', error);
    
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
 * POST /api/bookings - Create new booking
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = createBookingSchema.safeParse(body);
    
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

    const bookingData = validation.data;

    // Validate event date is in the future
    if (bookingData.eventDate < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event date must be in the future',
        },
        { status: 400 }
      );
    }

    // Create booking
    const result = await createBooking(bookingData);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const booking = result.booking!;

    // Send confirmation emails (but don't fail the booking if emails fail)
    try {
      // Prepare email data
      const emailData: BookingEmailData = {
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        bookingReference: booking.bookingReference,
        eventDate: booking.eventDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        eventType: booking.eventType,
        services: booking.servicesNeeded,
        venueName: booking.venueName || undefined,
        venueAddress: booking.venueAddress || undefined,
        totalAmount: booking.totalAmount ? Number(booking.totalAmount) : undefined,
        depositAmount: booking.depositAmount ? Number(booking.depositAmount) : undefined,
      };

      // Send customer confirmation email
      const customerEmailResult = await sendBookingConfirmation(emailData);
      if (customerEmailResult.success) {
      } else {
        console.error('❌ Failed to send customer confirmation:', customerEmailResult.error);
      }

      // Send admin notification email
      const adminEmailResult = await sendAdminNotification(emailData);
      if (adminEmailResult.success) {
      } else {
        console.error('❌ Failed to send admin notification:', adminEmailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Email sending error (booking still created):', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking: result.booking,
    }, { status: 201 });

  } catch (error) {
    console.error('Create booking API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
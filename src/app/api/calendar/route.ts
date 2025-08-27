/**
 * @fileoverview Calendar Management API
 * GET /api/calendar - Get calendar data with events
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';

// Query parameters schema
const calendarSchema = z.object({
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  includeBookings: z.string().transform(str => str === 'true').optional(),
});

/**
 * GET /api/calendar - Get calendar data
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeBookings = searchParams.get('includeBookings') || 'false';

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'startDate and endDate parameters are required',
        },
        { status: 400 }
      );
    }

    const validation = calendarSchema.safeParse({ startDate, endDate, includeBookings });
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { startDate: start, endDate: end, includeBookings: includeBkgs } = validation.data;

    // Validate date range
    if (start >= end) {
      return NextResponse.json(
        {
          success: false,
          error: 'startDate must be before endDate',
        },
        { status: 400 }
      );
    }

    // Get calendar availability using query helpers
    const { queryHelpers } = await import('@/lib/db');
    const availability = await queryHelpers.getCalendarAvailability(start, end);

    // If including bookings, get booking details
    let bookings = [];
    if (includeBkgs) {
      const { getBookingsByDateRange } = await import('@/lib/database');
      const bookingResult = await getBookingsByDateRange(start, end);
      if (bookingResult.success) {
        bookings = bookingResult.bookings || [];
      }
    }

    // Format calendar data
    const calendarData = availability.map(item => ({
      date: item.date.toISOString().split('T')[0],
      isAvailable: item.isAvailable,
      blockedReason: item.blockedReason,
      booking: item.booking ? {
        id: item.booking.id,
        clientName: item.booking.clientName,
        eventType: item.booking.eventType,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      calendar: calendarData,
      bookings: includeBkgs ? bookings : undefined,
      totalDays: availability.length,
      availableDays: availability.filter(item => item.isAvailable).length,
      bookedDays: availability.filter(item => !item.isAvailable).length,
    });

  } catch (error) {
    console.error('Calendar API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
/**
 * @fileoverview Booking Availability API
 * GET /api/bookings/availability - Check date availability
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAvailableDates } from '@/lib/database';

// Query parameters schema
const availabilitySchema = z.object({
  month: z.string().transform(str => parseInt(str)).refine(val => val >= 1 && val <= 12, 'Month must be 1-12'),
  year: z.string().transform(str => parseInt(str)).refine(val => val >= 2024 && val <= 2030, 'Year must be 2024-2030'),
});

/**
 * GET /api/bookings/availability - Get available dates for booking
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json(
        {
          success: false,
          error: 'Month and year parameters are required',
        },
        { status: 400 }
      );
    }

    const validation = availabilitySchema.safeParse({ month, year });
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

    const { month: monthNum, year: yearNum } = validation.data;

    // Get available dates
    const result = await getAvailableDates(monthNum, yearNum);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      month: monthNum,
      year: yearNum,
      availableDates: result.availableDates || [],
      totalAvailable: result.availableDates?.length || 0,
    });

  } catch (error) {
    console.error('Availability API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
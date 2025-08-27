/**
 * @fileoverview Calendar Availability Management API
 * PUT /api/calendar/availability - Update availability for specific dates
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import { updateCalendarAvailability } from '@/lib/database';

// Validation schema for updating availability
const updateAvailabilitySchema = z.object({
  date: z.string().transform(str => new Date(str)),
  available: z.boolean(),
  blockedReason: z.string().optional(),
});

// Bulk update schema
const bulkUpdateSchema = z.object({
  updates: z.array(updateAvailabilitySchema).min(1, 'At least one update is required'),
});

/**
 * PUT /api/calendar/availability - Update calendar availability (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Check if it's a single update or bulk update
    const isBulkUpdate = Array.isArray(body.updates);
    
    if (isBulkUpdate) {
      // Handle bulk updates
      const validation = bulkUpdateSchema.safeParse(body);
      
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

      const { updates } = validation.data;
      const results = [];

      // Process each update
      for (const update of updates) {
        try {
          const result = await updateCalendarAvailability(update.date, update.available);
          
          // If blocking a date, also update the blocked reason
          if (!update.available && update.blockedReason) {
            const { db } = await import('@/lib/db');
            await db.calendarAvailability.update({
              where: { date: update.date },
              data: { blockedReason: update.blockedReason },
            });
          }

          results.push({
            date: update.date.toISOString().split('T')[0],
            success: result.success,
            error: result.error,
          });
        } catch (error) {
          results.push({
            date: update.date.toISOString().split('T')[0],
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      return NextResponse.json({
        success: failureCount === 0,
        message: `Updated ${successCount} dates successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
        },
      });

    } else {
      // Handle single update
      const validation = updateAvailabilitySchema.safeParse(body);
      
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

      const { date, available, blockedReason } = validation.data;

      // Update availability
      const result = await updateCalendarAvailability(date, available);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      // If blocking a date, also update the blocked reason
      if (!available && blockedReason) {
        const { db } = await import('@/lib/db');
        await db.calendarAvailability.update({
          where: { date },
          data: { blockedReason },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Calendar availability updated successfully',
        date: date.toISOString().split('T')[0],
        available,
        blockedReason: !available ? blockedReason : null,
      });
    }

  } catch (error) {
    console.error('Update availability API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
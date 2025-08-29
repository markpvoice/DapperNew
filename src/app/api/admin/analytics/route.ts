/**
 * @fileoverview Admin Analytics API
 * GET /api/admin/analytics - Get detailed analytics and reports
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for API routes that use request.cookies or request.url
export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';

// Query parameters schema
const analyticsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  metrics: z.string().transform(str => str.split(',')).optional(),
});

/**
 * GET /api/admin/analytics - Get analytics data (admin only)
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
    
    const validation = analyticsSchema.safeParse(queryParams);
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

    const { period } = validation.data;

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const { db } = await import('@/lib/db');

    // Booking analytics
    const bookingAnalytics = await db.booking.groupBy({
      by: ['status', 'eventType'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Service popularity
    const serviceAnalytics = await db.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        servicesNeeded: true,
      },
    });

    // Process service popularity
    const servicePopularity: Record<string, number> = {};
    serviceAnalytics.forEach(booking => {
      booking.servicesNeeded.forEach(service => {
        servicePopularity[service] = (servicePopularity[service] || 0) + 1;
      });
    });

    // Daily booking trends
    const dailyBookings = await db.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM bookings 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Revenue analytics
    const revenueAnalytics = await db.booking.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      _sum: {
        totalAmount: true,
        depositAmount: true,
      },
      _avg: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // Contact form analytics
    const contactAnalytics = await db.contactSubmission.groupBy({
      by: ['source'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Event type trends
    const eventTypeAnalytics = await db.booking.groupBy({
      by: ['eventType'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
      _avg: {
        totalAmount: true,
      },
    });

    // Conversion funnel (simplified)
    const [totalContacts, totalBookings, confirmedBookings] = await Promise.all([
      db.contactSubmission.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      db.booking.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      db.booking.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      period,
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      analytics: {
        // Booking analytics
        bookings: {
          byStatus: bookingAnalytics.reduce((acc: Record<string, any>, item) => {
            if (!acc[item.status]) {
              acc[item.status] = { count: 0, revenue: 0 };
            }
            acc[item.status].count += item._count.id;
            acc[item.status].revenue += Number(item._sum.totalAmount || 0);
            return acc;
          }, {}),
          byEventType: eventTypeAnalytics.map(item => ({
            eventType: item.eventType,
            count: item._count.id,
            totalRevenue: Number(item._sum.totalAmount || 0),
            averageRevenue: Number(item._avg.totalAmount || 0),
          })),
          dailyTrends: dailyBookings.map(item => ({
            date: item.date,
            count: Number(item.count),
          })),
        },

        // Service analytics
        services: {
          popularity: Object.entries(servicePopularity)
            .sort(([,a], [,b]) => b - a)
            .map(([service, count]) => ({ service, count })),
        },

        // Revenue analytics
        revenue: {
          total: Number(revenueAnalytics._sum.totalAmount || 0),
          deposits: Number(revenueAnalytics._sum.depositAmount || 0),
          average: Number(revenueAnalytics._avg.totalAmount || 0),
          bookingsCount: revenueAnalytics._count.id,
        },

        // Contact analytics
        contacts: {
          bySourse: contactAnalytics.map(item => ({
            source: item.source,
            count: item._count.id,
          })),
        },

        // Conversion funnel
        conversion: {
          contacts: totalContacts,
          bookings: totalBookings,
          confirmed: confirmedBookings,
          contactToBooking: totalContacts > 0 ? (totalBookings / totalContacts * 100) : 0,
          bookingToConfirmed: totalBookings > 0 ? (confirmedBookings / totalBookings * 100) : 0,
        },
      },
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
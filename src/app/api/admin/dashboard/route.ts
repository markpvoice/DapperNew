/**
 * @fileoverview Admin Dashboard API
 * GET /api/admin/dashboard - Get dashboard statistics and data
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for API routes that use request.cookies
export const dynamic = 'force-dynamic';
import { verifyAuth } from '@/lib/auth';
import { getDashboardStats, getRecentBookings } from '@/lib/database';

/**
 * GET /api/admin/dashboard - Get dashboard data (admin only)
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

    // Get dashboard statistics
    const stats = await getDashboardStats();
    
    // Get recent bookings
    const recentBookings = await getRecentBookings(10);

    // Get contact form statistics
    const { db } = await import('@/lib/db');
    const [unreadContacts, recentContacts] = await Promise.all([
      db.contactSubmission.count({ where: { isRead: false } }),
      db.contactSubmission.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          createdAt: true,
          isRead: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate revenue statistics (from confirmed bookings)
    const revenueStats = await db.booking.aggregate({
      where: {
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      _sum: {
        totalAmount: true,
        depositAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get monthly booking trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends = await db.booking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Process monthly trends
    const trendsByMonth = monthlyTrends.reduce((acc: Record<string, number>, booking) => {
      const month = booking.createdAt.toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + booking._count.id;
      return acc;
    }, {});

    // Get upcoming events (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingEvents = await db.booking.findMany({
      where: {
        eventDate: {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        },
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      },
      select: {
        id: true,
        bookingReference: true,
        clientName: true,
        eventDate: true,
        eventType: true,
        status: true,
      },
      orderBy: { eventDate: 'asc' },
      take: 10,
    });

    // Recent activity (bookings and contacts combined)
    const recentActivity = [
      ...recentBookings.map(booking => ({
        type: 'booking' as const,
        id: booking.id,
        title: `New booking: ${booking.clientName}`,
        subtitle: `${booking.eventType} on ${booking.eventDate.toDateString()}`,
        timestamp: booking.createdAt,
      })),
      ...recentContacts.map(contact => ({
        type: 'contact' as const,
        id: contact.id,
        title: `Contact from ${contact.name}`,
        subtitle: contact.subject || 'General inquiry',
        timestamp: contact.createdAt,
        isRead: contact.isRead,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);

    return NextResponse.json({
      success: true,
      dashboard: {
        // Main statistics
        stats: {
          totalBookings: stats.totalBookings,
          pendingBookings: stats.pendingBookings,
          confirmedBookings: stats.confirmedBookings,
          thisMonthBookings: stats.thisMonthBookings,
          upcomingEvents: stats.upcomingEvents,
          unreadContacts,
        },
        
        // Revenue statistics
        revenue: {
          totalRevenue: Number(revenueStats._sum.totalAmount || 0),
          totalDeposits: Number(revenueStats._sum.depositAmount || 0),
          confirmedBookings: revenueStats._count.id,
          averageBookingValue: revenueStats._count.id > 0 
            ? Number(revenueStats._sum.totalAmount || 0) / revenueStats._count.id 
            : 0,
        },
        
        // Trends and analytics
        trends: {
          monthlyBookings: trendsByMonth,
        },
        
        // Recent data
        recentBookings: recentBookings.slice(0, 5),
        upcomingEvents,
        recentContacts,
        recentActivity,
      },
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
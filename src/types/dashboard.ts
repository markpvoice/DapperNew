/**
 * @fileoverview Dashboard Types
 * 
 * Type definitions for dashboard-related data structures.
 * Separated from hooks to prevent Fast Refresh issues.
 */

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings?: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  monthlyRevenue?: number;
  averageBookingValue: number;
  thisMonthBookings: number;
  lastMonthBookings: number;
  bookingGrowth: number;
  revenueGrowth: number;
  upcomingEvents?: number;
  recentBookings?: number;
  conversionRate?: number;
  responseTime?: number; // in hours
}

export interface UpcomingEvent {
  id: string;
  bookingReference: string;
  clientName: string;
  eventDate: string;
  eventType: string;
  status: string;
  venueName?: string;
  eventStartTime?: string;
  servicesNeeded?: string[];
  venue?: string;
}

export interface RecentBooking {
  id: string;
  bookingReference: string;
  clientName: string;
  eventType: string;
  eventDate: string;
  status: string;
  totalAmount?: number;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats | null;
  upcomingEvents: UpcomingEvent[];
  recentBookings: RecentBooking[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}
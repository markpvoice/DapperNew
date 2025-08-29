/**
 * @fileoverview Admin Analytics Component
 * 
 * Comprehensive analytics dashboard displaying:
 * - Revenue metrics and trends
 * - Booking status breakdowns
 * - Service popularity analytics
 * - Event type performance
 * - Conversion funnel metrics
 * - Contact source analytics
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { RevenueChart } from './charts/RevenueChart';
import { ServicePopularityChart } from './charts/ServicePopularityChart';
import { BookingTrendsChart } from './charts/BookingTrendsChart';

interface AnalyticsData {
  success: boolean;
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  analytics: {
    bookings: {
      byStatus: Record<string, { count: number; revenue: number }>;
      byEventType: Array<{
        eventType: string;
        count: number;
        totalRevenue: number;
        averageRevenue: number;
      }>;
      dailyTrends: Array<{
        date: string;
        count: number;
      }>;
    };
    services: {
      popularity: Array<{
        service: string;
        count: number;
      }>;
    };
    revenue: {
      total: number;
      deposits: number;
      average: number;
      bookingsCount: number;
    };
    contacts: {
      bySourse: Array<{
        source: string;
        count: number;
      }>;
    };
    conversion: {
      contacts: number;
      bookings: number;
      confirmed: number;
      contactToBooking: number;
      bookingToConfirmed: number;
    };
  };
}

const periodLabels = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
  '1y': 'Last Year'
};

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<keyof typeof periodLabels>('30d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      
        if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handlePeriodChange = (newPeriod: keyof typeof periodLabels) => {
    setPeriod(newPeriod);
  };

  const handleExport = () => {
    if (!data) {
      return;
    }
    
    const exportData = {
      period: data.period,
      dateRange: data.dateRange,
      analytics: data.analytics,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dapper-squad-analytics-${data.period}-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">Failed to load analytics data</p>
          <button
            onClick={fetchAnalytics}
            className="bg-brand-gold hover:bg-brand-dark-gold text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Business Performance Overview</p>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(data.dateRange.startDate)} - {formatDate(data.dateRange.endDate)}
          </p>
        </div>
        
        <div className="flex gap-4 mt-4 sm:mt-0">
          {/* Time Period Selector */}
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value as keyof typeof periodLabels)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            aria-label="Time Period"
          >
            {Object.entries(periodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="bg-brand-charcoal hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-grid">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.analytics.revenue.total)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Deposits Collected</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.analytics.revenue.deposits)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Average Booking</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.analytics.revenue.average)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(data.analytics.revenue.bookingsCount)}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <RevenueChart 
        data={data.analytics.bookings.dailyTrends.map(trend => ({
          date: trend.date,
          revenue: data.analytics.revenue.total / data.analytics.bookings.dailyTrends.length, // Mock even distribution
          bookings: trend.count
        }))}
        title="Revenue & Booking Trends"
        chartType="line"
        showBookings={true}
        height={350}
      />

      {/* Booking Status Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(data.analytics.bookings.byStatus).map(([status, stats]) => (
            <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">
                {status === 'CONFIRMED' ? 'Confirmed' : 
                 status === 'PENDING' ? 'Pending' : 
                 status === 'COMPLETED' ? 'Completed' : 
                 status === 'CANCELLED' ? 'Cancelled' : status}: {stats.count}
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(stats.revenue)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Service Popularity Chart */}
      <ServicePopularityChart 
        data={data.analytics.services.popularity}
        title="Service Popularity Distribution"
        showLegend={true}
        height={350}
      />

      {/* Event Type Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.analytics.bookings.byEventType.map((eventType) => (
            <div key={eventType.eventType} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">
                {eventType.eventType}: {eventType.count} events
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(eventType.totalRevenue)} revenue
              </p>
              <p className="text-sm text-gray-600">
                {formatCurrency(eventType.averageRevenue)} avg
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Trends Chart */}
      <BookingTrendsChart 
        data={data.analytics.bookings.dailyTrends.map(trend => ({
          date: trend.date,
          bookings: trend.count,
          revenue: data.analytics.revenue.total / data.analytics.bookings.dailyTrends.length // Mock even distribution
        }))}
        title="Daily Booking Trends"
        showPeriodSelector={true}
        height={350}
      />

      {/* Conversion Funnel */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{data.analytics.conversion.contacts}</p>
            <p className="text-sm text-gray-600">Contacts</p>
          </div>
          
          <div className="flex items-center">
            <div className="text-center">
              <p className="text-sm font-medium text-brand-gold">
                {data.analytics.conversion.contactToBooking.toFixed(1)}%
              </p>
              <div className="w-8 h-0.5 bg-brand-gold mt-1"></div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{data.analytics.conversion.bookings}</p>
            <p className="text-sm text-gray-600">Bookings</p>
          </div>
          
          <div className="flex items-center">
            <div className="text-center">
              <p className="text-sm font-medium text-brand-gold">
                {data.analytics.conversion.bookingToConfirmed.toFixed(1)}%
              </p>
              <div className="w-8 h-0.5 bg-brand-gold mt-1"></div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{data.analytics.conversion.confirmed}</p>
            <p className="text-sm text-gray-600">Confirmed</p>
          </div>
        </div>
      </div>

      {/* Contact Sources */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.analytics.contacts.bySourse.map((contact) => (
            <div key={contact.source} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">{contact.count}</p>
              <p className="text-sm text-gray-600 capitalize">
                {contact.source.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
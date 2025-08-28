/**
 * @fileoverview Admin Dashboard Component
 * 
 * Main dashboard interface for admin users with statistics, 
 * upcoming events, and recent bookings display.
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { BookingManagement } from './BookingManagement';

interface AdminDashboardProps {
  className?: string;
}

export function AdminDashboard({ className = '' }: AdminDashboardProps) {
  const { user } = useAuth();
  const { stats, upcomingEvents, recentBookings, loading, error } = useDashboardData();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings'>('overview');

  if (loading) {
    return (
      <div data-testid="dashboard-loading" className={`p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="dashboard-error" className={`p-8 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 font-medium mb-2">Dashboard Error</div>
          <div className="text-red-800">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="admin-dashboard" className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Navigation */}
      <nav data-testid="admin-navigation" className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-brand-charcoal font-bold text-sm">
                  DS
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              
              <div className="hidden md:flex space-x-6">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`pb-4 pt-4 font-medium ${
                    activeTab === 'overview'
                      ? 'text-brand-gold border-b-2 border-brand-gold'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`pb-4 pt-4 font-medium ${
                    activeTab === 'bookings'
                      ? 'text-brand-gold border-b-2 border-brand-gold'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Bookings
                </button>
                <a href="/admin/calendar" className="text-gray-500 hover:text-gray-700 pb-4 pt-4">
                  Calendar
                </a>
                <a href="/admin/analytics" className="text-gray-500 hover:text-gray-700 pb-4 pt-4">
                  Analytics
                </a>
                <a href="/admin/settings" className="text-gray-500 hover:text-gray-700 pb-4 pt-4">
                  Settings
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <div className="font-medium">{user?.name}</div>
                <div className="text-gray-500">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main data-testid="admin-content" className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' ? (
          <>
            {/* Overview Dashboard */}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingBookings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.confirmedBookings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completedBookings || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">
              ${(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">This Month Revenue</h3>
            <p className="text-3xl font-bold text-blue-600">
              ${(stats?.thisMonthRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Average Booking Value</h3>
            <p className="text-3xl font-bold text-purple-600">
              ${(stats?.averageBookingValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
            </div>
            <div data-testid="upcoming-events" className="divide-y divide-gray-200">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <a 
                          href={`/admin/bookings/${event.id}`} 
                          className="text-sm font-medium text-gray-900 hover:text-brand-gold"
                          aria-label={`View ${event.clientName} event`}
                        >
                          {event.clientName}
                        </a>
                        <p className="text-sm text-gray-500">{event.bookingReference}</p>
                        <p className="text-sm text-gray-600">{event.eventType}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(event.eventDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <span 
                        data-testid={`status-badge-${event.status.toLowerCase()}`}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          event.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-800' 
                            : event.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {event.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No upcoming events
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
            </div>
            <div data-testid="recent-bookings" className="divide-y divide-gray-200">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.clientName}</p>
                        <p className="text-sm text-gray-500">{booking.bookingReference}</p>
                        <p className="text-sm text-gray-600">{booking.eventType}</p>
                        <p className="text-sm text-gray-500">
                          ${booking.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <span 
                        data-testid={`status-badge-${booking.status.toLowerCase()}`}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-800' 
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No recent bookings
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div data-testid="quick-actions" className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <a 
                href="/admin/bookings/new" 
                className="bg-brand-gold text-brand-charcoal px-4 py-2 rounded-lg font-medium hover:bg-brand-dark-gold transition-colors"
              >
                New Booking
              </a>
              <a 
                href="/admin/calendar" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Manage Calendar
              </a>
              <a 
                href="/admin/analytics" 
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                View Reports
              </a>
            </div>
          </div>
        </div>
          </>
        ) : (
          /* Booking Management */
          <BookingManagement />
        )}
      </main>
    </div>
  );
}
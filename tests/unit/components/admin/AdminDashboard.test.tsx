/**
 * @fileoverview Admin Dashboard Component Tests
 * 
 * Test-Driven Development tests for the admin dashboard functionality.
 * These tests define the expected behavior before implementation.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

// Mock the auth hook
const mockAuthData = {
  user: {
    id: 1,
    email: 'admin@dappersquad.com',
    name: 'Admin User',
    role: 'admin',
  },
  loading: false,
  error: null,
};

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthData,
}));

// Mock the dashboard data hook
const mockDashboardData = {
  stats: {
    totalBookings: 15,
    pendingBookings: 3,
    confirmedBookings: 8,
    completedBookings: 4,
    totalRevenue: 12500.00,
    thisMonthRevenue: 4200.00,
    averageBookingValue: 833.33,
  },
  upcomingEvents: [
    {
      id: 'cmeurm5m20000qk6fgo68mmgs',
      bookingReference: 'DSE-931427-4WG',
      clientName: 'Test User',
      eventDate: '2025-09-15',
      eventType: 'Wedding',
      status: 'CONFIRMED',
    },
  ],
  recentBookings: [
    {
      id: 'cmeurmxhi0001qk6fu8320vdt',
      bookingReference: 'DSE-967557-DI2',
      clientName: 'Test User 2',
      eventDate: '2025-10-01',
      eventType: 'Birthday Party',
      status: 'PENDING',
    },
  ],
  loading: false,
  error: null,
};

jest.mock('@/hooks/useDashboardData', () => ({
  useDashboardData: () => mockDashboardData,
}));

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication and Layout', () => {
    test('renders admin dashboard layout with navigation', () => {
      render(<AdminDashboard />);
      
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('admin-navigation')).toBeInTheDocument();
      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });

    test('displays user information in header', () => {
      render(<AdminDashboard />);
      
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('admin@dappersquad.com')).toBeInTheDocument();
    });

    test('shows navigation menu items', () => {
      render(<AdminDashboard />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Bookings')).toBeInTheDocument();
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Dashboard Statistics', () => {
    test('displays key business metrics', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument(); // totalBookings
        expect(screen.getByText('3')).toBeInTheDocument(); // pendingBookings
        expect(screen.getByText('8')).toBeInTheDocument(); // confirmedBookings
        expect(screen.getByText('4')).toBeInTheDocument(); // completedBookings
      });
    });

    test('displays revenue information', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('$12,500.00')).toBeInTheDocument(); // totalRevenue
        expect(screen.getByText('$4,200.00')).toBeInTheDocument(); // thisMonthRevenue
        expect(screen.getByText('$833.33')).toBeInTheDocument(); // averageBookingValue
      });
    });

    test('displays metric labels correctly', () => {
      render(<AdminDashboard />);
      
      expect(screen.getByText('Total Bookings')).toBeInTheDocument();
      expect(screen.getByText('Pending Bookings')).toBeInTheDocument();
      expect(screen.getByText('Confirmed Bookings')).toBeInTheDocument();
      expect(screen.getByText('Completed Bookings')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('This Month Revenue')).toBeInTheDocument();
      expect(screen.getByText('Average Booking Value')).toBeInTheDocument();
    });
  });

  describe('Upcoming Events Section', () => {
    test('displays upcoming events list', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByTestId('upcoming-events')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('DSE-931427-4WG')).toBeInTheDocument();
        expect(screen.getByText('Wedding')).toBeInTheDocument();
        expect(screen.getByText('Sep 15, 2025')).toBeInTheDocument();
      });
    });

    test('shows event status badges', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByTestId('status-badge-confirmed')).toBeInTheDocument();
      });
    });

    test('provides links to event details', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const eventLink = screen.getByRole('link', { name: /view.*test user/i });
        expect(eventLink).toHaveAttribute('href', '/admin/bookings/cmeurm5m20000qk6fgo68mmgs');
      });
    });
  });

  describe('Recent Bookings Section', () => {
    test('displays recent bookings list', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByTestId('recent-bookings')).toBeInTheDocument();
        expect(screen.getByText('Test User 2')).toBeInTheDocument();
        expect(screen.getByText('DSE-967557-DI2')).toBeInTheDocument();
        expect(screen.getByText('Birthday Party')).toBeInTheDocument();
      });
    });

    test('shows booking status indicators', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByTestId('status-badge-pending')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions', () => {
    test('provides quick action buttons', () => {
      render(<AdminDashboard />);
      
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
      expect(screen.getByText('New Booking')).toBeInTheDocument();
      expect(screen.getByText('Manage Calendar')).toBeInTheDocument();
      expect(screen.getByText('View Reports')).toBeInTheDocument();
    });

    test('quick action buttons trigger correct navigation', () => {
      render(<AdminDashboard />);
      
      const newBookingBtn = screen.getByText('New Booking');
      const calendarBtn = screen.getByText('Manage Calendar');
      const reportsBtn = screen.getByText('View Reports');
      
      expect(newBookingBtn.closest('a')).toHaveAttribute('href', '/admin/bookings/new');
      expect(calendarBtn.closest('a')).toHaveAttribute('href', '/admin/calendar');
      expect(reportsBtn.closest('a')).toHaveAttribute('href', '/admin/analytics');
    });
  });

  describe('Loading States', () => {
    test('shows loading indicator when data is loading', () => {
      // Override mock to show loading state
      jest.doMock('@/hooks/useDashboardData', () => ({
        useDashboardData: () => ({
          ...mockDashboardData,
          loading: true,
        }),
      }));
      
      const { AdminDashboard: LoadingDashboard } = require('@/components/admin/AdminDashboard');
      render(<LoadingDashboard />);
      
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    test('shows error message when data loading fails', () => {
      // Override mock to show error state
      jest.doMock('@/hooks/useDashboardData', () => ({
        useDashboardData: () => ({
          ...mockDashboardData,
          loading: false,
          error: 'Failed to load dashboard data',
        }),
      }));
      
      const { AdminDashboard: ErrorDashboard } = require('@/components/admin/AdminDashboard');
      render(<ErrorDashboard />);
      
      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('adapts navigation for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });
      
      render(<AdminDashboard />);
      
      expect(screen.getByTestId('mobile-menu-toggle')).toBeInTheDocument();
    });

    test('shows collapsed navigation on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });
      
      render(<AdminDashboard />);
      
      const navigation = screen.getByTestId('admin-navigation');
      expect(navigation).toHaveClass('mobile-hidden');
    });
  });

  describe('Accessibility', () => {
    test('includes proper ARIA labels and roles', () => {
      render(<AdminDashboard />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Admin Dashboard')).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      render(<AdminDashboard />);
      
      const firstNavItem = screen.getByText('Dashboard');
      firstNavItem.focus();
      
      expect(document.activeElement).toBe(firstNavItem);
    });
  });
});
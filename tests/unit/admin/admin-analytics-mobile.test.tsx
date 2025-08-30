/**
 * @fileoverview Admin Analytics Mobile Responsiveness Tests
 * 
 * Comprehensive TDD test suite for AdminAnalytics mobile optimization.
 * Tests mobile-specific layouts, touch targets, and responsive chart behavior.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';

// Mock the chart components to avoid canvas rendering issues in tests
jest.mock('@/components/admin/charts/RevenueChart', () => ({
  RevenueChart: ({ mobile, height, ...props }: any) => (
    <div 
      data-testid="revenue-chart"
      data-mobile={mobile}
      data-height={height}
      style={{ height: height || 350 }}
    >
      Revenue Chart Mock
    </div>
  ),
}));

jest.mock('@/components/admin/charts/ServicePopularityChart', () => ({
  ServicePopularityChart: ({ mobile, simplified, ...props }: any) => (
    <div 
      data-testid="service-popularity-chart"
      data-mobile={mobile}
      data-simplified={simplified}
    >
      Service Popularity Chart Mock
    </div>
  ),
}));

jest.mock('@/components/admin/charts/BookingTrendsChart', () => ({
  BookingTrendsChart: ({ mobile, height, ...props }: any) => (
    <div 
      data-testid="booking-trends-chart"
      data-mobile={mobile}
      data-height={height}
      style={{ height: height || 300 }}
    >
      Booking Trends Chart Mock
    </div>
  ),
}));

// Mock analytics API response
const mockAnalyticsData = {
  success: true,
  period: '30d',
  dateRange: {
    startDate: '2025-08-01',
    endDate: '2025-08-30',
  },
  analytics: {
    bookings: {
      byStatus: {
        confirmed: { count: 15, revenue: 7500 },
        pending: { count: 5, revenue: 2500 },
        completed: { count: 8, revenue: 4000 },
      },
      byEventType: [
        { eventType: 'Wedding', count: 8, totalRevenue: 4000, averageRevenue: 500 },
        { eventType: 'Corporate', count: 10, totalRevenue: 6000, averageRevenue: 600 },
        { eventType: 'Birthday', count: 5, totalRevenue: 2000, averageRevenue: 400 },
      ],
      dailyTrends: [
        { date: '2025-08-01', count: 2 },
        { date: '2025-08-02', count: 1 },
        { date: '2025-08-03', count: 3 },
      ],
    },
    services: {
      popularity: [
        { service: 'DJ', count: 20 },
        { service: 'Photography', count: 15 },
        { service: 'Karaoke', count: 8 },
      ],
    },
    revenue: {
      total: 14000,
      deposits: 2800,
      average: 608,
      bookingsCount: 23,
    },
    contacts: {
      bySourse: [
        { source: 'Website', count: 50 },
        { source: 'Referral', count: 25 },
        { source: 'Social Media', count: 15 },
      ],
    },
    conversion: {
      contacts: 90,
      bookings: 23,
      confirmed: 15,
      contactToBooking: 25.6,
      bookingToConfirmed: 65.2,
    },
  },
};

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockAnalyticsData),
  })
) as jest.Mock;

// Helper function to simulate mobile viewport
const setMobileViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375, // iPhone SE width
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 667,
  });
  
  // Trigger resize event
  fireEvent(window, new Event('resize'));
};

// Helper function to simulate tablet viewport
const setTabletViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 768,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 1024,
  });
  
  fireEvent(window, new Event('resize'));
};

// Helper function to simulate desktop viewport
const setDesktopViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
  });
  
  fireEvent(window, new Event('resize'));
};

// Helper function to check touch target requirements
const checkTouchTarget = (element: HTMLElement, minSize = 44) => {
  const computedStyle = window.getComputedStyle(element);
  const width = parseInt(computedStyle.width) || 0;
  const height = parseInt(computedStyle.height) || 0;
  const paddingLeft = parseInt(computedStyle.paddingLeft) || 0;
  const paddingRight = parseInt(computedStyle.paddingRight) || 0;
  const paddingTop = parseInt(computedStyle.paddingTop) || 0;
  const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;
  
  const totalWidth = width + paddingLeft + paddingRight;
  const totalHeight = height + paddingTop + paddingBottom;
  
  return {
    width: totalWidth,
    height: totalHeight,
    meetsStandard: totalWidth >= minSize && totalHeight >= minSize,
  };
};

describe('Admin Analytics Mobile Optimization Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to successful mock for each test
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData),
      })
    ) as jest.Mock;
  });

  describe('Mobile Layout Responsiveness', () => {
    it('should have mobile-optimized header layout', async () => {
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
      });
      
      // Header should stack vertically on mobile
      const headerContainer = screen.getByText('Analytics Dashboard').closest('div');
      expect(headerContainer).toHaveClass('flex-col', 'sm:flex-row');
    });

    it('should have responsive typography scaling', async () => {
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        const title = screen.getByText('Analytics Dashboard');
        // Should use mobile-optimized font sizes
        expect(title).toHaveClass('text-xl'); // Expected mobile size
      });
    });

    it('should have mobile-friendly spacing and padding', async () => {
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        const dashboard = screen.getByTestId('analytics-dashboard');
        // Should have mobile-optimized spacing
        expect(dashboard).toHaveClass('space-y-4'); // Expected mobile spacing
      });
    });
  });

  describe('Mobile Touch Target Compliance', () => {
    it('should have period selector meet touch target requirements on mobile', async () => {
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        const periodSelector = screen.getByLabelText('Time Period');
        
        // Should have mobile-optimized sizing
        expect(periodSelector).toHaveClass('min-h-[2.75rem]'); // 44px minimum
        expect(periodSelector).toHaveClass('touch-manipulation');
        
        const { meetsStandard } = checkTouchTarget(periodSelector);
        expect(meetsStandard).toBe(true);
      });
    });

    it('should have export button meet touch target requirements on mobile', async () => {
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        const exportButton = screen.getByText('Export Report');
        
        // Should have mobile-optimized sizing
        expect(exportButton).toHaveClass('min-h-[2.75rem]'); // 44px minimum
        expect(exportButton).toHaveClass('touch-manipulation');
        
        const { meetsStandard } = checkTouchTarget(exportButton);
        expect(meetsStandard).toBe(true);
      });
    });

    it('should have retry button meet touch target requirements on mobile', async () => {
      // Mock API failure to show retry button
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as jest.Mock;
      
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        const retryButton = screen.getByText('Retry');
        
        // Should have mobile-optimized sizing  
        expect(retryButton).toHaveClass('min-h-[2.75rem]'); // 44px minimum
        expect(retryButton).toHaveClass('touch-manipulation');
        
        const { meetsStandard } = checkTouchTarget(retryButton);
        expect(meetsStandard).toBe(true);
      });
    });
  });

  describe('Mobile Chart Optimization', () => {
    it('should pass mobile props to charts on mobile viewport', async () => {
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        const revenueChart = screen.getByTestId('revenue-chart');
        const serviceChart = screen.getByTestId('service-popularity-chart');
        const trendsChart = screen.getByTestId('booking-trends-chart');
        
        // Charts should receive mobile optimization props
        expect(revenueChart).toHaveAttribute('data-mobile', 'true');
        expect(serviceChart).toHaveAttribute('data-mobile', 'true');
        expect(trendsChart).toHaveAttribute('data-mobile', 'true');
        
        // Charts should have mobile-optimized heights
        expect(revenueChart).toHaveAttribute('data-height', '250'); // Reduced for mobile
        expect(trendsChart).toHaveAttribute('data-height', '200'); // Reduced for mobile
        
        // Service chart should use simplified mobile view
        expect(serviceChart).toHaveAttribute('data-simplified', 'true');
      });
    });

    it('should use desktop chart configuration on desktop viewport', async () => {
      setDesktopViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        const revenueChart = screen.getByTestId('revenue-chart');
        const serviceChart = screen.getByTestId('service-popularity-chart');
        const trendsChart = screen.getByTestId('booking-trends-chart');
        
        // Charts should not receive mobile props on desktop
        expect(revenueChart).toHaveAttribute('data-mobile', 'false');
        expect(serviceChart).toHaveAttribute('data-mobile', 'false');
        expect(trendsChart).toHaveAttribute('data-mobile', 'false');
        
        // Charts should have full desktop heights
        expect(revenueChart).toHaveAttribute('data-height', '350');
        expect(trendsChart).toHaveAttribute('data-height', '300');
        
        // Service chart should use full view on desktop
        expect(serviceChart).toHaveAttribute('data-simplified', 'false');
      });
    });

    it('should have responsive chart container classes', async () => {
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        // Charts should be in responsive containers
        const chartContainers = screen.getAllByTestId(/.*-chart$/);
        chartContainers.forEach(container => {
          const parentContainer = container.parentElement;
          expect(parentContainer).toHaveClass('w-full'); // Expected responsive class
        });
      });
    });
  });

  describe('Mobile Statistics Cards Layout', () => {
    it('should have mobile-optimized revenue statistics layout', async () => {
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        // Revenue stats should stack on mobile
        const revenueContainer = screen.getByText('Total Revenue').closest('[class*="grid"]');
        expect(revenueContainer).toHaveClass('grid-cols-1'); // Mobile: single column
        expect(revenueContainer).toHaveClass('md:grid-cols-3'); // Desktop: three columns
      });
    });

    it('should have mobile-friendly statistics card sizing', async () => {
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        // Statistics cards should have mobile padding
        const statsCards = screen.getAllByText(/Total Revenue|Average/);
        statsCards.forEach(card => {
          const cardContainer = card.closest('div');
          expect(cardContainer).toHaveClass('p-4'); // Expected mobile padding
          expect(cardContainer).toHaveClass('sm:p-6'); // Desktop padding
        });
      });
    });
  });

  describe('Mobile Loading and Error States', () => {
    it('should have mobile-optimized loading state', async () => {
      // Mock slow API to show loading state
      global.fetch = jest.fn(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve(mockAnalyticsData),
          }), 1000)
        )
      ) as jest.Mock;
      
      setMobileViewport();
      render(<AdminAnalytics />);
      
      // Loading state should be mobile-friendly
      expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
      const loadingContainer = screen.getByText('Loading analytics...').closest('div');
      expect(loadingContainer).toHaveClass('min-h-screen');
      expect(loadingContainer).toHaveClass('flex');
      expect(loadingContainer).toHaveClass('items-center');
      expect(loadingContainer).toHaveClass('justify-center');
    });

    it('should have mobile-optimized error state with touch-friendly retry', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as jest.Mock;
      
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        const errorContainer = screen.getByText('Error Loading Analytics').closest('div');
        expect(errorContainer).toHaveClass('text-center');
        expect(errorContainer).toHaveClass('max-w-md');
        
        const retryButton = screen.getByText('Retry');
        expect(retryButton).toHaveClass('min-h-[2.75rem]'); // Touch target compliant
      });
    });
  });

  describe('Responsive Breakpoint Behavior', () => {
    it('should adapt layout correctly across different screen sizes', async () => {
      // Test mobile
      setMobileViewport();
      const { rerender } = render(<AdminAnalytics />);
      
      await waitFor(() => {
        const headerContainer = screen.getByText('Analytics Dashboard').closest('div');
        expect(headerContainer).toHaveClass('flex-col');
      });
      
      // Test tablet
      setTabletViewport();
      rerender(<AdminAnalytics />);
      
      await waitFor(() => {
        const headerContainer = screen.getByText('Analytics Dashboard').closest('div');
        expect(headerContainer).toHaveClass('sm:flex-row');
      });
      
      // Test desktop
      setDesktopViewport();
      rerender(<AdminAnalytics />);
      
      await waitFor(() => {
        const headerContainer = screen.getByText('Analytics Dashboard').closest('div');
        expect(headerContainer).toHaveClass('sm:flex-row');
      });
    });
  });

  describe('Mobile Accessibility Compliance', () => {
    it('should maintain accessibility standards on mobile', async () => {
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        // Period selector should have proper labeling
        const periodSelector = screen.getByLabelText('Time Period');
        expect(periodSelector).toHaveAttribute('aria-label', 'Time Period');
        
        // Export button should be keyboard accessible
        const exportButton = screen.getByText('Export Report');
        expect(exportButton.tagName).toBe('BUTTON');
      });
    });

    it('should have mobile-optimized focus indicators', async () => {
      setMobileViewport();
      render(<AdminAnalytics />);
      
      await waitFor(() => {
        const periodSelector = screen.getByLabelText('Time Period');
        expect(periodSelector).toHaveClass('focus:ring-2');
        expect(periodSelector).toHaveClass('focus:ring-brand-gold');
        
        const exportButton = screen.getByText('Export Report');
        // Should have mobile-friendly focus states
        expect(exportButton).toHaveClass('focus:ring-2'); // Expected focus ring
      });
    });
  });
});
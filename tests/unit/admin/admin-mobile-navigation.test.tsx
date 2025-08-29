/**
 * @fileoverview Admin Portal Mobile Navigation Tests
 * 
 * Comprehensive TDD test suite for admin portal mobile responsiveness.
 * Tests navigation functionality, touch targets, and mobile UX patterns.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { CalendarManagement } from '@/components/admin/CalendarManagement';

// Mock authentication
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@dappersquad.com',
      role: 'admin'
    },
    loading: false,
    error: null
  }),
}));

// Mock dashboard data
jest.mock('@/hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    stats: {
      totalBookings: 25,
      pendingBookings: 3,
      confirmedBookings: 15,
      completedBookings: 7,
      totalRevenue: 12500,
      thisMonthRevenue: 4200,
      averageBookingValue: 500,
      thisMonthBookings: 8,
      lastMonthBookings: 6,
      bookingGrowth: 33.3,
      revenueGrowth: 28.5
    },
    upcomingEvents: [],
    recentBookings: [],
    loading: false,
    error: null,
    refresh: jest.fn()
  }),
}));

// Mock calendar management hook
jest.mock('@/hooks/useCalendarManagement', () => ({
  useCalendarManagement: () => ({
    calendarData: {
      dates: [],
      totalDays: 30,
      availableDays: 25,
      bookedDays: 3,
      blockedDays: 2
    },
    selectedDates: [],
    loading: false,
    error: null,
    currentMonth: 8,
    currentYear: 2025,
    navigateMonth: jest.fn(),
    toggleDateSelection: jest.fn(),
    blockDates: jest.fn(),
    unblockDates: jest.fn(),
    setMaintenanceMode: jest.fn()
  }),
}));

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

describe('Admin Portal Mobile Navigation Tests', () => {
  describe('Mobile Navigation Visibility', () => {
    it('should show mobile navigation menu on mobile devices', () => {
      setMobileViewport();
      render(<AdminDashboard />);
      
      // Should have a mobile menu trigger button
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      expect(mobileMenuButton).toBeInTheDocument();
      expect(mobileMenuButton).toBeVisible();
    });

    it('should hide desktop navigation on mobile devices', () => {
      setMobileViewport();
      render(<AdminDashboard />);
      
      // Desktop navigation should be hidden
      const desktopNav = screen.getByTestId('desktop-navigation');
      expect(desktopNav).toHaveClass('hidden');
    });

    it('should show desktop navigation on desktop devices', () => {
      setDesktopViewport();
      render(<AdminDashboard />);
      
      // Desktop navigation should be visible
      const desktopNav = screen.getByTestId('desktop-navigation');
      expect(desktopNav).toHaveClass('md:flex');
      expect(desktopNav).toBeVisible();
    });

    it('should hide mobile navigation menu on desktop devices', () => {
      setDesktopViewport();
      render(<AdminDashboard />);
      
      // Mobile menu button should be hidden on desktop
      const mobileMenuButton = screen.queryByTestId('mobile-menu-button');
      if (mobileMenuButton) {
        expect(mobileMenuButton).toHaveClass('md:hidden');
      }
    });
  });

  describe('Mobile Menu Functionality', () => {
    beforeEach(() => {
      setMobileViewport();
    });

    it('should toggle mobile menu when hamburger button is clicked', async () => {
      render(<AdminDashboard />);
      
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      
      // Menu should be closed initially
      let mobileMenu = screen.queryByTestId('mobile-navigation-menu');
      expect(mobileMenu).not.toBeInTheDocument();
      
      // Click to open
      fireEvent.click(mobileMenuButton);
      
      await waitFor(() => {
        mobileMenu = screen.getByTestId('mobile-navigation-menu');
        expect(mobileMenu).toBeInTheDocument();
        expect(mobileMenu).toBeVisible();
      });
      
      // Click to close
      fireEvent.click(mobileMenuButton);
      
      await waitFor(() => {
        mobileMenu = screen.queryByTestId('mobile-navigation-menu');
        expect(mobileMenu).not.toBeInTheDocument();
      });
    });

    it('should show all navigation links in mobile menu', async () => {
      render(<AdminDashboard />);
      
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(mobileMenuButton);
      
      await waitFor(() => {
        const mobileMenu = screen.getByTestId('mobile-navigation-menu');
        expect(mobileMenu).toBeInTheDocument();
        
        // Check for all navigation links
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Bookings')).toBeInTheDocument();
        expect(screen.getByText('Calendar')).toBeInTheDocument();
        expect(screen.getByText('Analytics')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });
    });

    it('should close mobile menu when navigation link is clicked', async () => {
      render(<AdminDashboard />);
      
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(mobileMenuButton);
      
      await waitFor(() => {
        const mobileMenu = screen.getByTestId('mobile-navigation-menu');
        expect(mobileMenu).toBeInTheDocument();
      });
      
      // Click a navigation link
      const dashboardLink = screen.getByTestId('mobile-nav-dashboard');
      fireEvent.click(dashboardLink);
      
      await waitFor(() => {
        const mobileMenu = screen.queryByTestId('mobile-navigation-menu');
        expect(mobileMenu).not.toBeInTheDocument();
      });
    });
  });

  describe('Touch Target Compliance', () => {
    beforeEach(() => {
      setMobileViewport();
    });

    it('should have mobile menu button meet 44px touch target requirement', () => {
      render(<AdminDashboard />);
      
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      const { meetsStandard } = checkTouchTarget(mobileMenuButton);
      
      expect(meetsStandard).toBe(true);
    });

    it('should have mobile navigation links meet 44px touch target requirement', async () => {
      render(<AdminDashboard />);
      
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(mobileMenuButton);
      
      await waitFor(() => {
        const mobileMenu = screen.getByTestId('mobile-navigation-menu');
        expect(mobileMenu).toBeInTheDocument();
        
        // Check all navigation links
        const navLinks = [
          screen.getByTestId('mobile-nav-dashboard'),
          screen.getByTestId('mobile-nav-bookings'),
          screen.getByTestId('mobile-nav-calendar'),
          screen.getByTestId('mobile-nav-analytics'),
          screen.getByTestId('mobile-nav-settings')
        ];
        
        navLinks.forEach(link => {
          const { meetsStandard } = checkTouchTarget(link);
          expect(meetsStandard).toBe(true);
        });
      });
    });

    it('should have admin action buttons meet touch target requirements', () => {
      render(<AdminDashboard />);
      
      // Find action buttons (refresh, export, etc.)
      const actionButtons = screen.getAllByRole('button');
      
      actionButtons.forEach(button => {
        const { meetsStandard } = checkTouchTarget(button);
        expect(meetsStandard).toBe(true);
      });
    });
  });

  describe('Mobile Layout Responsiveness', () => {
    beforeEach(() => {
      setMobileViewport();
    });

    it('should stack statistics cards on mobile', () => {
      render(<AdminDashboard />);
      
      const statsContainer = screen.getByTestId('dashboard-stats');
      expect(statsContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    });

    it('should have mobile-optimized spacing and padding', () => {
      render(<AdminDashboard />);
      
      const dashboard = screen.getByTestId('admin-dashboard');
      expect(dashboard).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });

    it('should have readable typography on mobile', () => {
      render(<AdminDashboard />);
      
      const title = screen.getByText('Admin Dashboard');
      expect(title).toHaveClass('text-lg', 'sm:text-xl');
    });
  });

  describe('Active Tab Management', () => {
    it('should maintain active tab state during mobile navigation', async () => {
      setMobileViewport();
      render(<AdminDashboard />);
      
      // Switch to bookings tab
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(mobileMenuButton);
      
      await waitFor(() => {
        const bookingsLink = screen.getByTestId('mobile-nav-bookings');
        fireEvent.click(bookingsLink);
      });
      
      // Verify active tab is maintained
      const activeIndicator = screen.getByTestId('active-tab-indicator');
      expect(activeIndicator).toBeInTheDocument();
    });

    it('should show correct active state in mobile menu', async () => {
      setMobileViewport();
      render(<AdminDashboard />);
      
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(mobileMenuButton);
      
      await waitFor(() => {
        const dashboardLink = screen.getByTestId('mobile-nav-dashboard');
        expect(dashboardLink).toHaveClass('text-brand-gold'); // Active state
      });
    });
  });
});

describe('Calendar Management Mobile Tests', () => {
  beforeEach(() => {
    setMobileViewport();
  });

  describe('Calendar Touch Targets', () => {
    it('should have calendar navigation buttons meet touch target requirements', () => {
      render(<CalendarManagement />);
      
      const prevButton = screen.getByLabelText('Previous month');
      const nextButton = screen.getByLabelText('Next month');
      
      const { meetsStandard: prevMeets } = checkTouchTarget(prevButton);
      const { meetsStandard: nextMeets } = checkTouchTarget(nextButton);
      
      expect(prevMeets).toBe(true);
      expect(nextMeets).toBe(true);
    });

    it('should have mobile-optimized navigation buttons with larger touch targets', () => {
      setMobileViewport();
      render(<CalendarManagement />);
      
      const prevButton = screen.getByLabelText('Previous month');
      const nextButton = screen.getByLabelText('Next month');
      
      // Mobile buttons should be larger for better touch interaction
      expect(prevButton).toHaveClass('min-h-[2.75rem]'); // 44px minimum
      expect(nextButton).toHaveClass('min-h-[2.75rem]'); // 44px minimum
      
      const { meetsStandard: prevMeets } = checkTouchTarget(prevButton);
      const { meetsStandard: nextMeets } = checkTouchTarget(nextButton);
      
      expect(prevMeets).toBe(true);
      expect(nextMeets).toBe(true);
    });

    it('should have calendar date cells meet touch target requirements', async () => {
      render(<CalendarManagement />);
      
      // Wait for calendar to load
      await waitFor(() => {
        const calendarGrid = screen.getByTestId('calendar-grid');
        expect(calendarGrid).toBeInTheDocument();
      });
      
      const dateCells = screen.getAllByRole('gridcell');
      
      dateCells.forEach(cell => {
        const { meetsStandard } = checkTouchTarget(cell);
        expect(meetsStandard).toBe(true);
      });
    });

    it('should have mobile-optimized calendar date cells with enhanced touch targets', () => {
      setMobileViewport();
      render(<CalendarManagement />);
      
      // Find calendar date cells (they won't have role="gridcell" but will have calendar-date test ids)
      const calendarGrid = screen.getByTestId('calendar-grid');
      expect(calendarGrid).toBeInTheDocument();
      
      // Calendar cells should have minimum touch target size on mobile
      const dateElements = calendarGrid.querySelectorAll('[data-testid^="calendar-date-"]');
      
      dateElements.forEach(cell => {
        const htmlCell = cell as HTMLElement;
        // Check for mobile-optimized padding and minimum dimensions
        expect(htmlCell).toHaveClass('min-h-[2.75rem]'); // 44px minimum height
        expect(htmlCell).toHaveClass('min-w-[2.75rem]'); // 44px minimum width
        expect(htmlCell).toHaveClass('touch-manipulation'); // Touch optimization
        
        const { meetsStandard } = checkTouchTarget(htmlCell);
        expect(meetsStandard).toBe(true);
      });
    });

    it('should have calendar action buttons meet touch target requirements', () => {
      render(<CalendarManagement />);
      
      // Find action buttons (block dates, unblock dates, etc.)
      const actionButtons = screen.getAllByRole('button');
      
      actionButtons.forEach(button => {
        const { meetsStandard } = checkTouchTarget(button);
        expect(meetsStandard).toBe(true);
      });
    });

    it('should have mobile-optimized date action buttons with enhanced touch targets', () => {
      setMobileViewport();
      render(<CalendarManagement />);
      
      // Simulate selecting a date to show action buttons
      const calendarGrid = screen.getByTestId('calendar-grid');
      const dateElements = calendarGrid.querySelectorAll('[data-testid^="calendar-date-"]');
      
      if (dateElements.length > 0) {
        fireEvent.click(dateElements[0]);
        
        // Check for date action buttons with mobile-friendly sizing
        const blockButton = screen.getByText('Block Date');
        const unblockButton = screen.getByText('Unblock Date');
        const maintenanceButton = screen.getByText('Set Maintenance');
        
        // Mobile action buttons should meet touch target requirements
        expect(blockButton).toHaveClass('min-h-[2.75rem]'); // 44px minimum
        expect(unblockButton).toHaveClass('min-h-[2.75rem]'); // 44px minimum  
        expect(maintenanceButton).toHaveClass('min-h-[2.75rem]'); // 44px minimum
        
        const { meetsStandard: blockMeets } = checkTouchTarget(blockButton);
        const { meetsStandard: unblockMeets } = checkTouchTarget(unblockButton);
        const { meetsStandard: maintenanceMeets } = checkTouchTarget(maintenanceButton);
        
        expect(blockMeets).toBe(true);
        expect(unblockMeets).toBe(true);
        expect(maintenanceMeets).toBe(true);
      }
    });

    it('should have mobile-optimized month and year selectors with larger touch targets', () => {
      setMobileViewport();
      render(<CalendarManagement />);
      
      const monthSelector = screen.getByTestId('month-selector');
      const yearSelector = screen.getByTestId('year-selector');
      
      // Mobile selectors should have enhanced sizing for touch interaction
      expect(monthSelector).toHaveClass('min-h-[2.75rem]'); // 44px minimum
      expect(yearSelector).toHaveClass('min-h-[2.75rem]'); // 44px minimum
      
      const { meetsStandard: monthMeets } = checkTouchTarget(monthSelector);
      const { meetsStandard: yearMeets } = checkTouchTarget(yearSelector);
      
      expect(monthMeets).toBe(true);
      expect(yearMeets).toBe(true);
    });
  });

  describe('Mobile Calendar Layout', () => {
    it('should have responsive calendar grid', () => {
      render(<CalendarManagement />);
      
      const calendarGrid = screen.getByTestId('calendar-grid');
      expect(calendarGrid).toHaveClass('grid-cols-7');
      expect(calendarGrid).toHaveClass('gap-1', 'sm:gap-2');
    });

    it('should have mobile-optimized month navigation', () => {
      render(<CalendarManagement />);
      
      const monthNavigation = screen.getByTestId('month-navigation');
      expect(monthNavigation).toHaveClass('flex', 'justify-between');
      expect(monthNavigation).toHaveClass('px-4', 'sm:px-6');
    });

    it('should have readable calendar text on mobile', () => {
      render(<CalendarManagement />);
      
      const monthTitle = screen.getByTestId('month-title');
      expect(monthTitle).toHaveClass('text-lg', 'sm:text-xl', 'lg:text-2xl');
    });
  });

  describe('Mobile Calendar Interactions', () => {
    it('should support touch selection of calendar dates', async () => {
      render(<CalendarManagement />);
      
      await waitFor(() => {
        const dateCells = screen.getAllByRole('gridcell');
        expect(dateCells.length).toBeGreaterThan(0);
      });
      
      const dateCell = screen.getAllByRole('gridcell')[15]; // Mid-month date
      
      // Simulate touch interaction
      fireEvent.touchStart(dateCell);
      fireEvent.touchEnd(dateCell);
      fireEvent.click(dateCell);
      
      // Should handle touch interaction properly
      expect(dateCell).toHaveClass('cursor-pointer');
    });

    it('should show mobile-friendly dialogs for calendar actions', async () => {
      render(<CalendarManagement />);
      
      // Find and click a date
      await waitFor(() => {
        const dateCells = screen.getAllByRole('gridcell');
        if (dateCells.length > 0) {
          fireEvent.click(dateCells[15]);
        }
      });
      
      // Check if modal/dialog appears with mobile-friendly sizing
      const dialog = screen.queryByRole('dialog');
      if (dialog) {
        expect(dialog).toHaveClass('max-w-lg', 'mx-4');
      }
    });
  });
});

describe('Admin Portal Regression Prevention', () => {
  it('should maintain desktop functionality while adding mobile features', () => {
    setDesktopViewport();
    render(<AdminDashboard />);
    
    // Desktop navigation should still work
    const desktopNav = screen.getByTestId('desktop-navigation');
    expect(desktopNav).toBeVisible();
    
    // All desktop features should be present
    const dashboardButton = screen.getByText('Dashboard');
    const bookingsButton = screen.getByText('Bookings');
    
    expect(dashboardButton).toBeInTheDocument();
    expect(bookingsButton).toBeInTheDocument();
  });

  it('should preserve admin authentication and authorization', () => {
    render(<AdminDashboard />);
    
    // Should show admin user info
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@dappersquad.com')).toBeInTheDocument();
  });

  it('should maintain dashboard data functionality', async () => {
    render(<AdminDashboard />);
    
    // Should display dashboard statistics
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
    });
  });

  it('should preserve existing admin workflows', () => {
    render(<AdminDashboard />);
    
    // Admin dashboard should maintain all existing functionality
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('admin-navigation')).toBeInTheDocument();
  });
});
/**
 * @fileoverview Booking Management Mobile Responsiveness Tests
 * 
 * Comprehensive TDD test suite for BookingManagement mobile optimization.
 * Tests mobile table layout, card view, touch targets, and responsive behavior.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookingManagement } from '@/components/admin/BookingManagement';

// Mock the useBookings hook
const mockBookings = [
  {
    id: '1',
    bookingReference: 'DSE-123456-A1B',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientPhone: '555-123-4567',
    eventDate: '2025-09-15',
    eventType: 'Wedding',
    services: ['DJ', 'Photography'],
    venueName: 'Grand Ballroom',
    guestCount: 150,
    status: 'CONFIRMED',
    totalAmount: 2500,
    createdAt: '2025-08-29T10:00:00Z'
  },
  {
    id: '2',
    bookingReference: 'DSE-789012-C3D',
    clientName: 'Jane Smith',
    clientEmail: 'jane@example.com',
    clientPhone: '555-987-6543',
    eventDate: '2025-10-01',
    eventType: 'Corporate',
    services: ['Karaoke'],
    venueName: 'Conference Center',
    guestCount: 50,
    status: 'PENDING',
    totalAmount: 800,
    createdAt: '2025-08-29T11:00:00Z'
  }
];

jest.mock('@/hooks/use-bookings', () => ({
  useBookings: () => ({
    bookings: mockBookings,
    loading: false,
    error: null,
    filters: { status: '', eventType: '', dateFrom: '', dateTo: '' },
    setFilters: jest.fn(),
    sort: { field: 'name', direction: 'asc' },
    setSort: jest.fn(),
    updateBookingStatus: jest.fn().mockResolvedValue(true),
    deleteBooking: jest.fn().mockResolvedValue(true),
    totalCount: 2,
    page: 1,
    setPage: jest.fn(),
    pageSize: 10,
    refetch: jest.fn()
  })
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

describe('Booking Management Mobile Optimization Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mobile Table Layout Transformation', () => {
    it('should transform table to card layout on mobile viewport', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      // Mobile should use card layout instead of table
      const bookingList = screen.getByTestId('booking-list');
      expect(bookingList).toHaveClass('grid'); // Card grid layout
      expect(bookingList).toHaveClass('grid-cols-1'); // Single column on mobile
      expect(bookingList).toHaveClass('gap-4'); // Proper spacing between cards
    });

    it('should show booking cards with complete information on mobile', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      // Each booking should be in a card format
      const bookingCards = screen.getAllByTestId(/booking-card-/);
      expect(bookingCards).toHaveLength(2);
      
      // First booking card should contain all essential information
      const firstCard = screen.getByTestId('booking-card-1');
      expect(firstCard).toHaveClass('bg-white'); // Card styling
      expect(firstCard).toHaveClass('rounded-lg'); // Card borders
      expect(firstCard).toHaveClass('shadow-sm'); // Card elevation
      expect(firstCard).toHaveClass('border'); // Card outline
      
      // Card should contain client name, date, status, and actions
      within(firstCard, () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('09/15/2025')).toBeInTheDocument();
        expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
        expect(screen.getByText('Wedding')).toBeInTheDocument();
      });
    });

    it('should hide table structure on mobile and show on desktop', async () => {
      // Test mobile
      setMobileViewport();
      const { rerender } = render(<BookingManagement />);
      
      const mobileTable = screen.queryByRole('table');
      expect(mobileTable).toHaveClass('hidden'); // Table hidden on mobile
      expect(mobileTable).toHaveClass('lg:table'); // Table shown on large screens
      
      // Test desktop
      setDesktopViewport();
      rerender(<BookingManagement />);
      
      const desktopTable = screen.getByRole('table');
      expect(desktopTable).not.toHaveClass('hidden'); // Table visible on desktop
    });

    it('should use responsive grid for card layout across breakpoints', async () => {
      // Mobile: Single column
      setMobileViewport();
      const { rerender } = render(<BookingManagement />);
      
      const mobileBookingList = screen.getByTestId('booking-list');
      expect(mobileBookingList).toHaveClass('grid-cols-1');
      
      // Tablet: Two columns
      setTabletViewport();
      rerender(<BookingManagement />);
      
      const tabletBookingList = screen.getByTestId('booking-list');
      expect(tabletBookingList).toHaveClass('md:grid-cols-2');
    });
  });

  describe('Mobile Touch Target Compliance', () => {
    it('should have filter toggle button meet touch target requirements', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      const filterToggle = screen.getByText('Filters');
      
      // Should have mobile-optimized sizing
      expect(filterToggle).toHaveClass('min-h-[2.75rem]'); // 44px minimum
      expect(filterToggle).toHaveClass('touch-manipulation');
      
      const { meetsStandard } = checkTouchTarget(filterToggle);
      expect(meetsStandard).toBe(true);
    });

    it('should have filter apply button meet touch target requirements', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      // Open filters
      fireEvent.click(screen.getByText('Filters'));
      
      await waitFor(() => {
        const applyButton = screen.getByText('Apply Filters');
        
        // Should have mobile-optimized sizing
        expect(applyButton).toHaveClass('min-h-[2.75rem]'); // 44px minimum
        expect(applyButton).toHaveClass('touch-manipulation');
        
        const { meetsStandard } = checkTouchTarget(applyButton);
        expect(meetsStandard).toBe(true);
      });
    });

    it('should have card action buttons meet touch target requirements', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      const statusSelects = screen.getAllByDisplayValue('CONFIRMED');
      const statusSelect = statusSelects[0];
      
      // Status select should have touch-friendly sizing
      expect(statusSelect).toHaveClass('min-h-[2.75rem]'); // 44px minimum
      expect(statusSelect).toHaveClass('touch-manipulation');
      
      const { meetsStandard } = checkTouchTarget(statusSelect);
      expect(meetsStandard).toBe(true);
    });

    it('should have bulk action buttons meet touch target requirements', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      // Select a booking to show bulk actions
      const checkbox = screen.getAllByRole('checkbox')[1]; // First booking checkbox
      fireEvent.click(checkbox);
      
      await waitFor(() => {
        const confirmButton = screen.getByText('Confirm Selected');
        const cancelButton = screen.getByText('Cancel Selected');
        const deleteButton = screen.getByText('Delete Selected');
        
        // All bulk action buttons should meet touch target requirements
        [confirmButton, cancelButton, deleteButton].forEach(button => {
          expect(button).toHaveClass('min-h-[2.75rem]');
          expect(button).toHaveClass('touch-manipulation');
          
          const { meetsStandard } = checkTouchTarget(button);
          expect(meetsStandard).toBe(true);
        });
      });
    });

    it('should have pagination buttons meet touch target requirements on mobile', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      // Mock having more than one page
      const paginationButtons = screen.queryAllByRole('button');
      const navigationButtons = paginationButtons.filter(btn => 
        btn.textContent === 'Previous' || btn.textContent === 'Next'
      );
      
      navigationButtons.forEach(button => {
        expect(button).toHaveClass('min-h-[2.75rem]'); // 44px minimum
        expect(button).toHaveClass('touch-manipulation');
        
        const { meetsStandard } = checkTouchTarget(button);
        expect(meetsStandard).toBe(true);
      });
    });
  });

  describe('Mobile Card Design and Layout', () => {
    it('should have proper mobile card styling and spacing', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      const bookingCards = screen.getAllByTestId(/booking-card-/);
      bookingCards.forEach(card => {
        // Card styling
        expect(card).toHaveClass('bg-white');
        expect(card).toHaveClass('rounded-lg');
        expect(card).toHaveClass('shadow-sm');
        expect(card).toHaveClass('border');
        
        // Mobile-optimized padding
        expect(card).toHaveClass('p-4'); // Mobile padding
        expect(card).toHaveClass('sm:p-6'); // Desktop padding
      });
    });

    it('should stack card information vertically on mobile', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      const firstCard = screen.getByTestId('booking-card-1');
      
      // Card header should stack vertically
      const cardHeader = within(firstCard).getByTestId('card-header');
      expect(cardHeader).toHaveClass('flex-col'); // Vertical stack
      expect(cardHeader).toHaveClass('sm:flex-row'); // Horizontal on larger screens
      
      // Card content should be responsive
      const cardContent = within(firstCard).getByTestId('card-content');
      expect(cardContent).toHaveClass('space-y-3'); // Vertical spacing on mobile
    });

    it('should show condensed information on mobile cards', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      const firstCard = screen.getByTestId('booking-card-1');
      
      within(firstCard, () => {
        // Essential information should be prominently displayed
        expect(screen.getByText('John Doe')).toHaveClass('font-semibold'); // Client name prominent
        expect(screen.getByText('09/15/2025')).toHaveClass('text-sm'); // Date compact
        expect(screen.getByText('Wedding')).toBeInTheDocument(); // Event type visible
        expect(screen.getByText('Grand Ballroom')).toBeInTheDocument(); // Venue visible
        
        // Reference number should be smaller but accessible
        expect(screen.getByText('DSE-123456-A1B')).toHaveClass('text-xs');
        expect(screen.getByText('DSE-123456-A1B')).toHaveClass('text-gray-500');
      });
    });

    it('should have mobile-optimized status badges', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      const confirmedBadge = screen.getByTestId('status-badge-CONFIRMED');
      const pendingBadge = screen.getByTestId('status-badge-PENDING');
      
      // Status badges should be mobile-friendly
      [confirmedBadge, pendingBadge].forEach(badge => {
        expect(badge).toHaveClass('px-2'); // Adequate padding
        expect(badge).toHaveClass('py-1');
        expect(badge).toHaveClass('text-xs'); // Readable size
        expect(badge).toHaveClass('font-semibold');
        expect(badge).toHaveClass('rounded-full');
      });
    });
  });

  describe('Mobile Filters and Search', () => {
    it('should have mobile-friendly filter panel', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      // Filter toggle should be accessible
      const filterButton = screen.getByText('Filters');
      expect(filterButton).toHaveClass('w-full'); // Full width on mobile
      expect(filterButton).toHaveClass('sm:w-auto'); // Auto width on larger screens
      
      // Open filters
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        const filterPanel = screen.getByTestId('filter-panel');
        expect(filterPanel).toHaveClass('space-y-4'); // Mobile vertical spacing
      });
    });

    it('should stack filter inputs vertically on mobile', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      // Open filters
      fireEvent.click(screen.getByText('Filters'));
      
      await waitFor(() => {
        const filterGrid = screen.getByTestId('filter-grid');
        expect(filterGrid).toHaveClass('grid-cols-1'); // Single column on mobile
        expect(filterGrid).toHaveClass('md:grid-cols-2'); // Two columns on larger screens
        expect(filterGrid).toHaveClass('gap-4'); // Proper spacing
      });
    });

    it('should have mobile-optimized search input', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      const searchInput = screen.getByPlaceholderText('Search bookings...');
      
      // Search should be mobile-friendly
      expect(searchInput).toHaveClass('w-full'); // Full width
      expect(searchInput).toHaveClass('min-h-[2.75rem]'); // Touch target compliance
      expect(searchInput).toHaveClass('px-4'); // Adequate padding
      expect(searchInput).toHaveClass('touch-manipulation');
    });
  });

  describe('Mobile Accessibility and Usability', () => {
    it('should maintain accessibility standards on mobile', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      // All interactive elements should have proper labels
      const filterButton = screen.getByText('Filters');
      expect(filterButton).toHaveAttribute('type', 'button');
      
      // Status badges should have proper ARIA labels
      const confirmedBadge = screen.getByTestId('status-badge-CONFIRMED');
      expect(confirmedBadge).toHaveAttribute('aria-label', expect.stringContaining('Status'));
    });

    it('should have keyboard navigation support on mobile', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      // Filter button should be keyboard accessible
      const filterButton = screen.getByText('Filters');
      expect(filterButton).toHaveClass('focus:ring-2');
      expect(filterButton).toHaveClass('focus:ring-brand-gold');
      expect(filterButton).toHaveClass('focus:outline-none');
      
      // Cards should be keyboard accessible
      const firstCard = screen.getByTestId('booking-card-1');
      expect(firstCard).toHaveAttribute('tabindex', '0');
      expect(firstCard).toHaveClass('focus:ring-2');
    });

    it('should have proper mobile focus indicators', async () => {
      setMobileViewport();
      render(<BookingManagement />);
      
      // Open filters
      fireEvent.click(screen.getByText('Filters'));
      
      await waitFor(() => {
        const applyButton = screen.getByText('Apply Filters');
        
        // Focus indicators should be mobile-friendly
        expect(applyButton).toHaveClass('focus:ring-2');
        expect(applyButton).toHaveClass('focus:ring-brand-gold');
        expect(applyButton).toHaveClass('focus:ring-offset-2'); // Better visibility on mobile
      });
    });
  });

  describe('Mobile Performance and Loading States', () => {
    it('should show mobile-optimized loading state', async () => {
      // Mock loading state
      jest.doMock('@/hooks/useBookings', () => ({
        useBookings: () => ({
          bookings: [],
          loading: true,
          error: null,
          filters: {},
          setFilters: jest.fn(),
          sort: { field: 'name', direction: 'asc' },
          setSort: jest.fn(),
          updateBookingStatus: jest.fn(),
          deleteBooking: jest.fn(),
          totalCount: 0,
          page: 1,
          setPage: jest.fn(),
          pageSize: 10,
          refetch: jest.fn()
        })
      }));
      
      setMobileViewport();
      render(<BookingManagement />);
      
      const loadingState = screen.getByTestId('loading-state');
      expect(loadingState).toHaveClass('text-center');
      expect(loadingState).toHaveClass('py-8'); // Mobile-friendly padding
      expect(loadingState).toHaveClass('space-y-4');
    });

    it('should show mobile-friendly empty state', async () => {
      // Mock empty state
      jest.doMock('@/hooks/useBookings', () => ({
        useBookings: () => ({
          bookings: [],
          loading: false,
          error: null,
          filters: {},
          setFilters: jest.fn(),
          sort: { field: 'name', direction: 'asc' },
          setSort: jest.fn(),
          updateBookingStatus: jest.fn(),
          deleteBooking: jest.fn(),
          totalCount: 0,
          page: 1,
          setPage: jest.fn(),
          pageSize: 10,
          refetch: jest.fn()
        })
      }));
      
      setMobileViewport();
      render(<BookingManagement />);
      
      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toHaveClass('text-center');
      expect(emptyState).toHaveClass('py-12'); // Adequate spacing
      expect(emptyState).toHaveClass('px-4'); // Mobile padding
    });
  });

  describe('Responsive Breakpoint Behavior', () => {
    it('should adapt layout correctly across all screen sizes', async () => {
      // Test mobile layout
      setMobileViewport();
      const { rerender } = render(<BookingManagement />);
      
      const mobileContainer = screen.getByTestId('booking-management');
      expect(mobileContainer).toHaveClass('px-4'); // Mobile padding
      
      // Test tablet layout
      setTabletViewport();
      rerender(<BookingManagement />);
      
      const tabletContainer = screen.getByTestId('booking-management');
      expect(tabletContainer).toHaveClass('sm:px-6'); // Tablet padding
      
      // Test desktop layout
      setDesktopViewport();
      rerender(<BookingManagement />);
      
      const desktopContainer = screen.getByTestId('booking-management');
      expect(desktopContainer).toHaveClass('lg:px-8'); // Desktop padding
    });

    it('should transition between card and table layouts smoothly', async () => {
      setMobileViewport();
      const { rerender } = render(<BookingManagement />);
      
      // Mobile: Card layout visible, table hidden
      expect(screen.getByTestId('booking-cards')).not.toHaveClass('hidden');
      expect(screen.getByRole('table')).toHaveClass('hidden');
      
      // Desktop: Table visible, cards hidden
      setDesktopViewport();
      rerender(<BookingManagement />);
      
      expect(screen.getByTestId('booking-cards')).toHaveClass('lg:hidden');
      expect(screen.getByRole('table')).not.toHaveClass('hidden');
    });
  });
});
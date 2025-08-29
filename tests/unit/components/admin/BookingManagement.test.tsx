/**
 * @fileoverview Booking Management Component Tests
 * 
 * TDD tests for the admin booking management interface.
 * Defines expected behavior for viewing, filtering, and managing bookings.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingManagement } from '@/components/admin/BookingManagement';

const mockBookings = [
  {
    id: 'cmeurm5m20000qk6fgo68mmgs',
    bookingReference: 'DSE-931427-4WG',
    clientName: 'John Smith',
    clientEmail: 'john@example.com',
    clientPhone: '555-123-4567',
    eventDate: '2025-09-15',
    eventType: 'Wedding',
    services: ['DJ', 'Photography'],
    venueName: 'Grand Hotel',
    venueAddress: '123 Main St, Chicago, IL',
    guestCount: 150,
    status: 'CONFIRMED' as const,
    totalAmount: 2500.00,
    depositAmount: 500.00,
    createdAt: '2025-08-28',
  },
  {
    id: 'cmeurmxhi0001qk6fu8320vdt',
    bookingReference: 'DSE-967557-DI2',
    clientName: 'Jane Doe',
    clientEmail: 'jane@example.com',
    clientPhone: '555-987-6543',
    eventDate: '2025-10-01',
    eventType: 'Birthday Party',
    services: ['DJ', 'Karaoke'],
    venueName: 'Community Center',
    venueAddress: '456 Oak Ave, Milwaukee, WI',
    guestCount: 75,
    status: 'PENDING' as const,
    totalAmount: 1200.00,
    depositAmount: 300.00,
    createdAt: '2025-08-27',
  },
];

const mockUseBookings = {
  bookings: mockBookings,
  loading: false,
  error: null,
  refetch: jest.fn(),
  updateBookingStatus: jest.fn().mockResolvedValue(true),
  deleteBooking: jest.fn().mockResolvedValue(true),
  filters: {},
  setFilters: jest.fn(),
  sort: { field: 'date' as const, direction: 'desc' as const },
  setSort: jest.fn(),
  totalCount: mockBookings.length,
  page: 1,
  setPage: jest.fn(),
  pageSize: 10,
};

jest.mock('@/hooks/useBookings', () => ({
  useBookings: jest.fn(() => mockUseBookings),
}));

// Type the mock properly
const mockUseBookingsHook = jest.mocked(require('@/hooks/useBookings').useBookings);

describe.skip('BookingManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBookingsHook.mockReturnValue(mockUseBookings);
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  describe('Layout and Structure', () => {
    test('renders booking management interface', () => {
      render(<BookingManagement />);
      
      expect(screen.getByTestId('booking-management')).toBeInTheDocument();
      expect(screen.getByText('Booking Management')).toBeInTheDocument();
      expect(screen.getByTestId('booking-filters')).toBeInTheDocument();
      expect(screen.getByTestId('booking-list')).toBeInTheDocument();
    });

    test('displays booking count in header', () => {
      render(<BookingManagement />);
      
      expect(screen.getByText('2 bookings')).toBeInTheDocument();
    });
  });

  describe('Booking List Display', () => {
    test('displays all booking information correctly', () => {
      render(<BookingManagement />);
      
      // Check first booking
      expect(screen.getByText('DSE-931427-4WG')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Wedding')).toBeInTheDocument();
      expect(screen.getByText('Grand Hotel')).toBeInTheDocument();
      expect(screen.getByText('09/15/2025')).toBeInTheDocument();
      expect(screen.getByText('150 guests')).toBeInTheDocument();
      expect(screen.getByText('$2,500.00')).toBeInTheDocument();
      
      // Check second booking
      expect(screen.getByText('DSE-967557-DI2')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Birthday Party')).toBeInTheDocument();
    });

    test('shows status badges with correct styling', () => {
      render(<BookingManagement />);
      
      const confirmedBadge = screen.getByTestId('status-badge-CONFIRMED');
      const pendingBadge = screen.getByTestId('status-badge-PENDING');
      
      expect(confirmedBadge).toHaveClass('bg-green-100', 'text-green-800');
      expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    test('displays services as comma-separated list', () => {
      render(<BookingManagement />);
      
      expect(screen.getByText('DJ, Photography')).toBeInTheDocument();
      expect(screen.getByText('DJ, Karaoke')).toBeInTheDocument();
    });
  });

  describe('Filtering and Search', () => {
    test('provides status filter options', () => {
      render(<BookingManagement />);
      
      const statusFilter = screen.getByTestId('status-filter');
      expect(statusFilter).toBeInTheDocument();
      
      const statusOptions = statusFilter.querySelectorAll('option');
      const optionTexts = Array.from(statusOptions).map(option => option.textContent);
      expect(optionTexts).toContain('All Statuses');
      expect(optionTexts).toContain('Pending');
      expect(optionTexts).toContain('Confirmed');
      expect(optionTexts).toContain('Completed');
    });

    test('provides search functionality', async () => {
      const user = userEvent.setup();
      render(<BookingManagement />);
      
      const searchInput = screen.getByPlaceholderText('Search bookings...');
      expect(searchInput).toBeInTheDocument();
      
      await user.type(searchInput, 'John');
      
      const searchBtn = screen.getByText('Search');
      await user.click(searchBtn);
      
      expect(mockUseBookings.setFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'John'
        })
      );
    });

    test('provides date range filters with today as default dateFrom', () => {
      render(<BookingManagement />);
      
      const startDateInput = screen.getByTestId('start-date-filter') as HTMLInputElement;
      const endDateInput = screen.getByTestId('end-date-filter') as HTMLInputElement;
      
      // Check that dateFrom defaults to today
      const today = new Date().toISOString().split('T')[0];
      expect(startDateInput.value).toBe(today);
      expect(endDateInput.value).toBeTruthy(); // Should have some end date
    });

    test('applies filters when Apply Filters button clicked', async () => {
      const user = userEvent.setup();
      render(<BookingManagement />);
      
      const eventTypeFilter = screen.getByTestId('event-type-filter');
      await user.selectOptions(eventTypeFilter, 'wedding');
      
      const applyBtn = screen.getByText('Apply Filters');
      await user.click(applyBtn);
      
      expect(mockUseBookings.setFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'wedding'
        })
      );
    });
  });

  describe('Sorting Functionality', () => {
    test('provides column header sorting', async () => {
      const user = userEvent.setup();
      render(<BookingManagement />);
      
      // Check that column headers are clickable for sorting
      const clientHeader = screen.getByText(/Client/);
      const dateHeader = screen.getByText(/Event Date/);
      const amountHeader = screen.getByText(/Amount/);
      
      expect(clientHeader).toBeInTheDocument();
      expect(dateHeader).toBeInTheDocument();
      expect(amountHeader).toBeInTheDocument();
      
      // Click date header to change sort
      await user.click(dateHeader);
      expect(mockUseBookings.setSort).toHaveBeenCalled();
    });

    test('shows sort direction indicators', () => {
      render(<BookingManagement />);
      
      // Current sort is date desc, should show down arrow
      const dateHeader = screen.getByText(/Event Date/);
      expect(dateHeader.textContent).toContain('↓');
    });
  });

  describe('Booking Actions', () => {
    test('provides status dropdown for each booking', () => {
      render(<BookingManagement />);
      
      // Each booking row should have a status dropdown (plus filter dropdowns)
      const statusSelects = screen.getAllByRole('combobox');
      expect(statusSelects.length).toBeGreaterThanOrEqual(2); // At least 2 for our mock bookings
    });

    test('provides delete button for each booking', () => {
      render(<BookingManagement />);
      
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons).toHaveLength(2); // One for each mock booking
    });

    test('calls updateBookingStatus when status dropdown changes', async () => {
      const user = userEvent.setup();
      render(<BookingManagement />);
      
      // Find the status selects in the table rows (skip the filter selects)
      const allSelects = screen.getAllByRole('combobox');
      const tableSelects = allSelects.filter(select => 
        select.closest('tbody') !== null
      );
      
      await user.selectOptions(tableSelects[0], 'COMPLETED');
      
      await waitFor(() => {
        expect(mockUseBookings.updateBookingStatus).toHaveBeenCalledWith(
          'cmeurm5m20000qk6fgo68mmgs',
          'COMPLETED'
        );
      });
    });

    test('calls deleteBooking when delete button clicked', async () => {
      const user = userEvent.setup();
      render(<BookingManagement />);
      
      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this booking?');
      expect(mockUseBookings.deleteBooking).toHaveBeenCalledWith('cmeurm5m20000qk6fgo68mmgs');
    });
  });

  describe('Bulk Operations', () => {
    test('allows selecting multiple bookings', async () => {
      const user = userEvent.setup();
      render(<BookingManagement />);
      
      // Find all checkboxes (including header checkbox)
      const checkboxes = screen.getAllByRole('checkbox');
      const headerCheckbox = checkboxes[0]; // First checkbox is the "select all"
      
      await user.click(headerCheckbox);
      
      // After selecting all, bulk actions should appear
      await waitFor(() => {
        expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
        expect(screen.getByText('2 booking(s) selected')).toBeInTheDocument();
      });
    });

    test('provides bulk status update buttons', async () => {
      const user = userEvent.setup();
      render(<BookingManagement />);
      
      // Select all bookings first to show bulk actions
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // Header checkbox
      
      await waitFor(() => {
        // Check for bulk action buttons
        expect(screen.getByText('Confirm Selected')).toBeInTheDocument();
        expect(screen.getByText('Cancel Selected')).toBeInTheDocument();
        expect(screen.getByText('Delete Selected')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading state while data loads', () => {
      // Override the mock for this test
      mockUseBookingsHook.mockReturnValueOnce({
        ...mockUseBookings,
        loading: true,
        bookings: [],
      });
      
      render(<BookingManagement />);
      
      expect(screen.getByTestId('bookings-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading bookings...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('shows error message when bookings fail to load', () => {
      mockUseBookingsHook.mockReturnValueOnce({
        ...mockUseBookings,
        loading: false,
        error: 'Failed to load bookings',
        bookings: [],
      });
      
      render(<BookingManagement />);
      
      expect(screen.getByTestId('bookings-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load bookings')).toBeInTheDocument();
    });

    test('shows retry button on error', async () => {
      const user = userEvent.setup();
      
      mockUseBookingsHook.mockReturnValueOnce({
        ...mockUseBookings,
        error: 'Network error',
        bookings: [],
      });
      
      render(<BookingManagement />);
      
      const retryBtn = screen.getByTestId('retry-btn');
      await user.click(retryBtn);
      
      expect(mockUseBookings.refetch).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    test('shows empty state when no bookings exist', () => {
      mockUseBookingsHook.mockReturnValueOnce({
        ...mockUseBookings,
        bookings: [],
        totalCount: 0,
      });
      
      render(<BookingManagement />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No bookings found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
    });
  });
});
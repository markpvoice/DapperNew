/**
 * @fileoverview Admin Calendar Management Component Tests
 * 
 * TDD tests for the admin calendar management interface.
 * Defines expected behavior for viewing and managing calendar availability.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarManagement } from '@/components/admin/CalendarManagement';

const mockCalendarData = [
  {
    date: '2025-09-15',
    isAvailable: false,
    blockedReason: 'Booked Event',
    booking: {
      id: 'booking-1',
      clientName: 'John Smith',
      eventType: 'Wedding',
      bookingReference: 'DSE-123456',
    },
  },
  {
    date: '2025-09-16',
    isAvailable: true,
    blockedReason: null,
    booking: null,
  },
  {
    date: '2025-09-17',
    isAvailable: false,
    blockedReason: 'Maintenance',
    booking: null,
  },
];

const mockUseCalendarManagement = {
  calendarData: mockCalendarData,
  loading: false,
  error: null,
  selectedDate: null,
  currentMonth: 8, // September (0-indexed)
  currentYear: 2025,
  setSelectedDate: jest.fn(),
  goToNextMonth: jest.fn(),
  goToPreviousMonth: jest.fn(),
  goToMonth: jest.fn(),
  blockDate: jest.fn().mockResolvedValue(true),
  unblockDate: jest.fn().mockResolvedValue(true),
  setMaintenanceBlock: jest.fn().mockResolvedValue(true),
  refresh: jest.fn(),
};

jest.mock('@/hooks/use-calendar-management', () => ({
  useCalendarManagement: jest.fn(() => mockUseCalendarManagement),
}));

const mockUseCalendarManagementHook = jest.mocked(require('@/hooks/use-calendar-management').useCalendarManagement);

describe('CalendarManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCalendarManagementHook.mockReturnValue(mockUseCalendarManagement);
  });

  describe('Layout and Structure', () => {
    test('renders calendar management interface', () => {
      render(<CalendarManagement />);
      
      expect(screen.getByTestId('calendar-management')).toBeInTheDocument();
      expect(screen.getByText('Calendar Management')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
      expect(screen.getByTestId('month-navigation')).toBeInTheDocument();
    });

    test('displays current month and year', () => {
      render(<CalendarManagement />);
      
      expect(screen.getByText('September 2025')).toBeInTheDocument();
    });

    test('provides month navigation controls', () => {
      render(<CalendarManagement />);
      
      expect(screen.getByTestId('prev-month-btn')).toBeInTheDocument();
      expect(screen.getByTestId('next-month-btn')).toBeInTheDocument();
      expect(screen.getByTestId('month-year-selector')).toBeInTheDocument();
    });
  });

  describe('Calendar Grid Display', () => {
    test('displays calendar dates with correct availability status', () => {
      render(<CalendarManagement />);
      
      // Check booked date
      const bookedDate = screen.getByTestId('calendar-date-2025-09-15');
      expect(bookedDate).toHaveClass('bg-red-100', 'text-red-800');
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Wedding')).toBeInTheDocument();
      
      // Check available date
      const availableDate = screen.getByTestId('calendar-date-2025-09-16');
      expect(availableDate).toHaveClass('bg-green-100', 'text-green-800');
      
      // Check maintenance date
      const maintenanceDate = screen.getByTestId('calendar-date-2025-09-17');
      expect(maintenanceDate).toHaveClass('bg-gray-100', 'text-gray-800');
      expect(maintenanceDate).toHaveTextContent('Maintenance');
    });

    test('shows day numbers correctly', () => {
      render(<CalendarManagement />);
      
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('16')).toBeInTheDocument();
      expect(screen.getByText('17')).toBeInTheDocument();
    });

    test('displays booking references for booked dates', () => {
      render(<CalendarManagement />);
      
      expect(screen.getByText('DSE-123456')).toBeInTheDocument();
    });
  });

  describe('Date Selection and Management', () => {
    test('allows selecting individual dates', async () => {
      const user = userEvent.setup();
      render(<CalendarManagement />);
      
      const availableDate = screen.getByTestId('calendar-date-2025-09-16');
      await user.click(availableDate);
      
      expect(mockUseCalendarManagement.setSelectedDate).toHaveBeenCalledWith('2025-09-16');
    });

    test('shows date management actions when date is selected', async () => {
      const user = userEvent.setup();
      
      // Override mock to have a selected date
      mockUseCalendarManagementHook.mockReturnValue({
        ...mockUseCalendarManagement,
        selectedDate: '2025-09-16',
      });
      
      render(<CalendarManagement />);
      
      await waitFor(() => {
        expect(screen.getByTestId('date-actions')).toBeInTheDocument();
        expect(screen.getByText('Block Date')).toBeInTheDocument();
        expect(screen.getByText('Set Maintenance')).toBeInTheDocument();
      });
    });

    test('provides block date functionality', async () => {
      const user = userEvent.setup();
      
      mockUseCalendarManagementHook.mockReturnValue({
        ...mockUseCalendarManagement,
        selectedDate: '2025-09-16',
      });
      
      render(<CalendarManagement />);
      
      const blockBtn = screen.getByText('Block Date');
      await user.click(blockBtn);
      
      // Should show reason input dialog
      expect(screen.getByTestId('block-reason-dialog')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Reason for blocking...')).toBeInTheDocument();
      
      // Enter reason and confirm
      const reasonInput = screen.getByPlaceholderText('Reason for blocking...');
      await user.type(reasonInput, 'Private event');
      
      const confirmBtn = screen.getByText('Confirm Block');
      await user.click(confirmBtn);
      
      expect(mockUseCalendarManagement.blockDate).toHaveBeenCalledWith('2025-09-16', 'Private event');
    });

    test('provides unblock date functionality', async () => {
      const user = userEvent.setup();
      
      // Select a blocked maintenance date
      mockUseCalendarManagementHook.mockReturnValue({
        ...mockUseCalendarManagement,
        selectedDate: '2025-09-17',
      });
      
      render(<CalendarManagement />);
      
      const unblockBtn = screen.getByText('Unblock Date');
      await user.click(unblockBtn);
      
      // Should show confirmation dialog
      expect(screen.getByText('Confirm unblock this date?')).toBeInTheDocument();
      
      const confirmBtn = screen.getByText('Confirm Unblock');
      await user.click(confirmBtn);
      
      expect(mockUseCalendarManagement.unblockDate).toHaveBeenCalledWith('2025-09-17');
    });

    test('provides maintenance block functionality', async () => {
      const user = userEvent.setup();
      
      mockUseCalendarManagementHook.mockReturnValue({
        ...mockUseCalendarManagement,
        selectedDate: '2025-09-16',
      });
      
      render(<CalendarManagement />);
      
      const maintenanceBtn = screen.getByText('Set Maintenance');
      await user.click(maintenanceBtn);
      
      expect(mockUseCalendarManagement.setMaintenanceBlock).toHaveBeenCalledWith('2025-09-16');
    });
  });

  describe('Month Navigation', () => {
    test('navigates to previous month', async () => {
      const user = userEvent.setup();
      render(<CalendarManagement />);
      
      const prevBtn = screen.getByTestId('prev-month-btn');
      await user.click(prevBtn);
      
      expect(mockUseCalendarManagement.goToPreviousMonth).toHaveBeenCalled();
    });

    test('navigates to next month', async () => {
      const user = userEvent.setup();
      render(<CalendarManagement />);
      
      const nextBtn = screen.getByTestId('next-month-btn');
      await user.click(nextBtn);
      
      expect(mockUseCalendarManagement.goToNextMonth).toHaveBeenCalled();
    });

    test('allows direct month/year selection', async () => {
      const user = userEvent.setup();
      render(<CalendarManagement />);
      
      const monthSelector = screen.getByTestId('month-selector');
      const yearSelector = screen.getByTestId('year-selector');
      
      await user.selectOptions(monthSelector, '11'); // December
      await user.selectOptions(yearSelector, '2025');
      
      expect(mockUseCalendarManagement.goToMonth).toHaveBeenCalledWith(2025, 11);
    });
  });

  describe('Bulk Operations', () => {
    test('provides bulk date blocking functionality', async () => {
      const user = userEvent.setup();
      render(<CalendarManagement />);
      
      expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
      expect(screen.getByText('Block Date Range')).toBeInTheDocument();
    });

    test('allows blocking multiple consecutive dates', async () => {
      const user = userEvent.setup();
      render(<CalendarManagement />);
      
      const bulkBlockBtn = screen.getByText('Block Date Range');
      await user.click(bulkBlockBtn);
      
      // Should show date range picker dialog
      expect(screen.getByTestId('date-range-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('range-start-date')).toBeInTheDocument();
      expect(screen.getByTestId('range-end-date')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Reason for blocking range...')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('shows loading state while calendar data loads', () => {
      mockUseCalendarManagementHook.mockReturnValue({
        ...mockUseCalendarManagement,
        loading: true,
        calendarData: [],
      });
      
      render(<CalendarManagement />);
      
      expect(screen.getByTestId('calendar-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading calendar...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('shows error message when calendar fails to load', () => {
      mockUseCalendarManagementHook.mockReturnValue({
        ...mockUseCalendarManagement,
        loading: false,
        error: 'Failed to load calendar data',
        calendarData: [],
      });
      
      render(<CalendarManagement />);
      
      expect(screen.getByTestId('calendar-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load calendar data')).toBeInTheDocument();
    });

    test('shows retry button on error', async () => {
      const user = userEvent.setup();
      
      mockUseCalendarManagementHook.mockReturnValue({
        ...mockUseCalendarManagement,
        error: 'Network error',
        calendarData: [],
      });
      
      render(<CalendarManagement />);
      
      const retryBtn = screen.getByTestId('retry-btn');
      await user.click(retryBtn);
      
      expect(mockUseCalendarManagement.refresh).toHaveBeenCalled();
    });
  });

  describe('Legend and Status Indicators', () => {
    test('displays calendar legend with status meanings', () => {
      render(<CalendarManagement />);
      
      const legend = screen.getByTestId('calendar-legend');
      expect(legend).toBeInTheDocument();
      expect(legend).toHaveTextContent('Available');
      expect(legend).toHaveTextContent('Booked');
      expect(legend).toHaveTextContent('Maintenance');
      expect(legend).toHaveTextContent('Blocked');
    });

    test('shows correct color indicators in legend', () => {
      render(<CalendarManagement />);
      
      const availableIndicator = screen.getByTestId('legend-available');
      const bookedIndicator = screen.getByTestId('legend-booked');
      const maintenanceIndicator = screen.getByTestId('legend-maintenance');
      
      expect(availableIndicator).toHaveClass('bg-green-100');
      expect(bookedIndicator).toHaveClass('bg-red-100');
      expect(maintenanceIndicator).toHaveClass('bg-gray-100');
    });
  });

  describe('Accessibility', () => {
    test('includes proper ARIA labels and roles', () => {
      render(<CalendarManagement />);
      
      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(screen.getByLabelText('Calendar Management')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<CalendarManagement />);
      
      const firstDate = screen.getByTestId('calendar-date-2025-09-15');
      firstDate.focus();
      
      expect(document.activeElement).toBe(firstDate);
      
      // Arrow key navigation
      await user.keyboard('{ArrowRight}');
      const nextDate = screen.getByTestId('calendar-date-2025-09-16');
      expect(document.activeElement).toBe(nextDate);
    });
  });

  describe('Summary Statistics', () => {
    test('displays calendar summary statistics', () => {
      render(<CalendarManagement />);
      
      expect(screen.getByTestId('calendar-stats')).toBeInTheDocument();
      expect(screen.getByText('Total Days:')).toBeInTheDocument();
      expect(screen.getByText('Available:')).toBeInTheDocument();
      expect(screen.getByText('Booked:')).toBeInTheDocument();
      expect(screen.getByText('Blocked:')).toBeInTheDocument();
    });

    test('calculates statistics correctly', () => {
      render(<CalendarManagement />);
      
      const statsContainer = screen.getByTestId('calendar-stats');
      
      // Based on mock data: 1 available, 1 booked, 1 maintenance
      expect(statsContainer).toHaveTextContent('1'); // Available count exists
      expect(statsContainer).toHaveTextContent('Available:');
      expect(statsContainer).toHaveTextContent('Booked:');
      expect(statsContainer).toHaveTextContent('Blocked:');
    });
  });
});
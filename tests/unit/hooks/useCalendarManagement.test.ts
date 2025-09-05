/**
 * @fileoverview Calendar Management Hook Tests
 * 
 * TDD tests for the useCalendarManagement hook that manages
 * admin calendar operations and availability data.
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useCalendarManagement } from '@/hooks/use-calendar-management';

// Mock the API calls
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const mockCalendarResponse = {
  success: true,
  calendar: [
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
  ],
};

describe('useCalendarManagement Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockCalendarResponse,
    } as Response);
  });

  describe('Initial State', () => {
    test('returns initial loading state', () => {
      const { result } = renderHook(() => useCalendarManagement());
      
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(result.current.calendarData).toEqual([]);
      expect(result.current.selectedDate).toBe(null);
      expect(result.current.currentMonth).toBe(new Date().getMonth());
      expect(result.current.currentYear).toBe(new Date().getFullYear());
    });
  });

  describe('Data Fetching', () => {
    test('fetches calendar data successfully', async () => {
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe(null);
      expect(result.current.calendarData).toEqual(mockCalendarResponse.calendar);
    });

    test('makes correct API call for current month', async () => {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        const expectedStart = new Date(year, month, 1).toISOString().split('T')[0];
        const expectedEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];
        
        expect(mockFetch).toHaveBeenCalledWith(
          `/api/calendar?startDate=${expectedStart}&endDate=${expectedEnd}&includeBookings=true`
        );
      });
    });

    test('refetches data when month changes', async () => {
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      mockFetch.mockClear();
      
      act(() => {
        result.current.goToNextMonth();
      });
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Date Selection', () => {
    test('allows setting selected date', async () => {
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.setSelectedDate('2025-09-16');
      });
      
      expect(result.current.selectedDate).toBe('2025-09-16');
    });

    test('clears selected date when null is passed', async () => {
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.setSelectedDate('2025-09-16');
      });
      
      expect(result.current.selectedDate).toBe('2025-09-16');
      
      act(() => {
        result.current.setSelectedDate(null);
      });
      
      expect(result.current.selectedDate).toBe(null);
    });
  });

  describe('Month Navigation', () => {
    test('navigates to next month correctly', async () => {
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      const initialMonth = result.current.currentMonth;
      
      act(() => {
        result.current.goToNextMonth();
      });
      
      const expectedMonth = initialMonth === 11 ? 0 : initialMonth + 1;
      expect(result.current.currentMonth).toBe(expectedMonth);
    });

    test('navigates to previous month correctly', async () => {
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      const initialMonth = result.current.currentMonth;
      
      act(() => {
        result.current.goToPreviousMonth();
      });
      
      const expectedMonth = initialMonth === 0 ? 11 : initialMonth - 1;
      expect(result.current.currentMonth).toBe(expectedMonth);
    });

    test('navigates to specific month and year', async () => {
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.goToMonth(2025, 11); // December 2025
      });
      
      expect(result.current.currentMonth).toBe(11);
      expect(result.current.currentYear).toBe(2025);
    });
  });

  describe('Date Management Operations', () => {
    test('blocks date with reason successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCalendarResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);
      
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      let blockResult;
      await act(async () => {
        blockResult = await result.current.blockDate('2025-09-16', 'Private event');
      });
      
      expect(blockResult).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/calendar/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: '2025-09-16',
          available: false,
          blockedReason: 'Private event',
        }),
      });
    });

    test('unblocks date successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCalendarResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);
      
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      let unblockResult;
      await act(async () => {
        unblockResult = await result.current.unblockDate('2025-09-17');
      });
      
      expect(unblockResult).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/calendar/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: '2025-09-17',
          available: true,
          blockedReason: null,
        }),
      });
    });

    test('sets maintenance block successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCalendarResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);
      
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      let maintenanceResult;
      await act(async () => {
        maintenanceResult = await result.current.setMaintenanceBlock('2025-09-18');
      });
      
      expect(maintenanceResult).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/calendar/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: '2025-09-18',
          available: false,
          blockedReason: 'Maintenance',
        }),
      });
    });

    test('handles API errors gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCalendarResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response);
      
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      let blockResult;
      await act(async () => {
        blockResult = await result.current.blockDate('2025-09-16', 'Test');
      });
      
      expect(blockResult).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe('Failed to load calendar data');
      expect(result.current.calendarData).toEqual([]);
    });

    test('handles API response errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);
      
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe('Failed to load calendar data');
    });
  });

  describe('Data Refresh', () => {
    test('provides refresh function', async () => {
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.refresh).toBeDefined();
      expect(typeof result.current.refresh).toBe('function');
    });

    test('refresh function refetches data', async () => {
      const { result } = renderHook(() => useCalendarManagement());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      mockFetch.mockClear();
      
      await act(async () => {
        result.current.refresh();
      });
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });
});
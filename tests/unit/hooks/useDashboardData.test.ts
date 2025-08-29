/**
 * @fileoverview Dashboard Data Hook Tests
 * 
 * TDD tests for the useDashboardData hook that fetches and manages
 * admin dashboard statistics and data.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from '@/hooks/useDashboardData';

// Mock the API calls
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const mockDashboardResponse = {
  stats: {
    totalBookings: 25,
    pendingBookings: 5,
    confirmedBookings: 15,
    completedBookings: 5,
    totalRevenue: 18750.00,
    thisMonthRevenue: 6200.00,
    averageBookingValue: 750.00,
    thisMonthBookings: 8,
    lastMonthBookings: 12,
    revenueGrowth: 15.5,
    bookingGrowth: -33.3,
  },
  upcomingEvents: [
    {
      id: '1',
      bookingReference: 'DSE-123456',
      clientName: 'John Smith',
      eventDate: '2025-09-15',
      eventType: 'Wedding',
      status: 'CONFIRMED',
      venueName: 'Grand Hotel',
    },
    {
      id: '2',
      bookingReference: 'DSE-789012',
      clientName: 'Jane Doe',
      eventDate: '2025-09-20',
      eventType: 'Corporate Event',
      status: 'CONFIRMED',
      venueName: 'Convention Center',
    },
  ],
  recentBookings: [
    {
      id: '3',
      bookingReference: 'DSE-345678',
      clientName: 'Bob Johnson',
      eventDate: '2025-10-05',
      eventType: 'Birthday Party',
      status: 'PENDING',
      venueName: 'Community Center',
      totalAmount: 1200.00,
      createdAt: '2025-08-27T10:30:00.000Z',
    },
    {
      id: '4',
      bookingReference: 'DSE-901234',
      clientName: 'Alice Wilson',
      eventDate: '2025-10-12',
      eventType: 'Anniversary',
      status: 'CONFIRMED',
      venueName: 'Country Club',
      totalAmount: 1800.00,
      createdAt: '2025-08-26T14:15:00.000Z',
    },
  ],
};

describe.skip('useDashboardData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockDashboardResponse,
    } as Response);
  });

  describe('Initial State', () => {
    test('returns initial loading state', () => {
      const { result } = renderHook(() => useDashboardData());
      
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(result.current.stats).toBe(null);
      expect(result.current.upcomingEvents).toEqual([]);
      expect(result.current.recentBookings).toEqual([]);
    });
  });

  describe('Successful Data Fetching', () => {
    test('fetches dashboard data successfully', async () => {
      const { result } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe(null);
      expect(result.current.stats).toEqual(mockDashboardResponse.stats);
      expect(result.current.upcomingEvents).toEqual(mockDashboardResponse.upcomingEvents);
      expect(result.current.recentBookings).toEqual(mockDashboardResponse.recentBookings);
    });

    test('makes correct API call', async () => {
      renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/admin/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });
    });

    test('processes stats data correctly', async () => {
      const { result } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.stats).not.toBe(null);
      });
      
      const stats = result.current.stats!;
      expect(stats.totalBookings).toBe(25);
      expect(stats.pendingBookings).toBe(5);
      expect(stats.confirmedBookings).toBe(15);
      expect(stats.completedBookings).toBe(5);
      expect(stats.totalRevenue).toBe(18750.00);
      expect(stats.thisMonthRevenue).toBe(6200.00);
      expect(stats.averageBookingValue).toBe(750.00);
    });

    test('processes upcoming events correctly', async () => {
      const { result } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.upcomingEvents).toHaveLength(2);
      });
      
      const events = result.current.upcomingEvents;
      expect(events[0].clientName).toBe('John Smith');
      expect(events[0].eventType).toBe('Wedding');
      expect(events[0].status).toBe('CONFIRMED');
      expect(events[1].clientName).toBe('Jane Doe');
    });

    test('processes recent bookings correctly', async () => {
      const { result } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.recentBookings).toHaveLength(2);
      });
      
      const bookings = result.current.recentBookings;
      expect(bookings[0].clientName).toBe('Bob Johnson');
      expect(bookings[0].totalAmount).toBe(1200.00);
      expect(bookings[1].clientName).toBe('Alice Wilson');
    });
  });

  describe('Error Handling', () => {
    test('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe('Failed to load dashboard data');
      expect(result.current.stats).toBe(null);
      expect(result.current.upcomingEvents).toEqual([]);
      expect(result.current.recentBookings).toEqual([]);
    });

    test('handles API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);
      
      const { result } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe('Failed to load dashboard data');
    });

    test('handles JSON parsing errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);
      
      const { result } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe('Failed to load dashboard data');
    });
  });

  describe('Data Refresh', () => {
    test('provides refresh function', async () => {
      const { result } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.refresh).toBeDefined();
      expect(typeof result.current.refresh).toBe('function');
    });

    test('refresh function refetches data', async () => {
      const { result } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Clear previous calls
      mockFetch.mockClear();
      
      // Call refresh
      result.current.refresh();
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    test('refresh sets loading state correctly', async () => {
      const { result } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Mock slow response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => mockDashboardResponse,
          } as Response), 100)
        )
      );
      
      result.current.refresh();
      
      expect(result.current.loading).toBe(true);
    });
  });

  describe('Caching and Updates', () => {
    test('caches data between renders', async () => {
      const { result, rerender } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      const firstStats = result.current.stats;
      
      rerender();
      
      expect(result.current.stats).toBe(firstStats);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('updates data when refresh is called', async () => {
      const { result } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Mock updated data
      const updatedResponse = {
        ...mockDashboardResponse,
        stats: {
          ...mockDashboardResponse.stats,
          totalBookings: 30, // Updated value
        },
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedResponse,
      } as Response);
      
      result.current.refresh();
      
      await waitFor(() => {
        expect(result.current.stats?.totalBookings).toBe(30);
      });
    });
  });

  describe('Performance', () => {
    test('debounces multiple rapid refresh calls', async () => {
      const { result } = renderHook(() => useDashboardData());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      mockFetch.mockClear();
      
      // Make multiple rapid refresh calls
      result.current.refresh();
      result.current.refresh();
      result.current.refresh();
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });
});
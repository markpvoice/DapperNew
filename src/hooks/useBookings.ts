/**
 * @fileoverview Bookings Management Hook
 * 
 * Custom React hook for managing bookings data, filtering, and operations.
 * Provides CRUD operations for admin booking management.
 */

import { useState, useEffect, useCallback } from 'react';

export interface Booking {
  id: string;
  bookingReference: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  eventType: string;
  services: string[];
  venueName?: string;
  venueAddress?: string;
  guestCount?: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  totalAmount?: number;
  depositAmount?: number;
  createdAt: string;
}

export interface BookingFilters {
  status?: string;
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface BookingSortOptions {
  field: 'date' | 'amount' | 'name' | 'created';
  direction: 'asc' | 'desc';
}

export interface UseBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateBookingStatus: (_id: string, _status: string) => Promise<boolean>;
  deleteBooking: (_id: string) => Promise<boolean>;
  filters: BookingFilters;
  setFilters: (_filters: BookingFilters) => void;
  sort: BookingSortOptions;
  setSort: (_sort: BookingSortOptions) => void;
  totalCount: number;
  page: number;
  setPage: (_page: number) => void;
  pageSize: number;
}

export function useBookings(initialPageSize: number = 10): UseBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<BookingFilters>({});
  const [sort, setSortState] = useState<BookingSortOptions>({ field: 'date', direction: 'desc' });
  const [totalCount, setTotalCount] = useState(0);
  const [pageState, setPageState] = useState(1);
  const pageSize = initialPageSize;

  // Public setters that match the expected interface
  const setFilters = (newFilters: BookingFilters) => {
    setFiltersState(newFilters);
  };
  const setSort = (newSort: BookingSortOptions) => setSortState(newSort);
  const setPage = (newPage: number) => setPageState(newPage);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      params.set('status', filters.status);
    }
    if (filters.eventType && filters.eventType !== 'all') {
      params.set('eventType', filters.eventType);
    }
    if (filters.dateFrom) {
      params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params.set('dateTo', filters.dateTo);
    }
    if (filters.search) {
      params.set('search', filters.search);
    }
    
    params.set('sortField', sort.field);
    params.set('sortDirection', sort.direction);
    params.set('page', pageState.toString());
    params.set('pageSize', pageSize.toString());
    
    return params.toString();
  }, [filters, sort, pageState, pageSize]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString();
      const response = await fetch(`/api/bookings?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load bookings');
      }

      // Map the API response to our expected format
      const mappedBookings: Booking[] = (data.bookings || []).map((booking: any) => {
        return {
          id: booking.id,
          bookingReference: booking.bookingReference || booking.booking_reference,
          clientName: booking.clientName || booking.client_name,
          clientEmail: booking.clientEmail || booking.client_email,
          clientPhone: booking.clientPhone || booking.client_phone,
          eventDate: booking.eventDate || booking.event_date,
          eventType: booking.eventType || booking.event_type,
          services: booking.servicesNeeded || booking.services || [],
          venueName: booking.venueName || booking.venue_name,
          venueAddress: booking.venueAddress || booking.venue_address,
          guestCount: booking.guestCount || booking.guest_count,
          status: booking.status,
          totalAmount: booking.totalAmount ? Number(booking.totalAmount) : undefined,
          depositAmount: booking.depositAmount ? Number(booking.depositAmount) : undefined,
          createdAt: booking.createdAt || booking.created_at,
        };
      });

      setBookings(mappedBookings);
      setTotalCount(data.pagination?.total || mappedBookings.length);

    } catch (err) {
      console.error('Bookings fetch error:', err);
      setError('Failed to load bookings');
      setBookings([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  const updateBookingStatus = useCallback(async (bookingId: string, newStatus: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the booking in our local state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus as any } : booking
        ));
        return true;
      } else {
        throw new Error(data.error || 'Failed to update booking status');
      }
    } catch (err) {
      console.error('Update booking status error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update booking status');
      return false;
    }
  }, []);

  const deleteBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Remove the booking from our local state
        setBookings(prev => prev.filter(booking => booking.id !== bookingId));
        setTotalCount(prev => prev - 1);
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete booking');
      }
    } catch (err) {
      console.error('Delete booking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete booking');
      return false;
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  // Fetch bookings when filters, sort, or page changes
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset page when filters change
  useEffect(() => {
    setPageState(1);
  }, [filters, sort]);

  return {
    bookings,
    loading,
    error,
    refetch,
    updateBookingStatus,
    deleteBooking,
    filters,
    setFilters,
    sort,
    setSort,
    totalCount,
    page: pageState,
    setPage,
    pageSize,
  };
}
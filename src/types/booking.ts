/**
 * @fileoverview Booking Types
 * 
 * Type definitions for booking-related data structures.
 * Separated from hooks to prevent Fast Refresh issues.
 */

export interface Booking {
  id: string;
  bookingReference: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  eventStartTime?: string;
  eventEndTime?: string;
  eventType: string;
  services: string[];
  servicesNeeded?: string[];
  venueName?: string;
  venueAddress?: string;
  guestCount?: number;
  specialRequests?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus?: 'unpaid' | 'deposit_paid' | 'paid' | 'refunded';
  totalAmount?: number;
  depositAmount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingFilters {
  status?: string;
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface BookingSortOptions {
  field: 'date' | 'amount' | 'name' | 'created' | 'client' | 'status';
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
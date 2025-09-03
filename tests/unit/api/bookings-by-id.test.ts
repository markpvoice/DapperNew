/**
 * @fileoverview Unit tests for /api/bookings/[id] endpoints
 *
 * Tests GET, PUT, and DELETE operations for individual bookings
 * Covers auth requirements, validation, success/error scenarios
 */

import { GET, PUT, DELETE } from '@/app/api/bookings/[id]/route';

// Mocks
const mockVerifyAuth = jest.fn();
const mockGetBookingById = jest.fn();
const mockUpdateBookingStatus = jest.fn();
const mockDeleteBooking = jest.fn();
const mockDbUpdate = jest.fn();

jest.mock('@/lib/auth', () => ({
  verifyAuth: (...args: any[]) => mockVerifyAuth(...args),
}));

jest.mock('@/lib/database', () => ({
  getBookingById: (...args: any[]) => mockGetBookingById(...args),
  updateBookingStatus: (...args: any[]) => mockUpdateBookingStatus(...args),
  deleteBooking: (...args: any[]) => mockDeleteBooking(...args),
}));

jest.mock('@/lib/db', () => ({
  db: {
    booking: {
      update: (...args: any[]) => mockDbUpdate(...args),
    },
  },
}));

function makeRequest(method: string, body?: any) {
  const options: RequestInit = { method };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return new (global as any).Request('http://localhost:3000/api/bookings/123', options);
}

const mockParams = { params: { id: 'test-booking-id' } };

const mockBookingData = {
  id: 'test-booking-id',
  bookingReference: 'DSE-123456',
  clientName: 'John Doe',
  clientEmail: 'john@example.com',
  clientPhone: '+1234567890',
  eventDate: '2024-12-25T00:00:00.000Z',
  eventStartTime: '2024-12-25T18:00:00.000Z',
  eventEndTime: '2024-12-25T23:00:00.000Z',
  eventType: 'Wedding',
  services: ['DJ', 'Photography'],
  venueName: 'Grand Hall',
  venueAddress: '123 Main St',
  guestCount: 100,
  specialRequests: 'Special lighting',
  status: 'CONFIRMED' as const,
  totalAmount: 2500,
  depositAmount: 500,
  paymentStatus: 'DEPOSIT_PAID' as const,
  createdAt: '2024-12-01T00:00:00.000Z',
  updatedAt: '2024-12-01T00:00:00.000Z',
};

describe('/api/bookings/[id] - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should return booking when found', async () => {
      mockGetBookingById.mockResolvedValue(mockBookingData);
      
      const request = makeRequest('GET');
      const response = await GET(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        booking: mockBookingData,
      });
      expect(mockGetBookingById).toHaveBeenCalledWith('test-booking-id');
    });
  });

  describe('Error Cases', () => {
    it('should return 404 when booking not found', async () => {
      mockGetBookingById.mockResolvedValue(null);
      
      const request = makeRequest('GET');
      const response = await GET(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        success: false,
        error: 'Booking not found',
      });
    });

    it('should handle database errors gracefully', async () => {
      mockGetBookingById.mockRejectedValue(new Error('Database connection failed'));
      
      const request = makeRequest('GET');
      const response = await GET(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Internal server error',
      });
    });
  });
});

describe('/api/bookings/[id] - PUT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should require admin authentication', async () => {
      mockVerifyAuth.mockResolvedValue({ success: false, user: null });
      
      const request = makeRequest('PUT', { status: 'CONFIRMED' });
      const response = await PUT(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        success: false,
        error: 'Authentication required',
      });
    });

    it('should allow authenticated admin users', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, user: { id: 'admin-user' } });
      mockGetBookingById.mockResolvedValue(mockBookingData);
      mockUpdateBookingStatus.mockResolvedValue({
        success: true,
        booking: { ...mockBookingData, status: 'CONFIRMED' },
      });
      
      const request = makeRequest('PUT', { status: 'CONFIRMED' });
      const response = await PUT(request, mockParams);

      expect(response.status).toBe(200);
      expect(mockVerifyAuth).toHaveBeenCalledWith(request);
    });
  });

  describe('Validation', () => {
    it('should validate request body schema', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, user: { id: 'admin-user' } });
      
      const request = makeRequest('PUT', { 
        status: 'INVALID_STATUS',
        clientEmail: 'not-an-email' 
      });
      const response = await PUT(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should accept valid booking updates', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, user: { id: 'admin-user' } });
      mockGetBookingById.mockResolvedValue(mockBookingData);
      mockUpdateBookingStatus.mockResolvedValue({
        success: true,
        booking: { ...mockBookingData, status: 'CONFIRMED' },
      });
      
      const request = makeRequest('PUT', {
        status: 'CONFIRMED',
        guestCount: 150,
        totalAmount: 3000,
      });
      const response = await PUT(request, mockParams);

      expect(response.status).toBe(200);
    });
  });

  describe('Status Updates', () => {
    it('should use optimized function for status-only updates', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, user: { id: 'admin-user' } });
      mockGetBookingById.mockResolvedValue(mockBookingData);
      mockUpdateBookingStatus.mockResolvedValue({
        success: true,
        booking: { ...mockBookingData, status: 'COMPLETED' },
      });
      
      const request = makeRequest('PUT', { status: 'COMPLETED' });
      const response = await PUT(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Booking status updated successfully',
        booking: { ...mockBookingData, status: 'COMPLETED' },
      });
      expect(mockUpdateBookingStatus).toHaveBeenCalledWith('test-booking-id', 'COMPLETED');
    });

    it('should handle status update failures', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, user: { id: 'admin-user' } });
      mockGetBookingById.mockResolvedValue(mockBookingData);
      mockUpdateBookingStatus.mockResolvedValue({
        success: false,
        error: 'Cannot update status: booking is already completed',
      });
      
      const request = makeRequest('PUT', { status: 'COMPLETED' });
      const response = await PUT(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Cannot update status: booking is already completed',
      });
    });
  });

  describe('Complex Updates', () => {
    it('should use database update for multiple field updates', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, user: { id: 'admin-user' } });
      mockGetBookingById.mockResolvedValue(mockBookingData);
      
      const updatedBooking = {
        ...mockBookingData,
        clientName: 'Jane Doe',
        guestCount: 120,
        totalAmount: 2800,
        updatedAt: '2025-09-03T17:27:29.735Z',
      };
      mockDbUpdate.mockResolvedValue(updatedBooking);
      
      const request = makeRequest('PUT', {
        clientName: 'Jane Doe',
        guestCount: 120,
        totalAmount: 2800,
      });
      const response = await PUT(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Booking updated successfully',
        booking: updatedBooking,
      });
      expect(mockDbUpdate).toHaveBeenCalledWith({
        where: { id: 'test-booking-id' },
        data: {
          clientName: 'Jane Doe',
          guestCount: 120,
          totalAmount: 2800,
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('Error Cases', () => {
    it('should return 404 when booking not found for update', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, user: { id: 'admin-user' } });
      mockGetBookingById.mockResolvedValue(null);
      
      const request = makeRequest('PUT', { status: 'CONFIRMED' });
      const response = await PUT(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        success: false,
        error: 'Booking not found',
      });
    });

    it('should handle database errors during update', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, user: { id: 'admin-user' } });
      mockGetBookingById.mockRejectedValue(new Error('Database connection failed'));
      
      const request = makeRequest('PUT', { status: 'CONFIRMED' });
      const response = await PUT(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Internal server error',
      });
    });
  });
});

describe('/api/bookings/[id] - DELETE', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should require admin authentication', async () => {
      mockVerifyAuth.mockResolvedValue({ success: false, user: null });
      
      const request = makeRequest('DELETE');
      const response = await DELETE(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        success: false,
        error: 'Authentication required',
      });
    });
  });

  describe('Happy Path', () => {
    it('should successfully delete booking', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, user: { id: 'admin-user' } });
      mockDeleteBooking.mockResolvedValue({ success: true });
      
      const request = makeRequest('DELETE');
      const response = await DELETE(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Booking deleted successfully',
      });
      expect(mockDeleteBooking).toHaveBeenCalledWith('test-booking-id');
    });
  });

  describe('Error Cases', () => {
    it('should handle delete failures', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, user: { id: 'admin-user' } });
      mockDeleteBooking.mockResolvedValue({
        success: false,
        error: 'Cannot delete confirmed booking',
      });
      
      const request = makeRequest('DELETE');
      const response = await DELETE(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Cannot delete confirmed booking',
      });
    });

    it('should handle database errors during delete', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, user: { id: 'admin-user' } });
      mockDeleteBooking.mockRejectedValue(new Error('Database connection failed'));
      
      const request = makeRequest('DELETE');
      const response = await DELETE(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Internal server error',
      });
    });
  });
});
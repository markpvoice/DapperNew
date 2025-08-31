/**
 * @fileoverview Booking API Tests
 * Tests for booking management endpoints
 */

import { NextRequest } from 'next/server';
import { GET as bookingsGET, POST as bookingsPOST } from '@/app/api/bookings/route';
import { GET as bookingGET, PUT as bookingPUT, DELETE as bookingDELETE } from '@/app/api/bookings/[id]/route';

// Mock the auth verification
jest.mock('@/lib/auth', () => ({
  verifyAuth: jest.fn(),
}));

// Mock the database operations
jest.mock('@/lib/database', () => ({
  createBooking: jest.fn(),
  getBookingsByDateRange: jest.fn(),
  updateBookingStatus: jest.fn(),
  deleteBooking: jest.fn(),
  getBookingById: jest.fn(),
}));

// Mock the email service
jest.mock('@/lib/email', () => ({
  sendBookingConfirmation: jest.fn(),
  sendAdminNotification: jest.fn(),
}));

// Mock the rate limiter
jest.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: jest.fn(),
}));

// Mock the query helpers
jest.mock('@/lib/db', () => ({
  queryHelpers: {
    getBookingsList: jest.fn(),
  },
  db: {
    booking: {
      update: jest.fn(),
    },
  },
}));

describe('Booking API', () => {
  const mockAuthUser = {
    id: 1,
    email: 'admin@dappersquad.com',
    name: 'Admin User',
    role: 'admin',
  };

  const mockBooking = {
    id: 'clp123456',
    bookingReference: 'DSE-123456-ABC',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientPhone: '555-123-4567',
    eventDate: new Date('2024-12-25'),
    eventType: 'Wedding',
    servicesNeeded: ['DJ Services', 'Photography'],
    status: 'PENDING',
    totalAmount: 1500,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/bookings', () => {
    it('should list bookings for authenticated admin', async () => {
      const { verifyAuth } = await import('@/lib/auth');
      const { queryHelpers } = await import('@/lib/db');

      (verifyAuth as jest.Mock).mockResolvedValue({
        success: true,
        user: mockAuthUser,
      });

      (queryHelpers.getBookingsList as jest.Mock).mockResolvedValue([mockBooking]);

      const request = new NextRequest('http://localhost:3000/api/bookings');
      const response = await bookingsGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookings).toEqual([mockBooking]);
      expect(data.pagination).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      const { verifyAuth } = await import('@/lib/auth');

      (verifyAuth as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Authentication required',
      });

      const request = new NextRequest('http://localhost:3000/api/bookings');
      const response = await bookingsGET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should handle date range filtering', async () => {
      const { verifyAuth } = await import('@/lib/auth');
      const { getBookingsByDateRange } = await import('@/lib/database');

      (verifyAuth as jest.Mock).mockResolvedValue({
        success: true,
        user: mockAuthUser,
      });

      (getBookingsByDateRange as jest.Mock).mockResolvedValue({
        success: true,
        bookings: [mockBooking],
      });

      const request = new NextRequest('http://localhost:3000/api/bookings?dateFrom=2024-12-01&dateTo=2024-12-31');
      const response = await bookingsGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(getBookingsByDateRange).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date)
      );
    });
  });

  describe('POST /api/bookings', () => {
    const validBookingData = {
      clientName: 'Jane Smith',
      clientEmail: 'jane@example.com',
      clientPhone: '555-987-6543',
      eventDate: '2025-06-15',
      eventType: 'Wedding Reception',
      services: ['DJ Services', 'Photography'],
      venueName: 'Grand Ballroom',
      venueAddress: '123 Wedding St, Chicago, IL',
      guestCount: 150,
      specialRequests: 'Please play romantic music during dinner',
      totalAmount: 2000,
      depositAmount: 500,
    };

    it('should create booking with valid data', async () => {
      const { createBooking } = await import('@/lib/database');

      (createBooking as jest.Mock).mockResolvedValue({
        success: true,
        booking: { ...mockBooking, id: 'new-booking-id' },
      });

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validBookingData),
      });

      const response = await bookingsPOST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Booking created successfully');
      expect(data.booking).toBeDefined();
      expect(createBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          clientName: validBookingData.clientName,
          clientEmail: validBookingData.clientEmail,
          services: validBookingData.services,
        })
      );
    });

    it('should reject booking with invalid data', async () => {
      const invalidData = {
        clientName: '', // Empty name
        clientEmail: 'invalid-email', // Invalid email
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      });

      const response = await bookingsPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should reject booking with past event date', async () => {
      const pastDateData = {
        ...validBookingData,
        eventDate: '2020-01-01', // Past date
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pastDateData),
      });

      const response = await bookingsPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Event date must be in the future');
    });

    it('should succeed even when email sending fails', async () => {
      const { createBooking } = await import('@/lib/database');
      const { sendBookingConfirmation, sendAdminNotification } = await import('@/lib/email');

      (createBooking as jest.Mock).mockResolvedValue({
        success: true,
        booking: { ...mockBooking, id: 'new-booking-id' },
      });

      // Mock email failures
      (sendBookingConfirmation as jest.Mock).mockRejectedValue(new Error('Email service down'));
      (sendAdminNotification as jest.Mock).mockRejectedValue(new Error('Email service down'));

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validBookingData),
      });

      const response = await bookingsPOST(request);
      const data = await response.json();

      // Booking should still succeed
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Booking created successfully');
    });

    it('should handle timezone edge cases for future date validation', async () => {
      const { createBooking } = await import('@/lib/database');

      (createBooking as jest.Mock).mockResolvedValue({
        success: true,
        booking: { ...mockBooking, id: 'timezone-test' },
      });

      // Test date that might be considered past in some timezones but future in others
      const edgeDate = new Date();
      edgeDate.setDate(edgeDate.getDate() + 1);
      edgeDate.setHours(2, 0, 0, 0); // 2 AM tomorrow

      const edgeDateData = {
        ...validBookingData,
        eventDate: edgeDate.toISOString().split('T')[0],
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(edgeDateData),
      });

      const response = await bookingsPOST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should enforce rate limiting when enabled', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limiter');

      // Mock rate limit exceeded
      (checkRateLimit as jest.Mock).mockResolvedValue({
        allowed: false,
        remaining: 0,
        retryAfter: 600, // 10 minutes
      });

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify(validBookingData),
      });

      const response = await bookingsPOST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Too many requests');
      expect(response.headers.get('Retry-After')).toBe('600');
    });

    it('should allow requests when rate limit is in log mode', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limiter');
      const { createBooking } = await import('@/lib/database');

      // Mock rate limit in log-only mode (allows but logs)
      (checkRateLimit as jest.Mock).mockResolvedValue({
        allowed: true,
        remaining: 0, // Shows 0 remaining but still allows
        retryAfter: 600,
      });

      (createBooking as jest.Mock).mockResolvedValue({
        success: true,
        booking: { ...mockBooking, id: 'rate-limit-log-test' },
      });

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify(validBookingData),
      });

      const response = await bookingsPOST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should fail open when rate limiter has errors', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limiter');
      const { createBooking } = await import('@/lib/database');

      // Mock rate limiter failure
      (checkRateLimit as jest.Mock).mockRejectedValue(new Error('Rate limiter database error'));

      (createBooking as jest.Mock).mockResolvedValue({
        success: true,
        booking: { ...mockBooking, id: 'rate-limit-error-test' },
      });

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.1',
        },
        body: JSON.stringify(validBookingData),
      });

      const response = await bookingsPOST(request);
      const data = await response.json();

      // Should still allow the request (fail-open)
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/bookings/[id]', () => {
    it('should get specific booking by ID', async () => {
      const { getBookingById } = await import('@/lib/database');

      (getBookingById as jest.Mock).mockResolvedValue(mockBooking);

      const response = await bookingGET(
        new NextRequest('http://localhost:3000/api/bookings/clp123456'),
        { params: { id: 'clp123456' } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.booking).toEqual(mockBooking);
      expect(getBookingById).toHaveBeenCalledWith('clp123456');
    });

    it('should return 404 for non-existent booking', async () => {
      const { getBookingById } = await import('@/lib/database');

      (getBookingById as jest.Mock).mockResolvedValue(null);

      const response = await bookingGET(
        new NextRequest('http://localhost:3000/api/bookings/nonexistent'),
        { params: { id: 'nonexistent' } }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Booking not found');
    });
  });

  describe('PUT /api/bookings/[id]', () => {
    it('should update booking status for authenticated admin', async () => {
      const { verifyAuth } = await import('@/lib/auth');
      const { getBookingById, updateBookingStatus } = await import('@/lib/database');

      (verifyAuth as jest.Mock).mockResolvedValue({
        success: true,
        user: mockAuthUser,
      });

      (getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (updateBookingStatus as jest.Mock).mockResolvedValue({
        success: true,
        booking: { ...mockBooking, status: 'CONFIRMED' },
      });

      const request = new NextRequest('http://localhost:3000/api/bookings/clp123456', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });

      const response = await bookingPUT(request, { params: { id: 'clp123456' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Booking status updated successfully');
      expect(updateBookingStatus).toHaveBeenCalledWith('clp123456', 'CONFIRMED');
    });

    it('should reject unauthenticated update requests', async () => {
      const { verifyAuth } = await import('@/lib/auth');

      (verifyAuth as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Authentication required',
      });

      const request = new NextRequest('http://localhost:3000/api/bookings/clp123456', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });

      const response = await bookingPUT(request, { params: { id: 'clp123456' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('DELETE /api/bookings/[id]', () => {
    it('should delete booking for authenticated admin', async () => {
      const { verifyAuth } = await import('@/lib/auth');
      const { deleteBooking } = await import('@/lib/database');

      (verifyAuth as jest.Mock).mockResolvedValue({
        success: true,
        user: mockAuthUser,
      });

      (deleteBooking as jest.Mock).mockResolvedValue({
        success: true,
      });

      const request = new NextRequest('http://localhost:3000/api/bookings/clp123456', {
        method: 'DELETE',
      });

      const response = await bookingDELETE(request, { params: { id: 'clp123456' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Booking deleted successfully');
      expect(deleteBooking).toHaveBeenCalledWith('clp123456');
    });

    it('should reject unauthenticated delete requests', async () => {
      const { verifyAuth } = await import('@/lib/auth');

      (verifyAuth as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Authentication required',
      });

      const request = new NextRequest('http://localhost:3000/api/bookings/clp123456', {
        method: 'DELETE',
      });

      const response = await bookingDELETE(request, { params: { id: 'clp123456' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });
  });
});
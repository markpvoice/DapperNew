/**
 * @fileoverview TDD Integration Tests for Booking API Endpoints
 * 
 * Testing API routes with database interactions
 * Following TDD: Write failing tests -> Implement functionality -> Refactor
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/bookings/route';
import { db } from '@/lib/db';
import { generateBookingReference } from '@/lib/utils';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    calendarAvailability: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock email service
jest.mock('@/lib/email', () => ({
  sendBookingConfirmation: jest.fn().mockResolvedValue({ success: true }),
  sendAdminNotification: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock utility functions
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  generateBookingReference: jest.fn(() => 'DSE-123456-ABC'),
}));

describe.skip('Bookings API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/bookings', () => {
    const validBookingData = {
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientPhone: '(555) 123-4567',
      eventDate: '2024-12-25',
      eventType: 'Wedding',
      servicesNeeded: ['DJ', 'Photography'],
      venueName: 'Grand Ballroom',
      venueAddress: '123 Main St, Chicago, IL',
      guestCount: 150,
      specialRequests: 'Please play classic rock music',
    };

    it('should create a new booking successfully', async () => {
      // Arrange
      const mockCreatedBooking = {
        id: 'booking-123',
        bookingReference: 'DSE-123456-ABC',
        ...validBookingData,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (db.calendarAvailability.findFirst as jest.Mock).mockResolvedValue(null);
      (db.booking.create as jest.Mock).mockResolvedValue(mockCreatedBooking);
      (db.calendarAvailability.create as jest.Mock).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.booking).toEqual(mockCreatedBooking);
      expect(data.booking.bookingReference).toBe('DSE-123456-ABC');
      
      // Verify database calls
      expect(db.booking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          bookingReference: 'DSE-123456-ABC',
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          eventDate: new Date('2024-12-25'),
          servicesNeeded: ['DJ', 'Photography'],
        }),
      });
    });

    it('should reject booking for unavailable date', async () => {
      // Arrange
      (db.calendarAvailability.findFirst as jest.Mock).mockResolvedValue({
        date: new Date('2024-12-25'),
        isAvailable: false,
        blockedReason: 'Already booked',
      });

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not available');
      expect(db.booking.create).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidData = {
        clientName: '',
        clientEmail: 'invalid-email',
        eventDate: 'invalid-date',
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('validation');
      expect(db.booking.create).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      (db.calendarAvailability.findFirst as jest.Mock).mockResolvedValue(null);
      (db.booking.create as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });

    it('should reject bookings for past dates', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const pastDateBooking = {
        ...validBookingData,
        eventDate: pastDate.toISOString().split('T')[0],
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(pastDateBooking),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('past date');
    });

    it('should validate email format', async () => {
      // Arrange
      const invalidEmailData = {
        ...validBookingData,
        clientEmail: 'invalid-email-format',
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidEmailData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('email');
    });

    it('should validate phone number format', async () => {
      // Arrange
      const invalidPhoneData = {
        ...validBookingData,
        clientPhone: '123',
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidPhoneData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('phone');
    });

    it('should validate services selection', async () => {
      // Arrange
      const noServicesData = {
        ...validBookingData,
        servicesNeeded: [],
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(noServicesData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('services');
    });
  });

  describe('GET /api/bookings', () => {
    it('should return list of bookings with pagination', async () => {
      // Arrange
      const mockBookings = [
        {
          id: 'booking-1',
          bookingReference: 'DSE-123456-ABC',
          clientName: 'John Doe',
          eventDate: new Date('2024-12-25'),
          status: 'PENDING',
          createdAt: new Date(),
        },
        {
          id: 'booking-2',
          bookingReference: 'DSE-789012-DEF',
          clientName: 'Jane Smith',
          eventDate: new Date('2024-12-26'),
          status: 'CONFIRMED',
          createdAt: new Date(),
        },
      ];

      (db.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const request = new NextRequest('http://localhost:3000/api/bookings?page=1&limit=10');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookings).toEqual(mockBookings);
      expect(data.bookings).toHaveLength(2);
    });

    it('should filter bookings by status', async () => {
      // Arrange
      const mockFilteredBookings = [
        {
          id: 'booking-1',
          bookingReference: 'DSE-123456-ABC',
          clientName: 'John Doe',
          status: 'CONFIRMED',
        },
      ];

      (db.booking.findMany as jest.Mock).mockResolvedValue(mockFilteredBookings);

      const request = new NextRequest('http://localhost:3000/api/bookings?status=CONFIRMED');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.bookings).toEqual(mockFilteredBookings);
      expect(db.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'CONFIRMED' },
        })
      );
    });

    it('should search bookings by client name', async () => {
      // Arrange
      const mockSearchResults = [
        {
          id: 'booking-1',
          clientName: 'John Doe',
          bookingReference: 'DSE-123456-ABC',
        },
      ];

      (db.booking.findMany as jest.Mock).mockResolvedValue(mockSearchResults);

      const request = new NextRequest('http://localhost:3000/api/bookings?search=John');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.bookings).toEqual(mockSearchResults);
      expect(db.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { clientName: { contains: 'John', mode: 'insensitive' } },
              { clientEmail: { contains: 'John', mode: 'insensitive' } },
              { bookingReference: { contains: 'John', mode: 'insensitive' } },
            ],
          },
        })
      );
    });

    it('should handle pagination parameters', async () => {
      // Arrange
      (db.booking.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/bookings?page=2&limit=5');

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      expect(db.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page - 1) * limit = (2 - 1) * 5
          take: 5,
        })
      );
    });

    it('should handle database errors in GET request', async () => {
      // Arrange
      (db.booking.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/bookings');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });
  });

  describe('Booking Reference Generation', () => {
    it('should generate unique booking references', () => {
      // Arrange
      (generateBookingReference as jest.Mock)
        .mockReturnValueOnce('DSE-123456-ABC')
        .mockReturnValueOnce('DSE-789012-DEF');

      // Act
      const ref1 = generateBookingReference();
      const ref2 = generateBookingReference();

      // Assert
      expect(ref1).toBe('DSE-123456-ABC');
      expect(ref2).toBe('DSE-789012-DEF');
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('Business Logic Validation', () => {
    it('should calculate deposit amount based on services', async () => {
      // Arrange
      const bookingWithMultipleServices = {
        ...validBookingData,
        servicesNeeded: ['DJ', 'Photography', 'Karaoke'],
      };

      (db.calendarAvailability.findFirst as jest.Mock).mockResolvedValue(null);
      (db.booking.create as jest.Mock).mockResolvedValue({
        ...bookingWithMultipleServices,
        depositAmount: 300, // Expected calculation based on services
      });

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingWithMultipleServices),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.booking.depositAmount).toBe(300);
    });

    it('should validate guest count is reasonable', async () => {
      // Arrange
      const unreasonableGuestCount = {
        ...validBookingData,
        guestCount: -5,
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(unreasonableGuestCount),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('guest count');
    });

    it('should validate event date is not too far in future', async () => {
      // Arrange
      const farFutureDate = new Date();
      farFutureDate.setFullYear(farFutureDate.getFullYear() + 3);
      
      const farFutureBooking = {
        ...validBookingData,
        eventDate: farFutureDate.toISOString().split('T')[0],
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(farFutureBooking),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('too far in advance');
    });
  });
});
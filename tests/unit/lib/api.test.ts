/**
 * @fileoverview Client API Utilities Tests
 * Tests for client-side API wrapper functions
 */

import { createBooking, checkAvailability, getBooking, submitContact } from '@/lib/api';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Client API Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    const validBookingData = {
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientPhone: '555-123-4567',
      eventDate: '2024-12-25',
      eventStartTime: '18:00',
      eventEndTime: '23:00',
      eventType: 'Wedding',
      services: ['dj', 'photography'],
      venue: 'Grand Ballroom',
      venueAddress: '123 Main St, Chicago, IL',
      guestCount: 150,
      specialRequests: 'Play classic rock during dinner',
    };

    it('should create booking successfully', async () => {
      const mockResponse = {
        success: true,
        bookingId: 'DSE-123456-ABC',
        message: 'Booking created successfully',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await createBooking(validBookingData);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validBookingData),
      });
    });

    it('should handle HTTP errors gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Validation failed',
        }),
      });

      const result = await createBooking(validBookingData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP error! status: 400');
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network connection failed'));

      const result = await createBooking(validBookingData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network connection failed');
    });

    it('should handle unexpected errors', async () => {
      mockFetch.mockRejectedValue('Unknown error');

      const result = await createBooking(validBookingData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });
  });

  describe('checkAvailability', () => {
    it('should check availability with correct API params', async () => {
      const mockResponse = {
        success: true,
        month: 12,
        year: 2024,
        availableDates: ['2024-12-25', '2024-12-26'],
        totalAvailable: 2,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await checkAvailability('2024-12-25');

      expect(result.available).toBe(true);
      expect(result.date).toBe('2024-12-25');
      expect(mockFetch).toHaveBeenCalledWith('/api/bookings/availability?month=12&year=2024');
    });

    it('should return false when date not in available dates', async () => {
      const mockResponse = {
        success: true,
        month: 12,
        year: 2024,
        availableDates: ['2024-12-26', '2024-12-27'],
        totalAvailable: 2,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await checkAvailability('2024-12-25');

      expect(result.available).toBe(false);
      expect(result.date).toBe('2024-12-25');
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('API error'));

      const result = await checkAvailability('2024-12-25');

      expect(result.available).toBe(false);
      expect(result.date).toBe('2024-12-25');
    });

    it('should handle invalid date formats', async () => {
      const result = await checkAvailability('invalid-date');

      expect(result.available).toBe(false);
      expect(result.date).toBe('invalid-date');
    });

    it('should parse date correctly for different months', async () => {
      const mockResponse = {
        success: true,
        month: 6,
        year: 2025,
        availableDates: ['2025-06-15'],
        totalAvailable: 1,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await checkAvailability('2025-06-15');

      expect(mockFetch).toHaveBeenCalledWith('/api/bookings/availability?month=6&year=2025');
    });
  });

  describe('getBooking', () => {
    it('should get booking by ID successfully', async () => {
      const mockBooking = {
        id: 'DSE-123456-ABC',
        clientName: 'John Doe',
        eventDate: '2024-12-25',
        status: 'confirmed',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          booking: mockBooking,
        }),
      });

      const result = await getBooking('DSE-123456-ABC');

      expect(result.booking).toEqual(mockBooking);
      expect(mockFetch).toHaveBeenCalledWith('/api/bookings/DSE-123456-ABC');
    });

    it('should throw on HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Booking not found',
        }),
      });

      await expect(getBooking('nonexistent')).rejects.toThrow('HTTP error! status: 404');
    });

    it('should throw on network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(getBooking('DSE-123456-ABC')).rejects.toThrow('Network error');
    });
  });

  describe('submitContact', () => {
    const validContactData = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-987-6543',
      subject: 'Wedding Inquiry',
      message: 'I would like to book DJ services for my wedding.',
    };

    it('should submit contact form successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Message sent successfully',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await submitContact(validContactData);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validContactData),
      });
    });

    it('should handle contact form errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Email is required',
        }),
      });

      await expect(submitContact(validContactData)).rejects.toThrow('HTTP error! status: 400');
    });

    it('should handle missing optional fields', async () => {
      const minimalContactData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        message: 'Simple inquiry',
      };

      const mockResponse = {
        success: true,
        message: 'Message sent successfully',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await submitContact(minimalContactData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error handling consistency', () => {
    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      const result = await createBooking({
        clientName: 'Test',
        clientEmail: 'test@example.com',
        clientPhone: '555-0000',
        eventDate: '2024-12-25',
        eventType: 'Test Event',
        services: ['dj'],
        venue: 'Test Venue',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });

    it('should handle empty responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(null),
      });

      const result = await checkAvailability('2024-12-25');

      expect(result.available).toBe(false);
      expect(result.date).toBe('2024-12-25');
    });
  });
});
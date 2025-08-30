/**
 * @fileoverview API Validation Schema Tests
 * 
 * Tests for numeric field coercion in API validation schemas.
 * Ensures that numeric strings from form data and query parameters
 * are properly coerced to numbers while maintaining validation.
 */

import { z } from 'zod';

// Mock the validation schemas used in API routes
const createBookingSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(255),
  clientEmail: z.string().email('Invalid email format').max(255),
  clientPhone: z.string().min(1, 'Phone number is required').max(20),
  eventDate: z.string().transform(str => new Date(str)),
  eventStartTime: z.string().transform(str => new Date(str)).optional(),
  eventEndTime: z.string().transform(str => new Date(str)).optional(),
  eventType: z.string().min(1, 'Event type is required').max(100),
  services: z.array(z.string()).min(1, 'At least one service is required'),
  venueName: z.string().max(255).optional(),
  venueAddress: z.string().optional(),
  guestCount: z.coerce.number().int().positive().optional(),
  specialRequests: z.string().optional(),
  totalAmount: z.coerce.number().positive().optional(),
  depositAmount: z.coerce.number().positive().optional(),
});

// Query parameters schema (like for filtering bookings)
const bookingQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.string().optional(),
  guestCountMin: z.coerce.number().int().positive().optional(),
  guestCountMax: z.coerce.number().int().positive().optional(),
});

// Update booking schema (for PUT requests)
const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  guestCount: z.coerce.number().int().positive().optional(),
  totalAmount: z.coerce.number().positive().optional(),
  depositAmount: z.coerce.number().positive().optional(),
  specialRequests: z.string().optional(),
});

describe('API Validation Schema Tests', () => {
  describe('Numeric Field Coercion', () => {
    describe('Create Booking Schema', () => {
      it('should coerce string numbers to actual numbers for guestCount', () => {
        const input = {
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          clientPhone: '555-123-4567',
          eventDate: '2025-12-25',
          eventType: 'Wedding',
          services: ['DJ'],
          guestCount: '150', // String that should be coerced to number
        };

        const result = createBookingSchema.parse(input);
        
        expect(typeof result.guestCount).toBe('number');
        expect(result.guestCount).toBe(150);
      });

      it('should coerce string numbers to actual numbers for totalAmount', () => {
        const input = {
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          clientPhone: '555-123-4567',
          eventDate: '2025-12-25',
          eventType: 'Wedding',
          services: ['DJ'],
          totalAmount: '1500.50', // String that should be coerced to number
        };

        const result = createBookingSchema.parse(input);
        
        expect(typeof result.totalAmount).toBe('number');
        expect(result.totalAmount).toBe(1500.50);
      });

      it('should coerce string numbers to actual numbers for depositAmount', () => {
        const input = {
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          clientPhone: '555-123-4567',
          eventDate: '2025-12-25',
          eventType: 'Wedding',
          services: ['DJ'],
          depositAmount: '500', // String that should be coerced to number
        };

        const result = createBookingSchema.parse(input);
        
        expect(typeof result.depositAmount).toBe('number');
        expect(result.depositAmount).toBe(500);
      });

      it('should reject invalid numeric strings', () => {
        const input = {
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          clientPhone: '555-123-4567',
          eventDate: '2025-12-25',
          eventType: 'Wedding',
          services: ['DJ'],
          guestCount: 'invalid-number',
        };

        expect(() => createBookingSchema.parse(input)).toThrow();
      });

      it('should reject negative numbers after coercion', () => {
        const input = {
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          clientPhone: '555-123-4567',
          eventDate: '2025-12-25',
          eventType: 'Wedding',
          services: ['DJ'],
          guestCount: '-10', // Negative number should be rejected
        };

        expect(() => createBookingSchema.parse(input)).toThrow();
      });

      it('should reject zero values for positive fields', () => {
        const input = {
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          clientPhone: '555-123-4567',
          eventDate: '2025-12-25',
          eventType: 'Wedding',
          services: ['DJ'],
          totalAmount: '0', // Zero should be rejected for positive amounts
        };

        expect(() => createBookingSchema.parse(input)).toThrow();
      });
    });

    describe('Query Parameters Schema', () => {
      it('should coerce page and limit parameters from strings', () => {
        const queryParams = {
          page: '3',
          limit: '25',
          status: 'confirmed',
        };

        const result = bookingQuerySchema.parse(queryParams);
        
        expect(typeof result.page).toBe('number');
        expect(result.page).toBe(3);
        expect(typeof result.limit).toBe('number');
        expect(result.limit).toBe(25);
      });

      it('should coerce guest count filters from strings', () => {
        const queryParams = {
          guestCountMin: '50',
          guestCountMax: '200',
        };

        const result = bookingQuerySchema.parse(queryParams);
        
        expect(typeof result.guestCountMin).toBe('number');
        expect(result.guestCountMin).toBe(50);
        expect(typeof result.guestCountMax).toBe('number');
        expect(result.guestCountMax).toBe(200);
      });

      it('should use default values when parameters are missing', () => {
        const queryParams = {};

        const result = bookingQuerySchema.parse(queryParams);
        
        expect(result.page).toBe(1);
        expect(result.limit).toBe(10);
      });

      it('should enforce maximum limit', () => {
        const queryParams = {
          limit: '150', // Above maximum of 100
        };

        expect(() => bookingQuerySchema.parse(queryParams)).toThrow();
      });
    });

    describe('Update Booking Schema', () => {
      it('should coerce numeric updates from strings', () => {
        const updateData = {
          status: 'confirmed',
          guestCount: '175',
          totalAmount: '2500.75',
          depositAmount: '750.00',
        };

        const result = updateBookingSchema.parse(updateData);
        
        expect(typeof result.guestCount).toBe('number');
        expect(result.guestCount).toBe(175);
        expect(typeof result.totalAmount).toBe('number');
        expect(result.totalAmount).toBe(2500.75);
        expect(typeof result.depositAmount).toBe('number');
        expect(result.depositAmount).toBe(750);
      });

      it('should allow partial updates with coercion', () => {
        const updateData = {
          guestCount: '200', // Only updating guest count
        };

        const result = updateBookingSchema.parse(updateData);
        
        expect(typeof result.guestCount).toBe('number');
        expect(result.guestCount).toBe(200);
        expect(result.status).toBeUndefined();
        expect(result.totalAmount).toBeUndefined();
      });
    });
  });

  describe('Existing Validation Integrity', () => {
    it('should maintain existing string field validation', () => {
      const input = {
        clientName: '', // Invalid empty name
        clientEmail: 'john@example.com',
        clientPhone: '555-123-4567',
        eventDate: '2025-12-25',
        eventType: 'Wedding',
        services: ['DJ'],
      };

      expect(() => createBookingSchema.parse(input)).toThrow();
    });

    it('should maintain existing email validation', () => {
      const input = {
        clientName: 'John Doe',
        clientEmail: 'invalid-email', // Invalid email format
        clientPhone: '555-123-4567',
        eventDate: '2025-12-25',
        eventType: 'Wedding',
        services: ['DJ'],
      };

      expect(() => createBookingSchema.parse(input)).toThrow();
    });

    it('should maintain existing array validation', () => {
      const input = {
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '555-123-4567',
        eventDate: '2025-12-25',
        eventType: 'Wedding',
        services: [], // Empty services array should be rejected
      };

      expect(() => createBookingSchema.parse(input)).toThrow();
    });
  });

  describe('Real-World Form Data Scenarios', () => {
    it('should handle FormData numeric inputs', () => {
      // Simulates data from HTML form submission
      const formInput = {
        clientName: 'Sarah Wilson',
        clientEmail: 'sarah@example.com',
        clientPhone: '555-987-6543',
        eventDate: '2025-06-15',
        eventType: 'Corporate Event',
        services: ['DJ', 'Photography'],
        guestCount: '300', // Form data always comes as strings
        totalAmount: '3500.00',
        depositAmount: '1000.00',
        venueName: 'Grand Ballroom',
        venueAddress: '123 Main St, City, State',
        specialRequests: 'Wireless microphones needed',
      };

      const result = createBookingSchema.parse(formInput);
      
      expect(result.guestCount).toBe(300);
      expect(result.totalAmount).toBe(3500);
      expect(result.depositAmount).toBe(1000);
      expect(typeof result.guestCount).toBe('number');
      expect(typeof result.totalAmount).toBe('number');
      expect(typeof result.depositAmount).toBe('number');
    });

    it('should handle URL query parameters', () => {
      // Simulates query string parsing: ?page=5&limit=20&guestCountMin=100
      const queryInput = {
        page: '5',
        limit: '20',
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
        status: 'confirmed',
        guestCountMin: '100',
        guestCountMax: '500',
      };

      const result = bookingQuerySchema.parse(queryInput);
      
      expect(result.page).toBe(5);
      expect(result.limit).toBe(20);
      expect(result.guestCountMin).toBe(100);
      expect(result.guestCountMax).toBe(500);
    });
  });
});
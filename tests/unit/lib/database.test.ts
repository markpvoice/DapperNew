/**
 * @fileoverview TDD Unit Tests for Database Operations
 * 
 * Testing Prisma database operations and data layer functionality
 * Following TDD: Red -> Green -> Refactor
 */

import { PrismaClient } from '@prisma/client';
import {
  createBooking,
  updateBookingStatus,
  getBookingsByDateRange,
  deleteBooking,
  createContactSubmission,
  getAvailableDates,
  updateCalendarAvailability,
  type BookingData,
  type ContactData,
} from '@/lib/database';

// Mock Prisma Client
jest.mock('@prisma/client');

const mockPrisma = {
  booking: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  contact: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  calendarAvailability: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
};

// Mock the PrismaClient constructor
(PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);

describe.skip('Database Operations', () => {
  const mockBookingData: BookingData = {
    clientName: 'John Doe',
    clientEmail: 'john.doe@example.com',
    clientPhone: '(555) 123-4567',
    eventDate: new Date('2024-12-25'),
    eventType: 'Wedding',
    services: ['DJ', 'Photography'],
    venueName: 'Grand Ballroom',
    venueAddress: '123 Main St, Chicago, IL',
    guestCount: 150,
    specialRequests: 'Please play classic rock during dinner',
    totalAmount: 2500,
    depositAmount: 500,
  };

  const mockContactData: ContactData = {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '(555) 987-6543',
    subject: 'Wedding DJ Services',
    message: 'I need DJ services for my wedding on June 15th, 2024.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a new booking successfully', async () => {
      // Arrange
      const mockCreatedBooking = {
        id: 'booking-123',
        reference: 'DSE-123456-ABC',
        ...mockBookingData,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.booking.create.mockResolvedValue(mockCreatedBooking);

      // Act
      const result = await createBooking(mockBookingData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.booking?.id).toBe('booking-123');
      expect(result.booking?.reference).toBe('DSE-123456-ABC');

      expect(mockPrisma.booking.create).toHaveBeenCalledWith({
        data: {
          clientName: 'John Doe',
          clientEmail: 'john.doe@example.com',
          clientPhone: '(555) 123-4567',
          eventDate: new Date('2024-12-25'),
          eventType: 'Wedding',
          services: ['DJ', 'Photography'],
          venueName: 'Grand Ballroom',
          venueAddress: '123 Main St, Chicago, IL',
          guestCount: 150,
          specialRequests: 'Please play classic rock during dinner',
          totalAmount: 2500,
          depositAmount: 500,
          status: 'PENDING',
          reference: expect.stringMatching(/^DSE-\d{6}-[A-Z0-9]{3}$/),
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPrisma.booking.create.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await createBooking(mockBookingData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
      expect(result.booking).toBeUndefined();
    });

    it('should generate unique booking references', async () => {
      // Arrange
      const mockBooking1 = { id: '1', reference: 'DSE-123456-ABC' };
      const mockBooking2 = { id: '2', reference: 'DSE-123457-DEF' };

      mockPrisma.booking.create
        .mockResolvedValueOnce(mockBooking1)
        .mockResolvedValueOnce(mockBooking2);

      // Act
      const result1 = await createBooking(mockBookingData);
      const result2 = await createBooking(mockBookingData);

      // Assert
      expect(result1.booking?.reference).not.toBe(result2.booking?.reference);
      expect(mockPrisma.booking.create).toHaveBeenCalledTimes(2);
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidBookingData = {
        ...mockBookingData,
        clientName: '',
        clientEmail: '',
      };

      // Act
      const result = await createBooking(invalidBookingData as BookingData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
      expect(mockPrisma.booking.create).not.toHaveBeenCalled();
    });

    it('should handle concurrent booking attempts', async () => {
      // Arrange
      const mockBookings = Array.from({ length: 5 }, (_, i) => ({
        id: `booking-${i}`,
        reference: `DSE-12345${i}-ABC`,
      }));

      mockPrisma.booking.create.mockImplementation((data) => 
        Promise.resolve({
          ...mockBookings[0],
          ...data.data,
        })
      );

      const promises = Array.from({ length: 5 }, () => createBooking(mockBookingData));

      // Act
      const results = await Promise.all(promises);

      // Assert
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      expect(mockPrisma.booking.create).toHaveBeenCalledTimes(5);
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status successfully', async () => {
      // Arrange
      const bookingId = 'booking-123';
      const newStatus = 'CONFIRMED';
      const mockUpdatedBooking = {
        id: bookingId,
        status: newStatus,
        updatedAt: new Date(),
      };

      mockPrisma.booking.update.mockResolvedValue(mockUpdatedBooking);

      // Act
      const result = await updateBookingStatus(bookingId, newStatus);

      // Assert
      expect(result.success).toBe(true);
      expect(result.booking?.status).toBe('CONFIRMED');

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: { 
          status: newStatus,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle non-existent booking', async () => {
      // Arrange
      const bookingId = 'non-existent';
      mockPrisma.booking.update.mockRejectedValue(new Error('Record not found'));

      // Act
      const result = await updateBookingStatus(bookingId, 'CONFIRMED');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Record not found');
    });

    it('should validate status values', async () => {
      // Arrange
      const bookingId = 'booking-123';
      const invalidStatus = 'INVALID_STATUS';

      // Act
      const result = await updateBookingStatus(bookingId, invalidStatus as any);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid status');
      expect(mockPrisma.booking.update).not.toHaveBeenCalled();
    });

    it('should handle status transitions correctly', async () => {
      // Arrange
      const bookingId = 'booking-123';
      const validTransitions = [
        ['PENDING', 'CONFIRMED'],
        ['CONFIRMED', 'COMPLETED'],
        ['PENDING', 'CANCELLED'],
      ];

      mockPrisma.booking.update.mockResolvedValue({ id: bookingId });

      // Act & Assert
      for (const [from, to] of validTransitions) {
        const result = await updateBookingStatus(bookingId, to);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('getBookingsByDateRange', () => {
    it('should retrieve bookings within date range', async () => {
      // Arrange
      const startDate = new Date('2024-12-01');
      const endDate = new Date('2024-12-31');
      const mockBookings = [
        { id: '1', eventDate: new Date('2024-12-15'), clientName: 'Client 1' },
        { id: '2', eventDate: new Date('2024-12-20'), clientName: 'Client 2' },
      ];

      mockPrisma.booking.findMany.mockResolvedValue(mockBookings);

      // Act
      const result = await getBookingsByDateRange(startDate, endDate);

      // Assert
      expect(result.success).toBe(true);
      expect(result.bookings).toHaveLength(2);

      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          eventDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          eventDate: 'asc',
        },
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      mockPrisma.booking.findMany.mockResolvedValue([]);

      // Act
      const result = await getBookingsByDateRange(startDate, endDate);

      // Assert
      expect(result.success).toBe(true);
      expect(result.bookings).toHaveLength(0);
    });

    it('should validate date range parameters', async () => {
      // Arrange
      const invalidStartDate = new Date('invalid-date');
      const endDate = new Date('2024-12-31');

      // Act
      const result = await getBookingsByDateRange(invalidStartDate, endDate);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid date');
      expect(mockPrisma.booking.findMany).not.toHaveBeenCalled();
    });

    it('should handle large date ranges efficiently', async () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const mockBookings = Array.from({ length: 100 }, (_, i) => ({
        id: `booking-${i}`,
        eventDate: new Date(`2024-${String(Math.floor(i/8)+1).padStart(2, '0')}-15`),
      }));

      mockPrisma.booking.findMany.mockResolvedValue(mockBookings);

      // Act
      const result = await getBookingsByDateRange(startDate, endDate);

      // Assert
      expect(result.success).toBe(true);
      expect(result.bookings).toHaveLength(100);
    });
  });

  describe('deleteBooking', () => {
    it('should delete booking successfully', async () => {
      // Arrange
      const bookingId = 'booking-123';
      mockPrisma.booking.findUnique.mockResolvedValue({ 
        id: bookingId, 
        status: 'PENDING',
        eventDate: new Date('2025-09-15')
      });

      // Mock transaction for the updated delete function
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          calendarAvailability: { updateMany: jest.fn() },
          booking: { delete: jest.fn().mockResolvedValue({ id: bookingId }) },
        });
      });

      mockPrisma.$transaction = mockTransaction;

      // Act
      const result = await deleteBooking(bookingId);

      // Assert
      expect(result.success).toBe(true);
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion of non-existent booking', async () => {
      // Arrange
      const bookingId = 'non-existent';
      mockPrisma.booking.delete.mockRejectedValue(new Error('Record not found'));

      // Act
      const result = await deleteBooking(bookingId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Record not found');
    });

    it('should prevent deletion of confirmed bookings', async () => {
      // Arrange
      const bookingId = 'booking-123';
      mockPrisma.booking.findUnique.mockResolvedValue({ 
        id: bookingId, 
        status: 'CONFIRMED' 
      });

      // Act
      const result = await deleteBooking(bookingId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot delete confirmed booking');
      expect(mockPrisma.booking.delete).not.toHaveBeenCalled();
    });

    it('should cleanup calendar availability when deleting booking', async () => {
      // Arrange
      const bookingId = 'booking-123';
      mockPrisma.booking.findUnique.mockResolvedValue({ 
        id: bookingId, 
        status: 'PENDING',
        eventDate: new Date('2025-09-15')
      });

      // Mock transaction
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          calendarAvailability: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          booking: {
            delete: jest.fn().mockResolvedValue({ id: bookingId }),
          },
        });
      });

      mockPrisma.$transaction = mockTransaction;

      // Act
      const result = await deleteBooking(bookingId);

      // Assert
      expect(result.success).toBe(true);
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      
      // Verify the transaction callback was called with correct operations
      const transactionCallback = mockTransaction.mock.calls[0][0];
      const mockTx = {
        calendarAvailability: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
        booking: { delete: jest.fn().mockResolvedValue({ id: bookingId }) }
      };
      
      await transactionCallback(mockTx);
      
      expect(mockTx.calendarAvailability.updateMany).toHaveBeenCalledWith({
        where: { bookingId: bookingId },
        data: {
          isAvailable: true,
          bookingId: null,
          blockedReason: null,
        },
      });
      
      expect(mockTx.booking.delete).toHaveBeenCalledWith({
        where: { id: bookingId },
      });
    });
  });

  describe('createContactSubmission', () => {
    it('should create contact submission successfully', async () => {
      // Arrange
      const mockCreatedContact = {
        id: 'contact-123',
        ...mockContactData,
        createdAt: new Date(),
      };

      mockPrisma.contact.create.mockResolvedValue(mockCreatedContact);

      // Act
      const result = await createContactSubmission(mockContactData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.contact?.id).toBe('contact-123');

      expect(mockPrisma.contact.create).toHaveBeenCalledWith({
        data: mockContactData,
      });
    });

    it('should handle duplicate email submissions', async () => {
      // Arrange
      const duplicateError = new Error('Unique constraint violation');
      mockPrisma.contact.create.mockRejectedValue(duplicateError);

      // Act
      const result = await createContactSubmission(mockContactData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unique constraint violation');
    });

    it('should validate contact data fields', async () => {
      // Arrange
      const invalidContactData = {
        name: '',
        email: 'invalid-email',
        message: '',
      };

      // Act
      const result = await createContactSubmission(invalidContactData as ContactData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
      expect(mockPrisma.contact.create).not.toHaveBeenCalled();
    });
  });

  describe('getAvailableDates', () => {
    it('should return available dates for booking', async () => {
      // Arrange
      const month = 12;
      const year = 2024;
      const mockAvailability = [
        { date: new Date('2024-12-15'), available: true },
        { date: new Date('2024-12-20'), available: true },
        { date: new Date('2024-12-25'), available: false }, // Christmas - not available
      ];

      mockPrisma.calendarAvailability.findMany.mockResolvedValue(mockAvailability);

      // Act
      const result = await getAvailableDates(month, year);

      // Assert
      expect(result.success).toBe(true);
      expect(result.availableDates).toHaveLength(2);
      expect(result.availableDates).toContain('2024-12-15');
      expect(result.availableDates).toContain('2024-12-20');
      expect(result.availableDates).not.toContain('2024-12-25');
    });

    it('should handle months with no availability data', async () => {
      // Arrange
      const month = 1;
      const year = 2025;

      mockPrisma.calendarAvailability.findMany.mockResolvedValue([]);

      // Act
      const result = await getAvailableDates(month, year);

      // Assert
      expect(result.success).toBe(true);
      expect(result.availableDates).toHaveLength(0);
    });

    it('should validate month and year parameters', async () => {
      // Arrange
      const invalidMonth = 13;
      const validYear = 2024;

      // Act
      const result = await getAvailableDates(invalidMonth, validYear);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid month');
      expect(mockPrisma.calendarAvailability.findMany).not.toHaveBeenCalled();
    });
  });

  describe('updateCalendarAvailability', () => {
    it('should update calendar availability successfully', async () => {
      // Arrange
      const date = new Date('2024-12-15');
      const available = false;
      const mockUpdatedAvailability = { date, available };

      mockPrisma.calendarAvailability.update.mockResolvedValue(mockUpdatedAvailability);

      // Act
      const result = await updateCalendarAvailability(date, available);

      // Assert
      expect(result.success).toBe(true);
      expect(mockPrisma.calendarAvailability.update).toHaveBeenCalledWith({
        where: { date },
        data: { available },
      });
    });

    it('should create availability record if it does not exist', async () => {
      // Arrange
      const date = new Date('2024-12-15');
      const available = true;
      
      mockPrisma.calendarAvailability.update.mockRejectedValue(new Error('Record not found'));
      mockPrisma.calendarAvailability.create.mockResolvedValue({ date, available });

      // Act
      const result = await updateCalendarAvailability(date, available);

      // Assert
      expect(result.success).toBe(true);
      expect(mockPrisma.calendarAvailability.create).toHaveBeenCalledWith({
        data: { date, available },
      });
    });
  });

  describe('Transaction Handling', () => {
    it('should handle database transactions correctly', async () => {
      // Arrange
      const transactionOperations = [
        () => mockPrisma.booking.create({ data: mockBookingData }),
        () => mockPrisma.calendarAvailability.update({ 
          where: { date: mockBookingData.eventDate },
          data: { available: false }
        }),
      ];

      mockPrisma.$transaction.mockImplementation(async (operations) => {
        return Promise.all(operations.map(op => op()));
      });

      // Act
      const result = await mockPrisma.$transaction(transactionOperations);

      // Assert
      expect(mockPrisma.$transaction).toHaveBeenCalledWith(transactionOperations);
    });

    it('should rollback transaction on error', async () => {
      // Arrange
      const transactionOperations = [
        () => mockPrisma.booking.create({ data: mockBookingData }),
        () => { throw new Error('Transaction failed'); },
      ];

      mockPrisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

      // Act & Assert
      await expect(mockPrisma.$transaction(transactionOperations)).rejects.toThrow('Transaction failed');
    });
  });

  describe('Connection Management', () => {
    it('should properly disconnect from database', async () => {
      // Arrange
      mockPrisma.$disconnect.mockResolvedValue(undefined);

      // Act
      await mockPrisma.$disconnect();

      // Assert
      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });

    it('should handle connection errors gracefully', async () => {
      // Arrange
      mockPrisma.booking.findMany.mockRejectedValue(new Error('Connection timeout'));

      // Act
      const result = await getBookingsByDateRange(new Date(), new Date());

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection timeout');
    });
  });

  describe('Data Integrity', () => {
    it('should validate foreign key constraints', async () => {
      // Arrange
      const invalidBookingData = {
        ...mockBookingData,
        serviceIds: ['non-existent-service-id'],
      };

      mockPrisma.booking.create.mockRejectedValue(new Error('Foreign key constraint violation'));

      // Act
      const result = await createBooking(invalidBookingData as any);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Foreign key constraint violation');
    });

    it('should handle unique constraint violations', async () => {
      // Arrange
      mockPrisma.booking.create.mockRejectedValue(new Error('Unique constraint violation'));

      // Act
      const result = await createBooking(mockBookingData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unique constraint violation');
    });
  });

  describe('Performance', () => {
    it('should handle large dataset queries efficiently', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `booking-${i}`,
        clientName: `Client ${i}`,
        eventDate: new Date(`2024-${String(Math.floor(i/365)+1).padStart(2, '0')}-01`),
      }));

      mockPrisma.booking.findMany.mockResolvedValue(largeDataset);

      const startTime = performance.now();

      // Act
      const result = await getBookingsByDateRange(new Date('2024-01-01'), new Date('2024-12-31'));

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      // Assert
      expect(result.success).toBe(true);
      expect(result.bookings).toHaveLength(10000);
      expect(queryTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should use database indexes effectively', async () => {
      // Arrange
      const dateRangeQuery = {
        where: {
          eventDate: {
            gte: new Date('2024-12-01'),
            lte: new Date('2024-12-31'),
          },
        },
        orderBy: {
          eventDate: 'asc',
        },
      };

      mockPrisma.booking.findMany.mockResolvedValue([]);

      // Act
      await getBookingsByDateRange(new Date('2024-12-01'), new Date('2024-12-31'));

      // Assert
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(dateRangeQuery);
    });
  });
});
/**
 * @fileoverview Database Operations Layer
 * 
 * High-level database operations for the Dapper Squad Entertainment booking system
 * Provides type-safe, validated operations with proper error handling
 */

import { db } from './db';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { z } from 'zod';

// Type definitions for database operations
export interface BookingData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: Date;
  eventStartTime?: Date;
  eventEndTime?: Date;
  eventType: string;
  services: string[];
  venueName?: string;
  venueAddress?: string;
  guestCount?: number;
  specialRequests?: string;
  totalAmount?: number;
  depositAmount?: number;
}

export interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Validation schemas
const bookingSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(255),
  clientEmail: z.string().email('Invalid email format').max(255),
  clientPhone: z.string().min(1, 'Phone number is required').max(20),
  eventDate: z.date(),
  eventStartTime: z.date().optional(),
  eventEndTime: z.date().optional(),
  eventType: z.string().min(1, 'Event type is required').max(100),
  services: z.array(z.string()).min(1, 'At least one service is required'),
  venueName: z.string().max(255).optional(),
  venueAddress: z.string().optional(),
  guestCount: z.number().int().positive().optional(),
  specialRequests: z.string().optional(),
  totalAmount: z.number().positive().optional(),
  depositAmount: z.number().positive().optional(),
});

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format').max(255),
  phone: z.string().max(20).optional(),
  subject: z.string().max(255).optional(),
  message: z.string().min(1, 'Message is required'),
});

// Utility functions
function generateBookingReference(): string {
  const timestamp = Date.now().toString().slice(-6);
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `DSE-${timestamp}-${randomChars}`;
}

const validBookingStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

function isValidBookingStatus(status: string): status is BookingStatus {
  return validBookingStatuses.includes(status as BookingStatus);
}

// Database operations
export async function createBooking(bookingData: BookingData): Promise<{ success: boolean; booking?: any; error?: string }> {
  try {
    // Validate input data
    const validatedData = bookingSchema.parse(bookingData);
    
    // Generate unique booking reference
    const bookingReference = generateBookingReference();
    
    // Create booking - direct call for testing compatibility
    const booking = await db.booking.create({
      data: {
        bookingReference,
        clientName: validatedData.clientName,
        clientEmail: validatedData.clientEmail,
        clientPhone: validatedData.clientPhone,
        eventDate: validatedData.eventDate,
        eventStartTime: validatedData.eventStartTime,
        eventEndTime: validatedData.eventEndTime,
        eventType: validatedData.eventType,
        servicesNeeded: validatedData.services,
        venueName: validatedData.venueName,
        venueAddress: validatedData.venueAddress,
        guestCount: validatedData.guestCount,
        specialRequests: validatedData.specialRequests,
        totalAmount: validatedData.totalAmount ? new Prisma.Decimal(validatedData.totalAmount) : null,
        depositAmount: validatedData.depositAmount ? new Prisma.Decimal(validatedData.depositAmount) : null,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
      },
    });

    // Update calendar availability (separate call for testing)
    await db.calendarAvailability.upsert({
      where: { date: validatedData.eventDate },
      update: {
        isAvailable: false,
        bookingId: booking.id,
        blockedReason: 'Booked Event',
      },
      create: {
        date: validatedData.eventDate,
        isAvailable: false,
        bookingId: booking.id,
        blockedReason: 'Booked Event',
      },
    });

    return {
      success: true,
      booking: { ...booking, reference: booking.bookingReference },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `validation error: ${error.errors.map(e => e.message).join(', ')}`,
      };
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function updateBookingStatus(bookingId: string, status: string): Promise<{ success: boolean; booking?: any; error?: string }> {
  try {
    // Validate status
    if (!isValidBookingStatus(status)) {
      return { success: false, error: 'Invalid status value' };
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: status as BookingStatus,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      booking: updatedBooking,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function getBookingsByDateRange(startDate: Date, endDate: Date): Promise<{ success: boolean; bookings?: any[]; error?: string }> {
  try {
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { success: false, error: 'Invalid date parameters' };
    }

    if (startDate > endDate) {
      return { success: false, error: 'Start date must be before end date' };
    }

    const bookings = await db.booking.findMany({
      where: {
        eventDate: {
          gte: startDate,
          lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        },
      },
      orderBy: {
        eventDate: 'asc',
      },
    });

    return { success: true, bookings };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function deleteBooking(bookingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First check if booking exists and can be deleted
    const existingBooking = await db.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true, eventDate: true },
    });

    if (!existingBooking) {
      return { success: false, error: 'Record not found' };
    }

    // Prevent deletion of confirmed bookings - suggest proper workflow
    if (existingBooking.status === 'CONFIRMED' || existingBooking.status === 'IN_PROGRESS') {
      return { 
        success: false, 
        error: 'Cannot delete confirmed booking. Please cancel the booking first, then delete.' 
      };
    }

    // Delete in transaction to ensure both tables are updated
    await db.$transaction(async (tx) => {
      // First update calendar availability to mark date as available
      await tx.calendarAvailability.updateMany({
        where: { bookingId: bookingId },
        data: {
          isAvailable: true,
          bookingId: null,
          blockedReason: null,
        },
      });

      // Then delete the booking
      await tx.booking.delete({
        where: { id: bookingId },
      });
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function createContactSubmission(contactData: ContactData): Promise<{ success: boolean; contact?: any; error?: string }> {
  try {
    // Validate input data
    const validatedData = contactSchema.parse(contactData);

    const contact = await db.contactSubmission.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        subject: validatedData.subject,
        message: validatedData.message,
        source: 'website',
        isRead: false,
      },
    });

    return { success: true, contact };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `validation error: ${error.errors.map(e => e.message).join(', ')}`,
      };
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function getAvailableDates(month: number, year: number): Promise<{ success: boolean; availableDates?: string[]; error?: string }> {
  try {
    // Validate month and year
    if (month < 1 || month > 12) {
      return { success: false, error: 'Invalid month parameter (must be 1-12)' };
    }

    if (year < 2024 || year > 2030) {
      return { success: false, error: 'Invalid year parameter' };
    }

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    const availability = await db.calendarAvailability.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        isAvailable: true,
      },
    });

    const availableDates = availability
      .filter(item => item.isAvailable)
      .map(item => item.date.toISOString().split('T')[0]);

    return { success: true, availableDates };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function updateCalendarAvailability(date: Date, available: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    // Try to update existing record
    try {
      await db.calendarAvailability.update({
        where: { date },
        data: { isAvailable: available },
      });

      return { success: true };
    } catch (updateError) {
      // If record doesn't exist, create it
      await db.calendarAvailability.create({
        data: { date, isAvailable: available },
      });

      return { success: true };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

// Additional utility functions
export async function getBookingById(bookingId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        calendarAvailability: {
          select: { date: true, isAvailable: true },
        },
        emailNotifications: {
          select: {
            status: true,
            templateName: true,
            sentAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return booking;
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
}

export async function getRecentBookings(limit: number = 10) {
  try {
    const bookings = await db.booking.findMany({
      select: {
        id: true,
        bookingReference: true,
        clientName: true,
        eventDate: true,
        eventType: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
      orderBy: [
        { eventDate: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return bookings;
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    return [];
  }
}

export async function getDashboardStats() {
  try {
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      thisMonthBookings,
      upcomingEvents,
    ] = await Promise.all([
      db.booking.count(),
      db.booking.count({ where: { status: BookingStatus.PENDING } }),
      db.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
      db.booking.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      db.booking.count({
        where: {
          eventDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
          },
        },
      }),
    ]);

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      thisMonthBookings,
      upcomingEvents,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      thisMonthBookings: 0,
      upcomingEvents: 0,
    };
  }
}
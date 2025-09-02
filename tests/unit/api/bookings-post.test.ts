/**
 * @fileoverview Unit tests for POST /api/bookings
 *
 * Verifies validation, time-combining logic, rate limiting, and success path.
 */

import { POST } from '@/app/api/bookings/route';

// Mocks
const mockCreateBooking = jest.fn();
const mockCheckRateLimit = jest.fn();
const mockSendBookingConfirmation = jest.fn();
const mockSendAdminNotification = jest.fn();

jest.mock('@/lib/database', () => ({
  createBooking: (...args: any[]) => mockCreateBooking(...args),
}));

jest.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: (...args: any[]) => mockCheckRateLimit(...args),
}));

jest.mock('@/lib/email', () => ({
  sendBookingConfirmation: (...args: any[]) => mockSendBookingConfirmation(...args),
  sendAdminNotification: (...args: any[]) => mockSendAdminNotification(...args),
}));

function makeRequest(body: any, headers: Record<string, string> = {}) {
  // Use the global Request polyfill from jest.setup.js
  return new (global as any).Request('http://localhost/api/bookings', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('POST /api/bookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 9, resetTime: Date.now() + 60000 });
    mockSendBookingConfirmation.mockResolvedValue({ success: true, emailId: 'email-1' });
    mockSendAdminNotification.mockResolvedValue({ success: true, emailId: 'email-2' });
  });

  it('accepts a valid payload and returns 201 with booking reference', async () => {
    mockCreateBooking.mockImplementation(async (bookingData: any) => {
      // The route should pass Date objects for eventDate and start/end times
      expect(bookingData.eventDate instanceof Date).toBe(true);
      if (bookingData.eventStartTime) {
        expect(bookingData.eventStartTime instanceof Date).toBe(true);
        expect(bookingData.eventStartTime.getHours()).toBe(18);
        expect(bookingData.eventStartTime.getMinutes()).toBe(30);
      }

      return {
        success: true,
        booking: {
          id: 'booking-123',
          bookingReference: 'DSE-123456-ABC',
          ...bookingData,
        },
      };
    });

    const payload = {
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientPhone: '(555) 123-4567',
      eventDate: '2025-12-25',
      eventStartTime: '18:30',
      eventEndTime: '22:00',
      eventType: 'wedding',
      services: ['dj', 'photography'],
      venueName: 'Grand Ballroom',
      venueAddress: '123 Main St',
      guestCount: 150,
      specialRequests: 'Classic rock during dinner',
    };

    const req = makeRequest(payload, { 'x-forwarded-for': '1.2.3.4' });
    const res: any = await POST(req as any);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.booking.bookingReference).toBe('DSE-123456-ABC');
    expect(mockCreateBooking).toHaveBeenCalledTimes(1);
  });

  it('rejects past dates with 400', async () => {
    const payload = {
      clientName: 'Past Date',
      clientEmail: 'past@example.com',
      clientPhone: '(555) 000-0000',
      eventDate: '2000-01-01',
      eventStartTime: '10:00',
      eventType: 'wedding',
      services: ['dj'],
    };

    const req = makeRequest(payload);
    const res: any = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(String(json.error).toLowerCase()).toContain('future');
    expect(mockCreateBooking).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limit is exceeded', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: false, remaining: 0, resetTime: Date.now() + 600000, retryAfter: 600 });
    const payload = {
      clientName: 'RL User',
      clientEmail: 'rl@example.com',
      clientPhone: '(555) 111-1111',
      eventDate: '2025-12-25',
      eventType: 'wedding',
      services: ['dj'],
    };
    const req = makeRequest(payload);
    const res: any = await POST(req as any);
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(String(json.error).toLowerCase()).toContain('too many');
  });

  it('validates payload and returns 400 on missing fields', async () => {
    const badPayload = {
      clientName: 'No Services',
      clientEmail: 'no.services@example.com',
      clientPhone: '(555) 222-2222',
      eventDate: '2025-12-25',
      eventType: 'wedding',
      // services missing
    } as any;

    const req = makeRequest(badPayload);
    const res: any = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(String(json.error).toLowerCase()).toContain('validation');
  });

  it('combines HH:MM time with eventDate correctly', async () => {
    mockCreateBooking.mockImplementation(async (bookingData: any) => {
      expect(bookingData.eventDate instanceof Date).toBe(true);
      expect(bookingData.eventStartTime instanceof Date).toBe(true);
      expect(bookingData.eventStartTime.getHours()).toBe(9);
      expect(bookingData.eventStartTime.getMinutes()).toBe(5);
      return {
        success: true,
        booking: { id: 'b2', bookingReference: 'DSE-000002-XYZ', ...bookingData },
      };
    });

    const payload = {
      clientName: 'Time User',
      clientEmail: 'time@example.com',
      clientPhone: '(555) 333-3333',
      eventDate: '2025-12-25',
      eventStartTime: '09:05',
      eventType: 'wedding',
      services: ['dj'],
    };
    const req = makeRequest(payload);
    const res: any = await POST(req as any);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});


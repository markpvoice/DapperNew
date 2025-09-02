/**
 * @fileoverview Unit tests for GET /api/bookings
 *
 * Covers auth requirement, query validation, list retrieval,
 * and date range branch using getBookingsByDateRange.
 */

import { GET } from '@/app/api/bookings/route';

// Mocks
const mockVerifyAuth = jest.fn();
const mockGetBookingsByDateRange = jest.fn();
const mockGetBookingsList = jest.fn();

jest.mock('@/lib/auth', () => ({
  verifyAuth: (...args: any[]) => mockVerifyAuth(...args),
}));

jest.mock('@/lib/database', () => ({
  getBookingsByDateRange: (...args: any[]) => mockGetBookingsByDateRange(...args),
}));

jest.mock('@/lib/db', () => ({
  queryHelpers: {
    getBookingsList: (...args: any[]) => mockGetBookingsList(...args),
  },
}));

function makeRequest(url: string) {
  return new (global as any).Request(url, { method: 'GET' });
}

describe('GET /api/bookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAuth.mockResolvedValue({ success: true, user: { id: '1', email: 'admin@dappersquad.com', role: 'admin', name: 'Admin' } });
  });

  it('requires authentication', async () => {
    mockVerifyAuth.mockResolvedValueOnce({ success: false });
    const req = makeRequest('http://localhost/api/bookings');
    const res: any = await GET(req as any);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('validates query params and returns 400 for invalid values', async () => {
    const req = makeRequest('http://localhost/api/bookings?limit=-1');
    const res: any = await GET(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(String(json.error).toLowerCase()).toContain('invalid');
  });

  it('returns bookings list with pagination (list branch)', async () => {
    mockGetBookingsList.mockResolvedValueOnce([
      { id: 'a1', eventDate: new Date('2025-01-10') },
      { id: 'a2', eventDate: new Date('2025-01-15') },
    ]);

    const req = makeRequest('http://localhost/api/bookings?status=pending&limit=2&offset=0');
    const res: any = await GET(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.bookings)).toBe(true);
    expect(json.bookings).toHaveLength(2);
    expect(json.pagination.limit).toBe(2);
    // hasMore is true when totalCount === limit (as implemented)
    expect(json.pagination.hasMore).toBe(true);
    expect(mockGetBookingsList).toHaveBeenCalledTimes(1);
  });

  it('returns bookings for date range (date-range branch)', async () => {
    mockGetBookingsByDateRange.mockResolvedValueOnce({
      success: true,
      bookings: [
        { id: 'r1', eventDate: new Date('2025-01-05') },
        { id: 'r2', eventDate: new Date('2025-01-20') },
      ],
    });

    const req = makeRequest('http://localhost/api/bookings?dateFrom=2025-01-01&dateTo=2025-01-31');
    const res: any = await GET(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.bookings).toHaveLength(2);
    expect(mockGetBookingsByDateRange).toHaveBeenCalledTimes(1);
  });
});


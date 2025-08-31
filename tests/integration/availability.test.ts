/**
 * @fileoverview Availability API Tests
 * Tests for GET /api/bookings/availability endpoint
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/bookings/availability/route';

// Mock the database operations
jest.mock('@/lib/database', () => ({
  getAvailableDates: jest.fn(),
}));

describe('GET /api/bookings/availability', () => {
  const { getAvailableDates } = require('@/lib/database');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid requests', () => {
    it('should return available dates for valid month and year', async () => {
      const mockAvailableDates = [
        '2024-12-01',
        '2024-12-02',
        '2024-12-15',
        '2024-12-25',
      ];

      getAvailableDates.mockResolvedValue({
        success: true,
        availableDates: mockAvailableDates,
      });

      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=12&year=2024');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.month).toBe(12);
      expect(data.year).toBe(2024);
      expect(data.availableDates).toEqual(mockAvailableDates);
      expect(data.totalAvailable).toBe(4);

      expect(getAvailableDates).toHaveBeenCalledWith(12, 2024);
    });

    it('should handle empty available dates', async () => {
      getAvailableDates.mockResolvedValue({
        success: true,
        availableDates: [],
      });

      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=6&year=2025');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.availableDates).toEqual([]);
      expect(data.totalAvailable).toBe(0);
    });

    it('should handle null availableDates from database', async () => {
      getAvailableDates.mockResolvedValue({
        success: true,
        availableDates: null,
      });

      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=1&year=2024');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.availableDates).toEqual([]);
      expect(data.totalAvailable).toBe(0);
    });
  });

  describe('Parameter validation', () => {
    it('should reject missing month parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings/availability?year=2024');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Month and year parameters are required');
    });

    it('should reject missing year parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=12');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Month and year parameters are required');
    });

    it('should reject missing both parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings/availability');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Month and year parameters are required');
    });

    it('should reject invalid month (too low)', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=0&year=2024');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid parameters');
      expect(data.details).toBeDefined();
    });

    it('should reject invalid month (too high)', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=13&year=2024');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid parameters');
    });

    it('should reject invalid year (too low)', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=12&year=2023');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid parameters');
    });

    it('should reject invalid year (too high)', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=12&year=2031');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid parameters');
    });

    it('should reject non-numeric month', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=december&year=2024');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid parameters');
    });

    it('should reject non-numeric year', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=12&year=twenty-twenty-four');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid parameters');
    });
  });

  describe('Database error handling', () => {
    it('should handle database query errors', async () => {
      getAvailableDates.mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      });

      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=12&year=2024');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database connection failed');
    });

    it('should handle unexpected database exceptions', async () => {
      getAvailableDates.mockRejectedValue(new Error('Unexpected database error'));

      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=12&year=2024');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Edge cases', () => {
    it('should handle valid edge values', async () => {
      getAvailableDates.mockResolvedValue({
        success: true,
        availableDates: ['2024-01-31'],
      });

      // Test minimum valid month
      const request1 = new NextRequest('http://localhost:3000/api/bookings/availability?month=1&year=2024');
      const response1 = await GET(request1);
      const data1 = await response1.json();

      expect(response1.status).toBe(200);
      expect(data1.month).toBe(1);

      // Test maximum valid month
      const request2 = new NextRequest('http://localhost:3000/api/bookings/availability?month=12&year=2030');
      const response2 = await GET(request2);
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.month).toBe(12);
      expect(data2.year).toBe(2030);
    });

    it('should handle February in leap year', async () => {
      getAvailableDates.mockResolvedValue({
        success: true,
        availableDates: ['2024-02-29'],
      });

      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=2&year=2024');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.month).toBe(2);
      expect(data.year).toBe(2024);
    });

    it('should handle URL encoding in parameters', async () => {
      getAvailableDates.mockResolvedValue({
        success: true,
        availableDates: [],
      });

      const request = new NextRequest('http://localhost:3000/api/bookings/availability?month=12&year=2024&extra=ignore');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.month).toBe(12);
      expect(data.year).toBe(2024);
    });
  });
});
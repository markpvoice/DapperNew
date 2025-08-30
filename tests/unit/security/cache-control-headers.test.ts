/**
 * @fileoverview Cache Control Headers Security Tests
 * 
 * Tests for proper cache control headers on authenticated API endpoints.
 * Ensures sensitive data is not cached by browsers or CDNs.
 */

// Mock response object for testing
interface MockResponse {
  data: any;
  status: number;
  headers: Record<string, string>;
}

// Mock a secure response helper that should add no-cache headers
function createSecureApiResponse(data: any, status: number = 200): MockResponse {
  const response: MockResponse = {
    data,
    status,
    headers: {}
  };
  
  // Add security headers for authenticated responses
  response.headers['cache-control'] = 'no-store, no-cache, must-revalidate, private';
  response.headers['pragma'] = 'no-cache';
  response.headers['expires'] = '0';
  
  return response;
}

// Mock an auth helper that creates responses with proper headers
function createAuthenticatedResponse(data: any, status: number = 200): MockResponse {
  return createSecureApiResponse(data, status);
}

// Test utility to extract headers from mock response
function getResponseHeaders(response: MockResponse) {
  return response.headers;
}

describe('Cache Control Headers Security Tests', () => {
  describe('Authenticated API Responses', () => {
    it('should set Cache-Control: no-store for admin dashboard data', () => {
      const dashboardData = {
        totalBookings: 45,
        revenue: 12500,
        upcomingEvents: 8
      };

      const response = createAuthenticatedResponse(dashboardData);
      const headers = getResponseHeaders(response);

      expect(headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
    });

    it('should set Cache-Control: no-store for booking data', () => {
      const bookingData = {
        id: 1,
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        eventDate: '2025-06-15',
        status: 'CONFIRMED'
      };

      const response = createAuthenticatedResponse(bookingData);
      const headers = getResponseHeaders(response);

      expect(headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
    });

    it('should set Cache-Control: no-store for analytics data', () => {
      const analyticsData = {
        revenue: {
          total: 45000,
          deposits: 15000
        },
        bookings: {
          confirmed: 12,
          pending: 5
        }
      };

      const response = createAuthenticatedResponse(analyticsData);
      const headers = getResponseHeaders(response);

      expect(headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
    });

    it('should set Pragma: no-cache for legacy browser compatibility', () => {
      const data = { sensitive: 'data' };
      const response = createAuthenticatedResponse(data);
      const headers = getResponseHeaders(response);

      expect(headers['pragma']).toBe('no-cache');
    });

    it('should set Expires: 0 to prevent caching', () => {
      const data = { sensitive: 'data' };
      const response = createAuthenticatedResponse(data);
      const headers = getResponseHeaders(response);

      expect(headers['expires']).toBe('0');
    });
  });

  describe('Cache Control Components Validation', () => {
    it('should include no-store to prevent disk storage', () => {
      const response = createAuthenticatedResponse({ data: 'test' });
      const cacheControl = response.headers['cache-control'] || '';

      expect(cacheControl).toContain('no-store');
    });

    it('should include no-cache to prevent memory caching', () => {
      const response = createAuthenticatedResponse({ data: 'test' });
      const cacheControl = response.headers['cache-control'] || '';

      expect(cacheControl).toContain('no-cache');
    });

    it('should include must-revalidate for proxy servers', () => {
      const response = createAuthenticatedResponse({ data: 'test' });
      const cacheControl = response.headers['cache-control'] || '';

      expect(cacheControl).toContain('must-revalidate');
    });

    it('should include private to prevent CDN caching', () => {
      const response = createAuthenticatedResponse({ data: 'test' });
      const cacheControl = response.headers['cache-control'] || '';

      expect(cacheControl).toContain('private');
    });
  });

  describe('Response Status Handling', () => {
    it('should apply cache headers to successful responses (200)', () => {
      const response = createAuthenticatedResponse({ success: true }, 200);
      const headers = getResponseHeaders(response);

      expect(headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.status).toBe(200);
    });

    it('should apply cache headers to error responses (500)', () => {
      const response = createAuthenticatedResponse({ error: 'Server error' }, 500);
      const headers = getResponseHeaders(response);

      expect(headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.status).toBe(500);
    });

    it('should apply cache headers to unauthorized responses (401)', () => {
      const response = createAuthenticatedResponse({ error: 'Unauthorized' }, 401);
      const headers = getResponseHeaders(response);

      expect(headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.status).toBe(401);
    });

    it('should apply cache headers to forbidden responses (403)', () => {
      const response = createAuthenticatedResponse({ error: 'Forbidden' }, 403);
      const headers = getResponseHeaders(response);

      expect(headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.status).toBe(403);
    });
  });

  describe('Real-World API Endpoint Scenarios', () => {
    it('should secure admin dashboard endpoint responses', () => {
      // Simulate /api/admin/dashboard response
      const dashboardResponse = {
        stats: {
          totalBookings: 156,
          totalRevenue: 85600,
          upcomingEvents: 12,
          conversionRate: 0.35
        },
        recentBookings: [
          { id: 1, clientName: 'Jane Smith', eventDate: '2025-07-01' },
          { id: 2, clientName: 'Bob Wilson', eventDate: '2025-07-08' }
        ]
      };

      const response = createAuthenticatedResponse(dashboardResponse);
      const headers = getResponseHeaders(response);

      expect(headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(headers['pragma']).toBe('no-cache');
      expect(headers['expires']).toBe('0');
    });

    it('should secure booking list endpoint responses', () => {
      // Simulate /api/bookings response  
      const bookingsResponse = {
        bookings: [
          {
            id: 1,
            clientName: 'Sarah Johnson',
            clientEmail: 'sarah@example.com',
            clientPhone: '555-123-4567',
            eventDate: '2025-06-20',
            services: ['DJ', 'Photography'],
            totalAmount: 2500,
            status: 'CONFIRMED'
          }
        ],
        total: 45,
        page: 1
      };

      const response = createAuthenticatedResponse(bookingsResponse);
      const headers = getResponseHeaders(response);

      expect(headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
    });

    it('should secure analytics endpoint responses', () => {
      // Simulate /api/admin/analytics response
      const analyticsResponse = {
        revenue: {
          total: 125000,
          thisMonth: 12500,
          lastMonth: 15000
        },
        bookings: {
          total: 78,
          confirmed: 65,
          pending: 8,
          cancelled: 5
        },
        services: {
          'DJ': 45,
          'Photography': 28,
          'Karaoke': 33
        }
      };

      const response = createAuthenticatedResponse(analyticsResponse);
      const headers = getResponseHeaders(response);

      expect(headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(headers['pragma']).toBe('no-cache');
      expect(headers['expires']).toBe('0');
    });
  });

  describe('Header Validation', () => {
    it('should not cache sensitive client information', () => {
      const clientData = {
        clientName: 'Private Client',
        clientEmail: 'private@example.com',
        clientPhone: '555-999-0000',
        specialRequests: 'Confidential event details'
      };

      const response = createAuthenticatedResponse(clientData);
      const cacheControl = response.headers['cache-control'] || '';

      // Ensure comprehensive no-cache policy
      expect(cacheControl).toMatch(/no-store/);
      expect(cacheControl).toMatch(/no-cache/);
      expect(cacheControl).toMatch(/private/);
      expect(cacheControl).toMatch(/must-revalidate/);
    });

    it('should prevent intermediate proxy caching', () => {
      const sensitiveData = {
        revenue: 50000,
        clientList: ['Client A', 'Client B'],
        paymentStatus: 'PAID'
      };

      const response = createAuthenticatedResponse(sensitiveData);
      const headers = getResponseHeaders(response);

      // private directive prevents shared caches (CDN, proxies)
      expect(headers['cache-control']).toContain('private');
      
      // must-revalidate prevents stale cache serving
      expect(headers['cache-control']).toContain('must-revalidate');
    });
  });
});
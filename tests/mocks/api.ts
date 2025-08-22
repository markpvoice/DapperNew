/**
 * @fileoverview API Mocks for Testing
 * 
 * Mock implementations of API endpoints for unit and integration testing
 * Following TDD principles with realistic mock responses
 */

// Mock booking data
export const mockBookingData = {
  id: 'booking-123',
  reference: 'DSE-123456-ABC',
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
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
};

export const mockContactData = {
  id: 'contact-123',
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  phone: '(555) 987-6543',
  subject: 'Wedding DJ Services',
  message: 'I need DJ services for my wedding on June 15th, 2024.',
  createdAt: new Date('2024-01-15T10:00:00Z'),
};

// Mock API responses
export const mockApiResponses = {
  // Booking endpoints
  createBooking: {
    success: {
      success: true,
      data: mockBookingData,
      message: 'Booking created successfully',
    },
    error: {
      success: false,
      error: 'Failed to create booking',
      details: 'Date not available',
    },
    validation: {
      success: false,
      error: 'Validation failed',
      details: {
        clientName: ['Client name is required'],
        clientEmail: ['Please provide a valid email address'],
        eventDate: ['Event date must be in the future'],
      },
    },
  },

  // Contact endpoints
  createContact: {
    success: {
      success: true,
      data: mockContactData,
      message: 'Contact form submitted successfully',
    },
    error: {
      success: false,
      error: 'Failed to submit contact form',
      details: 'Server temporarily unavailable',
    },
  },

  // Calendar endpoints
  getAvailability: {
    success: {
      success: true,
      data: {
        availableDates: [
          '2024-12-15',
          '2024-12-20',
          '2024-12-22',
          '2024-12-28',
        ],
        unavailableDates: [
          '2024-12-25', // Christmas
          '2024-12-31', // New Year's Eve
        ],
      },
    },
    error: {
      success: false,
      error: 'Failed to fetch availability',
    },
  },

  // Pricing endpoints
  calculatePricing: {
    success: {
      success: true,
      data: {
        services: [
          { name: 'DJ', price: 800 },
          { name: 'Photography', price: 1200 },
        ],
        subtotal: 2000,
        discount: 200,
        total: 1800,
        deposit: 450,
      },
    },
  },
};

// Mock fetch implementation
export const createMockFetch = (responses: Record<string, any>) => {
  return jest.fn((url: string, options?: RequestInit) => {
    const method = options?.method || 'GET';
    const key = `${method} ${url}`;
    
    if (responses[key]) {
      const response = responses[key];
      
      return Promise.resolve({
        ok: response.success !== false,
        status: response.success !== false ? 200 : 400,
        statusText: response.success !== false ? 'OK' : 'Bad Request',
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
        headers: {
          get: (name: string) => {
            if (name.toLowerCase() === 'content-type') {
              return 'application/json';
            }
            return null;
          },
        },
      } as Response);
    }

    // Default 404 response
    return Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ success: false, error: 'Endpoint not found' }),
      text: () => Promise.resolve(JSON.stringify({ success: false, error: 'Endpoint not found' })),
    } as Response);
  });
};

// Mock API handlers for specific endpoints
export const mockApiHandlers = {
  // Booking handlers
  createBooking: jest.fn(() => mockApiResponses.createBooking.success),
  updateBooking: jest.fn(() => ({ 
    success: true, 
    data: { ...mockBookingData, status: 'CONFIRMED' } 
  })),
  deleteBooking: jest.fn(() => ({ success: true, message: 'Booking deleted' })),
  getBookings: jest.fn(() => ({ 
    success: true, 
    data: [mockBookingData],
    pagination: { page: 1, limit: 10, total: 1 }
  })),

  // Contact handlers
  createContact: jest.fn(() => mockApiResponses.createContact.success),
  getContacts: jest.fn(() => ({ 
    success: true, 
    data: [mockContactData],
    pagination: { page: 1, limit: 10, total: 1 }
  })),

  // Calendar handlers
  getAvailability: jest.fn(() => mockApiResponses.getAvailability.success),
  updateAvailability: jest.fn(() => ({ 
    success: true, 
    message: 'Availability updated' 
  })),

  // Pricing handlers
  calculatePricing: jest.fn(() => mockApiResponses.calculatePricing.success),
  getServices: jest.fn(() => ({
    success: true,
    data: [
      { id: 'dj', name: 'DJ Services', basePrice: 500, description: 'Professional DJ services' },
      { id: 'photo', name: 'Photography', basePrice: 800, description: 'Event photography' },
      { id: 'karaoke', name: 'Karaoke', basePrice: 300, description: 'Karaoke setup and hosting' },
    ],
  })),

  // Email handlers
  sendEmail: jest.fn(() => ({ 
    success: true, 
    emailId: 'email-123', 
    message: 'Email sent successfully' 
  })),
  checkEmailHealth: jest.fn(() => ({ 
    status: 'healthy', 
    message: 'Email service is operational' 
  })),

  // Authentication handlers (for admin features)
  login: jest.fn(() => ({
    success: true,
    data: {
      user: { id: 'admin-1', email: 'admin@dappersquad.com', role: 'ADMIN' },
      token: 'mock-jwt-token',
    },
  })),
  logout: jest.fn(() => ({ success: true, message: 'Logged out successfully' })),
  
  // File upload handlers
  uploadFile: jest.fn(() => ({
    success: true,
    data: {
      url: 'https://example.com/uploads/test-file.jpg',
      filename: 'test-file.jpg',
      size: 1024,
    },
  })),
};

// Mock API error generators
export const mockApiErrors = {
  networkError: () => Promise.reject(new Error('Network request failed')),
  serverError: () => Promise.resolve({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    json: () => Promise.resolve({
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong on our end',
    }),
  } as Response),
  
  validationError: (fields: Record<string, string[]>) => Promise.resolve({
    ok: false,
    status: 422,
    statusText: 'Unprocessable Entity',
    json: () => Promise.resolve({
      success: false,
      error: 'Validation failed',
      details: fields,
    }),
  } as Response),

  notFoundError: () => Promise.resolve({
    ok: false,
    status: 404,
    statusText: 'Not Found',
    json: () => Promise.resolve({
      success: false,
      error: 'Resource not found',
    }),
  } as Response),

  unauthorizedError: () => Promise.resolve({
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    json: () => Promise.resolve({
      success: false,
      error: 'Authentication required',
    }),
  } as Response),

  rateLimitError: () => Promise.resolve({
    ok: false,
    status: 429,
    statusText: 'Too Many Requests',
    json: () => Promise.resolve({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Please try again later',
    }),
  } as Response),
};

// Helper to setup API mocks for specific test scenarios
export const setupApiMocks = (scenario: 'success' | 'error' | 'validation' | 'loading') => {
  const handlers = { ...mockApiHandlers };

  switch (scenario) {
    case 'success':
      // Default handlers already return success responses
      break;

    case 'error':
      // Override all handlers to return errors
      Object.keys(handlers).forEach(key => {
        handlers[key as keyof typeof handlers] = jest.fn(() => 
          Promise.reject(new Error('Server error'))
        );
      });
      break;

    case 'validation':
      // Override handlers to return validation errors
      handlers.createBooking = jest.fn(() => mockApiResponses.createBooking.validation);
      handlers.createContact = jest.fn(() => ({
        success: false,
        error: 'Validation failed',
        details: {
          email: ['Please provide a valid email address'],
          message: ['Message must be at least 10 characters long'],
        },
      }));
      break;

    case 'loading':
      // Override handlers to return delayed responses
      Object.keys(handlers).forEach(key => {
        const originalHandler = handlers[key as keyof typeof handlers];
        handlers[key as keyof typeof handlers] = jest.fn(() => 
          new Promise(resolve => setTimeout(() => resolve(originalHandler()), 2000))
        );
      });
      break;
  }

  return handlers;
};

// Mock environment variables for testing
export const mockEnvVars = {
  NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
  NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
  RESEND_API_KEY: 'test-resend-api-key',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  NEXTAUTH_SECRET: 'test-secret',
  STRIPE_SECRET_KEY: 'sk_test_123',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
};

// Mock Next.js router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

// Mock analytics tracking
export const mockAnalytics = {
  track: jest.fn(),
  identify: jest.fn(),
  page: jest.fn(),
  reset: jest.fn(),
};

// Reset all mocks
export const resetAllMocks = () => {
  Object.values(mockApiHandlers).forEach(handler => {
    handler.mockClear();
  });
  
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.back.mockClear();
  mockRouter.forward.mockClear();
  mockRouter.refresh.mockClear();
  mockRouter.prefetch.mockClear();
  
  mockAnalytics.track.mockClear();
  mockAnalytics.identify.mockClear();
  mockAnalytics.page.mockClear();
  mockAnalytics.reset.mockClear();
};
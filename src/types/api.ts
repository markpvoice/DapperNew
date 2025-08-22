/**
 * @fileoverview API-specific TypeScript types
 * 
 * Type definitions for API requests, responses, and handlers
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookingData, ContactFormData, ApiResponse } from './index';

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Route Handler Types
export type ApiHandler = (
  _request: NextRequest,
  _context?: { params?: Record<string, string> }
) => Promise<NextResponse> | NextResponse;

export type ApiRouteHandlers = {
  GET?: ApiHandler;
  POST?: ApiHandler;
  PUT?: ApiHandler;
  PATCH?: ApiHandler;
  DELETE?: ApiHandler;
};

// Request/Response Types for Bookings API
export namespace BookingsAPI {
  export interface CreateRequest {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    eventDate: string;
    eventStartTime?: string;
    eventEndTime?: string;
    eventType: string;
    servicesNeeded: string[];
    venueName?: string;
    venueAddress?: string;
    guestCount?: number;
    specialRequests?: string;
  }

  export interface CreateResponse extends ApiResponse<BookingData> {
    data: BookingData;
  }

  export interface UpdateRequest {
    status?: string;
    depositAmount?: number;
    totalAmount?: number;
    paymentStatus?: string;
    specialRequests?: string;
  }

  export interface UpdateResponse extends ApiResponse<BookingData> {
    data: BookingData;
  }

  export interface ListRequest {
    page?: number;
    limit?: number;
    status?: string;
    eventType?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }

  export interface ListResponse extends ApiResponse<BookingData[]> {
    data: BookingData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }

  export interface DeleteResponse extends ApiResponse {
    message: string;
  }
}

// Request/Response Types for Contact API
export namespace ContactAPI {
  export interface CreateRequest extends ContactFormData {}

  export interface CreateResponse extends ApiResponse {
    message: string;
  }

  export interface ListRequest {
    page?: number;
    limit?: number;
    isRead?: boolean;
    search?: string;
  }

  export interface ListResponse extends ApiResponse {
    data: ContactFormData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }

  export interface UpdateRequest {
    isRead: boolean;
  }

  export interface UpdateResponse extends ApiResponse {
    message: string;
  }
}

// Request/Response Types for Calendar API
export namespace CalendarAPI {
  export interface AvailabilityRequest {
    month: number;
    year: number;
  }

  export interface AvailabilityResponse extends ApiResponse {
    data: {
      availableDates: string[];
      unavailableDates: string[];
      blockedDates: Array<{
        date: string;
        reason: string;
      }>;
    };
  }

  export interface UpdateAvailabilityRequest {
    date: string;
    isAvailable: boolean;
    reason?: string;
  }

  export interface UpdateAvailabilityResponse extends ApiResponse {
    message: string;
  }

  export interface EventsRequest {
    start: string;
    end: string;
  }

  export interface EventsResponse extends ApiResponse {
    data: Array<{
      id: string;
      title: string;
      start: string;
      end: string;
      allDay: boolean;
      color: string;
      extendedProps: {
        bookingId: string;
        clientName: string;
        services: string[];
        venue?: string;
      };
    }>;
  }
}

// Request/Response Types for Auth API
export namespace AuthAPI {
  export interface LoginRequest {
    email: string;
    password: string;
  }

  export interface LoginResponse extends ApiResponse {
    data: {
      user: {
        id: number;
        email: string;
        name: string;
        role: string;
      };
      token: string;
      expiresAt: string;
    };
  }

  export interface LogoutResponse extends ApiResponse {
    message: string;
  }

  export interface VerifyResponse extends ApiResponse {
    data: {
      user: {
        id: number;
        email: string;
        name: string;
        role: string;
      };
      isValid: boolean;
    };
  }

  export interface RefreshRequest {
    refreshToken: string;
  }

  export interface RefreshResponse extends ApiResponse {
    data: {
      token: string;
      refreshToken: string;
      expiresAt: string;
    };
  }
}

// Request/Response Types for Admin API
export namespace AdminAPI {
  export interface DashboardResponse extends ApiResponse {
    data: {
      metrics: {
        totalBookings: number;
        pendingBookings: number;
        confirmedBookings: number;
        totalRevenue: number;
        monthlyRevenue: number;
        averageBookingValue: number;
      };
      recentBookings: BookingData[];
      popularServices: Array<{
        service: string;
        count: number;
        revenue: number;
      }>;
      upcomingEvents: Array<{
        id: string;
        clientName: string;
        eventDate: string;
        eventType: string;
        services: string[];
      }>;
    };
  }

  export interface AnalyticsRequest {
    period: 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
  }

  export interface AnalyticsResponse extends ApiResponse {
    data: {
      bookingTrends: Array<{
        date: string;
        bookings: number;
        revenue: number;
      }>;
      serviceBreakdown: Array<{
        service: string;
        count: number;
        percentage: number;
      }>;
      eventTypeBreakdown: Array<{
        eventType: string;
        count: number;
        percentage: number;
      }>;
      monthlyComparison: {
        thisMonth: number;
        lastMonth: number;
        percentageChange: number;
      };
    };
  }
}

// Request/Response Types for Services API
export namespace ServicesAPI {
  export interface CreateRequest {
    name: string;
    description?: string;
    priceRange?: string;
    imageUrl?: string;
  }

  export interface CreateResponse extends ApiResponse {
    data: {
      id: number;
      name: string;
      description?: string;
      priceRange?: string;
      imageUrl?: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }

  export interface UpdateRequest {
    name?: string;
    description?: string;
    priceRange?: string;
    imageUrl?: string;
    isActive?: boolean;
  }

  export interface UpdateResponse extends ApiResponse {
    data: {
      id: number;
      name: string;
      description?: string;
      priceRange?: string;
      imageUrl?: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }

  export interface ListResponse extends ApiResponse {
    data: Array<{
      id: number;
      name: string;
      description?: string;
      priceRange?: string;
      imageUrl?: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
  }
}

// Request/Response Types for Email API
export namespace EmailAPI {
  export interface SendBookingConfirmationRequest {
    bookingId: string;
  }

  export interface SendBookingConfirmationResponse extends ApiResponse {
    data: {
      emailId: string;
      sentAt: string;
    };
  }

  export interface SendContactResponseRequest {
    contactId: number;
  }

  export interface SendContactResponseResponse extends ApiResponse {
    data: {
      emailId: string;
      sentAt: string;
    };
  }

  export interface HealthCheckResponse extends ApiResponse {
    data: {
      status: 'healthy' | 'unhealthy';
      lastEmailSent?: string;
      emailsToday: number;
      emailsThisMonth: number;
    };
  }
}

// Request/Response Types for Payment API
export namespace PaymentAPI {
  export interface CreatePaymentIntentRequest {
    bookingId: string;
    amount: number;
    paymentType: 'deposit' | 'full';
  }

  export interface CreatePaymentIntentResponse extends ApiResponse {
    data: {
      clientSecret: string;
      paymentIntentId: string;
    };
  }

  export interface ConfirmPaymentRequest {
    paymentIntentId: string;
    bookingId: string;
  }

  export interface ConfirmPaymentResponse extends ApiResponse {
    data: {
      status: 'succeeded' | 'failed';
      booking: BookingData;
    };
  }

  export interface WebhookRequest {
    type: string;
    data: {
      object: any;
    };
  }

  export interface WebhookResponse extends ApiResponse {
    message: string;
  }
}

// Request/Response Types for Upload API
export namespace UploadAPI {
  export interface UploadRequest {
    file: File;
    type: 'service-image' | 'profile-image' | 'document';
  }

  export interface UploadResponse extends ApiResponse {
    data: {
      url: string;
      filename: string;
      size: number;
      mimeType: string;
    };
  }
}

// Error Response Types
export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationErrorResponse extends ApiError {
  details: {
    field: string;
    message: string;
  }[];
}

// Middleware Types
export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export type AuthMiddleware = (
  _request: NextRequest
) => Promise<NextRequest | NextResponse>;

export type RateLimitMiddleware = (
  _request: NextRequest
) => Promise<NextRequest | NextResponse>;

// Health Check Types
export interface HealthCheckResponse extends ApiResponse {
  data: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    timestamp: string;
    services: {
      database: 'healthy' | 'unhealthy';
      email: 'healthy' | 'unhealthy';
      payment: 'healthy' | 'unhealthy';
    };
    uptime: number;
  };
}
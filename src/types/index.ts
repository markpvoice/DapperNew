/**
 * @fileoverview Global TypeScript types and interfaces
 * 
 * Centralized type definitions used across the application
 */

import { BookingStatus, PaymentStatus, EmailNotificationStatus } from '@prisma/client';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Booking Related Types
export interface BookingData {
  id?: string;
  bookingReference?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: Date | string;
  eventStartTime?: Date | string;
  eventEndTime?: Date | string;
  eventType: string;
  servicesNeeded: string[];
  venueName?: string;
  venueAddress?: string;
  guestCount?: number;
  specialRequests?: string;
  status?: BookingStatus;
  depositAmount?: number;
  totalAmount?: number;
  paymentStatus?: PaymentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingFormData {
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

// Contact Form Types
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface ContactSubmission extends ContactFormData {
  id: number;
  source: string;
  isRead: boolean;
  createdAt: Date;
}

// Service Types
export interface Service {
  id: number;
  name: string;
  description?: string;
  priceRange?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Calendar Types
export interface CalendarAvailability {
  id: number;
  date: Date;
  isAvailable: boolean;
  bookingId?: string;
  blockedReason?: string;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  extendedProps?: {
    bookingId?: string;
    clientName?: string;
    services?: string[];
    venue?: string;
  };
}

// User and Admin Types
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: AdminUser;
  token: string;
  expiresAt: Date;
}

// Email Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template: string;
  variables: string[];
}

export interface EmailNotification {
  id: number;
  recipientEmail: string;
  subject: string;
  templateName?: string;
  bookingId?: string;
  status: EmailNotificationStatus;
  sentAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

// Analytics and Metrics Types
export interface PageView {
  id: number;
  page: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  createdAt: Date;
}

export interface DashboardMetrics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  monthlyBookings: number;
  popularServices: Array<{
    service: string;
    count: number;
  }>;
  recentBookings: BookingData[];
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isLoading: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// Testimonial Types
export interface Testimonial {
  id: number;
  clientName: string;
  content: string;
  rating: number;
  eventType?: string;
  eventDate?: Date;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: Date;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  status?: BookingStatus[];
  eventType?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  services?: string[];
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// Payment Types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export interface PaymentData {
  bookingId: string;
  amount: number;
  paymentType: 'deposit' | 'full';
  stripePaymentIntentId?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

// Settings Types
export interface BusinessSettings {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  bookingSettings: {
    requireDeposit: boolean;
    depositPercentage: number;
    cancellationPolicy: string;
    leadTime: number; // days
  };
  emailSettings: {
    fromEmail: string;
    fromName: string;
    autoResponseEnabled: boolean;
    adminNotificationsEnabled: boolean;
  };
}

// Event Types for Calendar
export type CalendarView = 'month' | 'week' | 'day' | 'list';

export interface CalendarProps {
  events: CalendarEvent[];
  view: CalendarView;
  date: Date;
  onViewChange: (_view: CalendarView) => void;
  onDateChange: (_date: Date) => void;
  onEventClick?: (_event: CalendarEvent) => void;
  onDateClick?: (_date: Date) => void;
}

// Utility Types
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorCode?: string;
}

// Route and Navigation Types
export type RouteParams = {
  [key: string]: string | string[] | undefined;
};

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
  children?: NavigationItem[];
  badge?: string | number;
  isActive?: boolean;
  requiresAuth?: boolean;
}

// Theme and Styling Types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
}
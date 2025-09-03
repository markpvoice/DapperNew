/**
 * @fileoverview Centralized test ID constants
 * 
 * Centralizes data-testid values to prevent selector drift and ensure consistency
 * between components and tests. Import and use these constants instead of
 * hardcoding testid strings.
 * 
 * Usage:
 * - In components: data-testid={TEST_IDS.BOOKING.FORM}
 * - In tests: screen.getByTestId(TEST_IDS.BOOKING.FORM)
 */

export const TEST_IDS = {
  // Common UI Elements
  COMMON: {
    LOADING: 'loading',
    ERROR: 'error',
    SUCCESS: 'success',
    MODAL_CONTENT: 'modal-content',
    CLOSE_BUTTON: 'close-button',
  },

  // Authentication & Admin
  AUTH: {
    LOGIN_FORM: 'login-form',
    EMAIL_INPUT: 'email-input',
    PASSWORD_INPUT: 'password-input',
    LOGIN_BUTTON: 'login-button',
    LOGOUT_BUTTON: 'logout-button',
  },

  ADMIN: {
    DASHBOARD: 'admin-dashboard',
    NAVIGATION: 'admin-navigation',
    CONTENT: 'admin-content',
    MOBILE_MENU_BUTTON: 'mobile-menu-button',
    MOBILE_NAVIGATION_MENU: 'mobile-navigation-menu',
    MOBILE_NAV_DASHBOARD: 'mobile-nav-dashboard',
    MOBILE_NAV_BOOKINGS: 'mobile-nav-bookings',
    MOBILE_NAV_CALENDAR: 'mobile-nav-calendar',
    MOBILE_NAV_ANALYTICS: 'mobile-nav-analytics',
  },

  // Booking System
  BOOKING: {
    FORM: 'booking-form',
    MODAL: 'booking-modal',
    SUCCESS: 'booking-success',
    CONFIRMED_CELEBRATION: 'booking-confirmed-celebration',
    REFERENCE: 'booking-reference',
    INFO: 'booking-info',
    LIST: 'booking-list',
    MANAGEMENT: 'booking-management',
    CARDS: 'booking-cards',
    NOTIFICATION: 'booking-notification',
    NOTIFICATION_ITEM: 'booking-notification-item',
    BOOK_NOW_BUTTON: 'book-now-button',
  },

  // Service Selection
  SERVICE: {
    CARD: (id: string) => `service-card-${id}`,
    CARD_DJ: 'service-card-dj',
    CARD_PHOTOGRAPHY: 'service-card-photography', 
    CARD_KARAOKE: 'service-card-karaoke',
  },

  // Form Steps
  STEPS: {
    INDICATOR: (step: number) => `step-indicator-${step}`,
    CONTENT: (step: number) => `step-${step}`,
    PROGRESS: 'progress-indicator',
    NEXT_BUTTON: 'next-button',
    PREV_BUTTON: 'prev-button',
    SUBMIT_BUTTON: 'submit-button',
  },

  // Calendar
  CALENDAR: {
    GRID: 'calendar-grid',
    DAY: (date: string) => `calendar-day-${date}`,
    MONTH_SELECTOR: 'month-selector',
    YEAR_SELECTOR: 'year-selector',
    PREV_MONTH: 'prev-month',
    NEXT_MONTH: 'next-month',
    AVAILABLE_DAY: 'available-day',
    UNAVAILABLE_DAY: 'unavailable-day',
    SELECTED_DAY: 'selected-day',
  },

  // Form Fields
  FORM: {
    CLIENT_NAME: 'client-name',
    CLIENT_EMAIL: 'client-email',
    CLIENT_PHONE: 'client-phone',
    EVENT_DATE: 'event-date',
    EVENT_TYPE: 'event-type',
    VENUE_NAME: 'venue-name',
    VENUE_ADDRESS: 'venue-address',
    GUEST_COUNT: 'guest-count',
    SPECIAL_REQUESTS: 'special-requests',
    EVENT_START_TIME: 'event-start-time',
    EVENT_END_TIME: 'event-end-time',
  },

  // Analytics & Dashboard
  ANALYTICS: {
    DASHBOARD: 'analytics-dashboard',
    REVENUE_CHART: 'revenue-chart',
    BOOKINGS_CHART: 'bookings-chart',
    SERVICE_POPULARITY: 'service-popularity',
    METRICS_CARD: (metric: string) => `metrics-${metric}`,
    DATE_FILTER: 'date-filter',
    EXPORT_BUTTON: 'export-button',
  },

  // Status & Badges
  STATUS: {
    BADGE: (status: string) => `status-badge-${status.toLowerCase()}`,
    INDICATOR: 'status-indicator',
  },

  // Photo Gallery
  GALLERY: {
    CONTAINER: 'photo-gallery',
    PHOTO: (index: number) => `photo-${index}`,
    LIGHTBOX: 'lightbox',
    THUMBNAIL: (index: number) => `thumbnail-${index}`,
    FILTER: (category: string) => `filter-${category}`,
  },

  // Video & Media
  VIDEO: {
    PLAYER: 'video-player',
    THUMBNAIL: (index: number) => `video-thumbnail-${index}`,
    PLAY_BUTTON: 'play-button',
    DURATION: 'video-duration',
    TITLE: 'video-title',
    ERROR_MESSAGE: 'video-error-message',
    FULLSCREEN_BUTTON: 'fullscreen-button',
  },

  // Testimonials
  TESTIMONIALS: {
    CONTAINER: 'testimonials-container',
    ITEM: (index: number) => `testimonial-${index}`,
    TEXT: 'testimonial-text',
    CLIENT_NAME: 'testimonial-client-name',
    CLIENT_PHOTO: 'testimonial-client-photo',
    STAR_RATING: 'testimonial-star-rating',
    EVENT_TYPE: 'testimonial-event-type',
    PREV_BUTTON: 'testimonials-prev',
    NEXT_BUTTON: 'testimonials-next',
  },

  // Animations & Effects
  ANIMATIONS: {
    STATS: 'animated-stats',
    SECTION: 'animated-section',
    CHECKMARK: (index: number) => `checkmark-${index}`,
    CELEBRATION: 'celebration-effect',
  },

  // Mobile-specific
  MOBILE: {
    BOOKING_CARD: 'mobile-booking-card',
    DRAWER: 'mobile-drawer',
    DRAWER_BACKDROP: 'mobile-drawer-backdrop',
    ENHANCED_NAV: 'enhanced-mobile-nav',
  },

  // Utility
  UTILS: {
    ADD_TO_CALENDAR: 'add-to-calendar',
    PRINT_BUTTON: 'print-button',
    SHARE_BUTTON: 'share-button',
    COPY_LINK: 'copy-link',
  },
} as const;

/**
 * Type-safe test ID accessor
 * Provides autocomplete and type safety for test IDs
 */
export type TestId = typeof TEST_IDS;

/**
 * Helper function to create dynamic test IDs
 * Usage: createTestId('booking', 'card', bookingId)
 * Returns: 'booking-card-{bookingId}'
 */
export function createTestId(...parts: (string | number)[]): string {
  return parts.join('-').toLowerCase();
}

/**
 * Common test ID patterns for dynamic content
 */
export const TEST_ID_PATTERNS = {
  STATUS_BADGE: (status: string) => `status-badge-${status.toLowerCase()}`,
  SERVICE_CARD: (serviceId: string) => `service-card-${serviceId.toLowerCase()}`,
  STEP_INDICATOR: (stepNumber: number) => `step-indicator-${stepNumber}`,
  CALENDAR_DAY: (date: string) => `calendar-day-${date}`,
  FORM_FIELD: (fieldName: string) => `form-field-${fieldName.toLowerCase().replace(/\s+/g, '-')}`,
} as const;
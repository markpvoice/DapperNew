/**
 * @fileoverview Test ID Constants Tests
 * 
 * Ensures test ID constants are properly structured and provide expected values
 */

import { TEST_IDS, createTestId, TEST_ID_PATTERNS } from '@/constants/test-ids';

describe('Test ID Constants', () => {
  describe('TEST_IDS structure', () => {
    it('should provide common UI element IDs', () => {
      expect(TEST_IDS.COMMON.LOADING).toBe('loading');
      expect(TEST_IDS.COMMON.ERROR).toBe('error');
      expect(TEST_IDS.COMMON.SUCCESS).toBe('success');
      expect(TEST_IDS.COMMON.MODAL_CONTENT).toBe('modal-content');
    });

    it('should provide auth-related IDs', () => {
      expect(TEST_IDS.AUTH.LOGIN_FORM).toBe('login-form');
      expect(TEST_IDS.AUTH.EMAIL_INPUT).toBe('email-input');
      expect(TEST_IDS.AUTH.PASSWORD_INPUT).toBe('password-input');
      expect(TEST_IDS.AUTH.LOGIN_BUTTON).toBe('login-button');
    });

    it('should provide admin dashboard IDs', () => {
      expect(TEST_IDS.ADMIN.DASHBOARD).toBe('admin-dashboard');
      expect(TEST_IDS.ADMIN.NAVIGATION).toBe('admin-navigation');
      expect(TEST_IDS.ADMIN.MOBILE_MENU_BUTTON).toBe('mobile-menu-button');
      expect(TEST_IDS.ADMIN.MOBILE_NAVIGATION_MENU).toBe('mobile-navigation-menu');
    });

    it('should provide booking system IDs', () => {
      expect(TEST_IDS.BOOKING.FORM).toBe('booking-form');
      expect(TEST_IDS.BOOKING.MODAL).toBe('booking-modal');
      expect(TEST_IDS.BOOKING.BOOK_NOW_BUTTON).toBe('book-now-button');
      expect(TEST_IDS.BOOKING.SUCCESS).toBe('booking-success');
    });

    it('should provide service card IDs', () => {
      expect(TEST_IDS.SERVICE.CARD_DJ).toBe('service-card-dj');
      expect(TEST_IDS.SERVICE.CARD_PHOTOGRAPHY).toBe('service-card-photography');
      expect(TEST_IDS.SERVICE.CARD_KARAOKE).toBe('service-card-karaoke');
    });
  });

  describe('Dynamic test ID functions', () => {
    it('should generate service card IDs dynamically', () => {
      expect(TEST_IDS.SERVICE.CARD('dj')).toBe('service-card-dj');
      expect(TEST_IDS.SERVICE.CARD('photography')).toBe('service-card-photography');
      expect(TEST_IDS.SERVICE.CARD('karaoke')).toBe('service-card-karaoke');
    });

    it('should generate step indicator IDs', () => {
      expect(TEST_IDS.STEPS.INDICATOR(1)).toBe('step-indicator-1');
      expect(TEST_IDS.STEPS.INDICATOR(5)).toBe('step-indicator-5');
      expect(TEST_IDS.STEPS.CONTENT(2)).toBe('step-2');
    });

    it('should generate calendar day IDs', () => {
      expect(TEST_IDS.CALENDAR.DAY('2024-12-25')).toBe('calendar-day-2024-12-25');
      expect(TEST_IDS.CALENDAR.DAY('2025-01-01')).toBe('calendar-day-2025-01-01');
    });

    it('should generate status badge IDs', () => {
      expect(TEST_IDS.STATUS.BADGE('CONFIRMED')).toBe('status-badge-confirmed');
      expect(TEST_IDS.STATUS.BADGE('PENDING')).toBe('status-badge-pending');
      expect(TEST_IDS.STATUS.BADGE('CANCELLED')).toBe('status-badge-cancelled');
    });

    it('should generate photo and video IDs with indices', () => {
      expect(TEST_IDS.GALLERY.PHOTO(0)).toBe('photo-0');
      expect(TEST_IDS.GALLERY.PHOTO(5)).toBe('photo-5');
      expect(TEST_IDS.VIDEO.THUMBNAIL(1)).toBe('video-thumbnail-1');
      expect(TEST_IDS.VIDEO.THUMBNAIL(10)).toBe('video-thumbnail-10');
    });

    it('should generate testimonial IDs', () => {
      expect(TEST_IDS.TESTIMONIALS.ITEM(0)).toBe('testimonial-0');
      expect(TEST_IDS.TESTIMONIALS.ITEM(3)).toBe('testimonial-3');
    });

    it('should generate analytics metric IDs', () => {
      expect(TEST_IDS.ANALYTICS.METRICS_CARD('revenue')).toBe('metrics-revenue');
      expect(TEST_IDS.ANALYTICS.METRICS_CARD('bookings')).toBe('metrics-bookings');
    });
  });

  describe('createTestId helper function', () => {
    it('should create test IDs from multiple parts', () => {
      expect(createTestId('booking', 'card', '123')).toBe('booking-card-123');
      expect(createTestId('service', 'dj')).toBe('service-dj');
      expect(createTestId('step', 1, 'content')).toBe('step-1-content');
    });

    it('should handle mixed string and number types', () => {
      expect(createTestId('item', 42, 'selected')).toBe('item-42-selected');
      expect(createTestId('user', 'john', 123)).toBe('user-john-123');
    });

    it('should convert to lowercase', () => {
      expect(createTestId('BOOKING', 'FORM')).toBe('booking-form');
      expect(createTestId('Service', 'Card', 'DJ')).toBe('service-card-dj');
    });
  });

  describe('TEST_ID_PATTERNS', () => {
    it('should provide consistent status badge patterns', () => {
      expect(TEST_ID_PATTERNS.STATUS_BADGE('CONFIRMED')).toBe('status-badge-confirmed');
      expect(TEST_ID_PATTERNS.STATUS_BADGE('Pending')).toBe('status-badge-pending');
      expect(TEST_ID_PATTERNS.STATUS_BADGE('CANCELLED')).toBe('status-badge-cancelled');
    });

    it('should provide consistent service card patterns', () => {
      expect(TEST_ID_PATTERNS.SERVICE_CARD('DJ')).toBe('service-card-dj');
      expect(TEST_ID_PATTERNS.SERVICE_CARD('Photography')).toBe('service-card-photography');
      expect(TEST_ID_PATTERNS.SERVICE_CARD('KARAOKE')).toBe('service-card-karaoke');
    });

    it('should provide step indicator patterns', () => {
      expect(TEST_ID_PATTERNS.STEP_INDICATOR(1)).toBe('step-indicator-1');
      expect(TEST_ID_PATTERNS.STEP_INDICATOR(5)).toBe('step-indicator-5');
    });

    it('should provide calendar day patterns', () => {
      expect(TEST_ID_PATTERNS.CALENDAR_DAY('2024-12-25')).toBe('calendar-day-2024-12-25');
      expect(TEST_ID_PATTERNS.CALENDAR_DAY('2025-01-01')).toBe('calendar-day-2025-01-01');
    });

    it('should provide form field patterns', () => {
      expect(TEST_ID_PATTERNS.FORM_FIELD('Client Name')).toBe('form-field-client-name');
      expect(TEST_ID_PATTERNS.FORM_FIELD('Event Type')).toBe('form-field-event-type');
      expect(TEST_ID_PATTERNS.FORM_FIELD('Special Requests')).toBe('form-field-special-requests');
    });
  });

  describe('Type safety and consistency', () => {
    it('should maintain consistent naming conventions', () => {
      // All test IDs should use lowercase with hyphens
      const allIds = [
        TEST_IDS.COMMON.LOADING,
        TEST_IDS.AUTH.LOGIN_FORM,
        TEST_IDS.BOOKING.BOOK_NOW_BUTTON,
        TEST_IDS.ADMIN.MOBILE_MENU_BUTTON
      ];

      allIds.forEach(id => {
        expect(id).toMatch(/^[a-z0-9-]+$/);
        expect(id).not.toContain('_');
        expect(id).not.toContain(' ');
        expect(id).toBe(id.toLowerCase());
      });
    });

    it('should not have duplicate values in flat structure', () => {
      const allStaticIds: string[] = [];
      
      // Extract all static string values (not functions)
      Object.values(TEST_IDS).forEach(category => {
        if (typeof category === 'object') {
          Object.values(category).forEach(value => {
            if (typeof value === 'string') {
              allStaticIds.push(value);
            }
          });
        }
      });

      const uniqueIds = new Set(allStaticIds);
      expect(uniqueIds.size).toBe(allStaticIds.length);
    });
  });

  describe('Integration with existing patterns', () => {
    it('should match common existing test ID patterns from codebase', () => {
      // These should match patterns already used in the codebase
      expect(TEST_IDS.BOOKING.BOOK_NOW_BUTTON).toBe('book-now-button');
      expect(TEST_IDS.SERVICE.CARD_DJ).toBe('service-card-dj');
      expect(TEST_IDS.ADMIN.MOBILE_MENU_BUTTON).toBe('mobile-menu-button');
      expect(TEST_IDS.VIDEO.PLAY_BUTTON).toBe('play-button');
      expect(TEST_IDS.TESTIMONIALS.CLIENT_NAME).toBe('testimonial-client-name');
    });

    it('should support existing dynamic patterns', () => {
      // Status badges - commonly used pattern
      expect(TEST_ID_PATTERNS.STATUS_BADGE('CONFIRMED')).toBe('status-badge-confirmed');
      
      // Service cards - existing pattern
      expect(TEST_ID_PATTERNS.SERVICE_CARD('dj')).toBe('service-card-dj');
      
      // Step indicators - existing pattern  
      expect(TEST_ID_PATTERNS.STEP_INDICATOR(1)).toBe('step-indicator-1');
    });
  });
});
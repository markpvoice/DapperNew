/**
 * @fileoverview TDD Unit Tests for Utility Functions
 * 
 * Testing utilities that are used throughout the application
 * Following TDD principles: Red -> Green -> Refactor
 */

import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  generateBookingReference,
  slugify,
  capitalizeWords,
  truncateText,
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
  getInitials,
  debounce,
  sleep,
} from '@/lib/utils';

describe('Utility Functions', () => {
  // Test 1: Class name utility (cn)
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'not-included');
      expect(result).toBe('base-class conditional-class');
    });

    it('should handle Tailwind conflicts with twMerge', () => {
      const result = cn('px-4 px-6');
      expect(result).toBe('px-6'); // Should keep the last px value
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'end');
      expect(result).toBe('base end');
    });
  });

  // Test 2: Currency formatting
  describe('formatCurrency', () => {
    it('should format currency correctly with dollars', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-500)).toBe('-$500.00');
    });

    it('should handle decimal values', () => {
      expect(formatCurrency(99.99)).toBe('$99.99');
      expect(formatCurrency(1.5)).toBe('$1.50');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });

  // Test 3: Date formatting
  describe('formatDate', () => {
    it('should format date objects correctly', () => {
      const date = new Date('2024-12-25');
      const result = formatDate(date);
      expect(result).toMatch(/December 25, 2024/);
    });

    it('should format date strings correctly', () => {
      const result = formatDate('2024-01-01');
      expect(result).toMatch(/January 1, 2024/);
    });

    it('should handle different date formats', () => {
      const result = formatDate('2024-06-15T14:30:00Z');
      expect(result).toMatch(/June 15, 2024/);
    });
  });

  // Test 4: Date-time formatting
  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2024-12-25T15:30:00');
      const result = formatDateTime(date);
      expect(result).toMatch(/Dec 25, 2024/);
      expect(result).toMatch(/3:30 PM|15:30/);
    });

    it('should handle string input', () => {
      const result = formatDateTime('2024-01-01T09:00:00');
      expect(result).toMatch(/Jan 1, 2024/);
      expect(result).toMatch(/9:00 AM|09:00/);
    });
  });

  // Test 5: Booking reference generation
  describe('generateBookingReference', () => {
    it('should generate booking reference with correct format', () => {
      const reference = generateBookingReference();
      expect(reference).toMatch(/^DSE-\d{6}-[A-Z0-9]{3}$/);
    });

    it('should generate unique references', () => {
      const ref1 = generateBookingReference();
      const ref2 = generateBookingReference();
      expect(ref1).not.toBe(ref2);
    });

    it('should always start with DSE prefix', () => {
      const reference = generateBookingReference();
      expect(reference.startsWith('DSE-')).toBe(true);
    });
  });

  // Test 6: String slugification
  describe('slugify', () => {
    it('should convert text to URL-friendly slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('DJ & Karaoke Services')).toBe('dj-karaoke-services');
    });

    it('should handle special characters', () => {
      expect(slugify('Test@#$%^&*()String')).toBe('teststring');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('Multiple    Spaces   Here')).toBe('multiple-spaces-here');
    });

    it('should trim leading and trailing dashes', () => {
      expect(slugify('  Leading and trailing  ')).toBe('leading-and-trailing');
    });

    it('should handle empty strings', () => {
      expect(slugify('')).toBe('');
    });
  });

  // Test 7: Word capitalization
  describe('capitalizeWords', () => {
    it('should capitalize first letter of each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('dj karaoke service')).toBe('Dj Karaoke Service');
    });

    it('should handle single words', () => {
      expect(capitalizeWords('hello')).toBe('Hello');
    });

    it('should handle already capitalized text', () => {
      expect(capitalizeWords('HELLO WORLD')).toBe('Hello World');
    });

    it('should handle mixed case', () => {
      expect(capitalizeWords('hELLo WoRLD')).toBe('Hello World');
    });
  });

  // Test 8: Text truncation
  describe('truncateText', () => {
    it('should truncate long text correctly', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });

    it('should handle exact length', () => {
      const text = 'Exactly twenty chars';
      expect(truncateText(text, 20)).toBe('Exactly twenty chars');
    });

    it('should handle empty strings', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  // Test 9: Email validation
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('contact+tag@dappersquad.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('test.email-with+symbol@domain.com')).toBe(true);
      expect(isValidEmail('test..test@domain.com')).toBe(false); // double dot
    });
  });

  // Test 10: Phone validation
  describe('isValidPhone', () => {
    it('should validate US phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+11234567890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc-def-ghij')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });

    it('should handle international formats', () => {
      expect(isValidPhone('+441234567890')).toBe(true);
    });
  });

  // Test 11: Phone formatting
  describe('formatPhoneNumber', () => {
    it('should format 10-digit US numbers', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
    });

    it('should handle already formatted numbers', () => {
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
    });

    it('should return original for invalid formats', () => {
      expect(formatPhoneNumber('123')).toBe('123');
      expect(formatPhoneNumber('invalid')).toBe('invalid');
    });
  });

  // Test 12: Get initials
  describe('getInitials', () => {
    it('should extract initials from full names', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Jane Mary Smith')).toBe('JM');
      expect(getInitials('Alice Bob Charlie David')).toBe('AB');
    });

    it('should handle single names', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should handle empty strings', () => {
      expect(getInitials('')).toBe('');
    });

    it('should handle lowercase names', () => {
      expect(getInitials('john doe')).toBe('JD');
    });
  });

  // Test 13: Debounce function
  describe('debounce', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  // Test 14: Sleep function
  describe('sleep', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(95); // Allow small variance
    });

    it('should handle zero delay', async () => {
      const start = Date.now();
      await sleep(0);
      const end = Date.now();

      expect(end - start).toBeLessThan(10);
    });
  });

  // Test 15: Edge cases and error handling
  describe('Edge Cases', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(() => formatCurrency(0)).not.toThrow();
      expect(() => slugify('')).not.toThrow();
      expect(() => capitalizeWords('')).not.toThrow();
      expect(() => truncateText('', 0)).not.toThrow();
    });

    it('should handle extreme values', () => {
      expect(formatCurrency(Number.MAX_SAFE_INTEGER)).toMatch(/^\$[\d,]+\.00$/);
      expect(truncateText('a'.repeat(1000), 10)).toHaveLength(13); // 10 + '...'
    });
  });
});
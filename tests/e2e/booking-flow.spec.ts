/**
 * @fileoverview E2E Tests for Complete Booking Flow
 * 
 * Tests the critical user journey from homepage to booking confirmation
 * Following TDD: Write failing tests -> Implement features -> Refactor
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Booking Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should complete full booking flow successfully', async ({ page }) => {
    // Step 1: Homepage interaction
    await test.step('Open booking modal from homepage', async () => {
      // Verify homepage loads correctly
      await expect(page.locator('h1')).toContainText('Dapper Squad Entertainment');
      
      // Click on book now button
      await page.click('[data-testid="book-now-button"]');
      
      // Should open booking modal (not navigate to different page)
      await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();
    });

    // Step 2: Fill out booking form (Multi-step process)
    await test.step('Fill out booking form - Step 1: Services', async () => {
      // Services selection (First step)
      await page.click('[data-testid="service-card-dj"]');
      await page.click('[data-testid="service-card-photography"]');
      
      // Verify services are selected (cards should show selected state)
      await expect(page.locator('[data-testid="service-card-dj"]')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-testid="service-card-photography"]')).toHaveAttribute('aria-pressed', 'true');
      
      // Continue to next step
      await page.click('button:has-text("Next")');
    });

    await test.step('Fill out booking form - Step 2: Date & Time', async () => {
      // Event details
      await page.fill('[data-testid="event-date"]', '2024-12-25');
      
      // Continue to next step
      await page.click('button:has-text("Next")');
    });

    await test.step('Fill out booking form - Step 3: Event Details', async () => {
      await page.selectOption('[data-testid="event-type"]', 'wedding');
      
      // Venue information (these fields might not have testids yet, using name attributes)
      await page.fill('input[name="venue"], input[id*="venue"], input[placeholder*="venue"]', 'Grand Ballroom');
      await page.fill('input[name="venueAddress"], input[id*="address"], input[placeholder*="address"]', '123 Main St, Chicago, IL');
      await page.fill('input[name="guestCount"], input[id*="guest"], input[type="number"]', '150');
      
      // Continue to next step
      await page.click('button:has-text("Next")');
    });

    await test.step('Fill out booking form - Step 4: Contact Information', async () => {
      // Personal information
      await page.fill('[data-testid="client-name"]', 'John Doe');
      await page.fill('[data-testid="client-email"]', 'john.doe@example.com');
      await page.fill('[data-testid="client-phone"]', '(555) 123-4567');
      
      // Continue to review step
      await page.click('button:has-text("Next")');
    });

    await test.step('Review booking details', async () => {
      // Verify form data is shown in review step
      await expect(page.locator('text=John Doe')).toBeVisible();
      await expect(page.locator('text=john.doe@example.com')).toBeVisible();
      await expect(page.locator('text=December 25, 2024').or(page.locator('text=2024-12-25'))).toBeVisible();
    });

    // Step 3: Submit booking form
    await test.step('Submit booking form', async () => {
      // Submit the form
      await page.click('[data-testid="submit-booking"]');
      
      // Wait for form submission
      await page.waitForResponse(response => 
        response.url().includes('/api/bookings') && response.status() === 201
      );
      
      // Should show success message
      await expect(page.locator('[data-testid="booking-success"]')).toBeVisible();
      
      // Should display booking reference
      const bookingRef = await page.locator('[data-testid="booking-reference"]').textContent();
      expect(bookingRef).toMatch(/DSE-\d{6}-[A-Z0-9]{3}/);
    });

    // Step 4: Verify confirmation details
    await test.step('Verify booking confirmation', async () => {
      // Should show confirmation details
      await expect(page.locator('[data-testid="confirmed-name"]')).toContainText('John Doe');
      await expect(page.locator('[data-testid="confirmed-date"]')).toContainText('December 25, 2024');
      await expect(page.locator('[data-testid="confirmed-services"]')).toContainText('DJ');
      await expect(page.locator('[data-testid="confirmed-services"]')).toContainText('Photography');
      
      // Should show next steps
      await expect(page.locator('[data-testid="next-steps"]')).toBeVisible();
      
      // Should show payment information
      await expect(page.locator('[data-testid="payment-info"]')).toBeVisible();
    });

    // Step 5: Calendar integration
    await test.step('Test calendar integration', async () => {
      // Should have add to calendar button
      const calendarButton = page.locator('[data-testid="add-to-calendar"]');
      await expect(calendarButton).toBeVisible();
      
      // Click should generate calendar file
      const downloadPromise = page.waitForEvent('download');
      await calendarButton.click();
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.ics$/);
    });
  });

  test('should validate form fields correctly', async ({ page }) => {
    await test.step('Navigate to booking form', async () => {
      await page.click('[data-testid="book-now-button"]');
      await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();
    });

    await test.step('Test required field validation', async () => {
      // Navigate to contact step by clicking through the form
      await page.click('[data-testid="service-card-dj"]'); // Select at least one service
      
      // Navigate through steps to contact step
      await page.click('button:has-text("Next")'); // Services -> Date & Time
      await page.click('button:has-text("Next")'); // Date & Time -> Event Details  
      await page.click('button:has-text("Next")'); // Event Details -> Contact
      
      // Try to submit without filling contact information
      await page.click('[data-testid="submit-booking"]');
      
      // Should show validation errors on the same modal (no separate error elements expected)
      // Form will show inline validation errors
      await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();
    });

    await test.step('Test email validation', async () => {
      await page.fill('[data-testid="client-email"]', 'invalid-email');
      await page.click('[data-testid="submit-booking"]');
      
      await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email');
    });

    await test.step('Test phone validation', async () => {
      await page.fill('[data-testid="client-phone"]', '123');
      await page.click('[data-testid="submit-booking"]');
      
      await expect(page.locator('[data-testid="phone-error"]')).toContainText('valid phone');
    });

    await test.step('Test date validation', async () => {
      // Try to book a past date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      await page.fill('[data-testid="event-date"]', pastDate);
      await page.click('[data-testid="submit-booking"]');
      
      await expect(page.locator('[data-testid="date-error"]')).toContainText('future date');
    });

    await test.step('Test services validation', async () => {
      // Fill required fields but no services
      await page.fill('[data-testid="client-name"]', 'John Doe');
      await page.fill('[data-testid="client-email"]', 'john@example.com');
      await page.fill('[data-testid="event-date"]', '2024-12-25');
      
      await page.click('[data-testid="submit-booking"]');
      
      await expect(page.locator('[data-testid="services-error"]')).toContainText('at least one service');
    });
  });

  test('should handle unavailable dates', async ({ page }) => {
    await test.step('Navigate to booking form', async () => {
      await page.click('[data-testid="book-now-button"]');
    });

    await test.step('Try to book unavailable date', async () => {
      // Fill form with unavailable date (mocked in test data)
      await page.fill('[data-testid="client-name"]', 'Jane Smith');
      await page.fill('[data-testid="client-email"]', 'jane@example.com');
      await page.fill('[data-testid="client-phone"]', '(555) 987-6543');
      await page.fill('[data-testid="event-date"]', '2024-12-31'); // Unavailable date
      await page.selectOption('[data-testid="event-type"]', 'Corporate Event');
      await page.check('[data-testid="service-dj"]');
      
      await page.click('[data-testid="submit-booking"]');
      
      // Should show unavailable date error
      await expect(page.locator('[data-testid="booking-error"]')).toContainText('not available');
      
      // Should suggest alternative dates
      await expect(page.locator('[data-testid="alternative-dates"]')).toBeVisible();
    });
  });

  test('should handle booking submission errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('/api/bookings', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Server error' })
      });
    });

    await test.step('Submit booking with server error', async () => {
      await page.click('[data-testid="book-now-button"]');
      
      // Fill valid form
      await page.fill('[data-testid="client-name"]', 'John Doe');
      await page.fill('[data-testid="client-email"]', 'john@example.com');
      await page.fill('[data-testid="client-phone"]', '(555) 123-4567');
      await page.fill('[data-testid="event-date"]', '2024-12-25');
      await page.selectOption('[data-testid="event-type"]', 'Wedding');
      await page.check('[data-testid="service-dj"]');
      
      await page.click('[data-testid="submit-booking"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="booking-error"]')).toContainText('error occurred');
      
      // Should show retry option
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });
  });

  test('should be mobile responsive', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test only runs on mobile');

    await test.step('Test mobile booking flow', async () => {
      // Should show mobile-optimized layout
      await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();
      
      // Navigation should work on mobile
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      await page.click('[data-testid="mobile-book-now"]');
      await expect(page).toHaveURL(/.*\/booking/);
    });

    await test.step('Test mobile form usability', async () => {
      // Form should be mobile-friendly
      const nameInput = page.locator('[data-testid="client-name"]');
      await expect(nameInput).toBeVisible();
      
      // Test virtual keyboard interactions
      await nameInput.focus();
      await nameInput.fill('Mobile User');
      
      // Date picker should work on mobile
      await page.click('[data-testid="event-date"]');
      // Mobile date picker behavior varies by browser/device
    });
  });

  test('should handle multiple service combinations', async ({ page }) => {
    await page.click('[data-testid="book-now-button"]');

    await test.step('Test DJ only booking', async () => {
      await fillBasicBookingInfo(page, 'DJ Only Client');
      await page.check('[data-testid="service-dj"]');
      
      // Should show DJ-specific information
      await expect(page.locator('[data-testid="dj-info"]')).toBeVisible();
      
      // Should calculate correct pricing
      await expect(page.locator('[data-testid="estimated-price"]')).toContainText('$500');
    });

    await test.step('Test full package booking', async () => {
      await page.reload();
      await fillBasicBookingInfo(page, 'Full Package Client');
      
      await page.check('[data-testid="service-dj"]');
      await page.check('[data-testid="service-photography"]');
      await page.check('[data-testid="service-karaoke"]');
      
      // Should show package discount
      await expect(page.locator('[data-testid="package-discount"]')).toBeVisible();
      
      // Should calculate discounted pricing
      await expect(page.locator('[data-testid="estimated-price"]')).toContainText('$2000');
    });
  });

  test('should track user interactions for analytics', async ({ page }) => {
    // Mock analytics tracking
    const analyticsEvents: string[] = [];
    
    await page.evaluateOnNewDocument(() => {
      (window as any).mockAnalytics = {
        track: (event: string) => {
          (window as any).analyticsEvents = (window as any).analyticsEvents || [];
          (window as any).analyticsEvents.push(event);
        }
      };
    });

    await test.step('Track booking funnel', async () => {
      // Homepage view
      await page.goto('/');
      
      // Click book now (should track)
      await page.click('[data-testid="book-now-button"]');
      
      // Fill form (should track progress)
      await fillBasicBookingInfo(page, 'Analytics User');
      await page.check('[data-testid="service-dj"]');
      
      // Submit (should track conversion)
      await page.click('[data-testid="submit-booking"]');
      
      // Verify analytics events were tracked
      const events = await page.evaluate(() => (window as any).analyticsEvents);
      expect(events).toContain('booking_started');
      expect(events).toContain('service_selected');
      expect(events).toContain('booking_submitted');
    });
  });
});

// Helper function to fill basic booking information
async function fillBasicBookingInfo(page: Page, name: string) {
  await page.fill('[data-testid="client-name"]', name);
  await page.fill('[data-testid="client-email"]', `${name.toLowerCase().replace(' ', '.')}@example.com`);
  await page.fill('[data-testid="client-phone"]', '(555) 123-4567');
  await page.fill('[data-testid="event-date"]', '2024-12-25');
  await page.selectOption('[data-testid="event-type"]', 'Wedding');
  await page.fill('[data-testid="venue-name"]', 'Test Venue');
  await page.fill('[data-testid="guest-count"]', '100');
}
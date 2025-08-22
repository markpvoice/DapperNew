/**
 * @fileoverview E2E Tests for Contact Form Flow
 * 
 * Tests contact form submission and user experience
 * Following TDD principles with real user interactions
 */

import { test, expect } from '@playwright/test';

test.describe('Contact Form E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should submit contact form successfully', async ({ page }) => {
    await test.step('Navigate to contact section', async () => {
      // Scroll to contact section or navigate via menu
      await page.click('[data-testid="contact-nav-link"]');
      
      // Should scroll to contact section
      await expect(page.locator('[data-testid="contact-section"]')).toBeInViewport();
    });

    await test.step('Fill out contact form', async () => {
      // Fill all form fields
      await page.fill('[data-testid="contact-name"]', 'Sarah Johnson');
      await page.fill('[data-testid="contact-email"]', 'sarah.johnson@example.com');
      await page.fill('[data-testid="contact-phone"]', '(555) 987-6543');
      await page.fill('[data-testid="contact-subject"]', 'Wedding DJ Services Inquiry');
      await page.fill('[data-testid="contact-message"]', 
        'Hi! I am getting married on June 15th, 2024, and I am looking for a DJ for my wedding reception. ' +
        'The venue is in downtown Chicago and we expect about 120 guests. ' +
        'Could you please provide more information about your services and pricing?'
      );

      // Verify form is filled correctly
      await expect(page.locator('[data-testid="contact-name"]')).toHaveValue('Sarah Johnson');
      await expect(page.locator('[data-testid="contact-email"]')).toHaveValue('sarah.johnson@example.com');
    });

    await test.step('Submit contact form', async () => {
      // Submit the form
      await page.click('[data-testid="submit-contact"]');

      // Wait for API response
      await page.waitForResponse(response => 
        response.url().includes('/api/contact') && response.status() === 201
      );

      // Should show success message
      await expect(page.locator('[data-testid="contact-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="contact-success"]')).toContainText('Thank you');

      // Form should be cleared
      await expect(page.locator('[data-testid="contact-name"]')).toHaveValue('');
      await expect(page.locator('[data-testid="contact-email"]')).toHaveValue('');
    });

    await test.step('Verify success message details', async () => {
      // Should show confirmation details
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Sarah Johnson');
      await expect(page.locator('[data-testid="response-timeframe"]')).toContainText('24 hours');
      
      // Should show additional contact options
      await expect(page.locator('[data-testid="phone-contact-option"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-contact-option"]')).toBeVisible();
    });
  });

  test('should validate contact form fields', async ({ page }) => {
    await test.step('Navigate to contact form', async () => {
      await page.click('[data-testid="contact-nav-link"]');
    });

    await test.step('Test required field validation', async () => {
      // Try to submit empty form
      await page.click('[data-testid="submit-contact"]');

      // Should show validation errors
      await expect(page.locator('[data-testid="name-error"]')).toContainText('required');
      await expect(page.locator('[data-testid="email-error"]')).toContainText('required');
      await expect(page.locator('[data-testid="message-error"]')).toContainText('required');

      // Form should not be submitted
      await expect(page.locator('[data-testid="contact-success"]')).not.toBeVisible();
    });

    await test.step('Test email format validation', async () => {
      await page.fill('[data-testid="contact-name"]', 'Test User');
      await page.fill('[data-testid="contact-email"]', 'invalid-email-format');
      await page.fill('[data-testid="contact-message"]', 'This is a test message.');

      await page.click('[data-testid="submit-contact"]');

      await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email');
    });

    await test.step('Test message length validation', async () => {
      await page.fill('[data-testid="contact-name"]', 'Test User');
      await page.fill('[data-testid="contact-email"]', 'test@example.com');
      await page.fill('[data-testid="contact-message"]', 'Hi'); // Too short

      await page.click('[data-testid="submit-contact"]');

      await expect(page.locator('[data-testid="message-error"]')).toContainText('at least 10 characters');
    });

    await test.step('Test phone number validation', async () => {
      await page.fill('[data-testid="contact-phone"]', '123'); // Invalid phone

      // Should show validation hint
      await expect(page.locator('[data-testid="phone-hint"]')).toContainText('format: (555) 123-4567');
    });
  });

  test('should handle form submission errors gracefully', async ({ page }) => {
    // Mock server error
    await page.route('/api/contact', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Server temporarily unavailable' })
      });
    });

    await test.step('Submit form with server error', async () => {
      await page.click('[data-testid="contact-nav-link"]');

      // Fill valid form
      await page.fill('[data-testid="contact-name"]', 'Error Test User');
      await page.fill('[data-testid="contact-email"]', 'error@example.com');
      await page.fill('[data-testid="contact-message"]', 'This is a test message for error handling.');

      await page.click('[data-testid="submit-contact"]');

      // Should show error message
      await expect(page.locator('[data-testid="contact-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="contact-error"]')).toContainText('temporarily unavailable');

      // Should show retry option
      await expect(page.locator('[data-testid="retry-contact"]')).toBeVisible();
      
      // Should show alternative contact methods
      await expect(page.locator('[data-testid="alternative-contact"]')).toBeVisible();
      await expect(page.locator('[data-testid="phone-backup"]')).toContainText('(555) 123-4567');
    });

    await test.step('Test retry functionality', async () => {
      // Click retry button
      await page.click('[data-testid="retry-contact"]');

      // Should clear error message
      await expect(page.locator('[data-testid="contact-error"]')).not.toBeVisible();

      // Form data should still be preserved
      await expect(page.locator('[data-testid="contact-name"]')).toHaveValue('Error Test User');
      await expect(page.locator('[data-testid="contact-email"]')).toHaveValue('error@example.com');
    });
  });

  test('should show appropriate loading states', async ({ page }) => {
    await test.step('Test form submission loading', async () => {
      await page.click('[data-testid="contact-nav-link"]');

      // Fill form
      await page.fill('[data-testid="contact-name"]', 'Loading Test');
      await page.fill('[data-testid="contact-email"]', 'loading@example.com');
      await page.fill('[data-testid="contact-message"]', 'Testing loading states.');

      // Mock slow API response
      await page.route('/api/contact', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Contact form submitted successfully' })
        });
      });

      // Submit form
      await page.click('[data-testid="submit-contact"]');

      // Should show loading state
      await expect(page.locator('[data-testid="submit-contact"]')).toContainText('Sending...');
      await expect(page.locator('[data-testid="submit-contact"]')).toBeDisabled();
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

      // Should show success after loading
      await expect(page.locator('[data-testid="contact-success"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="submit-contact"]')).not.toBeDisabled();
    });
  });

  test('should auto-fill subject based on page context', async ({ page }) => {
    await test.step('Navigate from services page', async () => {
      // Go to DJ services page first
      await page.click('[data-testid="services-nav-link"]');
      await page.click('[data-testid="dj-service-card"]');

      // Then navigate to contact
      await page.click('[data-testid="contact-from-service"]');

      // Subject should be pre-filled based on service
      await expect(page.locator('[data-testid="contact-subject"]')).toHaveValue('DJ Services Inquiry');
    });

    await test.step('Navigate from pricing section', async () => {
      await page.goto('/');
      await page.click('[data-testid="pricing-section"]');
      await page.click('[data-testid="get-quote-button"]');

      // Subject should indicate quote request
      await expect(page.locator('[data-testid="contact-subject"]')).toHaveValue('Quote Request');
    });
  });

  test('should handle special characters and long messages', async ({ page }) => {
    await test.step('Test special characters in form', async () => {
      await page.click('[data-testid="contact-nav-link"]');

      const nameWithSpecialChars = "José María O'Connor-Smith";
      const messageWithSpecialChars = `
        Hello! I'm looking for DJ services for my quinceañera 🎉
        
        Event details:
        - Date: July 15th, 2024
        - Location: "La Rosa" Banquet Hall
        - Time: 6:00 PM - 12:00 AM
        - Special requests: Mix of English & Spanish music
        
        Budget: $800-$1,200
        
        ¡Gracias!
      `;

      await page.fill('[data-testid="contact-name"]', nameWithSpecialChars);
      await page.fill('[data-testid="contact-email"]', 'jose.maria@example.com');
      await page.fill('[data-testid="contact-message"]', messageWithSpecialChars);

      await page.click('[data-testid="submit-contact"]');

      await expect(page.locator('[data-testid="contact-success"]')).toBeVisible();
    });

    await test.step('Test maximum message length', async () => {
      // Create a very long message (but within limits)
      const longMessage = 'A'.repeat(2000) + ' This is a very long message to test the maximum length handling.';

      await page.fill('[data-testid="contact-name"]', 'Long Message Test');
      await page.fill('[data-testid="contact-email"]', 'long@example.com');
      await page.fill('[data-testid="contact-message"]', longMessage);

      // Should show character count
      await expect(page.locator('[data-testid="character-count"]')).toContainText('2000+');

      await page.click('[data-testid="submit-contact"]');
      await expect(page.locator('[data-testid="contact-success"]')).toBeVisible();
    });
  });

  test('should be accessible to screen readers', async ({ page }) => {
    await test.step('Test form accessibility', async () => {
      await page.click('[data-testid="contact-nav-link"]');

      // Check form labels are properly associated
      const nameInput = page.locator('[data-testid="contact-name"]');
      const nameLabel = page.locator('label[for="contact-name"]');
      
      await expect(nameLabel).toBeVisible();
      await expect(nameInput).toHaveAttribute('aria-describedby');

      // Check error messages are announced
      await page.click('[data-testid="submit-contact"]');
      
      const nameError = page.locator('[data-testid="name-error"]');
      await expect(nameError).toHaveAttribute('role', 'alert');
    });

    await test.step('Test keyboard navigation', async () => {
      // Test tab order
      await page.keyboard.press('Tab'); // Name field
      await expect(page.locator('[data-testid="contact-name"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Email field
      await expect(page.locator('[data-testid="contact-email"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Phone field
      await expect(page.locator('[data-testid="contact-phone"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Subject field
      await expect(page.locator('[data-testid="contact-subject"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Message field
      await expect(page.locator('[data-testid="contact-message"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Submit button
      await expect(page.locator('[data-testid="submit-contact"]')).toBeFocused();
    });
  });

  test('should work correctly on mobile devices', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test only runs on mobile');

    await test.step('Test mobile contact form', async () => {
      // Navigate to contact on mobile
      await page.click('[data-testid="mobile-menu-button"]');
      await page.click('[data-testid="mobile-contact-link"]');

      // Form should be mobile-optimized
      const form = page.locator('[data-testid="contact-form"]');
      await expect(form).toBeVisible();

      // Test touch interactions
      await page.tap('[data-testid="contact-name"]');
      await page.fill('[data-testid="contact-name"]', 'Mobile User');

      // Virtual keyboard should not obscure form
      await page.tap('[data-testid="contact-message"]');
      await expect(page.locator('[data-testid="contact-message"]')).toBeInViewport();
    });
  });

  test('should integrate with analytics tracking', async ({ page }) => {
    // Mock analytics
    await page.addInitScript(() => {
      (window as any).gtag = (event: string, action: string, params: any) => {
        (window as any).analyticsEvents = (window as any).analyticsEvents || [];
        (window as any).analyticsEvents.push({ event, action, params });
      };
    });

    await test.step('Track contact form interactions', async () => {
      await page.click('[data-testid="contact-nav-link"]');

      // Should track form view
      const viewEvents = await page.evaluate(() => 
        (window as any).analyticsEvents?.filter((e: any) => e.action === 'view_contact_form') || []
      );
      expect(viewEvents.length).toBeGreaterThan(0);

      // Fill and submit form
      await page.fill('[data-testid="contact-name"]', 'Analytics User');
      await page.fill('[data-testid="contact-email"]', 'analytics@example.com');
      await page.fill('[data-testid="contact-message"]', 'Testing analytics tracking.');

      await page.click('[data-testid="submit-contact"]');

      // Should track form submission
      const submitEvents = await page.evaluate(() => 
        (window as any).analyticsEvents?.filter((e: any) => e.action === 'submit_contact_form') || []
      );
      expect(submitEvents.length).toBeGreaterThan(0);
    });
  });
});
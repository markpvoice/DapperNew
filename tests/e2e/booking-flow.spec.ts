/**
 * @fileoverview E2E Tests for Complete Booking Flow
 * 
 * Tests the critical user journey from homepage to booking confirmation
 * Following TDD: Write failing tests -> Implement features -> Refactor
 */

import { test, expect, Page } from '@playwright/test';

// Helper functions for reliable interactions
async function waitForElementAndClick(page: Page, selector: string, timeout = 10000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Wait for animations
  await page.click(selector, { force: true });
  await page.waitForTimeout(300); // Wait for click effects
}

async function fillFieldSafely(page: Page, selector: string, value: string) {
  await page.waitForSelector(selector, { state: 'visible' });
  await page.fill(selector, ''); // Clear first
  await page.fill(selector, value);
  await page.waitForTimeout(100); // Small delay for input processing
}

async function openBookingModal(page: Page) {
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Wait for animations
  
  // Click booking button
  await waitForElementAndClick(page, '[data-testid="book-now-button"]');
  
  // Wait for modal to appear with multiple selector options
  const modal = page.locator('[data-testid="booking-modal"], [role="dialog"], .modal');
  await expect(modal).toBeVisible({ timeout: 15000 });
  
  // Wait for modal content to stabilize
  await page.waitForTimeout(1000);
}

test.describe('Booking Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should open booking modal successfully', async ({ page }) => {
    await test.step('Open booking modal from homepage', async () => {
      // Verify homepage loads correctly
      await expect(page.locator('h1')).toContainText('Dapper Squad');
      
      // Open modal using helper function
      await openBookingModal(page);
      
      // Verify modal content is present
      await expect(page.locator('h2:has-text("Select Services")')).toBeVisible();
    });
  });

  test('should select services successfully', async ({ page }) => {
    await openBookingModal(page);

    await test.step('Select DJ service', async () => {
      await waitForElementAndClick(page, '[data-testid="service-card-dj"]');
      await expect(page.locator('[data-testid="service-card-dj"]')).toHaveAttribute('aria-pressed', 'true');
    });

    await test.step('Select additional service', async () => {
      await waitForElementAndClick(page, '[data-testid="service-card-photography"]');
      await expect(page.locator('[data-testid="service-card-photography"]')).toHaveAttribute('aria-pressed', 'true');
    });

    await test.step('Verify pricing summary appears', async () => {
      await expect(page.locator('text=Total Estimated:')).toBeVisible();
    });
  });

  test('should navigate through form steps', async ({ page }) => {
    await openBookingModal(page);

    await test.step('Complete services step', async () => {
      await waitForElementAndClick(page, '[data-testid="service-card-dj"]');
      await waitForElementAndClick(page, 'button:has-text("Next")');
      await expect(page.locator('h2:has-text("Select Date & Time")')).toBeVisible();
    });

    await test.step('Complete date/time step', async () => {
      await fillFieldSafely(page, '[data-testid="event-date"]', '2024-12-25');
      
      // Also fill start time which might be required
      const startTimeField = page.locator('input[type="time"]').first();
      await startTimeField.fill('18:00');
      
      await waitForElementAndClick(page, 'button:has-text("Next")');
      await expect(page.locator('h2:has-text("Event Details")')).toBeVisible();
    });

    await test.step('Complete event details step', async () => {
      await page.selectOption('[data-testid="event-type"]', 'wedding');
      await fillFieldSafely(page, '#venue', 'Test Venue');
      await waitForElementAndClick(page, 'button:has-text("Next")');
      await expect(page.locator('h2:has-text("Contact Information")')).toBeVisible();
    });
  });

  test('should validate services are required', async ({ page }) => {
    await openBookingModal(page);

    await test.step('Try to proceed without selecting services', async () => {
      await waitForElementAndClick(page, 'button:has-text("Next")');
      await expect(page.locator('text=Please select at least one service')).toBeVisible();
    });
  });

  test('should validate contact information', async ({ page }) => {
    await openBookingModal(page);

    await test.step('Navigate to contact step', async () => {
      // Select a service and navigate to contact info
      await waitForElementAndClick(page, '[data-testid="service-card-dj"]');
      await waitForElementAndClick(page, 'button:has-text("Next")');
      
      // Fill date and move forward
      await fillFieldSafely(page, '[data-testid="event-date"]', '2024-12-25');
      await page.locator('input[type="time"]').first().fill('18:00');
      await waitForElementAndClick(page, 'button:has-text("Next")');
      
      // Fill event details and move to contact  
      await page.waitForSelector('[data-testid="event-type"]', { timeout: 10000 });
      await page.selectOption('[data-testid="event-type"]', 'wedding');
      await fillFieldSafely(page, '#venue', 'Test Venue');
      await waitForElementAndClick(page, 'button:has-text("Next")');
      
      // Now we're on contact step
      await expect(page.locator('h2:has-text("Contact Information")')).toBeVisible();
    });

    await test.step('Test required name field', async () => {
      await waitForElementAndClick(page, 'button:has-text("Next")');
      await expect(page.locator('text=Please provide your name')).toBeVisible();
    });
  });

  test.skip('should handle unavailable dates', async () => {
    // Not implemented in current UI flow
  });

  test('should handle form errors gracefully', async ({ page }) => {
    await openBookingModal(page);

    await test.step('Show helpful error messages', async () => {
      // Try to proceed without services
      await waitForElementAndClick(page, 'button:has-text("Next")');
      
      // Should show specific error message
      await expect(page.locator('text=Please select at least one service')).toBeVisible();
      
      // Modal should remain open
      await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();
    });
  });

  test('should be mobile responsive', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test only runs on mobile');

    await test.step('Test mobile booking flow', async () => {
      await openBookingModal(page);
      
      // Verify modal is accessible on mobile
      await expect(page.locator('text=Select Services')).toBeVisible();
      
      // Test service selection on mobile
      await waitForElementAndClick(page, '[data-testid="service-card-dj"]');
      await expect(page.locator('[data-testid="service-card-dj"]')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test('should support multiple service selections', async ({ page }) => {
    await openBookingModal(page);

    await test.step('Select multiple services', async () => {
      await waitForElementAndClick(page, '[data-testid="service-card-dj"]');
      await waitForElementAndClick(page, '[data-testid="service-card-photography"]');
      await waitForElementAndClick(page, '[data-testid="service-card-karaoke"]');
      
      // All services should be selected
      await expect(page.locator('[data-testid="service-card-dj"]')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-testid="service-card-photography"]')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-testid="service-card-karaoke"]')).toHaveAttribute('aria-pressed', 'true');
      
      // Pricing summary should appear
      await expect(page.locator('text=Total Estimated:')).toBeVisible();
    });
  });

  test.skip('should track user interactions for analytics', async () => {
    // Not implemented in UI; skip until analytics events are wired.
  });
});


/**
 * @fileoverview E2E Tests for Contact Section
 * 
 * Validates the presence and accessibility of the Contact section
 * on the homepage. The current UI does not include a contact form.
 */

import { test, expect } from '@playwright/test';

test.describe('Contact Section E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to contact section and display info', async ({ page }) => {
    await test.step('Navigate to contact section', async () => {
      await page.click('a[href="#contact"]');
      await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
    });

    await test.step('Verify contact details are visible', async () => {
      await expect(page.locator('text=We typically reply within 24–48 hours')).toBeVisible();
      await expect(page.locator('text=dappersquadentertainment414@gmail.com')).toBeVisible();
      await expect(page.locator('text=Facebook: Dapper Squad Entertainment')).toBeVisible();
    });
  });

  test('should have accessible landmarks', async ({ page }) => {
    // Main and footer landmarks present
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    // Contact heading is an accessible heading
    await page.click('a[href="#contact"]');
    await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
  });
});

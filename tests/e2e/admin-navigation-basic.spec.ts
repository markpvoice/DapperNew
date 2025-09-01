/**
 * @fileoverview Basic Admin Navigation E2E Tests
 * 
 * Simplified version of admin navigation tests for quick verification.
 * Tests core navigation functionality without complex scenarios.
 */

import { test, expect, Page } from '@playwright/test';
import { 
  AdminAuthHelpers, 
  AdminDashboardHelpers,
  quickAdminLogin,
  ADMIN_ROUTES,
  TIMEOUTS
} from './helpers/admin-auth-helpers';

test.describe('Basic Admin Navigation Tests', () => {
  let authHelpers: AdminAuthHelpers;
  let dashboardHelpers: AdminDashboardHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AdminAuthHelpers(page);
    dashboardHelpers = new AdminDashboardHelpers(page);

    // Start from homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should login to admin dashboard successfully', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await authHelpers.navigateToLogin();
      
      // Verify login page loaded
      await expect(page.locator('text=Admin Portal, text=Admin Login')).toBeVisible();
    });

    await test.step('Perform login', async () => {
      await authHelpers.login();
      
      // Verify redirected to dashboard
      await expect(page).toHaveURL(/.*\/admin$/);
      await expect(page.locator('text=Admin Dashboard, text=Dashboard')).toBeVisible();
    });
  });

  test('should navigate to calendar section', async ({ page }) => {
    await quickAdminLogin(page);

    await test.step('Navigate to calendar', async () => {
      await dashboardHelpers.navigateToCalendar();
      
      // Verify calendar page loaded
      await expect(page).toHaveURL(/.*\/admin\/calendar/);
      await dashboardHelpers.verifyCalendarPageLoaded();
    });
  });

  test('should navigate to analytics section', async ({ page }) => {
    await quickAdminLogin(page);

    await test.step('Navigate to analytics', async () => {
      await dashboardHelpers.navigateToAnalytics();
      
      // Verify analytics page loaded
      await expect(page).toHaveURL(/.*\/admin\/analytics/);
      await dashboardHelpers.verifyAnalyticsPageLoaded();
    });
  });

  test('should redirect unauthenticated users', async ({ page }) => {
    await test.step('Try to access admin without auth', async () => {
      await page.goto(ADMIN_ROUTES.dashboard);
      await page.waitForLoadState('networkidle');
      
      // Should redirect to login or show login form
      await authHelpers.verifyNotAuthenticated();
    });
  });

  test('should support direct URL navigation when authenticated', async ({ page }) => {
    await quickAdminLogin(page);

    await test.step('Direct access to calendar', async () => {
      await page.goto(ADMIN_ROUTES.calendar);
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/.*\/admin\/calendar/);
      await dashboardHelpers.verifyCalendarPageLoaded();
    });

    await test.step('Direct access to analytics', async () => {
      await page.goto(ADMIN_ROUTES.analytics);
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/.*\/admin\/analytics/);
      await dashboardHelpers.verifyAnalyticsPageLoaded();
    });
  });

  test('should handle mobile viewport', async ({ page }) => {
    await quickAdminLogin(page);

    await test.step('Set mobile viewport and test navigation', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(TIMEOUTS.animationWait);

      // Should still be able to navigate
      await page.goto(ADMIN_ROUTES.calendar);
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/.*\/admin\/calendar/);
    });
  });
});
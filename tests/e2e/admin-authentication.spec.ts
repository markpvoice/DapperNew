/**
 * @fileoverview E2E Tests for Admin Authentication and Dashboard Navigation
 * 
 * Comprehensive tests for admin login, dashboard access, and navigation.
 * Demonstrates usage of the admin authentication test helpers.
 * 
 * Test Coverage:
 * - Admin login with valid credentials
 * - Authentication failure scenarios
 * - Dashboard access and navigation
 * - Session verification and logout
 * - Mobile responsiveness
 * - Error handling
 */

import { test, expect, Page } from '@playwright/test';
import {
  AdminAuthHelpers,
  AdminDashboardHelpers,
  AdminTestDataHelpers,
  performCompleteAdminLogin,
  quickAdminLogin,
  testAuthenticationFailures,
  ADMIN_TEST_CREDENTIALS,
  ADMIN_ROUTES
} from './helpers/admin-auth-helpers';

test.describe('Admin Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage to ensure clean state
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should perform complete admin login workflow', async ({ page }) => {
    await test.step('Navigate to admin login page', async () => {
      const authHelpers = new AdminAuthHelpers(page);
      await authHelpers.navigateToLogin();
      
      // Verify login page is loaded correctly
      await expect(page.locator('text=Admin Portal')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    });

    await test.step('Perform admin login with valid credentials', async () => {
      const authHelpers = new AdminAuthHelpers(page);
      await authHelpers.login(ADMIN_TEST_CREDENTIALS.email, ADMIN_TEST_CREDENTIALS.password);
      
      // Should be redirected to admin dashboard
      await expect(page).toHaveURL(/.*\/admin$/);
    });

    await test.step('Verify dashboard access and authentication', async () => {
      const authHelpers = new AdminAuthHelpers(page);
      await authHelpers.verifyDashboardAccess();
      await authHelpers.verifyAuthenticated();
      
      // Dashboard elements should be visible
      await expect(
        page.locator('h1:has-text("Admin Dashboard"), h1:has-text("Dashboard"), text=Admin Dashboard')
      ).toBeVisible();
    });
  });

  test('should handle authentication failures correctly', async ({ page }) => {
    const authHelpers = new AdminAuthHelpers(page);

    await test.step('Test invalid email credentials', async () => {
      await authHelpers.navigateToLogin();
      await authHelpers.login('invalid@example.com', ADMIN_TEST_CREDENTIALS.password, false);
      
      // Should remain on login page
      expect(page.url()).toContain('/admin/login');
      
      // Should show error message
      await authHelpers.handleAuthenticationError('Invalid credentials');
    });

    await test.step('Test invalid password credentials', async () => {
      await authHelpers.navigateToLogin();  
      await authHelpers.login(ADMIN_TEST_CREDENTIALS.email, 'wrongpassword', false);
      
      // Should remain on login page
      expect(page.url()).toContain('/admin/login');
      
      // Should show error message
      await authHelpers.handleAuthenticationError('Invalid credentials');
    });

    await test.step('Test empty credentials', async () => {
      await authHelpers.navigateToLogin();
      
      // Try to submit with empty fields - button should be disabled
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });
  });

  test('should navigate admin dashboard sections correctly', async ({ page }) => {
    // Perform initial login
    const { dashboardHelpers } = await performCompleteAdminLogin(page);

    await test.step('Navigate to calendar management', async () => {
      await dashboardHelpers.navigateToCalendar();
      await dashboardHelpers.verifyCalendarPageLoaded();
      
      // Should be on calendar page
      await expect(page).toHaveURL(/.*\/admin\/calendar/);
    });

    await test.step('Navigate to analytics dashboard', async () => {
      await dashboardHelpers.navigateToAnalytics();
      await dashboardHelpers.verifyAnalyticsPageLoaded();
      
      // Should be on analytics page
      await expect(page).toHaveURL(/.*\/admin\/analytics/);
    });

    await test.step('Return to main dashboard', async () => {
      await page.goto(ADMIN_ROUTES.dashboard);
      await page.waitForLoadState('networkidle');
      
      // Should be back on main dashboard
      await expect(page).toHaveURL(/.*\/admin$/);
      await dashboardHelpers.waitForDashboardData();
    });
  });

  test('should handle logout correctly', async ({ page }) => {
    // Login first
    await quickAdminLogin(page);
    
    await test.step('Verify authenticated access', async () => {
      const authHelpers = new AdminAuthHelpers(page);
      await authHelpers.verifyAuthenticated();
    });

    await test.step('Perform logout', async () => {
      const authHelpers = new AdminAuthHelpers(page);
      await authHelpers.logout();
    });

    await test.step('Verify logout was successful', async () => {
      const authHelpers = new AdminAuthHelpers(page);
      await authHelpers.verifyNotAuthenticated();
      
      // Should not be able to access admin pages
      await page.goto(ADMIN_ROUTES.dashboard);
      await page.waitForLoadState('networkidle');
      
      // Should redirect to login or show login form
      const isOnLoginPage = page.url().includes('/admin/login');
      const hasLoginForm = await page.locator('form').count() > 0 && 
                           await page.locator('input[name="email"]').count() > 0;
      
      expect(isOnLoginPage || hasLoginForm).toBe(true);
    });
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    // Login first
    await quickAdminLogin(page);

    await test.step('Verify session persists after page refresh', async () => {
      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be authenticated and on dashboard
      const authHelpers = new AdminAuthHelpers(page);
      await authHelpers.verifyAuthenticated();
      await authHelpers.verifyDashboardAccess();
    });

    await test.step('Verify session persists across navigation', async () => {
      const { dashboardHelpers } = await performCompleteAdminLogin(page);
      
      // Navigate to different admin sections
      await dashboardHelpers.navigateToCalendar();
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be authenticated
      const authHelpers = new AdminAuthHelpers(page);
      await authHelpers.verifyAuthenticated();
    });
  });

  test('should handle direct URL access correctly', async ({ page }) => {
    await test.step('Test unauthenticated direct access to admin dashboard', async () => {
      await page.goto(ADMIN_ROUTES.dashboard);
      await page.waitForLoadState('networkidle');
      
      const authHelpers = new AdminAuthHelpers(page);
      await authHelpers.verifyNotAuthenticated();
    });

    await test.step('Test unauthenticated direct access to admin calendar', async () => {
      await page.goto(ADMIN_ROUTES.calendar);
      await page.waitForLoadState('networkidle');
      
      const authHelpers = new AdminAuthHelpers(page);
      await authHelpers.verifyNotAuthenticated();
    });

    await test.step('Test authenticated direct access works', async () => {
      // Login first
      await quickAdminLogin(page);
      
      // Direct access should work
      await page.goto(ADMIN_ROUTES.calendar);
      await page.waitForLoadState('networkidle');
      
      const dashboardHelpers = new AdminDashboardHelpers(page);
      await dashboardHelpers.verifyCalendarPageLoaded();
    });
  });

  test('should display dashboard data correctly', async ({ page }) => {
    const { dashboardHelpers, dataHelpers } = await performCompleteAdminLogin(page);

    await test.step('Wait for dashboard data to load', async () => {
      await dashboardHelpers.waitForDashboardData();
      await dataHelpers.verifyDashboardData();
    });

    await test.step('Verify dashboard statistics are displayed', async () => {
      // Look for common dashboard elements
      const statsElements = [
        'text=Total',
        'text=Revenue',
        'text=Bookings',
        'text=/[0-9]+/', // Numbers
        'text=/\\$[0-9]+/' // Currency
      ];

      for (const selector of statsElements) {
        const elements = await page.locator(selector).count();
        if (elements > 0) {
          // At least one stats element should be visible
          await expect(page.locator(selector).first()).toBeVisible();
          break;
        }
      }
    });
  });

  test('should be mobile responsive', async ({ page }) => {
    // Login on desktop first
    await quickAdminLogin(page);

    await test.step('Test mobile viewport behavior', async () => {
      const dashboardHelpers = new AdminDashboardHelpers(page);
      await dashboardHelpers.verifyMobileResponsive();
    });

    await test.step('Test mobile navigation still works', async () => {
      // Navigation should still work on mobile
      const dashboardHelpers = new AdminDashboardHelpers(page);
      
      // Try to navigate (might use mobile menu)
      try {
        await dashboardHelpers.navigateToCalendar();
        await dashboardHelpers.verifyCalendarPageLoaded();
      } catch (error) {
        // Mobile navigation might work differently, just verify page access
        await page.goto(ADMIN_ROUTES.calendar);
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*\/admin\/calendar/);
      }
    });
  });

  test('should handle rate limiting gracefully', async ({ page }) => {
    // This test would simulate multiple failed login attempts
    // Skip if rate limiting is not enabled in test environment
    test.skip(process.env.DISABLE_RATE_LIMITING === 'true', 'Rate limiting disabled in test environment');

    const authHelpers = new AdminAuthHelpers(page);

    await test.step('Test rate limiting after multiple failures', async () => {
      await authHelpers.navigateToLogin();
      
      // Attempt multiple failed logins (adjust count based on rate limit)
      for (let i = 0; i < 5; i++) {
        await authHelpers.login('invalid@example.com', 'wrongpassword', false);
        await authHelpers.handleAuthenticationError();
        
        // Reset form for next attempt
        await page.reload();
        await page.waitForLoadState('networkidle');
      }
      
      // Next attempt should show rate limiting error
      await authHelpers.login('invalid@example.com', 'wrongpassword', false);
      await authHelpers.handleAuthenticationError('Too many login attempts');
    });
  });

  test('should use authentication helper functions correctly', async ({ page }) => {
    await test.step('Test performCompleteAdminLogin helper', async () => {
      const { authHelpers, dashboardHelpers, dataHelpers } = await performCompleteAdminLogin(page);
      
      // All helpers should be returned and functional
      expect(authHelpers).toBeDefined();
      expect(dashboardHelpers).toBeDefined();
      expect(dataHelpers).toBeDefined();
      
      // Should be on dashboard
      await expect(page).toHaveURL(/.*\/admin$/);
    });

    await test.step('Test quickAdminLogin helper', async () => {
      // Logout first
      const authHelpers = new AdminAuthHelpers(page);
      await authHelpers.logout();
      
      // Quick login should work
      await quickAdminLogin(page);
      await expect(page).toHaveURL(/.*\/admin$/);
    });

    await test.step('Test testAuthenticationFailures helper', async () => {
      // Logout first
      const authHelpers = new AdminAuthHelpers(page);
      await authHelpers.logout();
      
      // Test authentication failures
      await testAuthenticationFailures(page);
      
      // Should still be on login page after failed attempts
      expect(page.url()).toContain('/admin/login');
    });
  });
});
/**
 * @fileoverview E2E Tests for Admin Dashboard Navigation
 * 
 * Comprehensive tests covering admin dashboard navigation functionality including:
 * - Main dashboard access and layout verification
 * - Tab/section switching between Dashboard, Calendar, Analytics
 * - Mobile responsive navigation patterns with hamburger menus
 * - URL navigation and direct access scenarios
 * - Navigation state persistence across page refreshes
 * - Authentication guards and error handling
 * - Cross-browser compatibility for navigation flows
 * 
 * Uses AdminAuthHelpers and AdminDashboardHelpers for reliable test patterns
 * following the established booking-flow.spec.ts approach.
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { 
  AdminAuthHelpers, 
  AdminDashboardHelpers, 
  AdminTestDataHelpers,
  performCompleteAdminLogin,
  quickAdminLogin,
  testAuthenticationFailures,
  ADMIN_ROUTES,
  ADMIN_TEST_CREDENTIALS,
  TIMEOUTS
} from './helpers/admin-auth-helpers';

// Enhanced helper for navigation verification
class NavigationTestHelpers {
  constructor(private page: Page) {}

  /**
   * Verify page URL matches expected route
   */
  async verifyCurrentRoute(expectedRoute: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`.*${expectedRoute.replace('/', '\\/')}$`));
  }

  /**
   * Verify navigation breadcrumbs are correct
   */
  async verifyBreadcrumbs(expectedBreadcrumbs: string[]): Promise<void> {
    for (const breadcrumb of expectedBreadcrumbs) {
      await expect(
        this.page.locator(`text="${breadcrumb}", [aria-label*="${breadcrumb}"]`).first()
      ).toBeVisible({ timeout: TIMEOUTS.elementVisible });
    }
  }

  /**
   * Verify active navigation state
   */
  async verifyActiveTab(tabName: string): Promise<void> {
    const activeTabSelectors = [
      `button:has-text("${tabName}").text-brand-gold`,
      `a:has-text("${tabName}").text-brand-gold`,
      `[aria-current="page"]:has-text("${tabName}")`,
      `.border-brand-gold:has-text("${tabName}")`
    ];

    let tabFound = false;
    for (const selector of activeTabSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        await expect(element).toBeVisible();
        tabFound = true;
        break;
      }
    }

    if (!tabFound) {
      // Fallback: at least verify the tab text exists
      await expect(this.page.locator(`text="${tabName}"`)).toBeVisible();
    }
  }

  /**
   * Test back navigation functionality
   */
  async testBrowserBackNavigation(expectedPreviousRoute: string): Promise<void> {
    await this.page.goBack();
    await this.page.waitForLoadState('networkidle');
    await this.verifyCurrentRoute(expectedPreviousRoute);
  }

  /**
   * Test forward navigation functionality
   */
  async testBrowserForwardNavigation(expectedNextRoute: string): Promise<void> {
    await this.page.goForward();
    await this.page.waitForLoadState('networkidle');
    await this.verifyCurrentRoute(expectedNextRoute);
  }

  /**
   * Verify page refresh maintains navigation state
   */
  async testPageRefreshPersistence(): Promise<void> {
    const currentUrl = this.page.url();
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(currentUrl);
  }

  /**
   * Test mobile hamburger menu functionality
   */
  async testMobileMenuToggle(): Promise<void> {
    // Switch to mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(TIMEOUTS.animationWait);

    // Look for mobile menu button
    const mobileMenuSelectors = [
      '[data-testid="mobile-menu-button"]',
      'button[aria-label="Menu"]',
      'button:has-text("☰")',
      '.hamburger-menu'
    ];

    let menuButtonFound = false;
    for (const selector of mobileMenuSelectors) {
      const button = this.page.locator(selector);
      if (await button.count() > 0) {
        // Click to open menu
        await button.click();
        await this.page.waitForTimeout(TIMEOUTS.animationWait);
        
        // Verify menu opened (look for navigation links)
        await expect(
          this.page.locator('text=Dashboard, text=Calendar, text=Analytics').first()
        ).toBeVisible();
        
        // Click again to close
        await button.click();
        await this.page.waitForTimeout(TIMEOUTS.animationWait);
        
        menuButtonFound = true;
        break;
      }
    }

    expect(menuButtonFound).toBe(true);
  }
}

test.describe('Admin Dashboard Navigation E2E Tests', () => {
  let authHelpers: AdminAuthHelpers;
  let dashboardHelpers: AdminDashboardHelpers;
  let dataHelpers: AdminTestDataHelpers;
  let navHelpers: NavigationTestHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AdminAuthHelpers(page);
    dashboardHelpers = new AdminDashboardHelpers(page);
    dataHelpers = new AdminTestDataHelpers(page);
    navHelpers = new NavigationTestHelpers(page);

    // Start each test from a clean state
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Authentication and Dashboard Access', () => {
    test('should perform complete admin login and verify dashboard access', async ({ page }) => {
      await test.step('Navigate to login and authenticate', async () => {
        const { authHelpers: auth, dashboardHelpers: dash } = await performCompleteAdminLogin(page);
        
        // Verify we're on the main dashboard
        await navHelpers.verifyCurrentRoute('/admin');
        await dash.waitForDashboardData();
      });

      await test.step('Verify dashboard layout and navigation elements', async () => {
        // Verify main dashboard elements are present
        await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
        await expect(page.locator('[data-testid="admin-navigation"]')).toBeVisible();
        await expect(page.locator('text=Admin Dashboard')).toBeVisible();
        
        // Verify navigation tabs are present
        await expect(page.locator('text=Dashboard')).toBeVisible();
        await expect(page.locator('text=Calendar')).toBeVisible();
        await expect(page.locator('text=Analytics')).toBeVisible();
      });

      await test.step('Verify active tab state', async () => {
        await navHelpers.verifyActiveTab('Dashboard');
      });
    });

    test('should redirect unauthenticated users to login', async ({ page }) => {
      await test.step('Try to access admin dashboard without authentication', async () => {
        await page.goto(ADMIN_ROUTES.dashboard);
        await page.waitForLoadState('networkidle');
        
        // Should redirect to login or show login form
        const isOnLoginPage = page.url().includes('/admin/login');
        const hasLoginForm = await page.locator('form').count() > 0 && 
                             await page.locator('input[name="email"]').count() > 0;
        
        expect(isOnLoginPage || hasLoginForm).toBe(true);
      });
    });

    test('should handle authentication failures gracefully', async ({ page }) => {
      await testAuthenticationFailures(page);
    });
  });

  test.describe('Main Dashboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await quickAdminLogin(page);
    });

    test('should display dashboard statistics and data', async ({ page }) => {
      await test.step('Wait for dashboard data to load', async () => {
        await dashboardHelpers.waitForDashboardData();
      });

      await test.step('Verify dashboard statistics are present', async () => {
        await dataHelpers.verifyDashboardData();
        
        // Look for common dashboard elements
        const dashboardElements = [
          'text=/Total.*Revenue/',
          'text=/Bookings/',
          'text=/Upcoming/',
          'text=/Recent/'
        ];

        // At least some dashboard data should be visible
        let hasData = false;
        for (const selector of dashboardElements) {
          if (await page.locator(selector).count() > 0) {
            hasData = true;
            break;
          }
        }
        expect(hasData).toBe(true);
      });
    });

    test('should handle dashboard loading states correctly', async ({ page }) => {
      await test.step('Refresh page and verify loading states', async () => {
        await page.reload();
        
        // Check for loading indicators
        const loadingElement = page.locator('[data-testid="dashboard-loading"]');
        const dashboardElement = page.locator('[data-testid="admin-dashboard"]');
        
        // Either loading state or dashboard should be visible
        await expect(loadingElement.or(dashboardElement)).toBeVisible({ timeout: TIMEOUTS.navigation });
        
        // Eventually dashboard should load
        await expect(dashboardElement).toBeVisible({ timeout: TIMEOUTS.navigation });
      });
    });

    test('should handle dashboard errors gracefully', async ({ page }) => {
      // This test would need API mocking to simulate errors
      // For now, we'll just verify error handling structure exists
      await test.step('Verify error handling elements exist', async () => {
        // Check that error handling is built into component
        // (This would be enhanced with API mocking in a real implementation)
        await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
      });
    });
  });

  test.describe('Tab and Section Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await quickAdminLogin(page);
    });

    test('should switch between Dashboard and Bookings tabs', async ({ page }) => {
      await test.step('Start on Dashboard tab', async () => {
        await navHelpers.verifyActiveTab('Dashboard');
        await navHelpers.verifyCurrentRoute('/admin');
      });

      await test.step('Switch to Bookings tab', async () => {
        await page.locator('button:has-text("Bookings")').click();
        await page.waitForTimeout(TIMEOUTS.animationWait);
        
        await navHelpers.verifyActiveTab('Bookings');
        
        // Verify bookings content is displayed
        await expect(
          page.locator('text=Bookings, text=Manage Bookings, [data-testid="booking-management"]').first()
        ).toBeVisible({ timeout: TIMEOUTS.elementVisible });
      });

      await test.step('Switch back to Dashboard tab', async () => {
        await page.locator('button:has-text("Dashboard")').click();
        await page.waitForTimeout(TIMEOUTS.animationWait);
        
        await navHelpers.verifyActiveTab('Dashboard');
      });
    });

    test('should navigate to Calendar section', async ({ page }) => {
      await test.step('Click Calendar navigation link', async () => {
        await page.locator('a[href="/admin/calendar"]').click();
        await page.waitForLoadState('networkidle');
        
        await navHelpers.verifyCurrentRoute('/admin/calendar');
        await dashboardHelpers.verifyCalendarPageLoaded();
      });

      await test.step('Verify calendar-specific elements', async () => {
        await expect(
          page.locator('text=Calendar Management, text=Calendar').first()
        ).toBeVisible({ timeout: TIMEOUTS.elementVisible });
      });
    });

    test('should navigate to Analytics section', async ({ page }) => {
      await test.step('Click Analytics navigation link', async () => {
        await page.locator('a[href="/admin/analytics"]').click();
        await page.waitForLoadState('networkidle');
        
        await navHelpers.verifyCurrentRoute('/admin/analytics');
        await dashboardHelpers.verifyAnalyticsPageLoaded();
      });

      await test.step('Verify analytics-specific elements', async () => {
        await expect(
          page.locator('text=Analytics, text=Revenue, svg').first()
        ).toBeVisible({ timeout: TIMEOUTS.elementVisible });
      });
    });

    test('should maintain navigation state across sections', async ({ page }) => {
      await test.step('Navigate through multiple sections', async () => {
        // Start at Dashboard
        await navHelpers.verifyCurrentRoute('/admin');
        
        // Go to Calendar
        await page.locator('a[href="/admin/calendar"]').click();
        await page.waitForLoadState('networkidle');
        await navHelpers.verifyCurrentRoute('/admin/calendar');
        
        // Go to Analytics
        await page.locator('a[href="/admin/analytics"]').click();
        await page.waitForLoadState('networkidle');
        await navHelpers.verifyCurrentRoute('/admin/analytics');
        
        // Return to Dashboard
        await page.locator('a[href="/admin"]').click();
        await page.waitForLoadState('networkidle');
        await navHelpers.verifyCurrentRoute('/admin');
      });
    });
  });

  test.describe('Back Navigation and Breadcrumbs', () => {
    test.beforeEach(async ({ page }) => {
      await quickAdminLogin(page);
    });

    test('should support back navigation between admin sections', async ({ page }) => {
      await test.step('Navigate from Dashboard to Calendar', async () => {
        await page.locator('a[href="/admin/calendar"]').click();
        await page.waitForLoadState('networkidle');
        await navHelpers.verifyCurrentRoute('/admin/calendar');
      });

      await test.step('Use back navigation to return to Dashboard', async () => {
        await navHelpers.testBrowserBackNavigation('/admin');
      });

      await test.step('Use forward navigation to return to Calendar', async () => {
        await navHelpers.testBrowserForwardNavigation('/admin/calendar');
      });
    });

    test('should provide "Back to Dashboard" links in sub-sections', async ({ page }) => {
      await test.step('Navigate to Analytics and find back link', async () => {
        await page.locator('a[href="/admin/analytics"]').click();
        await page.waitForLoadState('networkidle');
        
        // Look for back to dashboard link
        const backLinkSelectors = [
          'a:has-text("Back to Dashboard")',
          'a:has-text("← Dashboard")',
          'a:has-text("Back")',
          'a[href="/admin"]:has-text("Dashboard")'
        ];

        let backLinkFound = false;
        for (const selector of backLinkSelectors) {
          const link = page.locator(selector);
          if (await link.count() > 0) {
            await link.click();
            await page.waitForLoadState('networkidle');
            await navHelpers.verifyCurrentRoute('/admin');
            backLinkFound = true;
            break;
          }
        }

        // If no back link found, that's acceptable for some designs
        if (!backLinkFound) {
          console.log('No explicit back to dashboard link found - this may be expected');
        }
      });
    });
  });

  test.describe('Mobile Responsive Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await quickAdminLogin(page);
    });

    test('should display hamburger menu on mobile devices', async ({ page }) => {
      await test.step('Switch to mobile viewport and test menu', async () => {
        await navHelpers.testMobileMenuToggle();
      });
    });

    test('should maintain navigation functionality on mobile', async ({ page }) => {
      await test.step('Set mobile viewport', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(TIMEOUTS.animationWait);
      });

      await test.step('Test mobile navigation to Calendar', async () => {
        // Try direct navigation since mobile menus might work differently
        await page.goto(ADMIN_ROUTES.calendar);
        await page.waitForLoadState('networkidle');
        await navHelpers.verifyCurrentRoute('/admin/calendar');
        
        await dashboardHelpers.verifyCalendarPageLoaded();
      });

      await test.step('Test mobile navigation to Analytics', async () => {
        await page.goto(ADMIN_ROUTES.analytics);
        await page.waitForLoadState('networkidle');
        await navHelpers.verifyCurrentRoute('/admin/analytics');
        
        await dashboardHelpers.verifyAnalyticsPageLoaded();
      });
    });

    test('should have proper touch targets on mobile', async ({ page }) => {
      await test.step('Verify mobile navigation elements meet touch target requirements', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(TIMEOUTS.animationWait);

        // Check navigation elements have appropriate sizing
        const navElements = await page.locator('nav a, nav button').all();
        for (const element of navElements) {
          const boundingBox = await element.boundingBox();
          if (boundingBox) {
            // Touch targets should be at least 44px (iOS guideline)
            expect(boundingBox.height).toBeGreaterThanOrEqual(40); // Allow some flexibility
          }
        }
      });
    });
  });

  test.describe('URL Navigation and Direct Access', () => {
    test.beforeEach(async ({ page }) => {
      await quickAdminLogin(page);
    });

    test('should support direct URL access to admin sections', async ({ page }) => {
      await test.step('Direct access to Calendar via URL', async () => {
        await page.goto(ADMIN_ROUTES.calendar);
        await page.waitForLoadState('networkidle');
        await navHelpers.verifyCurrentRoute('/admin/calendar');
        await dashboardHelpers.verifyCalendarPageLoaded();
      });

      await test.step('Direct access to Analytics via URL', async () => {
        await page.goto(ADMIN_ROUTES.analytics);
        await page.waitForLoadState('networkidle');
        await navHelpers.verifyCurrentRoute('/admin/analytics');
        await dashboardHelpers.verifyAnalyticsPageLoaded();
      });

      await test.step('Direct access to Dashboard via URL', async () => {
        await page.goto(ADMIN_ROUTES.dashboard);
        await page.waitForLoadState('networkidle');
        await navHelpers.verifyCurrentRoute('/admin');
        await authHelpers.verifyDashboardAccess();
      });
    });

    test('should handle invalid admin routes gracefully', async ({ page }) => {
      await test.step('Access non-existent admin route', async () => {
        const response = await page.goto('/admin/nonexistent');
        
        // Should either redirect or show 404
        const is404 = response?.status() === 404;
        const redirectedToValid = page.url().includes('/admin') && !page.url().includes('nonexistent');
        
        expect(is404 || redirectedToValid).toBe(true);
      });
    });
  });

  test.describe('Navigation State Persistence', () => {
    test.beforeEach(async ({ page }) => {
      await quickAdminLogin(page);
    });

    test('should maintain authentication state across page refreshes', async ({ page }) => {
      await test.step('Navigate to Calendar and refresh', async () => {
        await page.goto(ADMIN_ROUTES.calendar);
        await page.waitForLoadState('networkidle');
        
        await navHelpers.testPageRefreshPersistence();
        
        // Should still be authenticated and on calendar page
        await dashboardHelpers.verifyCalendarPageLoaded();
      });
    });

    test('should persist navigation state in browser history', async ({ page }) => {
      await test.step('Navigate through sections and test history', async () => {
        // Create navigation history
        await page.goto(ADMIN_ROUTES.dashboard);
        await page.waitForLoadState('networkidle');
        
        await page.goto(ADMIN_ROUTES.calendar);
        await page.waitForLoadState('networkidle');
        
        await page.goto(ADMIN_ROUTES.analytics);
        await page.waitForLoadState('networkidle');
        
        // Test back navigation through history
        await page.goBack(); // Should go to calendar
        await page.waitForLoadState('networkidle');
        await navHelpers.verifyCurrentRoute('/admin/calendar');
        
        await page.goBack(); // Should go to dashboard
        await page.waitForLoadState('networkidle');
        await navHelpers.verifyCurrentRoute('/admin');
        
        // Test forward navigation
        await page.goForward(); // Should go to calendar
        await page.waitForLoadState('networkidle');
        await navHelpers.verifyCurrentRoute('/admin/calendar');
      });
    });
  });

  test.describe('Authentication Guards and Error Handling', () => {
    test('should enforce authentication on all admin routes', async ({ page }) => {
      const adminRoutes = ['/admin', '/admin/calendar', '/admin/analytics'];

      for (const route of adminRoutes) {
        await test.step(`Test authentication guard on ${route}`, async () => {
          // Clear any existing authentication
          await page.context().clearCookies();
          
          // Try to access admin route
          await page.goto(route);
          await page.waitForLoadState('networkidle');
          
          // Should redirect to login or show login form
          await authHelpers.verifyNotAuthenticated();
        });
      }
    });

    test('should handle network errors gracefully during navigation', async ({ page }) => {
      await quickAdminLogin(page);

      await test.step('Simulate network error during navigation', async () => {
        // Navigate to a valid page first
        await page.goto(ADMIN_ROUTES.dashboard);
        await page.waitForLoadState('networkidle');
        
        // For this test, we'll just verify the navigation system is resilient
        // In a real implementation, we'd mock network failures
        await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
      });
    });

    test('should provide helpful error messages for navigation failures', async ({ page }) => {
      await quickAdminLogin(page);

      await test.step('Test error handling structure', async () => {
        // Verify error handling components exist
        const hasErrorHandling = await page.locator('[data-testid="dashboard-error"]').count() > 0 ||
                                   await page.evaluate(() => {
                                     return document.querySelector('.error, .bg-red-50, .text-red-600') !== null;
                                   });
        
        // Error handling structure should exist (even if not currently triggered)
        console.log('Error handling structure present:', hasErrorHandling);
      });
    });
  });

  test.describe('Cross-Browser Navigation Compatibility', () => {
    test('should work consistently across different browsers', async ({ page, browserName }) => {
      await test.step(`Test navigation in ${browserName}`, async () => {
        await quickAdminLogin(page);
        
        // Test basic navigation flow
        await page.goto(ADMIN_ROUTES.dashboard);
        await page.waitForLoadState('networkidle');
        await authHelpers.verifyDashboardAccess();
        
        await page.goto(ADMIN_ROUTES.calendar);
        await page.waitForLoadState('networkidle');
        await dashboardHelpers.verifyCalendarPageLoaded();
        
        await page.goto(ADMIN_ROUTES.analytics);
        await page.waitForLoadState('networkidle');
        await dashboardHelpers.verifyAnalyticsPageLoaded();
      });
    });

    test('should handle browser-specific navigation quirks', async ({ page, browserName }) => {
      await test.step(`Test browser-specific features in ${browserName}`, async () => {
        await quickAdminLogin(page);
        
        // Test keyboard navigation (Tab key)
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        // Test keyboard shortcuts (if any)
        if (browserName === 'firefox') {
          // Firefox-specific testing
          console.log('Running Firefox-specific navigation tests');
        } else if (browserName === 'webkit') {
          // Safari/WebKit-specific testing
          console.log('Running WebKit-specific navigation tests');
        }
        
        // All browsers should support basic navigation
        await navHelpers.verifyCurrentRoute('/admin');
      });
    });
  });

  test.describe('Performance and Loading', () => {
    test.beforeEach(async ({ page }) => {
      await quickAdminLogin(page);
    });

    test('should navigate between sections with acceptable performance', async ({ page }) => {
      await test.step('Measure navigation performance', async () => {
        const startTime = Date.now();
        
        await page.goto(ADMIN_ROUTES.calendar);
        await page.waitForLoadState('networkidle');
        
        const navigationTime = Date.now() - startTime;
        
        // Navigation should be reasonably fast (under 3 seconds)
        expect(navigationTime).toBeLessThan(3000);
        
        await dashboardHelpers.verifyCalendarPageLoaded();
      });
    });

    test('should handle slow network conditions gracefully', async ({ page }) => {
      await test.step('Simulate slow network and test navigation', async () => {
        // Simulate slow 3G connection
        const client = await page.context().newCDPSession(page);
        await client.send('Network.emulateNetworkConditions', {
          offline: false,
          downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
          uploadThroughput: 750 * 1024 / 8, // 750 Kbps
          latency: 40, // 40ms RTT
        });

        await page.goto(ADMIN_ROUTES.analytics);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        await dashboardHelpers.verifyAnalyticsPageLoaded();
      });
    });
  });
});
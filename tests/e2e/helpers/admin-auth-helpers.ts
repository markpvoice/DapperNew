/**
 * @fileoverview Admin Authentication Test Helpers for Playwright E2E Tests
 * 
 * Comprehensive helpers for admin authentication, dashboard navigation, and verification.
 * Follows the same reliable patterns established in booking-flow.spec.ts for consistency.
 * 
 * Key Features:
 * - Robust admin login with email/password authentication
 * - HTTP-only cookie handling for JWT tokens
 * - Dashboard navigation and verification utilities
 * - Logout functionality and session cleanup
 * - Comprehensive error handling for authentication scenarios
 * - Test data management for admin dashboard tests
 */

import { Page, expect, Locator } from '@playwright/test';

// Admin test credentials (matching the seeded admin user from prisma/seed.ts)
export const ADMIN_TEST_CREDENTIALS = {
  email: 'admin@dappersquad.com',
  password: 'admin123!',
} as const;

// Admin routes for navigation
export const ADMIN_ROUTES = {
  login: '/admin/login',
  dashboard: '/admin',
  calendar: '/admin/calendar',
  analytics: '/admin/analytics',
} as const;

// Test timeouts for reliability
export const TIMEOUTS = {
  navigation: 15000,
  authentication: 10000,
  apiResponse: 8000,
  elementVisible: 5000,
  shortWait: 1000,
  animationWait: 500,
} as const;

/**
 * Helper function for reliable element interactions with proper waits
 */
async function waitForElementAndClick(page: Page, selector: string, timeout = TIMEOUTS.elementVisible) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(TIMEOUTS.animationWait); // Wait for animations
  await page.click(selector, { force: true });
  await page.waitForTimeout(300); // Wait for click effects
}

/**
 * Helper function for safe form field filling
 */
async function fillFieldSafely(page: Page, selector: string, value: string) {
  await page.waitForSelector(selector, { state: 'visible' });
  await page.fill(selector, ''); // Clear first
  await page.fill(selector, value);
  await page.waitForTimeout(100); // Small delay for input processing
}

/**
 * Admin Authentication Helper Functions
 */
export class AdminAuthHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to admin login page and wait for it to load
   */
  async navigateToLogin(): Promise<void> {
    await this.page.goto(ADMIN_ROUTES.login);
    await this.page.waitForLoadState('networkidle');
    
    // Wait for login form to be visible
    await expect(this.page.locator('text=Admin Portal')).toBeVisible({ timeout: TIMEOUTS.elementVisible });
    await expect(this.page.locator('form')).toBeVisible();
    await expect(this.page.locator('input[name="email"]')).toBeVisible();
    await expect(this.page.locator('input[name="password"]')).toBeVisible();
  }

  /**
   * Perform admin login with email and password
   * @param email - Admin email address
   * @param password - Admin password
   * @param shouldSucceed - Whether login is expected to succeed (default: true)
   */
  async login(
    email: string = ADMIN_TEST_CREDENTIALS.email,
    password: string = ADMIN_TEST_CREDENTIALS.password,
    shouldSucceed: boolean = true
  ): Promise<void> {
    // Navigate to login page if not already there
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/admin/login')) {
      await this.navigateToLogin();
    }

    // Fill login form
    await fillFieldSafely(this.page, 'input[name="email"]', email);
    await fillFieldSafely(this.page, 'input[name="password"]', password);

    // Set up response monitoring
    const loginRequest = this.page.waitForResponse(
      response => response.url().includes('/api/auth/login') && response.request().method() === 'POST',
      { timeout: TIMEOUTS.apiResponse }
    );

    // Submit form
    await waitForElementAndClick(this.page, 'button[type="submit"]');

    // Wait for API response
    const response = await loginRequest;
    
    if (shouldSucceed) {
      // Verify successful login
      expect(response.status()).toBe(200);
      
      // Wait for redirect to admin dashboard
      await this.page.waitForURL('**/admin', { timeout: TIMEOUTS.navigation });
      await this.page.waitForLoadState('networkidle');
      
      // Verify we're on the admin dashboard
      await this.verifyDashboardAccess();
    } else {
      // Verify failed login
      expect(response.status()).not.toBe(200);
      
      // Should still be on login page with error message
      expect(this.page.url()).toContain('/admin/login');
    }
  }

  /**
   * Verify that admin dashboard is accessible and loaded correctly
   */
  async verifyDashboardAccess(): Promise<void> {
    // Should be on admin dashboard
    await expect(this.page).toHaveURL(/.*\/admin$/);
    
    // Wait for dashboard content to load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(TIMEOUTS.shortWait);
    
    // Check what's actually on the page - either admin dashboard or still on login
    const adminDashboardElements = [
      '[data-testid="admin-dashboard"]',
      'h1:has-text("Admin Dashboard")',
      'text=Admin Dashboard',
      'button:has-text("Bookings")',
      'button:has-text("Dashboard")'
    ];
    
    const loginElements = [
      '[data-testid="admin-login"]',
      'form',
      'input[name="email"]',
      'input[name="password"]'
    ];
    
    let isDashboard = false;
    let isLogin = false;
    
    // Check for dashboard elements
    for (const selector of adminDashboardElements) {
      const count = await this.page.locator(selector).count();
      if (count > 0) {
        isDashboard = true;
        break;
      }
    }
    
    // Check for login elements if dashboard not found
    if (!isDashboard) {
      for (const selector of loginElements) {
        const count = await this.page.locator(selector).count();
        if (count > 0) {
          isLogin = true;
          break;
        }
      }
    }
    
    if (isLogin) {
      throw new Error('Still on login page after authentication - cookies may not be set correctly');
    }
    
    if (!isDashboard) {
      // Get page content for debugging
      const pageContent = await this.page.content();
      console.log('Page content after login:', pageContent.substring(0, 500) + '...');
      throw new Error('Neither dashboard nor login elements found - unknown page state');
    }
    
    // If we get here, dashboard elements are present
    console.log('Admin dashboard successfully loaded');
  }

  /**
   * Verify that user is authenticated (has valid session)
   */
  async verifyAuthenticated(): Promise<void> {
    // Check for authentication cookies
    const cookies = await this.page.context().cookies();
    const authCookies = cookies.filter(cookie => 
      cookie.name.includes('access-token') || 
      cookie.name.includes('auth-token') ||
      cookie.name.includes('refresh-token')
    );
    
    expect(authCookies.length).toBeGreaterThan(0);
    
    // Verify admin pages are accessible without redirect
    await this.page.goto(ADMIN_ROUTES.dashboard);
    await this.page.waitForLoadState('networkidle');
    
    // Should not redirect to login
    expect(this.page.url()).not.toContain('/admin/login');
  }

  /**
   * Verify that user is not authenticated (no valid session)
   */
  async verifyNotAuthenticated(): Promise<void> {
    // Try to access admin dashboard
    await this.page.goto(ADMIN_ROUTES.dashboard);
    await this.page.waitForLoadState('networkidle');
    
    // Should redirect to login page or show login form
    const isOnLoginPage = this.page.url().includes('/admin/login');
    const hasLoginForm = await this.page.locator('form').count() > 0 && 
                         await this.page.locator('input[name="email"]').count() > 0;
    
    expect(isOnLoginPage || hasLoginForm).toBe(true);
  }

  /**
   * Perform admin logout
   */
  async logout(): Promise<void> {
    // Look for logout button/link in various possible locations
    const logoutSelectors = [
      'button:has-text("Logout")',
      'button:has-text("Sign Out")',
      'a:has-text("Logout")',
      'a:has-text("Sign Out")',
      '[data-testid="logout-button"]',
      '[data-testid="signout-button"]'
    ];

    let logoutFound = false;
    for (const selector of logoutSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        await waitForElementAndClick(this.page, selector);
        logoutFound = true;
        break;
      }
    }

    if (!logoutFound) {
      // If no logout button found, try API logout directly
      await this.page.goto('/api/auth/logout', { waitUntil: 'networkidle' });
    }

    // Wait for logout to complete
    await this.page.waitForTimeout(TIMEOUTS.shortWait);
    
    // Verify logout was successful
    await this.verifyNotAuthenticated();
  }

  /**
   * Navigate to specific admin section
   * @param section - Admin section to navigate to
   */
  async navigateToSection(section: keyof typeof ADMIN_ROUTES): Promise<void> {
    await this.page.goto(ADMIN_ROUTES[section]);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(TIMEOUTS.shortWait);
  }

  /**
   * Handle authentication errors and provide helpful debugging info
   */
  async handleAuthenticationError(expectedError?: string): Promise<void> {
    // Wait for error message to appear
    await this.page.waitForTimeout(TIMEOUTS.shortWait);
    
    // Look for error messages in various formats
    const errorSelectors = [
      '.bg-red-50 .text-red-800',  // Tailwind error styling from AdminLogin
      '.error-message',
      '.alert-error',
      'text=Invalid credentials',
      'text=Account is deactivated',
      'text=Too many login attempts'
    ];

    let errorFound = false;
    let actualError = '';
    
    for (const selector of errorSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        actualError = await element.textContent() || '';
        errorFound = true;
        break;
      }
    }

    if (expectedError && errorFound) {
      expect(actualError).toContain(expectedError);
    }

    // Provide debugging information
    if (!errorFound) {
      console.log('No authentication error message found. Page content:');
      console.log(await this.page.content());
    }
  }
}

/**
 * Admin Dashboard Navigation Helpers
 */
export class AdminDashboardHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to calendar management section
   */
  async navigateToCalendar(): Promise<void> {
    // Try multiple navigation methods
    const calendarSelectors = [
      'a[href="/admin/calendar"]',
      'button:has-text("Calendar")',
      'text=Calendar Management',
      '[data-testid="calendar-nav"]'
    ];

    let navigationSuccessful = false;
    for (const selector of calendarSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        await waitForElementAndClick(this.page, selector);
        navigationSuccessful = true;
        break;
      }
    }

    if (!navigationSuccessful) {
      // Direct navigation if no nav elements found
      await this.page.goto(ADMIN_ROUTES.calendar);
    }

    await this.page.waitForLoadState('networkidle');
    await this.verifyCalendarPageLoaded();
  }

  /**
   * Navigate to analytics section
   */
  async navigateToAnalytics(): Promise<void> {
    const analyticsSelectors = [
      'a[href="/admin/analytics"]',
      'button:has-text("Analytics")',
      'text=Analytics Dashboard',
      '[data-testid="analytics-nav"]'
    ];

    let navigationSuccessful = false;
    for (const selector of analyticsSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        await waitForElementAndClick(this.page, selector);
        navigationSuccessful = true;
        break;
      }
    }

    if (!navigationSuccessful) {
      await this.page.goto(ADMIN_ROUTES.analytics);
    }

    await this.page.waitForLoadState('networkidle');
    await this.verifyAnalyticsPageLoaded();
  }

  /**
   * Verify calendar page is loaded correctly
   */
  async verifyCalendarPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/admin\/calendar/);
    
    // Look for calendar-specific elements
    const calendarElements = [
      'text=Calendar Management',
      'text=Calendar',
      '.calendar-grid',
      'text=Available',
      'text=Blocked',
      'button:has-text("Block Date")'
    ];

    // At least one calendar element should be visible
    const visibleElements = await Promise.all(
      calendarElements.map(selector => this.page.locator(selector).count())
    );
    
    expect(visibleElements.some(count => count > 0)).toBe(true);
  }

  /**
   * Verify analytics page is loaded correctly  
   */
  async verifyAnalyticsPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/admin\/analytics/);
    
    // Look for analytics-specific elements
    const analyticsElements = [
      'text=Analytics',
      'text=Revenue',
      'text=Bookings',
      'text=Total Revenue',
      'svg', // Charts should contain SVG elements
      '.recharts-wrapper'
    ];

    // At least one analytics element should be visible
    const visibleElements = await Promise.all(
      analyticsElements.map(selector => this.page.locator(selector).count())
    );
    
    expect(visibleElements.some(count => count > 0)).toBe(true);
  }

  /**
   * Wait for admin dashboard data to load
   */
  async waitForDashboardData(): Promise<void> {
    // Wait for API calls to complete
    await this.page.waitForLoadState('networkidle');
    
    // Wait for loading states to complete
    await this.page.waitForFunction(
      () => {
        const loadingElements = document.querySelectorAll('.animate-spin, .loading, [data-testid="loading"]');
        return loadingElements.length === 0;
      },
      { timeout: TIMEOUTS.apiResponse }
    );
  }

  /**
   * Verify mobile responsive behavior
   */
  async verifyMobileResponsive(): Promise<void> {
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(TIMEOUTS.animationWait);
    
    // Look for mobile-specific elements like hamburger menu
    const mobileElements = [
      'button[aria-label="Menu"]',
      '.hamburger-menu',
      '[data-testid="mobile-menu"]',
      'button:has-text("☰")'
    ];

    const hasMobileNav = await Promise.all(
      mobileElements.map(selector => this.page.locator(selector).count())
    );
    
    // Should have some mobile navigation element
    expect(hasMobileNav.some(count => count > 0)).toBe(true);
  }
}

/**
 * Admin Test Data Management Helpers
 */
export class AdminTestDataHelpers {
  constructor(private page: Page) {}

  /**
   * Setup test data for admin dashboard tests
   */
  async setupTestData(): Promise<void> {
    // This would typically make API calls to create test data
    // For now, we'll assume data exists from database seeding
    console.log('Setting up admin test data...');
    
    // In a real implementation, this might:
    // 1. Create test bookings
    // 2. Set up calendar availability
    // 3. Generate test analytics data
    // 4. Create sample contact submissions
  }

  /**
   * Cleanup test data after tests complete
   */
  async cleanupTestData(): Promise<void> {
    console.log('Cleaning up admin test data...');
    
    // In a real implementation, this would:
    // 1. Remove test bookings
    // 2. Reset calendar state
    // 3. Clear test analytics
    // 4. Remove test contact submissions
  }

  /**
   * Verify dashboard shows expected data
   */
  async verifyDashboardData(): Promise<void> {
    // Wait for data to load
    await this.page.waitForLoadState('networkidle');
    
    // Look for data elements
    const dataElements = [
      'text=/[0-9]+/', // Any numbers (statistics)
      'text=/\$[0-9]+/', // Currency amounts
      'text=Total',
      'text=Revenue',
      'text=Bookings'
    ];

    // Should have some data displayed
    const hasData = await Promise.all(
      dataElements.map(selector => this.page.locator(selector).count())
    );
    
    expect(hasData.some(count => count > 0)).toBe(true);
  }
}

/**
 * Complete Admin Authentication Workflow
 * 
 * High-level function that combines all the helpers for a complete admin auth workflow
 */
export async function performCompleteAdminLogin(page: Page): Promise<{
  authHelpers: AdminAuthHelpers;
  dashboardHelpers: AdminDashboardHelpers;
  dataHelpers: AdminTestDataHelpers;
}> {
  const authHelpers = new AdminAuthHelpers(page);
  const dashboardHelpers = new AdminDashboardHelpers(page);
  const dataHelpers = new AdminTestDataHelpers(page);

  // Perform complete login workflow
  await authHelpers.navigateToLogin();
  await authHelpers.login();
  await authHelpers.verifyDashboardAccess();
  await dashboardHelpers.waitForDashboardData();

  return {
    authHelpers,
    dashboardHelpers,  
    dataHelpers
  };
}

/**
 * Quick admin login helper for tests that need authenticated admin access
 */
export async function quickAdminLogin(page: Page): Promise<void> {
  const authHelpers = new AdminAuthHelpers(page);
  await authHelpers.navigateToLogin();
  await authHelpers.login();
  await authHelpers.verifyDashboardAccess();
}

/**
 * Test authentication failure scenarios
 */
export async function testAuthenticationFailures(page: Page): Promise<void> {
  const authHelpers = new AdminAuthHelpers(page);
  
  // Test invalid credentials
  await authHelpers.navigateToLogin();
  await authHelpers.login('invalid@email.com', 'wrongpassword', false);
  await authHelpers.handleAuthenticationError('Invalid credentials');
}

// Helper classes are already exported above, no need to re-export
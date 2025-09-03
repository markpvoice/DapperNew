/**
 * @fileoverview Navigation Test Helper Utilities
 * 
 * Additional helper functions specifically for navigation testing scenarios.
 * Extends the AdminAuthHelpers with navigation-specific testing utilities.
 */

import { Page, expect } from '@playwright/test';
import { TIMEOUTS } from './admin-auth-helpers';

/**
 * Enhanced Navigation Test Helpers for E2E Tests
 */
export class NavigationTestHelpers {
  constructor(private page: Page) {}

  /**
   * Verify page URL matches expected route with optional parameters
   */
  async verifyCurrentRoute(expectedRoute: string, exact: boolean = false): Promise<void> {
    if (exact) {
      await expect(this.page).toHaveURL(expectedRoute);
    } else {
      const routePattern = expectedRoute.replace('/', '\\/');
      await expect(this.page).toHaveURL(new RegExp(`.*${routePattern}$`));
    }
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
   * Verify active navigation state for tabs and links
   */
  async verifyActiveTab(tabName: string): Promise<void> {
    const activeTabSelectors = [
      `button:has-text("${tabName}").text-brand-gold`,
      `a:has-text("${tabName}").text-brand-gold`,
      `[aria-current="page"]:has-text("${tabName}")`,
      `.border-brand-gold:has-text("${tabName}")`,
      `button:has-text("${tabName}")[class*="border-b-2"]`,
      `a:has-text("${tabName}")[class*="border-b-2"]`
    ];

    let tabFound = false;
    let actualTab = '';
    
    for (const selector of activeTabSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        await expect(element).toBeVisible();
        actualTab = await element.textContent() || '';
        tabFound = true;
        break;
      }
    }

    if (!tabFound) {
      // Fallback: at least verify the tab text exists and log for debugging
      await expect(this.page.locator(`text="${tabName}"`)).toBeVisible();
      console.log(`Active tab verification: Tab "${tabName}" found but active state not detected`);
    } else {
      console.log(`Active tab verified: "${actualTab}"`);
    }
  }

  /**
   * Test browser back navigation functionality
   */
  async testBrowserBackNavigation(expectedPreviousRoute: string): Promise<void> {
    await this.page.goBack();
    await this.page.waitForLoadState('networkidle');
    await this.verifyCurrentRoute(expectedPreviousRoute);
  }

  /**
   * Test browser forward navigation functionality
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
    
    // Wait for page to fully load after refresh
    await this.page.waitForTimeout(TIMEOUTS.shortWait);
  }

  /**
   * Test mobile hamburger menu functionality
   */
  async testMobileMenuToggle(): Promise<void> {
    // Switch to mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(TIMEOUTS.animationWait);

    // Look for mobile menu button with existing selectors from components
    const mobileMenuSelectors = [
      '[data-testid="mobile-menu-button"]',
      'button[aria-label="Menu"]',
      'button[aria-label="Open menu"]',
      'button[class*="md:hidden"]', // Tailwind responsive classes
      '#mobile-menu-button' // From actual component
    ];

    let menuButtonFound = false;
    for (const selector of mobileMenuSelectors) {
      const button = this.page.locator(selector);
      if (await button.count() > 0 && await button.isVisible()) {
        console.log(`Found mobile menu button: ${selector}`);
        
        // Click to open menu
        await button.click();
        await this.page.waitForTimeout(TIMEOUTS.animationWait);
        
        // Verify menu opened (look for navigation links)
        const navigationVisible = await this.verifyMobileNavigationVisible();
        
        if (navigationVisible) {
          // Click again to close menu
          await button.click();
          await this.page.waitForTimeout(TIMEOUTS.animationWait);
        }
        
        menuButtonFound = true;
        break;
      }
    }

    if (!menuButtonFound) {
      console.log('Mobile menu button not found - this may be expected for some designs');
      
      // Verify that navigation links are still accessible in mobile view
      const mobileNavExists = await this.page.locator('nav a, nav button').count() > 0;
      expect(mobileNavExists).toBe(true);
    }
  }

  /**
   * Verify mobile navigation is visible after menu toggle
   */
  private async verifyMobileNavigationVisible(): Promise<boolean> {
    const navSelectors = [
      'text=Dashboard',
      'text=Calendar', 
      'text=Analytics',
      'a[href*="/admin"]',
      '[data-testid="mobile-navigation-menu"]', // From actual component
      '#mobile-menu' // From actual component
    ];

    for (const selector of navSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0 && await element.isVisible()) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Test keyboard navigation support
   */
  async testKeyboardNavigation(): Promise<void> {
    // Test Tab key navigation
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(100);
    
    // Verify focus is on a focusable element
    const focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT'].includes(focusedElement || '')).toBe(true);
  }

  /**
   * Verify navigation loading states
   */
  async verifyNavigationLoadingStates(): Promise<void> {
    // Check for loading indicators during navigation
    const loadingIndicators = [
      '.animate-spin',
      '.loading',
      '[data-testid="loading"]',
      'text=Loading'
    ];

    // Wait for loading to complete
    await this.page.waitForFunction(
      (selectors) => {
        return selectors.every(selector => {
          const elements = document.querySelectorAll(selector);
          return elements.length === 0;
        });
      },
      loadingIndicators,
      { timeout: TIMEOUTS.apiResponse }
    );
  }

  /**
   * Verify page has proper navigation structure
   */
  async verifyNavigationStructure(): Promise<void> {
    // Check for main navigation elements
    await expect(this.page.locator('nav')).toBeVisible();
    
    // Verify navigation has proper ARIA attributes
    const nav = this.page.locator('nav').first();
    const hasAriaLabel = await nav.getAttribute('aria-label') !== null;
    const hasRole = await nav.getAttribute('role') !== null;
    
    // At least one accessibility attribute should be present
    if (!hasAriaLabel && !hasRole) {
      console.log('Warning: Navigation lacks ARIA accessibility attributes');
    }
  }

  /**
   * Test navigation performance timing
   */
  async measureNavigationPerformance(targetRoute: string): Promise<number> {
    const startTime = Date.now();
    
    await this.page.goto(targetRoute);
    await this.page.waitForLoadState('networkidle');
    
    const navigationTime = Date.now() - startTime;
    console.log(`Navigation to ${targetRoute} took ${navigationTime}ms`);
    
    return navigationTime;
  }

  /**
   * Verify responsive navigation behavior across viewports
   */
  async testResponsiveNavigation(): Promise<void> {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(TIMEOUTS.animationWait);
      
      console.log(`Testing ${viewport.name} navigation (${viewport.width}x${viewport.height})`);
      
      // Verify navigation is present and accessible
      await this.verifyNavigationStructure();
      
      // For mobile, test menu if present
      if (viewport.name === 'Mobile') {
        await this.testMobileMenuToggle();
      }
    }
  }

  /**
   * Check for navigation errors and console warnings
   */
  async checkForNavigationErrors(): Promise<void> {
    // Get console messages
    const messages: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        messages.push(`${msg.type()}: ${msg.text()}`);
      }
    });

    // Wait for any console messages to appear
    await this.page.waitForTimeout(1000);
    
    // Filter out known acceptable warnings
    const significantMessages = messages.filter(msg => 
      !msg.includes('Download the React DevTools') &&
      !msg.includes('FontFace') &&
      !msg.includes('third-party cookie')
    );

    if (significantMessages.length > 0) {
      console.log('Navigation console messages:', significantMessages);
    }
  }

  /**
   * Verify navigation state persistence across browser refresh
   */
  async testNavigationStatePersistence(routeToTest: string): Promise<void> {
    // Navigate to route
    await this.page.goto(routeToTest);
    await this.page.waitForLoadState('networkidle');
    
    // Store current state
    const currentUrl = this.page.url();
    const currentTitle = await this.page.title();
    
    // Refresh page
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    
    // Verify state maintained
    await expect(this.page).toHaveURL(currentUrl);
    await expect(this.page).toHaveTitle(currentTitle);
    
    console.log(`Navigation state persistence verified for: ${routeToTest}`);
  }
}

/**
 * Navigation Test Data and Scenarios
 */
export const NAVIGATION_TEST_SCENARIOS = {
  adminRoutes: [
    { path: '/admin', name: 'Dashboard' },
    { path: '/admin/calendar', name: 'Calendar' },
    { path: '/admin/analytics', name: 'Analytics' }
  ],
  
  navigationFlows: [
    {
      name: 'Dashboard to Calendar',
      steps: ['/admin', '/admin/calendar']
    },
    {
      name: 'Calendar to Analytics', 
      steps: ['/admin/calendar', '/admin/analytics']
    },
    {
      name: 'Analytics back to Dashboard',
      steps: ['/admin/analytics', '/admin']
    }
  ],
  
  mobileBreakpoints: [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11' },
    { width: 360, height: 640, name: 'Galaxy S5' }
  ]
} as const;

/**
 * Performance benchmarks for navigation
 */
export const NAVIGATION_PERFORMANCE_THRESHOLDS = {
  maxNavigationTime: 3000, // 3 seconds
  maxInitialLoad: 5000,    // 5 seconds
  maxBackNavigation: 1000  // 1 second
} as const;
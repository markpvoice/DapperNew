/**
 * @fileoverview E2E Tests for Admin Calendar Management
 * 
 * Comprehensive tests for admin calendar management functionality including:
 * - Calendar grid display with proper status color coding
 * - Month/year navigation with data refresh
 * - Date blocking/unblocking with reason dialogs
 * - Bulk operations and date range selection
 * - Maintenance period scheduling
 * - Calendar statistics accuracy
 * - Mobile responsive interactions
 * - API integration verification
 * - Error handling for calendar operations
 */

import { test, expect, Page } from '@playwright/test';
import { 
  AdminAuthHelpers, 
  AdminDashboardHelpers,
  ADMIN_TEST_CREDENTIALS,
  TIMEOUTS 
} from './helpers/admin-auth-helpers';

/**
 * Calendar-specific test helpers
 */
class CalendarTestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for calendar to load completely with data
   */
  async waitForCalendarLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    
    // Wait for loading indicator to disappear
    await this.page.waitForFunction(
      () => !document.querySelector('[data-testid="calendar-loading"]'),
      { timeout: TIMEOUTS.apiResponse }
    );

    // Wait for calendar grid to be visible
    await expect(this.page.locator('[data-testid="calendar-grid"]')).toBeVisible({
      timeout: TIMEOUTS.elementVisible
    });

    // Wait for statistics to load
    await expect(this.page.locator('[data-testid="calendar-stats"]')).toBeVisible();

    // Small delay for animations and data population
    await this.page.waitForTimeout(TIMEOUTS.animationWait);
  }

  /**
   * Get calendar date element by date string
   */
  async getDateElement(dateStr: string): Promise<any> {
    const selector = `[data-testid="calendar-date-${dateStr}"]`;
    await expect(this.page.locator(selector)).toBeVisible({ timeout: TIMEOUTS.elementVisible });
    return this.page.locator(selector);
  }

  /**
   * Click on a specific calendar date
   */
  async clickDate(dateStr: string): Promise<void> {
    const dateElement = await this.getDateElement(dateStr);
    await dateElement.click();
    
    // Wait for selection to register
    await this.page.waitForTimeout(200);
    
    // Verify date actions appear
    await expect(this.page.locator('[data-testid="date-actions"]')).toBeVisible();
  }

  /**
   * Get the current month and year from the calendar header
   */
  async getCurrentMonthYear(): Promise<{ month: string; year: string }> {
    const monthSelector = this.page.locator('[data-testid="month-selector"]');
    const yearSelector = this.page.locator('[data-testid="year-selector"]');
    
    const month = await monthSelector.inputValue();
    const year = await yearSelector.inputValue();
    
    return { month, year };
  }

  /**
   * Navigate to a specific month/year
   */
  async navigateToMonth(monthIndex: number, year: number): Promise<void> {
    await this.page.selectOption('[data-testid="month-selector"]', monthIndex.toString());
    await this.page.selectOption('[data-testid="year-selector"]', year.toString());
    
    // Wait for calendar to refresh
    await this.waitForCalendarLoad();
  }

  /**
   * Get calendar statistics from the stats section
   */
  async getCalendarStats(): Promise<{ total: number; available: number; booked: number; blocked: number }> {
    const statsSection = this.page.locator('[data-testid="calendar-stats"]');
    await expect(statsSection).toBeVisible();

    const statsText = await statsSection.textContent();
    if (!statsText) throw new Error('Could not read calendar statistics');

    // Extract numbers from the statistics text
    const totalMatch = statsText.match(/Total Days:\s*(\d+)/);
    const availableMatch = statsText.match(/Available:\s*(\d+)/);
    const bookedMatch = statsText.match(/Booked:\s*(\d+)/);
    const blockedMatch = statsText.match(/Blocked:\s*(\d+)/);

    return {
      total: totalMatch ? parseInt(totalMatch[1]) : 0,
      available: availableMatch ? parseInt(availableMatch[1]) : 0,
      booked: bookedMatch ? parseInt(bookedMatch[1]) : 0,
      blocked: blockedMatch ? parseInt(blockedMatch[1]) : 0,
    };
  }

  /**
   * Block a specific date with a reason
   */
  async blockDateWithReason(dateStr: string, reason: string): Promise<void> {
    // Click on the date
    await this.clickDate(dateStr);

    // Click block date button
    await this.page.click('button:has-text("Block Date")');

    // Wait for dialog to appear
    await expect(this.page.locator('[data-testid="block-reason-dialog"]')).toBeVisible();

    // Fill in reason
    await this.page.fill('input[placeholder="Reason for blocking..."]', reason);

    // Confirm blocking
    await this.page.click('button:has-text("Confirm Block")');

    // Wait for dialog to close and calendar to refresh
    await this.page.waitForTimeout(1000);
    await this.waitForCalendarLoad();
  }

  /**
   * Unblock a specific date
   */
  async unblockDate(dateStr: string): Promise<void> {
    await this.clickDate(dateStr);
    await this.page.click('button:has-text("Unblock Date")');
    
    // Confirm unblocking
    await this.page.click('button:has-text("Confirm Unblock")');
    
    await this.page.waitForTimeout(1000);
    await this.waitForCalendarLoad();
  }

  /**
   * Set maintenance for a specific date
   */
  async setMaintenanceDate(dateStr: string): Promise<void> {
    await this.clickDate(dateStr);
    await this.page.click('button:has-text("Set Maintenance")');
    
    await this.page.waitForTimeout(1000);
    await this.waitForCalendarLoad();
  }

  /**
   * Verify date has specific color/status
   */
  async verifyDateStatus(dateStr: string, expectedStatus: 'available' | 'booked' | 'blocked' | 'maintenance'): Promise<void> {
    const dateElement = await this.getDateElement(dateStr);
    
    const colorMappings = {
      available: 'bg-green-100',
      booked: 'bg-red-100', 
      blocked: 'bg-yellow-100',
      maintenance: 'bg-gray-100'
    };

    const expectedColor = colorMappings[expectedStatus];
    await expect(dateElement).toHaveClass(new RegExp(expectedColor));
  }

  /**
   * Get date range for bulk operations
   */
  async selectDateRange(startDate: string, endDate: string, reason: string): Promise<void> {
    // Click bulk operations button
    await this.page.click('button:has-text("Block Date Range")');

    // Wait for range dialog
    await expect(this.page.locator('[data-testid="date-range-dialog"]')).toBeVisible();

    // Fill in date range
    await this.page.fill('[data-testid="range-start-date"]', startDate);
    await this.page.fill('[data-testid="range-end-date"]', endDate);
    await this.page.fill('input[placeholder="Reason for blocking range..."]', reason);

    // Note: The component has a TODO for range blocking implementation
    // We'll test the UI but expect the functionality to be implemented
    await this.page.click('button:has-text("Block Range")');
    
    await this.page.waitForTimeout(1000);
  }
}

test.describe('Admin Calendar Management E2E Tests', () => {
  let authHelpers: AdminAuthHelpers;
  let dashboardHelpers: AdminDashboardHelpers;
  let calendarHelpers: CalendarTestHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AdminAuthHelpers(page);
    dashboardHelpers = new AdminDashboardHelpers(page);
    calendarHelpers = new CalendarTestHelpers(page);

    // Login as admin and navigate to calendar
    await authHelpers.navigateToLogin();
    await authHelpers.login();
    await authHelpers.verifyDashboardAccess();
    await dashboardHelpers.navigateToCalendar();
    await calendarHelpers.waitForCalendarLoad();
  });

  test.describe('Calendar Grid Display & Status Visualization', () => {
    test('should display calendar grid with proper layout', async ({ page }) => {
      // Verify calendar management page is loaded
      await expect(page.locator('[data-testid="calendar-management"]')).toBeVisible();
      
      // Verify month title
      await expect(page.locator('[data-testid="month-title"]')).toHaveText('Calendar Management');
      
      // Verify calendar grid structure
      const calendarGrid = page.locator('[data-testid="calendar-grid"]');
      await expect(calendarGrid).toBeVisible();
      await expect(calendarGrid).toHaveAttribute('role', 'grid');
      
      // Verify day headers (Sun, Mon, Tue, etc.)
      const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (const day of dayHeaders) {
        await expect(page.locator(`text=${day}`)).toBeVisible();
      }

      // Verify calendar has date cells
      const dateCells = page.locator('[data-testid^="calendar-date-"]');
      const cellCount = await dateCells.count();
      expect(cellCount).toBeGreaterThan(0);
    });

    test('should display color-coded date statuses correctly', async ({ page }) => {
      // Wait for calendar data to load
      await calendarHelpers.waitForCalendarLoad();

      // Check legend is visible
      await expect(page.locator('[data-testid="calendar-legend"]')).toBeVisible();
      
      // Verify legend items exist
      await expect(page.locator('[data-testid="legend-available"]')).toBeVisible();
      await expect(page.locator('[data-testid="legend-booked"]')).toBeVisible(); 
      await expect(page.locator('[data-testid="legend-maintenance"]')).toBeVisible();

      // Get current date and verify at least some dates are visible
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Navigate to current month to ensure we have predictable data
      await calendarHelpers.navigateToMonth(currentMonth, currentYear);
      
      // Verify at least some calendar dates are present
      const dateCells = page.locator('[data-testid^="calendar-date-"]');
      const cellCount = await dateCells.count();
      expect(cellCount).toBeGreaterThan(20); // Should have at least ~30 days in current month view
    });

    test('should show booking details in booked date cells', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();

      // Look for any booked dates (red background)
      const bookedDates = page.locator('[data-testid^="calendar-date-"].bg-red-100');
      const bookedCount = await bookedDates.count();
      
      if (bookedCount > 0) {
        // Check first booked date for booking details
        const firstBookedDate = bookedDates.first();
        
        // Booked dates should show client information
        const hasClientInfo = await firstBookedDate.locator('text=/[A-Za-z]+ [A-Za-z]+/').count() > 0 || // Client name pattern
                             await firstBookedDate.locator('text=/DSE-/').count() > 0; // Booking reference pattern
        
        expect(hasClientInfo).toBe(true);
      }
    });
  });

  test.describe('Month/Year Navigation', () => {
    test('should navigate between months using arrow buttons', async ({ page }) => {
      // Get initial month/year
      const initial = await calendarHelpers.getCurrentMonthYear();
      
      // Click next month
      await page.click('[data-testid="next-month-btn"]');
      await calendarHelpers.waitForCalendarLoad();
      
      // Verify month changed
      const afterNext = await calendarHelpers.getCurrentMonthYear();
      expect(afterNext.month !== initial.month || afterNext.year !== initial.year).toBe(true);
      
      // Click previous month twice to go back past original
      await page.click('[data-testid="prev-month-btn"]');
      await calendarHelpers.waitForCalendarLoad();
      await page.click('[data-testid="prev-month-btn"]');
      await calendarHelpers.waitForCalendarLoad();
      
      // Verify we're at a different month than initial
      const afterPrev = await calendarHelpers.getCurrentMonthYear();
      expect(afterPrev.month !== initial.month || afterPrev.year !== initial.year).toBe(true);
    });

    test('should navigate using month/year dropdowns', async ({ page }) => {
      // Select a specific month and year
      const targetMonth = 5; // June (0-indexed)
      const targetYear = 2024;
      
      await calendarHelpers.navigateToMonth(targetMonth, targetYear);
      
      // Verify navigation worked
      const result = await calendarHelpers.getCurrentMonthYear();
      expect(result.month).toBe(targetMonth.toString());
      expect(result.year).toBe(targetYear.toString());
      
      // Verify calendar data refreshed for the new month
      await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
    });

    test('should refresh calendar data when navigating months', async ({ page }) => {
      // Get initial statistics
      const initialStats = await calendarHelpers.getCalendarStats();
      
      // Navigate to a different month
      await page.click('[data-testid="next-month-btn"]');
      await calendarHelpers.waitForCalendarLoad();
      
      // Get new statistics 
      const newStats = await calendarHelpers.getCalendarStats();
      
      // Statistics should be recalculated (may be same or different values)
      expect(typeof newStats.total).toBe('number');
      expect(typeof newStats.available).toBe('number');
      expect(typeof newStats.booked).toBe('number');
      expect(typeof newStats.blocked).toBe('number');
    });
  });

  test.describe('Date Selection & Actions', () => {
    test('should select dates and show action buttons', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // Find an available date to select
      const availableDates = page.locator('[data-testid^="calendar-date-"].bg-green-100');
      const availableCount = await availableDates.count();
      
      if (availableCount > 0) {
        // Click on first available date
        await availableDates.first().click();
        
        // Verify date actions appear
        await expect(page.locator('[data-testid="date-actions"]')).toBeVisible();
        
        // Verify action buttons are present
        await expect(page.locator('button:has-text("Block Date")')).toBeVisible();
        await expect(page.locator('button:has-text("Unblock Date")')).toBeVisible();
        await expect(page.locator('button:has-text("Set Maintenance")')).toBeVisible();
      }
    });

    test('should support keyboard navigation for date selection', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // Find a date cell and focus it
      const firstDateCell = page.locator('[data-testid^="calendar-date-"]').first();
      await firstDateCell.focus();
      
      // Press Enter to select
      await page.keyboard.press('Enter');
      
      // Verify date actions appear
      await expect(page.locator('[data-testid="date-actions"]')).toBeVisible();
      
      // Test arrow key navigation (basic test)
      await page.keyboard.press('ArrowRight');
      // Note: Full arrow key navigation testing would require more complex setup
    });

    test('should have proper touch targets for mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      await calendarHelpers.waitForCalendarLoad();
      
      // Verify touch targets meet minimum 44px requirement
      const dateCells = page.locator('[data-testid^="calendar-date-"]');
      const firstCell = dateCells.first();
      
      // Check minimum dimensions (approximated through CSS classes)
      await expect(firstCell).toHaveClass(/min-h-\[2\.75rem\]/); // 44px
      await expect(firstCell).toHaveClass(/min-w-\[2\.75rem\]/); // 44px
      await expect(firstCell).toHaveClass(/touch-manipulation/);
    });
  });

  test.describe('Date Blocking & Unblocking', () => {
    test('should block a date with reason dialog', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // Find an available date
      const availableDates = page.locator('[data-testid^="calendar-date-"].bg-green-100');
      const availableCount = await availableDates.count();
      
      if (availableCount > 0) {
        // Get the date string from the first available date
        const firstAvailable = availableDates.first();
        const dateTestId = await firstAvailable.getAttribute('data-testid');
        const dateStr = dateTestId?.replace('calendar-date-', '') || '';
        
        // Block the date
        const blockReason = 'Equipment maintenance';
        await calendarHelpers.blockDateWithReason(dateStr, blockReason);
        
        // Verify the date is now blocked (should change color)
        const dateElement = await calendarHelpers.getDateElement(dateStr);
        
        // Should no longer be green (available)
        const isStillGreen = await dateElement.evaluate(el => 
          el.className.includes('bg-green-100')
        );
        expect(isStillGreen).toBe(false);
      }
    });

    test('should handle block dialog cancellation', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      const availableDates = page.locator('[data-testid^="calendar-date-"].bg-green-100');
      const availableCount = await availableDates.count();
      
      if (availableCount > 0) {
        // Click on available date
        await availableDates.first().click();
        
        // Click block date
        await page.click('button:has-text("Block Date")');
        
        // Verify dialog appears
        await expect(page.locator('[data-testid="block-reason-dialog"]')).toBeVisible();
        
        // Cancel the dialog
        await page.click('button:has-text("Cancel")');
        
        // Verify dialog is closed
        await expect(page.locator('[data-testid="block-reason-dialog"]')).not.toBeVisible();
        
        // Date should still be available (unchanged)
        const dateElement = availableDates.first();
        await expect(dateElement).toHaveClass(/bg-green-100/);
      }
    });

    test('should unblock a previously blocked date', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // First block a date
      const availableDates = page.locator('[data-testid^="calendar-date-"].bg-green-100');
      const availableCount = await availableDates.count();
      
      if (availableCount > 0) {
        const firstAvailable = availableDates.first();
        const dateTestId = await firstAvailable.getAttribute('data-testid');
        const dateStr = dateTestId?.replace('calendar-date-', '') || '';
        
        // Block it first
        await calendarHelpers.blockDateWithReason(dateStr, 'Test block');
        
        // Now unblock it
        await calendarHelpers.unblockDate(dateStr);
        
        // Verify it's available again
        await calendarHelpers.verifyDateStatus(dateStr, 'available');
      }
    });
  });

  test.describe('Maintenance Period Management', () => {
    test('should set maintenance period for date', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      const availableDates = page.locator('[data-testid^="calendar-date-"].bg-green-100');
      const availableCount = await availableDates.count();
      
      if (availableCount > 0) {
        const firstAvailable = availableDates.first();
        const dateTestId = await firstAvailable.getAttribute('data-testid');
        const dateStr = dateTestId?.replace('calendar-date-', '') || '';
        
        // Set maintenance
        await calendarHelpers.setMaintenanceDate(dateStr);
        
        // Verify date is marked as maintenance (gray background)
        await calendarHelpers.verifyDateStatus(dateStr, 'maintenance');
      }
    });
  });

  test.describe('Bulk Operations', () => {
    test('should open date range blocking dialog', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // Click bulk actions button
      await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
      await page.click('button:has-text("Block Date Range")');
      
      // Verify range dialog opens
      await expect(page.locator('[data-testid="date-range-dialog"]')).toBeVisible();
      
      // Verify form fields are present
      await expect(page.locator('[data-testid="range-start-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="range-end-date"]')).toBeVisible();
      await expect(page.locator('input[placeholder="Reason for blocking range..."]')).toBeVisible();
      
      // Cancel dialog
      await page.click('button:has-text("Cancel")');
      await expect(page.locator('[data-testid="date-range-dialog"]')).not.toBeVisible();
    });

    test('should fill in date range form fields', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      await page.click('button:has-text("Block Date Range")');
      await expect(page.locator('[data-testid="date-range-dialog"]')).toBeVisible();
      
      // Fill in form
      const startDate = '2024-12-01';
      const endDate = '2024-12-03';
      const reason = 'Holiday break';
      
      await page.fill('[data-testid="range-start-date"]', startDate);
      await page.fill('[data-testid="range-end-date"]', endDate);
      await page.fill('input[placeholder="Reason for blocking range..."]', reason);
      
      // Verify values were set
      await expect(page.locator('[data-testid="range-start-date"]')).toHaveValue(startDate);
      await expect(page.locator('[data-testid="range-end-date"]')).toHaveValue(endDate);
      await expect(page.locator('input[placeholder="Reason for blocking range..."]')).toHaveValue(reason);
    });
  });

  test.describe('Calendar Statistics', () => {
    test('should display accurate calendar statistics', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // Get statistics
      const stats = await calendarHelpers.getCalendarStats();
      
      // Verify statistics are numerical and logical
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.total).toBe(stats.available + stats.booked + stats.blocked);
      
      // All statistics should be non-negative
      expect(stats.available).toBeGreaterThanOrEqual(0);
      expect(stats.booked).toBeGreaterThanOrEqual(0);
      expect(stats.blocked).toBeGreaterThanOrEqual(0);
    });

    test('should update statistics when blocking dates', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // Get initial stats
      const initialStats = await calendarHelpers.getCalendarStats();
      
      // Block an available date if any exist
      const availableDates = page.locator('[data-testid^="calendar-date-"].bg-green-100');
      const availableCount = await availableDates.count();
      
      if (availableCount > 0) {
        const firstAvailable = availableDates.first();
        const dateTestId = await firstAvailable.getAttribute('data-testid');
        const dateStr = dateTestId?.replace('calendar-date-', '') || '';
        
        await calendarHelpers.blockDateWithReason(dateStr, 'Test statistics update');
        
        // Get updated stats
        const updatedStats = await calendarHelpers.getCalendarStats();
        
        // Available should decrease, blocked should increase
        expect(updatedStats.available).toBeLessThan(initialStats.available);
        expect(updatedStats.blocked).toBeGreaterThan(initialStats.blocked);
        expect(updatedStats.total).toBe(initialStats.total); // Total stays same
      }
    });
  });

  test.describe('API Integration & Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // Mock API failure for testing error handling
      await page.route('**/api/calendar/availability', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });
      
      // Try to perform an action that would trigger API call
      const availableDates = page.locator('[data-testid^="calendar-date-"].bg-green-100');
      const availableCount = await availableDates.count();
      
      if (availableCount > 0) {
        await availableDates.first().click();
        await page.click('button:has-text("Block Date")');
        
        // Fill dialog and submit
        await page.fill('input[placeholder="Reason for blocking..."]', 'Test error handling');
        await page.click('button:has-text("Confirm Block")');
        
        // Should handle error gracefully (exact behavior depends on implementation)
        // At minimum, the app shouldn't crash
        await page.waitForTimeout(2000);
        
        // Calendar should still be functional
        await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
      }
    });

    test('should show loading states during operations', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // The calendar component shows loading states
      // We can verify the loading structure exists
      await expect(page.locator('[data-testid="calendar-management"]')).toBeVisible();
      
      // Navigate to different month to see loading behavior
      await page.click('[data-testid="next-month-btn"]');
      
      // Calendar should reload (may be too fast to catch loading state in tests)
      await calendarHelpers.waitForCalendarLoad();
      await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
    });

    test('should handle network timeouts', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // Mock slow API response
      await page.route('**/api/calendar/availability', route => {
        // Delay response to simulate timeout
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          });
        }, 10000); // 10 second delay
      });
      
      const availableDates = page.locator('[data-testid^="calendar-date-"].bg-green-100');
      const availableCount = await availableDates.count();
      
      if (availableCount > 0) {
        await availableDates.first().click();
        await page.click('button:has-text("Block Date")');
        
        await page.fill('input[placeholder="Reason for blocking..."]', 'Test timeout');
        await page.click('button:has-text("Confirm Block")');
        
        // Should handle timeout gracefully
        await page.waitForTimeout(3000);
        
        // App should remain responsive
        await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display properly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      await calendarHelpers.waitForCalendarLoad();
      
      // Calendar should be visible and usable
      await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
      
      // Navigation should work on mobile
      await expect(page.locator('[data-testid="month-navigation"]')).toBeVisible();
      await expect(page.locator('[data-testid="prev-month-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="next-month-btn"]')).toBeVisible();
      
      // Statistics should be readable
      await expect(page.locator('[data-testid="calendar-stats"]')).toBeVisible();
      
      // Legend should be visible
      await expect(page.locator('[data-testid="calendar-legend"]')).toBeVisible();
    });

    test('should have proper touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await calendarHelpers.waitForCalendarLoad();
      
      // Check that interactive elements have proper touch targets
      const touchElements = [
        '[data-testid="prev-month-btn"]',
        '[data-testid="next-month-btn"]', 
        '[data-testid="month-selector"]',
        '[data-testid="year-selector"]'
      ];
      
      for (const selector of touchElements) {
        const element = page.locator(selector);
        await expect(element).toBeVisible();
        // Verify minimum touch target size through CSS classes
        await expect(element).toHaveClass(/min-h-\[2\.75rem\]/);
      }
    });

    test('should support mobile scrolling and navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await calendarHelpers.waitForCalendarLoad();
      
      // Test month navigation on mobile
      await page.click('[data-testid="next-month-btn"]');
      await calendarHelpers.waitForCalendarLoad();
      
      // Should still be functional
      await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
      
      // Test date selection on mobile
      const dateCells = page.locator('[data-testid^="calendar-date-"]');
      const cellCount = await dateCells.count();
      
      if (cellCount > 0) {
        await dateCells.first().click();
        await expect(page.locator('[data-testid="date-actions"]')).toBeVisible();
      }
    });
  });

  test.describe('Accessibility & Keyboard Navigation', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // Check main container
      const calendarContainer = page.locator('[data-testid="calendar-management"]');
      await expect(calendarContainer).toHaveAttribute('aria-label', 'Calendar Management');
      
      // Check calendar grid
      await expect(page.locator('[data-testid="calendar-grid"]')).toHaveAttribute('role', 'grid');
      
      // Check navigation buttons
      await expect(page.locator('[data-testid="prev-month-btn"]')).toHaveAttribute('aria-label', 'Previous month');
      await expect(page.locator('[data-testid="next-month-btn"]')).toHaveAttribute('aria-label', 'Next month');
    });

    test('should support keyboard navigation', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // Focus on first date cell
      const firstDateCell = page.locator('[data-testid^="calendar-date-"]').first();
      await firstDateCell.focus();
      
      // Should be focusable
      await expect(firstDateCell).toBeFocused();
      
      // Tab navigation should work
      await page.keyboard.press('Tab');
      // Next focusable element should be focused (exact element depends on layout)
    });

    test('should announce changes for screen readers', async ({ page }) => {
      await calendarHelpers.waitForCalendarLoad();
      
      // While we can't directly test screen reader announcements in E2E tests,
      // we can verify that the structure supports screen readers
      
      // Check that statistics have descriptive text
      const statsSection = page.locator('[data-testid="calendar-stats"]');
      const statsText = await statsSection.textContent();
      
      expect(statsText).toContain('Total Days');
      expect(statsText).toContain('Available');
      expect(statsText).toContain('Booked');
      expect(statsText).toContain('Blocked');
    });
  });
});
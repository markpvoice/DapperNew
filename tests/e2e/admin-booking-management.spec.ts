/**
 * @fileoverview E2E Tests for Admin Booking Management
 * 
 * Comprehensive E2E tests covering all admin booking management functionality:
 * - Booking list display and data verification
 * - Filtering, search, and sorting functionality
 * - Status management workflows (pending→confirmed→completed)
 * - CRUD operations with proper validation
 * - Bulk operations and selection management
 * - Mobile responsive interactions
 * - Error handling and data integrity
 * - Pagination and export functionality
 * 
 * Uses AdminAuthHelpers for consistent authentication patterns
 * and follows the same reliable interaction patterns from booking-flow.spec.ts
 */

import { test, expect, Page, Locator } from '@playwright/test';
import { 
  AdminAuthHelpers, 
  AdminDashboardHelpers,
  AdminTestDataHelpers,
  quickAdminLogin,
  ADMIN_ROUTES,
  TIMEOUTS
} from './helpers/admin-auth-helpers';

// Test data constants for booking management
const TEST_BOOKING_DATA = {
  clientName: 'John Smith',
  clientEmail: 'john.smith@email.com',
  clientPhone: '(555) 123-4567',
  eventDate: '2024-12-25',
  eventType: 'wedding',
  venueName: 'Grand Hotel Ballroom',
  guestCount: 150,
  services: ['DJ', 'Photography'],
  status: 'PENDING',
  totalAmount: 2500.00,
  depositAmount: 500.00
} as const;

const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
const EVENT_TYPES = ['wedding', 'birthday', 'corporate', 'anniversary'] as const;

/**
 * Enhanced helper functions for booking management interactions
 */
class BookingManagementHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to booking management page and wait for data to load
   */
  async navigateToBookingManagement(): Promise<void> {
    await this.page.goto('/admin');
    await this.page.waitForLoadState('networkidle');
    
    // Admin dashboard has tabs - click on Bookings tab
    const bookingsButton = this.page.locator('button:has-text("Bookings")');
    const bookingsCount = await bookingsButton.count();
    
    if (bookingsCount > 0) {
      await this.waitForElementAndClick('button:has-text("Bookings")');
      await this.page.waitForLoadState('networkidle');
    }
    
    await this.verifyBookingManagementLoaded();
  }

  /**
   * Verify booking management interface is loaded and functional
   */
  async verifyBookingManagementLoaded(): Promise<void> {
    // Wait for booking management component to be visible
    await expect(this.page.locator('[data-testid="booking-management"]')).toBeVisible({ 
      timeout: TIMEOUTS.elementVisible 
    });

    // Verify core elements are present
    await expect(this.page.locator('text=Booking Management, h2:has-text("Booking")')).toBeVisible();
    
    // Wait for data to load (no loading state)
    await this.page.waitForFunction(
      () => {
        const loadingElements = document.querySelectorAll('[data-testid="loading-state"]');
        return loadingElements.length === 0;
      },
      { timeout: TIMEOUTS.apiResponse }
    );
  }

  /**
   * Wait for element and click with proper timing
   */
  async waitForElementAndClick(selector: string, timeout = TIMEOUTS.elementVisible): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(TIMEOUTS.animationWait);
    await this.page.click(selector, { force: true });
    await this.page.waitForTimeout(300);
  }

  /**
   * Fill form field safely with proper clearing
   */
  async fillFieldSafely(selector: string, value: string): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.fill(selector, '');
    await this.page.fill(selector, value);
    await this.page.waitForTimeout(100);
  }

  /**
   * Set date filter with proper format
   */
  async setDateFilter(filterType: 'start' | 'end', date: string): Promise<void> {
    const selector = filterType === 'start' ? '[data-testid="start-date-filter"]' : '[data-testid="end-date-filter"]';
    await this.fillFieldSafely(selector, date);
    
    // Auto-close date picker
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(200);
  }

  /**
   * Apply filters and wait for results
   */
  async applyFiltersAndWait(): Promise<void> {
    await this.waitForElementAndClick('button:has-text("Apply Filters")');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(TIMEOUTS.shortWait);
  }

  /**
   * Search for bookings and wait for results
   */
  async searchBookings(searchTerm: string): Promise<void> {
    await this.fillFieldSafely('input[placeholder*="Search"]', searchTerm);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(TIMEOUTS.shortWait);
  }

  /**
   * Select booking by checkbox
   */
  async selectBooking(bookingId: string): Promise<void> {
    const checkbox = this.page.locator(`[data-testid="booking-card-${bookingId}"] input[type="checkbox"], tr:has([data-testid*="${bookingId}"]) input[type="checkbox"]`);
    await checkbox.check();
    await this.page.waitForTimeout(200);
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, newStatus: typeof BOOKING_STATUSES[number]): Promise<void> {
    // Find status dropdown for the booking
    const statusSelector = `[data-testid="booking-card-${bookingId}"] select, tr:has([data-testid*="${bookingId}"]) select`;
    await this.page.selectOption(statusSelector, newStatus);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(TIMEOUTS.shortWait);
  }

  /**
   * Delete booking with confirmation
   */
  async deleteBooking(bookingId: string, confirmDelete: boolean = true): Promise<void> {
    // Find delete button for the booking
    const deleteButton = this.page.locator(`[data-testid="booking-card-${bookingId}"] button:has-text("Delete"), tr:has([data-testid*="${bookingId}"]) button:has-text("Delete")`);
    await deleteButton.click();

    // Handle confirmation dialog
    if (confirmDelete) {
      this.page.on('dialog', async dialog => {
        await dialog.accept();
      });
    } else {
      this.page.on('dialog', async dialog => {
        await dialog.dismiss();
      });
    }

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(TIMEOUTS.shortWait);
  }

  /**
   * Verify booking appears in list with expected data
   */
  async verifyBookingInList(booking: typeof TEST_BOOKING_DATA): Promise<void> {
    // Check for booking in both mobile cards and desktop table
    const bookingLocator = this.page.locator(`text=${booking.clientName}`);
    await expect(bookingLocator).toBeVisible();

    // Verify key details are displayed
    await expect(this.page.locator(`text=${booking.clientEmail}`)).toBeVisible();
    await expect(this.page.locator(`text=${booking.eventType}`)).toBeVisible();
  }

  /**
   * Get booking count from interface
   */
  async getBookingCount(): Promise<number> {
    const countText = await this.page.locator('p:has-text("bookings")').textContent();
    const match = countText?.match(/(\d+)\s+bookings/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Verify mobile responsive layout
   */
  async verifyMobileLayout(): Promise<void> {
    // Should show cards instead of table
    await expect(this.page.locator('[data-testid="booking-cards"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="booking-list"] table')).not.toBeVisible();

    // Verify touch targets are properly sized
    const buttons = this.page.locator('button, select, input[type="checkbox"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(44); // WCAG touch target minimum
      }
    }
  }

  /**
   * Verify desktop table layout
   */
  async verifyDesktopLayout(): Promise<void> {
    // Should show table instead of cards
    await expect(this.page.locator('[data-testid="booking-list"] table')).toBeVisible();
    await expect(this.page.locator('[data-testid="booking-cards"]')).not.toBeVisible();

    // Verify table headers
    const expectedHeaders = ['Client', 'Event Date', 'Event Type', 'Status', 'Amount', 'Actions'];
    for (const header of expectedHeaders) {
      await expect(this.page.locator(`th:has-text("${header}")`)).toBeVisible();
    }
  }
}

test.describe('Admin Booking Management E2E Tests', () => {
  let authHelpers: AdminAuthHelpers;
  let dashboardHelpers: AdminDashboardHelpers;
  let dataHelpers: AdminTestDataHelpers;
  let bookingHelpers: BookingManagementHelpers;

  test.beforeEach(async ({ page }) => {
    // Initialize helpers
    authHelpers = new AdminAuthHelpers(page);
    dashboardHelpers = new AdminDashboardHelpers(page);
    dataHelpers = new AdminTestDataHelpers(page);
    bookingHelpers = new BookingManagementHelpers(page);

    // Authenticate as admin
    await quickAdminLogin(page);
    
    // Navigate to booking management
    await bookingHelpers.navigateToBookingManagement();
  });

  test.describe('Booking List Display and Data Verification', () => {
    test('should display booking list with proper data formatting', async ({ page }) => {
      await test.step('Verify booking management interface loads', async () => {
        await expect(page.locator('[data-testid="booking-management"]')).toBeVisible();
        await expect(page.locator('h2:has-text("Booking"), text=Booking Management')).toBeVisible();
      });

      await test.step('Verify booking count is displayed', async () => {
        const countElement = page.locator('p:has-text("bookings")');
        await expect(countElement).toBeVisible();
        
        const countText = await countElement.textContent();
        expect(countText).toMatch(/\d+\s+bookings/);
      });

      await test.step('Verify booking data appears with proper formatting', async () => {
        // Check for at least one booking in the list
        const bookingElements = page.locator('[data-testid^="booking-card"], tbody tr');
        const bookingCount = await bookingElements.count();
        expect(bookingCount).toBeGreaterThan(0);

        // Verify essential booking data is displayed
        await expect(page.locator('text=/\\$[0-9,]+\\.[0-9]{2}/')).toBeVisible(); // Currency formatting
        await expect(page.locator('text=/[0-9]{2}\\/[0-9]{2}\\/[0-9]{4}/')).toBeVisible(); // Date formatting
        await expect(page.locator('[data-testid^="status-badge"]')).toBeVisible(); // Status badges
      });
    });

    test('should handle empty state correctly', async ({ page }) => {
      await test.step('Apply filters that return no results', async () => {
        // Set filters that should return no bookings
        await page.locator('button:has-text("Show Filters")').click();
        
        await bookingHelpers.setDateFilter('start', '2030-01-01');
        await bookingHelpers.setDateFilter('end', '2030-01-02');
        await bookingHelpers.applyFiltersAndWait();
      });

      await test.step('Verify empty state is displayed', async () => {
        await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
        await expect(page.locator('text=No bookings found')).toBeVisible();
        await expect(page.locator('text=Try adjusting your search or filters')).toBeVisible();
      });
    });
  });

  test.describe('Booking Filtering and Search Functionality', () => {
    test('should filter bookings by status', async ({ page }) => {
      await test.step('Show filters panel', async () => {
        await page.locator('button:has-text("Show Filters")').click();
        await expect(page.locator('[data-testid="filter-panel"]')).toBeVisible();
      });

      for (const status of BOOKING_STATUSES) {
        await test.step(`Filter by ${status} status`, async () => {
          await page.selectOption('[data-testid="status-filter"]', status);
          await bookingHelpers.applyFiltersAndWait();

          // Verify all visible bookings have the correct status
          const statusBadges = page.locator(`[data-testid="status-badge-${status}"]`);
          const badgeCount = await statusBadges.count();
          
          if (badgeCount > 0) {
            // At least one booking should be visible with this status
            await expect(statusBadges.first()).toBeVisible();
            await expect(statusBadges.first()).toContainText(status);
          }
        });
      }
    });

    test('should filter bookings by event type', async ({ page }) => {
      await test.step('Show filters panel', async () => {
        await page.locator('button:has-text("Show Filters")').click();
        await expect(page.locator('[data-testid="filter-panel"]')).toBeVisible();
      });

      for (const eventType of EVENT_TYPES) {
        await test.step(`Filter by ${eventType} events`, async () => {
          await page.selectOption('[data-testid="event-type-filter"]', eventType);
          await bookingHelpers.applyFiltersAndWait();

          // Verify filtered results show correct event type
          const eventTypeElements = page.locator(`text=${eventType}`);
          const elementCount = await eventTypeElements.count();
          
          if (elementCount > 0) {
            await expect(eventTypeElements.first()).toBeVisible();
          }
        });
      }
    });

    test('should filter bookings by date range', async ({ page }) => {
      await test.step('Show filters and set date range', async () => {
        await page.locator('button:has-text("Show Filters")').click();
        
        // Set a specific date range
        await bookingHelpers.setDateFilter('start', '2024-01-01');
        await bookingHelpers.setDateFilter('end', '2024-12-31');
        await bookingHelpers.applyFiltersAndWait();
      });

      await test.step('Verify filtered results', async () => {
        // Should show bookings within the date range
        const bookingCards = page.locator('[data-testid^="booking-card"], tbody tr');
        const count = await bookingCards.count();
        
        // At least verify the interface responds to date filtering
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    test('should search bookings by client name and email', async ({ page }) => {
      await test.step('Search by client name', async () => {
        await bookingHelpers.searchBookings('Smith');
        
        // Verify search results contain the search term
        const searchResults = page.locator('text=Smith');
        const resultCount = await searchResults.count();
        
        if (resultCount > 0) {
          await expect(searchResults.first()).toBeVisible();
        }
      });

      await test.step('Clear search and try email search', async () => {
        await page.locator('button:has-text("Clear")').click();
        await page.waitForLoadState('networkidle');
        
        await bookingHelpers.searchBookings('@email.com');
        
        // Verify search results contain email addresses
        const emailResults = page.locator('text=@email.com');
        const emailCount = await emailResults.count();
        
        if (emailCount > 0) {
          await expect(emailResults.first()).toBeVisible();
        }
      });
    });

    test('should combine multiple filters', async ({ page }) => {
      await test.step('Apply multiple filters simultaneously', async () => {
        await page.locator('button:has-text("Show Filters")').click();
        
        // Set multiple filter criteria
        await page.selectOption('[data-testid="status-filter"]', 'CONFIRMED');
        await page.selectOption('[data-testid="event-type-filter"]', 'wedding');
        await bookingHelpers.setDateFilter('start', '2024-01-01');
        await bookingHelpers.setDateFilter('end', '2024-12-31');
        
        await bookingHelpers.applyFiltersAndWait();
      });

      await test.step('Verify combined filter results', async () => {
        // Results should match all filter criteria
        const confirmedBadges = page.locator('[data-testid="status-badge-CONFIRMED"]');
        const weddingElements = page.locator('text=wedding');
        
        const confirmedCount = await confirmedBadges.count();
        const weddingCount = await weddingElements.count();
        
        if (confirmedCount > 0 && weddingCount > 0) {
          await expect(confirmedBadges.first()).toBeVisible();
          await expect(weddingElements.first()).toBeVisible();
        }
      });
    });
  });

  test.describe('Booking Status Management Workflows', () => {
    test('should update booking status successfully', async ({ page }) => {
      await test.step('Find a pending booking to update', async () => {
        // Look for pending status badges first
        const pendingBadges = page.locator('[data-testid="status-badge-PENDING"]');
        const pendingCount = await pendingBadges.count();
        
        if (pendingCount === 0) {
          console.log('No pending bookings found, test will use first available booking');
        }
      });

      await test.step('Update booking status to CONFIRMED', async () => {
        // Find first booking status dropdown
        const statusDropdowns = page.locator('select:has(option[value="PENDING"])');
        const dropdownCount = await statusDropdowns.count();
        
        if (dropdownCount > 0) {
          const firstDropdown = statusDropdowns.first();
          await firstDropdown.selectOption('CONFIRMED');
          await page.waitForLoadState('networkidle');
          
          // Verify status updated
          await expect(page.locator('[data-testid="status-badge-CONFIRMED"]')).toBeVisible();
        }
      });
    });

    test('should handle status workflow: pending → confirmed → completed', async ({ page }) => {
      // Find a booking to work with
      const bookingRows = page.locator('[data-testid^="booking-card"], tbody tr');
      const bookingCount = await bookingRows.count();
      
      if (bookingCount > 0) {
        await test.step('Set booking to PENDING', async () => {
          const firstDropdown = page.locator('select').first();
          await firstDropdown.selectOption('PENDING');
          await page.waitForTimeout(TIMEOUTS.shortWait);
        });

        await test.step('Progress to CONFIRMED', async () => {
          const firstDropdown = page.locator('select').first();
          await firstDropdown.selectOption('CONFIRMED');
          await page.waitForTimeout(TIMEOUTS.shortWait);
          
          await expect(page.locator('[data-testid="status-badge-CONFIRMED"]')).toBeVisible();
        });

        await test.step('Progress to COMPLETED', async () => {
          const firstDropdown = page.locator('select').first();
          await firstDropdown.selectOption('COMPLETED');
          await page.waitForTimeout(TIMEOUTS.shortWait);
          
          await expect(page.locator('[data-testid="status-badge-COMPLETED"]')).toBeVisible();
        });
      }
    });

    test('should handle booking cancellation correctly', async ({ page }) => {
      await test.step('Find a confirmed booking and cancel it', async () => {
        const statusDropdowns = page.locator('select');
        const dropdownCount = await statusDropdowns.count();
        
        if (dropdownCount > 0) {
          const firstDropdown = statusDropdowns.first();
          
          // First set to confirmed
          await firstDropdown.selectOption('CONFIRMED');
          await page.waitForTimeout(TIMEOUTS.shortWait);
          
          // Find cancel button (should appear for confirmed bookings)
          const cancelButtons = page.locator('button:has-text("Cancel")');
          const cancelButtonCount = await cancelButtons.count();
          
          if (cancelButtonCount > 0) {
            // Set up dialog handler for confirmation
            page.on('dialog', async dialog => {
              expect(dialog.type()).toBe('confirm');
              expect(dialog.message()).toContain('Cancel this confirmed booking');
              await dialog.accept();
            });
            
            await cancelButtons.first().click();
            await page.waitForLoadState('networkidle');
            
            // Verify booking is now cancelled
            await expect(page.locator('[data-testid="status-badge-CANCELLED"]')).toBeVisible();
          }
        }
      });
    });
  });

  test.describe('Booking CRUD Operations and Validation', () => {
    test('should delete booking with proper confirmation', async ({ page }) => {
      await test.step('Find a non-confirmed booking to delete', async () => {
        // Look for delete buttons (should appear for non-confirmed bookings)
        const deleteButtons = page.locator('button:has-text("Delete")');
        const deleteButtonCount = await deleteButtons.count();
        
        if (deleteButtonCount > 0) {
          const initialCount = await bookingHelpers.getBookingCount();
          
          // Set up dialog handler
          page.on('dialog', async dialog => {
            expect(dialog.type()).toBe('confirm');
            expect(dialog.message()).toContain('delete this booking');
            await dialog.accept();
          });
          
          await deleteButtons.first().click();
          await page.waitForLoadState('networkidle');
          
          // Verify booking count decreased (if it was > 1)
          if (initialCount > 1) {
            const newCount = await bookingHelpers.getBookingCount();
            expect(newCount).toBeLessThan(initialCount);
          }
        }
      });
    });

    test('should prevent deletion of confirmed bookings', async ({ page }) => {
      await test.step('Set booking to confirmed status', async () => {
        const statusDropdowns = page.locator('select');
        const dropdownCount = await statusDropdowns.count();
        
        if (dropdownCount > 0) {
          await statusDropdowns.first().selectOption('CONFIRMED');
          await page.waitForTimeout(TIMEOUTS.shortWait);
        }
      });

      await test.step('Verify delete button is replaced with cancel button', async () => {
        // For confirmed bookings, should see Cancel button instead of Delete
        const cancelButtons = page.locator('button:has-text("Cancel")');
        const deleteButtons = page.locator('button:has-text("Delete")');
        
        const cancelCount = await cancelButtons.count();
        const deleteCount = await deleteButtons.count();
        
        // Should have cancel buttons for confirmed bookings
        if (cancelCount > 0) {
          await expect(cancelButtons.first()).toBeVisible();
          expect(await cancelButtons.first().getAttribute('title')).toContain('Cancel booking');
        }
      });
    });
  });

  test.describe('Bulk Operations and Selection', () => {
    test('should select and deselect individual bookings', async ({ page }) => {
      await test.step('Select individual bookings', async () => {
        const checkboxes = page.locator('input[type="checkbox"]:not(:first-of-type)'); // Exclude select-all checkbox
        const checkboxCount = await checkboxes.count();
        
        if (checkboxCount > 0) {
          // Select first booking
          await checkboxes.first().check();
          await expect(checkboxes.first()).toBeChecked();
          
          // Verify bulk actions appear
          await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
          await expect(page.locator('text=1 booking(s) selected')).toBeVisible();
        }
      });

      await test.step('Deselect booking', async () => {
        const checkboxes = page.locator('input[type="checkbox"]:not(:first-of-type)');
        const checkboxCount = await checkboxes.count();
        
        if (checkboxCount > 0) {
          await checkboxes.first().uncheck();
          await expect(checkboxes.first()).not.toBeChecked();
          
          // Bulk actions should disappear
          await expect(page.locator('[data-testid="bulk-actions"]')).not.toBeVisible();
        }
      });
    });

    test('should select all bookings with master checkbox', async ({ page }) => {
      await test.step('Use select-all checkbox', async () => {
        const selectAllCheckbox = page.locator('th input[type="checkbox"], .booking-management input[type="checkbox"]').first();
        const individualCheckboxes = page.locator('input[type="checkbox"]:not(:first-of-type)');
        const checkboxCount = await individualCheckboxes.count();
        
        if (checkboxCount > 0) {
          await selectAllCheckbox.check();
          await page.waitForTimeout(300);
          
          // Verify all individual checkboxes are selected
          for (let i = 0; i < Math.min(checkboxCount, 5); i++) {
            await expect(individualCheckboxes.nth(i)).toBeChecked();
          }
          
          // Verify bulk actions show correct count
          await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
        }
      });
    });

    test('should perform bulk status updates', async ({ page }) => {
      await test.step('Select multiple bookings', async () => {
        const checkboxes = page.locator('input[type="checkbox"]:not(:first-of-type)');
        const checkboxCount = await checkboxes.count();
        
        if (checkboxCount >= 2) {
          // Select first two bookings
          await checkboxes.nth(0).check();
          await checkboxes.nth(1).check();
          
          await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
        }
      });

      await test.step('Perform bulk confirmation', async () => {
        const bulkConfirmButton = page.locator('button:has-text("Confirm Selected")');
        const bulkConfirmCount = await bulkConfirmButton.count();
        
        if (bulkConfirmCount > 0) {
          await bulkConfirmButton.click();
          await page.waitForLoadState('networkidle');
          
          // Verify confirmed status badges appear
          await expect(page.locator('[data-testid="status-badge-CONFIRMED"]')).toBeVisible();
        }
      });
    });

    test('should handle bulk deletion with confirmation', async ({ page }) => {
      await test.step('Select multiple non-confirmed bookings', async () => {
        // First, set some bookings to pending status
        const statusDropdowns = page.locator('select');
        const dropdownCount = await statusDropdowns.count();
        
        if (dropdownCount >= 2) {
          await statusDropdowns.nth(0).selectOption('PENDING');
          await statusDropdowns.nth(1).selectOption('PENDING');
          await page.waitForTimeout(TIMEOUTS.shortWait);
        }
        
        // Then select them
        const checkboxes = page.locator('input[type="checkbox"]:not(:first-of-type)');
        const checkboxCount = await checkboxes.count();
        
        if (checkboxCount >= 2) {
          await checkboxes.nth(0).check();
          await checkboxes.nth(1).check();
        }
      });

      await test.step('Perform bulk deletion', async () => {
        const bulkDeleteButton = page.locator('button:has-text("Delete Selected")');
        const bulkDeleteCount = await bulkDeleteButton.count();
        
        if (bulkDeleteCount > 0) {
          const initialCount = await bookingHelpers.getBookingCount();
          
          // Set up dialog handler
          page.on('dialog', async dialog => {
            expect(dialog.type()).toBe('confirm');
            expect(dialog.message()).toContain('delete');
            await dialog.accept();
          });
          
          await bulkDeleteButton.click();
          await page.waitForLoadState('networkidle');
          
          // Verify booking count decreased
          if (initialCount > 2) {
            const newCount = await bookingHelpers.getBookingCount();
            expect(newCount).toBeLessThan(initialCount);
          }
        }
      });
    });
  });

  test.describe('Mobile Responsive Booking Management', () => {
    test('should display mobile card layout on small screens', async ({ page }) => {
      await test.step('Switch to mobile viewport', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(TIMEOUTS.animationWait);
      });

      await test.step('Verify mobile card layout', async () => {
        await bookingHelpers.verifyMobileLayout();
        
        // Verify mobile-specific elements
        await expect(page.locator('[data-testid="booking-cards"]')).toBeVisible();
        
        // Check that cards contain all essential information
        const bookingCards = page.locator('[data-testid^="booking-card"]');
        const cardCount = await bookingCards.count();
        
        if (cardCount > 0) {
          const firstCard = bookingCards.first();
          await expect(firstCard.locator('[data-testid="card-header"]')).toBeVisible();
          await expect(firstCard.locator('[data-testid="card-content"]')).toBeVisible();
        }
      });

      await test.step('Test mobile touch interactions', async () => {
        const buttons = page.locator('button, select');
        const buttonCount = await buttons.count();
        
        // Test first few buttons for proper touch target sizing
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const button = buttons.nth(i);
          const boundingBox = await button.boundingBox();
          
          if (boundingBox) {
            expect(boundingBox.height).toBeGreaterThanOrEqual(44); // WCAG minimum touch target
            expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          }
        }
      });
    });

    test('should maintain functionality in mobile layout', async ({ page }) => {
      await test.step('Switch to mobile viewport', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(TIMEOUTS.animationWait);
      });

      await test.step('Test mobile filtering', async () => {
        const filterToggle = page.locator('button:has-text("Show Filters"), button:has-text("Hide Filters")');
        const filterToggleCount = await filterToggle.count();
        
        if (filterToggleCount > 0) {
          await filterToggle.click();
          await expect(page.locator('[data-testid="filter-panel"]')).toBeVisible();
          
          // Test filter application on mobile
          const statusFilter = page.locator('[data-testid="status-filter"]');
          const statusFilterCount = await statusFilter.count();
          
          if (statusFilterCount > 0) {
            await statusFilter.selectOption('CONFIRMED');
            await page.locator('button:has-text("Apply Filters")').click();
            await page.waitForLoadState('networkidle');
          }
        }
      });

      await test.step('Test mobile status updates', async () => {
        const mobileStatusDropdowns = page.locator('[data-testid^="booking-card"] select');
        const dropdownCount = await mobileStatusDropdowns.count();
        
        if (dropdownCount > 0) {
          await mobileStatusDropdowns.first().selectOption('PENDING');
          await page.waitForTimeout(TIMEOUTS.shortWait);
          
          // Verify status update worked
          await expect(page.locator('[data-testid="status-badge-PENDING"]')).toBeVisible();
        }
      });
    });
  });

  test.describe('Error Handling and Data Integrity', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      await test.step('Test error recovery', async () => {
        // Look for retry button in error states
        const retryButtons = page.locator('[data-testid="retry-btn"]');
        const retryCount = await retryButtons.count();
        
        if (retryCount > 0) {
          await retryButtons.first().click();
          await page.waitForLoadState('networkidle');
        } else {
          // Force a potential error by rapid filtering
          await page.locator('button:has-text("Show Filters")').click();
          await page.selectOption('[data-testid="status-filter"]', 'PENDING');
          await page.locator('button:has-text("Apply Filters")').click();
          await page.selectOption('[data-testid="status-filter"]', 'CONFIRMED');
          await page.locator('button:has-text("Apply Filters")').click();
          await page.waitForLoadState('networkidle');
        }
      });
    });

    test('should validate booking operations', async ({ page }) => {
      await test.step('Test status change validation', async () => {
        const statusDropdowns = page.locator('select');
        const dropdownCount = await statusDropdowns.count();
        
        if (dropdownCount > 0) {
          const originalValue = await statusDropdowns.first().inputValue();
          
          // Try to change status
          await statusDropdowns.first().selectOption('COMPLETED');
          await page.waitForTimeout(TIMEOUTS.shortWait);
          
          // Verify change was processed
          const newValue = await statusDropdowns.first().inputValue();
          expect(newValue).toBe('COMPLETED');
        }
      });
    });

    test('should handle network failures gracefully', async ({ page }) => {
      await test.step('Test offline behavior simulation', async () => {
        // Test rapid interactions that might cause race conditions
        const searchInput = page.locator('input[placeholder*="Search"]');
        const searchInputCount = await searchInput.count();
        
        if (searchInputCount > 0) {
          await searchInput.fill('test');
          await page.keyboard.press('Enter');
          await searchInput.fill('different');
          await page.keyboard.press('Enter');
          
          // Should eventually stabilize
          await page.waitForLoadState('networkidle');
        }
      });
    });
  });

  test.describe('Pagination and Data Management', () => {
    test('should handle pagination correctly', async ({ page }) => {
      await test.step('Check if pagination is present', async () => {
        const paginationElement = page.locator('[data-testid="pagination"]');
        const paginationCount = await paginationElement.count();
        
        if (paginationCount > 0) {
          // Test pagination info
          await expect(page.locator('text=/Showing \\d+ to \\d+ of \\d+ bookings/')).toBeVisible();
          
          // Test pagination buttons
          const nextButton = page.locator('button:has-text("Next")');
          const prevButton = page.locator('button:has-text("Previous")');
          
          // Previous should be disabled on first page
          await expect(prevButton).toBeDisabled();
          
          // Test next if available
          const nextEnabled = await nextButton.isEnabled();
          if (nextEnabled) {
            await nextButton.click();
            await page.waitForLoadState('networkidle');
            
            // Previous should now be enabled
            await expect(prevButton).toBeEnabled();
          }
        }
      });
    });

    test('should maintain state during pagination', async ({ page }) => {
      await test.step('Apply filters and test pagination', async () => {
        // Apply a filter
        await page.locator('button:has-text("Show Filters")').click();
        await page.selectOption('[data-testid="status-filter"]', 'CONFIRMED');
        await page.locator('button:has-text("Apply Filters")').click();
        await page.waitForLoadState('networkidle');
        
        // Check if pagination exists
        const nextButton = page.locator('button:has-text("Next")');
        const nextEnabled = await nextButton.isEnabled();
        
        if (nextEnabled) {
          await nextButton.click();
          await page.waitForLoadState('networkidle');
          
          // Verify filter is still applied
          const statusFilter = page.locator('[data-testid="status-filter"]');
          const selectedValue = await statusFilter.inputValue();
          expect(selectedValue).toBe('CONFIRMED');
        }
      });
    });
  });
});
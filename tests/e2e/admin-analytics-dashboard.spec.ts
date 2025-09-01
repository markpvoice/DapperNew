/**
 * @fileoverview E2E Tests for Admin Analytics Dashboard Functionality
 * 
 * Comprehensive test suite for admin analytics dashboard covering:
 * - Analytics data display and KPI metrics
 * - Chart interactions (RevenueChart, ServicePopularityChart, BookingTrendsChart)
 * - Time period filtering (7d, 30d, 90d, 1y) and data refresh
 * - Export functionality with JSON file generation
 * - Mobile responsive chart layouts
 * - Chart accessibility (ARIA labels, keyboard navigation)
 * - Error handling and loading states
 * - Business intelligence features for admin decision-making
 * 
 * Test Coverage:
 * - Dashboard authentication and navigation
 * - Revenue metrics and statistics display
 * - Interactive chart features (tooltips, hover states, legend interactions)
 * - Data visualization with Recharts components
 * - Cross-browser chart compatibility
 * - Performance monitoring during data loading
 */

import { test, expect, Page, Download } from '@playwright/test';
import {
  AdminAuthHelpers,
  AdminDashboardHelpers,
  AdminTestDataHelpers,
  performCompleteAdminLogin,
  quickAdminLogin,
  ADMIN_TEST_CREDENTIALS,
  ADMIN_ROUTES,
  TIMEOUTS
} from './helpers/admin-auth-helpers';

// Analytics-specific test constants
const ANALYTICS_TIMEOUTS = {
  chartRender: 8000,
  dataLoad: 10000,
  export: 5000,
  animation: 1000,
  hover: 500
} as const;

const CHART_SELECTORS = {
  revenueChart: '[data-testid="revenue-chart"], .recharts-wrapper',
  serviceChart: '[data-testid="service-chart"], .recharts-pie-chart',
  trendsChart: '[data-testid="trends-chart"], .recharts-line-chart',
  chartTooltip: '.recharts-tooltip-wrapper',
  chartLegend: '.recharts-legend-wrapper',
  chartGrid: '.recharts-cartesian-grid',
  chartAxes: '.recharts-xAxis, .recharts-yAxis'
} as const;

const ANALYTICS_ELEMENTS = {
  dashboard: '[data-testid="analytics-dashboard"]',
  statsGrid: '[data-testid="stats-grid"]',
  periodSelector: 'select[aria-label="Time Period"]',
  exportButton: 'button:has-text("Export Report")',
  loadingSpinner: '.animate-spin',
  errorState: '.text-red-500',
  retryButton: 'button:has-text("Retry")'
} as const;

// Mock analytics data for testing
const MOCK_ANALYTICS_DATA = {
  period: '30d',
  dateRange: {
    startDate: '2025-08-01',
    endDate: '2025-08-31'
  },
  analytics: {
    revenue: {
      total: 25000,
      deposits: 12500,
      average: 1250,
      bookingsCount: 20
    },
    bookings: {
      byStatus: {
        CONFIRMED: { count: 15, revenue: 18750 },
        PENDING: { count: 3, revenue: 3750 },
        COMPLETED: { count: 2, revenue: 2500 }
      },
      byEventType: [
        { eventType: 'Wedding', count: 8, totalRevenue: 12000, averageRevenue: 1500 },
        { eventType: 'Birthday Party', count: 7, totalRevenue: 8750, averageRevenue: 1250 },
        { eventType: 'Corporate Event', count: 5, totalRevenue: 4250, averageRevenue: 850 }
      ],
      dailyTrends: [
        { date: '2025-08-01', count: 1 },
        { date: '2025-08-15', count: 3 },
        { date: '2025-08-31', count: 2 }
      ]
    },
    services: {
      popularity: [
        { service: 'DJ', count: 15 },
        { service: 'Photography', count: 10 },
        { service: 'Karaoke', count: 8 }
      ]
    },
    contacts: {
      bySourse: [
        { source: 'website', count: 25 },
        { source: 'referral', count: 15 },
        { source: 'social_media', count: 10 }
      ]
    },
    conversion: {
      contacts: 50,
      bookings: 20,
      confirmed: 15,
      contactToBooking: 40.0,
      bookingToConfirmed: 75.0
    }
  }
};

/**
 * Helper class for analytics-specific test operations
 */
class AnalyticsTestHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to analytics dashboard and wait for data load
   */
  async navigateToAnalytics(): Promise<void> {
    await this.page.goto(ADMIN_ROUTES.analytics);
    await this.page.waitForLoadState('networkidle');
    await this.waitForAnalyticsDataLoad();
  }

  /**
   * Wait for analytics data to load completely
   */
  async waitForAnalyticsDataLoad(): Promise<void> {
    // Wait for loading spinner to disappear
    await this.page.waitForFunction(
      () => {
        const spinner = document.querySelector('.animate-spin');
        return !spinner || spinner.clientHeight === 0;
      },
      { timeout: ANALYTICS_TIMEOUTS.dataLoad }
    );

    // Wait for charts to render
    await this.page.waitForSelector(
      '.recharts-wrapper, svg',
      { state: 'visible', timeout: ANALYTICS_TIMEOUTS.chartRender }
    );

    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify analytics dashboard is loaded with data
   */
  async verifyAnalyticsDashboard(): Promise<void> {
    // Check main dashboard container
    await expect(this.page.locator(ANALYTICS_ELEMENTS.dashboard)).toBeVisible();
    
    // Verify statistics grid is present
    await expect(this.page.locator(ANALYTICS_ELEMENTS.statsGrid)).toBeVisible();
    
    // Check for key metrics
    const metrics = ['Total Revenue', 'Deposits', 'Average Booking', 'Total Bookings'];
    for (const metric of metrics) {
      await expect(this.page.locator(`text=${metric}`)).toBeVisible();
    }
  }

  /**
   * Test time period selector functionality
   */
  async testPeriodSelector(): Promise<void> {
    const selector = this.page.locator(ANALYTICS_ELEMENTS.periodSelector);
    await expect(selector).toBeVisible();

    // Test different periods
    const periods = ['7d', '30d', '90d', '1y'];
    for (const period of periods) {
      await selector.selectOption(period);
      await this.page.waitForLoadState('networkidle');
      await this.waitForAnalyticsDataLoad();
      
      // Verify data refreshes
      await this.verifyAnalyticsDashboard();
    }
  }

  /**
   * Test export functionality
   */
  async testExportFunctionality(): Promise<void> {
    const exportButton = this.page.locator(ANALYTICS_ELEMENTS.exportButton);
    await expect(exportButton).toBeVisible();

    // Listen for download event
    const downloadPromise = this.page.waitForEvent('download', {
      timeout: ANALYTICS_TIMEOUTS.export
    });

    await exportButton.click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/dapper-squad-analytics-.*\.json/);
  }

  /**
   * Test chart interactions
   */
  async testChartInteractions(): Promise<void> {
    // Test revenue chart interactions
    await this.testRevenueChartInteractions();
    
    // Test service popularity chart
    await this.testServicePopularityChart();
    
    // Test booking trends chart
    await this.testBookingTrendsChart();
  }

  /**
   * Test revenue chart specific interactions
   */
  private async testRevenueChartInteractions(): Promise<void> {
    const revenueChart = this.page.locator(CHART_SELECTORS.revenueChart).first();
    await expect(revenueChart).toBeVisible();

    // Test hover interactions for tooltips
    const chartArea = revenueChart.locator('svg');
    if (await chartArea.count() > 0) {
      await chartArea.hover({ position: { x: 100, y: 100 } });
      await this.page.waitForTimeout(ANALYTICS_TIMEOUTS.hover);
      
      // Tooltip should appear on hover
      const tooltip = this.page.locator(CHART_SELECTORS.chartTooltip);
      if (await tooltip.count() > 0) {
        await expect(tooltip).toBeVisible();
      }
    }
  }

  /**
   * Test service popularity chart interactions
   */
  private async testServicePopularityChart(): Promise<void> {
    const serviceChart = this.page.locator(CHART_SELECTORS.serviceChart);
    if (await serviceChart.count() > 0) {
      await expect(serviceChart).toBeVisible();

      // Test pie chart segments
      const pieSegments = serviceChart.locator('.recharts-pie-sector');
      if (await pieSegments.count() > 0) {
        await pieSegments.first().hover();
        await this.page.waitForTimeout(ANALYTICS_TIMEOUTS.hover);
      }
    }
  }

  /**
   * Test booking trends chart interactions
   */
  private async testBookingTrendsChart(): Promise<void> {
    const trendsChart = this.page.locator(CHART_SELECTORS.trendsChart);
    if (await trendsChart.count() > 0) {
      await expect(trendsChart).toBeVisible();

      // Test line chart points
      const chartPoints = trendsChart.locator('.recharts-dot');
      if (await chartPoints.count() > 0) {
        await chartPoints.first().hover();
        await this.page.waitForTimeout(ANALYTICS_TIMEOUTS.hover);
      }
    }
  }

  /**
   * Test mobile responsive behavior
   */
  async testMobileResponsive(): Promise<void> {
    // Switch to mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(ANALYTICS_TIMEOUTS.animation);

    // Charts should still be visible and functional
    await this.verifyAnalyticsDashboard();
    
    // Test mobile navigation
    const backToAdmin = this.page.locator('text=Back to Dashboard');
    if (await backToAdmin.count() > 0) {
      await expect(backToAdmin).toBeVisible();
    }

    // Reset to desktop viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
    await this.page.waitForTimeout(ANALYTICS_TIMEOUTS.animation);
  }

  /**
   * Test chart accessibility features
   */
  async testChartAccessibility(): Promise<void> {
    // Check for ARIA labels on charts
    const chartElements = await this.page.locator('svg').all();
    
    for (const chart of chartElements) {
      // Charts should have proper ARIA attributes or be in containers with labels
      const hasAriaLabel = await chart.getAttribute('aria-label');
      const hasRole = await chart.getAttribute('role');
      const hasTitle = await chart.locator('title').count();
      
      // At least one accessibility feature should be present
      const hasAccessibility = hasAriaLabel || hasRole === 'img' || hasTitle > 0;
      if (!hasAccessibility) {
        console.warn('Chart may be missing accessibility attributes');
      }
    }
  }

  /**
   * Test error handling scenarios
   */
  async testErrorHandling(): Promise<void> {
    // Mock network error
    await this.page.route('**/api/admin/analytics**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await this.navigateToAnalytics();
    
    // Should show error state
    await expect(this.page.locator(ANALYTICS_ELEMENTS.errorState)).toBeVisible();
    
    // Should have retry button
    const retryButton = this.page.locator(ANALYTICS_ELEMENTS.retryButton);
    if (await retryButton.count() > 0) {
      await expect(retryButton).toBeVisible();
    }

    // Clear route mock
    await this.page.unroute('**/api/admin/analytics**');
  }

  /**
   * Verify business metrics are displayed correctly
   */
  async verifyBusinessMetrics(): Promise<void> {
    // Check revenue metrics
    await expect(this.page.locator('text=/\\$[0-9,]+/')).toBeVisible();
    
    // Check booking counts
    await expect(this.page.locator('text=/[0-9]+ Bookings/i')).toBeVisible();
    
    // Check conversion rates
    await expect(this.page.locator('text=/%/')).toBeVisible();
    
    // Check status breakdown
    const statuses = ['Confirmed', 'Pending', 'Completed'];
    for (const status of statuses) {
      const statusElement = this.page.locator(`text=${status}`);
      if (await statusElement.count() > 0) {
        await expect(statusElement).toBeVisible();
      }
    }
  }
}

test.describe('Admin Analytics Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage to ensure clean state
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should authenticate and navigate to analytics dashboard', async ({ page }) => {
    await test.step('Login as admin user', async () => {
      const { authHelpers, dashboardHelpers } = await performCompleteAdminLogin(page);
      await authHelpers.verifyAuthenticated();
      await dashboardHelpers.waitForDashboardData();
    });

    await test.step('Navigate to analytics dashboard', async () => {
      const analyticsHelpers = new AnalyticsTestHelpers(page);
      await analyticsHelpers.navigateToAnalytics();
      
      // Should be on analytics page
      await expect(page).toHaveURL(/.*\/admin\/analytics/);
    });

    await test.step('Verify analytics dashboard loads correctly', async () => {
      const analyticsHelpers = new AnalyticsTestHelpers(page);
      await analyticsHelpers.verifyAnalyticsDashboard();
    });
  });

  test('should display analytics data and business metrics correctly', async ({ page }) => {
    // Login and navigate to analytics
    await quickAdminLogin(page);
    const analyticsHelpers = new AnalyticsTestHelpers(page);
    await analyticsHelpers.navigateToAnalytics();

    await test.step('Verify dashboard header and navigation', async () => {
      await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
      await expect(page.locator('text=Business Performance Overview')).toBeVisible();
      await expect(page.locator('text=Back to Dashboard')).toBeVisible();
    });

    await test.step('Verify revenue statistics display', async () => {
      await analyticsHelpers.verifyBusinessMetrics();
      
      // Check statistics grid
      const statsGrid = page.locator(ANALYTICS_ELEMENTS.statsGrid);
      await expect(statsGrid).toBeVisible();
      
      // Should have multiple stat cards
      const statCards = statsGrid.locator('.bg-white');
      await expect(statCards).toHaveCount(4); // Total Revenue, Deposits, Average, Bookings
    });

    await test.step('Verify booking status analytics', async () => {
      await expect(page.locator('text=Booking Status')).toBeVisible();
      
      // Should show different booking statuses
      const statusElements = page.locator('text=Confirmed, text=Pending, text=Completed');
      const statusCount = await statusElements.count();
      expect(statusCount).toBeGreaterThan(0);
    });

    await test.step('Verify conversion funnel display', async () => {
      await expect(page.locator('text=Conversion Funnel')).toBeVisible();
      await expect(page.locator('text=Contacts')).toBeVisible();
      await expect(page.locator('text=Bookings')).toBeVisible();
      
      // Should show conversion percentages
      await expect(page.locator('text=/%/')).toBeVisible();
    });
  });

  test('should handle time period filtering correctly', async ({ page }) => {
    await quickAdminLogin(page);
    const analyticsHelpers = new AnalyticsTestHelpers(page);
    await analyticsHelpers.navigateToAnalytics();

    await test.step('Test period selector functionality', async () => {
      await analyticsHelpers.testPeriodSelector();
    });

    await test.step('Verify data refreshes on period change', async () => {
      const periodSelector = page.locator(ANALYTICS_ELEMENTS.periodSelector);
      
      // Change to 7 days
      await periodSelector.selectOption('7d');
      await analyticsHelpers.waitForAnalyticsDataLoad();
      await expect(page.locator('text=Last 7 Days')).toBeVisible();
      
      // Change to 1 year
      await periodSelector.selectOption('1y');
      await analyticsHelpers.waitForAnalyticsDataLoad();
      await expect(page.locator('text=Last Year')).toBeVisible();
    });

    await test.step('Verify date range updates correctly', async () => {
      // Date range should be displayed and updated
      const dateDisplay = page.locator('text=/[A-Za-z]+ [0-9]+, [0-9]+ - [A-Za-z]+ [0-9]+, [0-9]+/');
      if (await dateDisplay.count() > 0) {
        await expect(dateDisplay).toBeVisible();
      }
    });
  });

  test('should render and interact with charts correctly', async ({ page }) => {
    await quickAdminLogin(page);
    const analyticsHelpers = new AnalyticsTestHelpers(page);
    await analyticsHelpers.navigateToAnalytics();

    await test.step('Verify all charts are rendered', async () => {
      // Revenue chart
      const revenueChart = page.locator('text=Revenue & Booking Trends').locator('..').locator('svg, .recharts-wrapper');
      if (await revenueChart.count() > 0) {
        await expect(revenueChart.first()).toBeVisible();
      }

      // Service popularity chart
      const serviceChart = page.locator('text=Service Popularity Distribution').locator('..').locator('svg, .recharts-wrapper');
      if (await serviceChart.count() > 0) {
        await expect(serviceChart.first()).toBeVisible();
      }

      // Booking trends chart
      const trendsChart = page.locator('text=Daily Booking Trends').locator('..').locator('svg, .recharts-wrapper');
      if (await trendsChart.count() > 0) {
        await expect(trendsChart.first()).toBeVisible();
      }
    });

    await test.step('Test chart interactions', async () => {
      await analyticsHelpers.testChartInteractions();
    });

    await test.step('Test chart hover and tooltip functionality', async () => {
      // Find any SVG chart element
      const chartSvgs = page.locator('svg');
      const svgCount = await chartSvgs.count();
      
      if (svgCount > 0) {
        // Hover over first chart
        await chartSvgs.first().hover({ position: { x: 100, y: 100 } });
        await page.waitForTimeout(ANALYTICS_TIMEOUTS.hover);
        
        // Check if tooltip appears (may not always be present)
        const tooltips = page.locator('.recharts-tooltip-wrapper, .recharts-tooltip');
        if (await tooltips.count() > 0) {
          await expect(tooltips.first()).toBeVisible();
        }
      }
    });
  });

  test('should handle data export functionality', async ({ page }) => {
    await quickAdminLogin(page);
    const analyticsHelpers = new AnalyticsTestHelpers(page);
    await analyticsHelpers.navigateToAnalytics();

    await test.step('Verify export button is present', async () => {
      const exportButton = page.locator(ANALYTICS_ELEMENTS.exportButton);
      await expect(exportButton).toBeVisible();
      await expect(exportButton).toBeEnabled();
    });

    await test.step('Test export functionality', async () => {
      await analyticsHelpers.testExportFunctionality();
    });

    await test.step('Verify export file naming convention', async () => {
      const downloadPromise = page.waitForEvent('download');
      await page.locator(ANALYTICS_ELEMENTS.exportButton).click();
      
      const download = await downloadPromise;
      const filename = download.suggestedFilename();
      
      // Should match expected pattern
      expect(filename).toMatch(/^dapper-squad-analytics-\w+-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  test('should be mobile responsive', async ({ page }) => {
    await quickAdminLogin(page);
    const analyticsHelpers = new AnalyticsTestHelpers(page);
    await analyticsHelpers.navigateToAnalytics();

    await test.step('Test mobile viewport behavior', async () => {
      await analyticsHelpers.testMobileResponsive();
    });

    await test.step('Verify mobile chart rendering', async () => {
      // Switch to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(ANALYTICS_TIMEOUTS.animation);
      
      // Charts should still render
      const chartElements = page.locator('svg, .recharts-wrapper');
      const chartCount = await chartElements.count();
      if (chartCount > 0) {
        await expect(chartElements.first()).toBeVisible();
      }
      
      // Mobile navigation should work
      const backButton = page.locator('text=Back to Dashboard');
      if (await backButton.count() > 0) {
        await expect(backButton).toBeVisible();
      }
    });

    await test.step('Test mobile touch interactions', async () => {
      // Touch interactions should work on mobile
      const chartSvgs = page.locator('svg');
      if (await chartSvgs.count() > 0) {
        await chartSvgs.first().tap();
        await page.waitForTimeout(500);
      }
    });
  });

  test('should handle error states and loading correctly', async ({ page }) => {
    await quickAdminLogin(page);

    await test.step('Test loading state display', async () => {
      // Navigate to analytics and look for loading state
      await page.goto(ADMIN_ROUTES.analytics);
      
      // Loading spinner should appear initially
      const loadingSpinner = page.locator(ANALYTICS_ELEMENTS.loadingSpinner);
      if (await loadingSpinner.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(loadingSpinner).toBeVisible();
        
        // Should eventually disappear
        await expect(loadingSpinner).not.toBeVisible({ timeout: ANALYTICS_TIMEOUTS.dataLoad });
      }
    });

    await test.step('Test error handling', async () => {
      const analyticsHelpers = new AnalyticsTestHelpers(page);
      await analyticsHelpers.testErrorHandling();
    });

    await test.step('Test network failure recovery', async () => {
      // Simulate network failure
      await page.setOfflineMode(true);
      await page.reload();
      
      // Should handle offline state gracefully
      await page.waitForLoadState('networkidle');
      
      // Restore network
      await page.setOfflineMode(false);
      await page.reload();
      await page.waitForLoadState('networkidle');
    });
  });

  test('should have proper chart accessibility features', async ({ page }) => {
    await quickAdminLogin(page);
    const analyticsHelpers = new AnalyticsTestHelpers(page);
    await analyticsHelpers.navigateToAnalytics();

    await test.step('Test chart accessibility', async () => {
      await analyticsHelpers.testChartAccessibility();
    });

    await test.step('Test keyboard navigation', async () => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to focus on interactive elements
      const focusedElement = page.locator(':focus');
      if (await focusedElement.count() > 0) {
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        expect(['button', 'select', 'a', 'input']).toContain(tagName);
      }
    });

    await test.step('Test screen reader compatibility', async () => {
      // Charts should have appropriate labels
      const chartContainers = page.locator('.recharts-wrapper').locator('..');
      const containerCount = await chartContainers.count();
      
      for (let i = 0; i < containerCount; i++) {
        const container = chartContainers.nth(i);
        const hasHeading = await container.locator('h2, h3, h4').count() > 0;
        const hasAriaLabel = await container.getAttribute('aria-label') !== null;
        
        // Should have some form of labeling
        expect(hasHeading || hasAriaLabel).toBeTruthy();
      }
    });
  });

  test('should display event type and service analytics correctly', async ({ page }) => {
    await quickAdminLogin(page);
    const analyticsHelpers = new AnalyticsTestHelpers(page);
    await analyticsHelpers.navigateToAnalytics();

    await test.step('Verify event type analytics', async () => {
      await expect(page.locator('text=Event Types')).toBeVisible();
      
      // Should show event type breakdown
      const eventTypes = ['Wedding', 'Birthday', 'Corporate', 'Party'];
      for (const eventType of eventTypes) {
        const eventElement = page.locator(`text=${eventType}`);
        if (await eventElement.count() > 0) {
          await expect(eventElement).toBeVisible();
        }
      }
    });

    await test.step('Verify service popularity display', async () => {
      await expect(page.locator('text=Service Popularity Distribution')).toBeVisible();
      
      // Should show services
      const services = ['DJ', 'Photography', 'Karaoke'];
      for (const service of services) {
        const serviceElement = page.locator(`text=${service}`);
        if (await serviceElement.count() > 0) {
          await expect(serviceElement).toBeVisible();
        }
      }
    });

    await test.step('Verify contact source analytics', async () => {
      await expect(page.locator('text=Contact Sources')).toBeVisible();
      
      // Should show contact sources
      const sources = ['Website', 'Referral', 'Social Media'];
      for (const source of sources) {
        const sourceElement = page.locator(`text=${source}`);
        if (await sourceElement.count() > 0) {
          await expect(sourceElement).toBeVisible();
        }
      }
    });
  });

  test('should maintain performance during data loading', async ({ page }) => {
    await quickAdminLogin(page);

    await test.step('Monitor page load performance', async () => {
      const startTime = Date.now();
      
      const analyticsHelpers = new AnalyticsTestHelpers(page);
      await analyticsHelpers.navigateToAnalytics();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (10 seconds)
      expect(loadTime).toBeLessThan(10000);
      console.log(`Analytics dashboard loaded in ${loadTime}ms`);
    });

    await test.step('Verify smooth chart rendering', async () => {
      // Charts should render without blocking the UI
      const chartElements = page.locator('svg');
      const chartCount = await chartElements.count();
      
      if (chartCount > 0) {
        // All charts should be visible
        for (let i = 0; i < chartCount; i++) {
          await expect(chartElements.nth(i)).toBeVisible();
        }
      }
    });

    await test.step('Test rapid period switching performance', async () => {
      const periodSelector = page.locator(ANALYTICS_ELEMENTS.periodSelector);
      
      // Rapidly switch periods
      const periods = ['7d', '30d', '90d', '1y'];
      for (const period of periods) {
        await periodSelector.selectOption(period);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
      }
      
      // Dashboard should remain responsive
      const analyticsHelpers = new AnalyticsTestHelpers(page);
      await analyticsHelpers.verifyAnalyticsDashboard();
    });
  });

  test('should handle different data scenarios correctly', async ({ page }) => {
    await quickAdminLogin(page);
    
    await test.step('Test with mock data scenarios', async () => {
      // Mock empty data scenario
      await page.route('**/api/admin/analytics**', route => {
        const emptyData = {
          ...MOCK_ANALYTICS_DATA,
          analytics: {
            ...MOCK_ANALYTICS_DATA.analytics,
            revenue: { total: 0, deposits: 0, average: 0, bookingsCount: 0 },
            bookings: { byStatus: {}, byEventType: [], dailyTrends: [] }
          }
        };
        route.fulfill({ status: 200, body: JSON.stringify(emptyData) });
      });
      
      const analyticsHelpers = new AnalyticsTestHelpers(page);
      await analyticsHelpers.navigateToAnalytics();
      
      // Should handle empty data gracefully
      await expect(page.locator('text=$0')).toBeVisible(); // Zero revenue
    });

    await test.step('Test with high volume data', async () => {
      // Mock high volume scenario
      await page.route('**/api/admin/analytics**', route => {
        const highVolumeData = {
          ...MOCK_ANALYTICS_DATA,
          analytics: {
            ...MOCK_ANALYTICS_DATA.analytics,
            revenue: { total: 250000, deposits: 125000, average: 5000, bookingsCount: 50 }
          }
        };
        route.fulfill({ status: 200, body: JSON.stringify(highVolumeData) });
      });
      
      await page.reload();
      await analyticsHelpers.waitForAnalyticsDataLoad();
      
      // Should display large numbers correctly
      await expect(page.locator('text=$250,000')).toBeVisible();
    });

    // Clear route mocks
    await page.unroute('**/api/admin/analytics**');
  });
});
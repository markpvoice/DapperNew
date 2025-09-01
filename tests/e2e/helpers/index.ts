/**
 * @fileoverview Test Helpers Index
 * 
 * Central export file for all E2E test helpers to ensure consistent imports.
 */

// Admin Authentication Helpers
export {
  AdminAuthHelpers,
  AdminDashboardHelpers,
  AdminTestDataHelpers,
  performCompleteAdminLogin,
  quickAdminLogin,
  testAuthenticationFailures,
  ADMIN_TEST_CREDENTIALS,
  ADMIN_ROUTES,
  TIMEOUTS
} from './admin-auth-helpers';

// Future helper exports can be added here
// export * from './booking-helpers';
// export * from './contact-helpers';
// export * from './analytics-helpers';
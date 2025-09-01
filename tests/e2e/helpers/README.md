# E2E Test Helpers Documentation

## Admin Authentication Test Helpers

Comprehensive test helpers for admin authentication, dashboard navigation, and verification in Playwright E2E tests.

### Quick Start

```typescript
import { quickAdminLogin, AdminAuthHelpers } from './helpers/admin-auth-helpers';

test('admin dashboard test', async ({ page }) => {
  // Quick login for tests that need authenticated access
  await quickAdminLogin(page);
  
  // Your test code here - already logged in and on dashboard
});
```

### Complete Usage Examples

#### 1. Basic Admin Login Test

```typescript
import { AdminAuthHelpers, ADMIN_TEST_CREDENTIALS } from './helpers/admin-auth-helpers';

test('should login successfully', async ({ page }) => {
  const authHelpers = new AdminAuthHelpers(page);
  
  await authHelpers.navigateToLogin();
  await authHelpers.login();
  await authHelpers.verifyDashboardAccess();
});
```

#### 2. Testing Authentication Failures

```typescript
import { AdminAuthHelpers } from './helpers/admin-auth-helpers';

test('should handle invalid credentials', async ({ page }) => {
  const authHelpers = new AdminAuthHelpers(page);
  
  await authHelpers.navigateToLogin();
  await authHelpers.login('invalid@email.com', 'wrongpassword', false);
  await authHelpers.handleAuthenticationError('Invalid credentials');
});
```

#### 3. Dashboard Navigation Testing

```typescript
import { performCompleteAdminLogin } from './helpers/admin-auth-helpers';

test('should navigate admin sections', async ({ page }) => {
  const { dashboardHelpers } = await performCompleteAdminLogin(page);
  
  await dashboardHelpers.navigateToCalendar();
  await dashboardHelpers.verifyCalendarPageLoaded();
  
  await dashboardHelpers.navigateToAnalytics();
  await dashboardHelpers.verifyAnalyticsPageLoaded();
});
```

#### 4. Session Management Testing

```typescript
import { quickAdminLogin, AdminAuthHelpers } from './helpers/admin-auth-helpers';

test('should maintain session across navigation', async ({ page }) => {
  await quickAdminLogin(page);
  
  // Navigate elsewhere
  await page.goto('/admin/calendar');
  
  // Verify still authenticated
  const authHelpers = new AdminAuthHelpers(page);
  await authHelpers.verifyAuthenticated();
});
```

### Helper Classes

#### AdminAuthHelpers

Core authentication functionality:

- `navigateToLogin()` - Navigate to admin login page
- `login(email, password, shouldSucceed)` - Perform login with credentials
- `verifyDashboardAccess()` - Verify successful dashboard access
- `verifyAuthenticated()` - Check authentication state
- `verifyNotAuthenticated()` - Verify logged out state
- `logout()` - Perform logout
- `handleAuthenticationError(expectedError)` - Handle and verify auth errors

#### AdminDashboardHelpers

Dashboard navigation and verification:

- `navigateToCalendar()` - Go to calendar management
- `navigateToAnalytics()` - Go to analytics dashboard
- `verifyCalendarPageLoaded()` - Verify calendar page
- `verifyAnalyticsPageLoaded()` - Verify analytics page
- `waitForDashboardData()` - Wait for data loading
- `verifyMobileResponsive()` - Test mobile behavior

#### AdminTestDataHelpers

Test data management:

- `setupTestData()` - Create test data
- `cleanupTestData()` - Remove test data
- `verifyDashboardData()` - Verify data display

### High-Level Workflow Functions

#### performCompleteAdminLogin(page)

Complete login workflow that returns all helper instances:

```typescript
const { authHelpers, dashboardHelpers, dataHelpers } = await performCompleteAdminLogin(page);
```

#### quickAdminLogin(page)

Quick login for tests that just need authenticated access:

```typescript
await quickAdminLogin(page);
// Now logged in and on dashboard
```

#### testAuthenticationFailures(page)

Test common authentication failure scenarios:

```typescript
await testAuthenticationFailures(page);
// Tests invalid credentials and error handling
```

### Configuration Constants

```typescript
// Test credentials (matching demo credentials in AdminLogin.tsx)
ADMIN_TEST_CREDENTIALS = {
  email: 'admin@dappersquad.com',
  password: 'admin123'
}

// Admin routes
ADMIN_ROUTES = {
  login: '/admin/login',
  dashboard: '/admin', 
  calendar: '/admin/calendar',
  analytics: '/admin/analytics'
}

// Timeout configurations
TIMEOUTS = {
  navigation: 15000,
  authentication: 10000,
  apiResponse: 8000,
  elementVisible: 5000,
  shortWait: 1000,
  animationWait: 500
}
```

### Best Practices

1. **Use appropriate helper level**:
   - `quickAdminLogin()` for simple authenticated tests
   - `AdminAuthHelpers` class for detailed auth testing
   - `performCompleteAdminLogin()` for complex dashboard tests

2. **Handle async operations properly**:
   ```typescript
   // Always await helper functions
   await authHelpers.login();
   await dashboardHelpers.navigateToCalendar();
   ```

3. **Verify state after actions**:
   ```typescript
   await authHelpers.login();
   await authHelpers.verifyDashboardAccess(); // Verify success
   ```

4. **Use error handling helpers**:
   ```typescript
   await authHelpers.login('bad@email.com', 'wrong', false);
   await authHelpers.handleAuthenticationError('Invalid credentials');
   ```

5. **Clean up between tests**:
   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.goto('/'); // Start from clean state
   });
   ```

### Error Handling

The helpers include comprehensive error handling:

- **Authentication errors**: Invalid credentials, rate limiting, inactive accounts
- **Navigation errors**: Failed redirects, missing elements, timeout issues
- **Session errors**: Expired tokens, missing cookies, unauthorized access
- **Network errors**: API failures, timeout, connection issues

### Mobile Testing

Test mobile responsive behavior:

```typescript
test('mobile admin dashboard', async ({ page }) => {
  await quickAdminLogin(page);
  
  const dashboardHelpers = new AdminDashboardHelpers(page);
  await dashboardHelpers.verifyMobileResponsive();
});
```

### Debugging Tips

1. **Use verbose error handling**:
   ```typescript
   await authHelpers.handleAuthenticationError(); // Shows actual error found
   ```

2. **Check console output**:
   - Helpers log debugging information
   - Page content is logged on failures

3. **Verify cookies**:
   ```typescript
   const cookies = await page.context().cookies();
   console.log('Auth cookies:', cookies.filter(c => c.name.includes('token')));
   ```

4. **Test timeouts**:
   - Increase timeouts for slow environments
   - Use appropriate timeout constants

### Integration with Existing Tests

These helpers integrate seamlessly with the existing booking flow test patterns:

```typescript
// Same patterns as booking-flow.spec.ts
async function waitForElementAndClick(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible' });
  await page.waitForLoadState('networkidle');
  await page.click(selector, { force: true });
}
```

### Future Enhancements

Planned additions:

1. **Calendar-specific helpers**: Date blocking, booking management
2. **Analytics helpers**: Chart interactions, data filtering
3. **Booking management helpers**: CRUD operations, status changes
4. **Performance helpers**: Load time measurements, network monitoring

### Contributing

When adding new admin helpers:

1. Follow the established patterns
2. Include comprehensive error handling
3. Add TypeScript types
4. Update this documentation
5. Add example usage in tests
# Test-Driven Development (TDD) Workflow

## Overview

This document outlines the complete Test-Driven Development workflow implemented for the Dapper Squad Entertainment project. TDD follows the **Red-Green-Refactor** cycle to ensure high-quality, well-tested code.

## TDD Cycle: Red-Green-Refactor

### 🔴 Red: Write a Failing Test
1. **Write the test first** - Before implementing any feature
2. **Test should fail** - Confirms the test is working and feature doesn't exist yet
3. **Test should be specific** - Focus on one small piece of functionality

### 🟢 Green: Make the Test Pass
1. **Write minimal code** - Just enough to make the test pass
2. **Don't optimize yet** - Focus only on making it work
3. **Confirm test passes** - Run the test to verify success

### 🔵 Refactor: Improve the Code
1. **Clean up the code** - Improve structure, readability, performance
2. **Keep tests passing** - Ensure all tests still pass after refactoring
3. **Follow best practices** - Apply design patterns, remove duplication

## Project Testing Structure

```
tests/
├── setup.ts                          # Global test configuration
├── utils/
│   └── test-utils.tsx                # Custom render functions and helpers
├── mocks/
│   └── api.ts                        # API mocks and test data
├── unit/
│   ├── components/
│   │   └── ui/
│   │       └── button.test.tsx       # UI component tests
│   ├── lib/
│   │   ├── utils.test.ts            # Utility function tests
│   │   ├── email.test.ts            # Email service tests
│   │   └── database.test.ts         # Database operation tests
│   └── emails/
│       └── booking-confirmation.test.tsx  # Email template tests
├── integration/
│   └── api/
│       ├── bookings.test.ts         # API endpoint tests
│       └── contact.test.ts          # Contact API tests
└── e2e/
    ├── booking-flow.spec.ts         # End-to-end user flows
    ├── contact-form.spec.ts         # Contact form E2E tests
    └── global-setup.ts              # E2E environment setup
```

## Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage

# Run tests for specific file
npm test button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should validate form"
```

## TDD Workflow Examples

### Example 1: Adding a New Component

#### Step 1: Red - Write Failing Test
```typescript
// tests/unit/components/ui/calendar.test.tsx
describe('Calendar Component', () => {
  it('should display current month and year', () => {
    render(<Calendar />);
    
    const monthYear = screen.getByTestId('calendar-month-year');
    expect(monthYear).toHaveTextContent('January 2024');
  });
});
```

#### Step 2: Green - Make Test Pass
```typescript
// src/components/ui/calendar.tsx
export const Calendar = () => {
  const currentDate = new Date();
  const monthNames = ['January', 'February', /* ... */];
  const month = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  
  return (
    <div data-testid="calendar-month-year">
      {month} {year}
    </div>
  );
};
```

#### Step 3: Refactor - Improve Code
```typescript
// src/components/ui/calendar.tsx
import { formatDate } from '@/lib/utils';

export const Calendar = () => {
  const monthYear = formatDate(new Date(), 'MMMM yyyy');
  
  return (
    <div data-testid="calendar-month-year">
      {monthYear}
    </div>
  );
};
```

### Example 2: Adding API Endpoint

#### Step 1: Red - Write Failing Test
```typescript
// tests/integration/api/calendar.test.ts
describe('/api/calendar', () => {
  it('should return available dates for given month', async () => {
    const response = await request(app)
      .get('/api/calendar/availability')
      .query({ month: 12, year: 2024 });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.availableDates).toBeArray();
  });
});
```

#### Step 2: Green - Make Test Pass
```typescript
// src/app/api/calendar/availability/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  
  // Basic implementation
  const availableDates = ['2024-12-15', '2024-12-20'];
  
  return Response.json({
    success: true,
    data: { availableDates }
  });
}
```

#### Step 3: Refactor - Add Real Logic
```typescript
// src/app/api/calendar/availability/route.ts
import { getAvailableDates } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get('month') || '1');
  const year = parseInt(searchParams.get('year') || '2024');
  
  const result = await getAvailableDates(month, year);
  
  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: 500 });
  }
  
  return Response.json({
    success: true,
    data: { availableDates: result.availableDates }
  });
}
```

## Testing Categories

### 1. Unit Tests
- **Purpose**: Test individual functions, components, and modules in isolation
- **Location**: `tests/unit/`
- **Focus**: Logic, rendering, props, state changes
- **Examples**: Button clicks, form validation, utility functions

### 2. Integration Tests
- **Purpose**: Test how different parts work together
- **Location**: `tests/integration/`
- **Focus**: API endpoints, database operations, service interactions
- **Examples**: API requests, database queries, email sending

### 3. End-to-End Tests
- **Purpose**: Test complete user workflows
- **Location**: `tests/e2e/`
- **Focus**: User interactions, business flows, cross-browser compatibility
- **Examples**: Booking flow, contact form submission, payment process

## Best Practices

### Writing Good Tests

1. **Follow AAA Pattern**:
   ```typescript
   it('should do something', () => {
     // Arrange - Set up test data and conditions
     const user = { name: 'John', email: 'john@example.com' };
     
     // Act - Perform the action being tested
     const result = validateUser(user);
     
     // Assert - Verify the expected outcome
     expect(result.isValid).toBe(true);
   });
   ```

2. **Use Descriptive Test Names**:
   ```typescript
   // ❌ Bad
   it('tests booking creation', () => {});
   
   // ✅ Good
   it('should create booking with valid data and return confirmation', () => {});
   ```

3. **Test Behavior, Not Implementation**:
   ```typescript
   // ❌ Bad - Testing implementation details
   expect(component.state.isLoading).toBe(true);
   
   // ✅ Good - Testing user-visible behavior
   expect(screen.getByText('Loading...')).toBeInTheDocument();
   ```

4. **Keep Tests Independent**:
   ```typescript
   // ❌ Bad - Tests depend on each other
   describe('User management', () => {
     let userId: string;
     
     it('should create user', () => {
       userId = createUser().id; // Other tests depend on this
     });
   });
   
   // ✅ Good - Each test is independent
   describe('User management', () => {
     it('should create user', () => {
       const user = createUser();
       expect(user.id).toBeDefined();
     });
   });
   ```

### TDD Guidelines

1. **Start Small**: Begin with the simplest possible test
2. **One Test at a Time**: Don't write multiple failing tests
3. **Minimum Code**: Write just enough code to pass the test
4. **Frequent Commits**: Commit after each Red-Green-Refactor cycle
5. **Test Edge Cases**: Consider error conditions and boundary values

### Test Data Management

1. **Use Factories**: Create reusable test data generators
   ```typescript
   const createBookingData = (overrides = {}) => ({
     clientName: 'Test Client',
     eventDate: '2024-12-25',
     services: ['DJ'],
     ...overrides,
   });
   ```

2. **Mock External Dependencies**: Isolate units under test
   ```typescript
   jest.mock('@/lib/email', () => ({
     sendEmail: jest.fn().mockResolvedValue({ success: true }),
   }));
   ```

3. **Clean State**: Reset mocks and data between tests
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
     cleanup();
   });
   ```

## Code Coverage Goals

- **Unit Tests**: 90%+ coverage for utility functions and business logic
- **Integration Tests**: 80%+ coverage for API endpoints
- **E2E Tests**: 100% coverage for critical user paths

```bash
# View coverage report
npm run test:coverage

# Open detailed HTML report
open coverage/lcov-report/index.html
```

## Debugging Tests

### Common Issues and Solutions

1. **Async Operations**: Use proper async/await patterns
   ```typescript
   // ❌ Bad
   it('should load data', () => {
     loadData();
     expect(screen.getByText('Data loaded')).toBeInTheDocument();
   });
   
   // ✅ Good
   it('should load data', async () => {
     await loadData();
     expect(await screen.findByText('Data loaded')).toBeInTheDocument();
   });
   ```

2. **Component Not Found**: Check test-ids and rendering
   ```typescript
   // Debug what's actually rendered
   screen.debug();
   
   // Or check specific element
   console.log(screen.getByTestId('my-component').innerHTML);
   ```

3. **Mock Not Working**: Ensure proper mock placement
   ```typescript
   // ❌ Bad - Mock after import
   import { myFunction } from './module';
   jest.mock('./module');
   
   // ✅ Good - Mock before import
   jest.mock('./module');
   import { myFunction } from './module';
   ```

## Continuous Integration

Tests run automatically on:
- Every commit to main branch
- All pull requests
- Nightly builds

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run test:coverage
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [TDD Best Practices](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## Team Guidelines

1. **No Production Code Without Tests**: All new features must have tests
2. **Test First**: Write tests before implementation when possible
3. **Code Review**: Tests are reviewed along with implementation code
4. **Documentation**: Update this guide when adding new testing patterns
5. **Team Knowledge**: Share testing techniques and learnings

Remember: The goal of TDD is not just testing, but designing better software through the discipline of writing tests first. This leads to more modular, maintainable, and reliable code.
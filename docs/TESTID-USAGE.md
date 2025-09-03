# Test ID Constants Usage Guide

## Overview

Centralized test ID constants prevent selector drift and ensure consistency between components and tests. Instead of hardcoding `data-testid` strings throughout the codebase, use the centralized `TEST_IDS` constants.

## Benefits

- **Prevents selector drift**: Changes to test IDs only need to be made in one place
- **Type safety**: TypeScript autocomplete and error checking
- **Consistency**: Standardized naming conventions across the codebase
- **Maintainability**: Easy to find and update test IDs
- **Refactoring safety**: Renaming is safe with IDE refactoring tools

## Usage

### Import the constants

```typescript
import { TEST_IDS, createTestId, TEST_ID_PATTERNS } from '@/constants/test-ids';
```

### In Components

Use the constants for `data-testid` attributes:

```tsx
// ❌ Don't do this - hardcoded strings
<button data-testid="book-now-button">Book Now</button>
<div data-testid="booking-form">...</div>

// ✅ Do this - use constants
<button data-testid={TEST_IDS.BOOKING.BOOK_NOW_BUTTON}>Book Now</button>
<div data-testid={TEST_IDS.BOOKING.FORM}>...</div>
```

### In Tests

Use the same constants in your tests:

```typescript
// ❌ Don't do this - hardcoded strings
screen.getByTestId('book-now-button')
screen.getByTestId('booking-form')

// ✅ Do this - use constants
screen.getByTestId(TEST_IDS.BOOKING.BOOK_NOW_BUTTON)
screen.getByTestId(TEST_IDS.BOOKING.FORM)
```

### Dynamic Test IDs

For dynamic content, use the function-based patterns:

```tsx
// Service cards with dynamic IDs
{services.map(service => (
  <div 
    key={service.id}
    data-testid={TEST_IDS.SERVICE.CARD(service.id)}
  >
    {service.name}
  </div>
))}

// In tests
await screen.findByTestId(TEST_IDS.SERVICE.CARD('dj'))
await screen.findByTestId(TEST_IDS.SERVICE.CARD('photography'))
```

### Status badges with dynamic content

```tsx
// Status badges
<span data-testid={TEST_IDS.STATUS.BADGE(booking.status)}>
  {booking.status}
</span>

// In tests
expect(screen.getByTestId(TEST_IDS.STATUS.BADGE('CONFIRMED'))).toBeVisible()
```

### Using Patterns for Complex IDs

```typescript
// For more complex dynamic IDs
const testId = createTestId('booking', 'card', bookingId)
// Returns: 'booking-card-{bookingId}'

// Or use patterns
const statusId = TEST_ID_PATTERNS.STATUS_BADGE('PENDING')
// Returns: 'status-badge-pending'
```

## Available Constants

### Common UI Elements
- `TEST_IDS.COMMON.LOADING`
- `TEST_IDS.COMMON.ERROR`
- `TEST_IDS.COMMON.SUCCESS`
- `TEST_IDS.COMMON.MODAL_CONTENT`

### Authentication & Admin
- `TEST_IDS.AUTH.LOGIN_FORM`
- `TEST_IDS.AUTH.EMAIL_INPUT`
- `TEST_IDS.ADMIN.DASHBOARD`
- `TEST_IDS.ADMIN.MOBILE_MENU_BUTTON`

### Booking System
- `TEST_IDS.BOOKING.FORM`
- `TEST_IDS.BOOKING.MODAL`
- `TEST_IDS.BOOKING.BOOK_NOW_BUTTON`

### Service Selection
- `TEST_IDS.SERVICE.CARD_DJ`
- `TEST_IDS.SERVICE.CARD_PHOTOGRAPHY`
- `TEST_IDS.SERVICE.CARD(serviceId)` - Dynamic function

### Form Steps
- `TEST_IDS.STEPS.INDICATOR(stepNumber)`
- `TEST_IDS.STEPS.CONTENT(stepNumber)`

See `/src/constants/test-ids.ts` for the complete list.

## Naming Conventions

All test IDs follow these conventions:

- **Lowercase with hyphens**: `booking-form`, `mobile-menu-button`
- **No underscores or spaces**: Use hyphens to separate words
- **Descriptive and specific**: `testimonial-client-name` not just `name`
- **Consistent prefixes**: Related elements share prefixes (`testimonial-*`)

## Adding New Test IDs

When adding new test IDs:

1. **Check existing constants first** - Don't duplicate
2. **Use appropriate category** - Add to existing sections when possible
3. **Follow naming conventions** - Lowercase with hyphens
4. **Add tests** - Update `test-ids.test.ts` with new constants
5. **Document usage** - Add examples for complex patterns

### Example: Adding a new feature

```typescript
// In test-ids.ts
NOTIFICATIONS: {
  CONTAINER: 'notifications-container',
  ITEM: (id: string) => `notification-${id}`,
  DISMISS_BUTTON: (id: string) => `dismiss-notification-${id}`,
  MARK_READ: 'mark-all-read',
}

// In component
<div data-testid={TEST_IDS.NOTIFICATIONS.CONTAINER}>
  {notifications.map(notification => (
    <div
      key={notification.id}
      data-testid={TEST_IDS.NOTIFICATIONS.ITEM(notification.id)}
    >
      <button 
        data-testid={TEST_IDS.NOTIFICATIONS.DISMISS_BUTTON(notification.id)}
      >
        Dismiss
      </button>
    </div>
  ))}
</div>

// In tests
await screen.findByTestId(TEST_IDS.NOTIFICATIONS.CONTAINER)
await screen.findByTestId(TEST_IDS.NOTIFICATIONS.ITEM('123'))
await user.click(screen.getByTestId(TEST_IDS.NOTIFICATIONS.DISMISS_BUTTON('123')))
```

## Migration Guide

To migrate existing hardcoded test IDs:

1. **Find hardcoded strings**: Search for `data-testid="` and `getByTestId("`
2. **Check if constant exists**: Look in `TEST_IDS` for existing constant
3. **Add missing constants**: If not found, add to appropriate category
4. **Replace usage**: Update both component and test files
5. **Test thoroughly**: Ensure tests still pass after migration

## Best Practices

- **Import once per file**: Import constants at the top of each file
- **Use descriptive categories**: Don't put everything in `COMMON`
- **Prefer functions for dynamic IDs**: Use `TEST_IDS.SERVICE.CARD(id)` over string concatenation
- **Update tests together**: When changing a test ID, update both component and tests
- **Document complex patterns**: Add comments for non-obvious ID patterns

## Troubleshooting

### TypeScript Errors
- Make sure you're importing from the correct path: `@/constants/test-ids`
- Check that the constant exists in the `TEST_IDS` object
- Verify function signatures for dynamic ID functions

### Test Failures After Migration
- Ensure both component and test use the same constant
- Check for typos in constant names (use TypeScript autocomplete)
- Verify dynamic functions receive correct parameters

### Missing Constants
- Add new constants to the appropriate category in `test-ids.ts`
- Update the test file to verify the new constants
- Follow naming conventions for consistency
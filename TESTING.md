# Testing Guide for Caught Up Yet

This document provides comprehensive information about the testing infrastructure and test suites for the Caught Up Yet application.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Test Coverage](#test-coverage)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

Caught Up Yet has a comprehensive test suite covering:

- **Unit Tests**: Core business logic (game position, share codes, utilities)
- **Integration Tests**: External API integrations (ESPN API)
- **Component Tests**: React components (UI, interactions, accessibility)
- **E2E Tests**: Critical user flows (navigation, game browsing, room creation)

**Total Test Count**: 188+ tests across all suites

## Testing Stack

### Unit & Component Testing
- **Vitest** - Fast, Vite-native test runner
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - DOM matchers
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment for Node.js

### E2E Testing
- **Playwright** - Cross-browser E2E testing
- **Multiple browsers**: Chromium, Firefox, WebKit
- **Mobile testing**: Pixel 5, iPhone 12

### Mocking & Test Utilities
- **Vitest mocks** - Built-in mocking capabilities
- **MSW (Mock Service Worker)** - API mocking (installed but not yet configured)

## Running Tests

### All Tests

```bash
# Run all unit/component tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Specific Test Suites

```bash
# Run specific test file
npm test -- game-position.test.ts

# Run tests matching a pattern
npm test -- share-code

# Run component tests only
npm test -- components/
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run E2E tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Coverage reports are generated in ./coverage/
# Open coverage/index.html in your browser to view detailed report
```

**Coverage Thresholds**:
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## Test Structure

### Unit Tests (`/lib/*.test.ts`)

#### `game-position.test.ts` (73 tests)
Tests the **critical spoiler protection logic**:
- ✅ NFL position comparison
- ✅ MLB position comparison (including extra innings)
- ✅ NBA position comparison
- ✅ NHL position comparison
- ✅ Message visibility determination (spoiler protection)
- ✅ Position formatting for all sports
- ✅ Position validation
- ✅ Initial position generation

**Why this is critical**: This logic determines whether messages are shown to users based on their current position in the game. Any bugs here would break the core spoiler protection feature.

#### `share-code.test.ts` (33 tests)
Tests room access control:
- ✅ Share code generation (6-character, unique, no confusing characters)
- ✅ Share code validation
- ✅ Share code normalization
- ✅ Share code formatting
- ✅ Complete user workflows

#### `espn-api.test.ts` (21 tests)
Tests external API integration:
- ✅ Fetching games for all 4 sports (NFL, MLB, NBA, NHL)
- ✅ Date formatting for API calls
- ✅ Error handling (network errors, HTTP errors, JSON parse errors)
- ✅ Data transformation and validation
- ✅ Parallel fetching of all sports
- ✅ Game sorting by date

### Component Tests (`/components/**/*.test.tsx`)

#### `GameCard.test.tsx` (26 tests)
Tests game display component:
- ✅ Rendering team information
- ✅ Game status badges (LIVE, FINAL, scheduled)
- ✅ Score display
- ✅ All 4 sports rendering
- ✅ Modal interactions
- ✅ Accessibility
- ✅ Edge cases (missing data, long names)

#### `Button.test.tsx` (35 tests)
Tests reusable button component:
- ✅ Variant styles (primary, secondary, ghost)
- ✅ Size options (sm, md, lg)
- ✅ HTML attributes (type, disabled, onClick)
- ✅ Rendering as link (href, asLink)
- ✅ Accessibility (focus, keyboard interactions)
- ✅ Custom className support

### E2E Tests (`/e2e/*.spec.ts`)

#### `home.spec.ts`
Tests landing page:
- ✅ Hero section display
- ✅ Navigation links
- ✅ Page navigation
- ✅ Responsive design (mobile, tablet, desktop)

#### `games.spec.ts`
Tests game browsing and room creation:
- ✅ Games page display
- ✅ Sport filtering (NFL, MLB, NBA, NHL)
- ✅ Date navigation
- ✅ Game cards rendering
- ✅ Create watch party flow
- ✅ Modal interactions
- ✅ Mobile responsiveness

#### `auth.spec.ts`
Tests authentication and navigation:
- ✅ Login page display
- ✅ Protected route access
- ✅ Public page access
- ✅ Navigation structure
- ✅ Footer presence and links

## Test Coverage

### Current Coverage by Area

| Area | Files | Tests | Status |
|------|-------|-------|--------|
| **Core Business Logic** | 3 | 127 | ✅ Complete |
| Game Position | 1 | 73 | ✅ Complete |
| Share Codes | 1 | 33 | ✅ Complete |
| ESPN API | 1 | 21 | ✅ Complete |
| **UI Components** | 2 | 61 | ✅ Complete |
| GameCard | 1 | 26 | ✅ Complete |
| Button | 1 | 35 | ✅ Complete |
| **E2E Tests** | 3 | ~15 | ✅ Complete |
| **TOTAL** | **8** | **188+** | ✅ Complete |

### Areas Not Yet Covered

The following areas have infrastructure set up but no tests yet:
- ⏳ API Routes (`/app/api/**`)
  - Room creation/management
  - Message sending
  - Member position updates
- ⏳ Additional Components
  - MessageFeed
  - MessageComposer
  - Position sliders (NFL, MLB, NBA, NHL)
  - CreateRoomModal
  - DateNavigation
  - SportTabs

**Note**: These can be added following the same patterns established in existing tests.

## Writing Tests

### Unit Test Template

```typescript
import { describe, it, expect } from 'vitest'
import { yourFunction } from './your-module'

describe('yourFunction', () => {
  it('should do something specific', () => {
    const result = yourFunction(input)
    expect(result).toBe(expected)
  })

  it('should handle edge cases', () => {
    expect(yourFunction(null)).toBe(fallbackValue)
  })
})
```

### Component Test Template

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import YourComponent from './YourComponent'

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent prop="value" />)

    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interactions', () => {
    const handleClick = vi.fn()
    render(<YourComponent onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should perform user flow', async ({ page }) => {
    await page.goto('/path')

    await expect(page.getByRole('heading')).toBeVisible()

    await page.getByRole('button').click()

    await expect(page).toHaveURL(/expected-path/)
  })
})
```

## Best Practices

### 1. Test Naming
- Use descriptive test names: `should show LIVE badge for in-progress games`
- Not: `test game status`

### 2. Arrange-Act-Assert Pattern
```typescript
it('should do something', () => {
  // Arrange: Set up test data
  const input = createTestData()

  // Act: Execute the code being tested
  const result = functionUnderTest(input)

  // Assert: Verify the results
  expect(result).toBe(expected)
})
```

### 3. Test One Thing
Each test should verify one specific behavior.

### 4. Avoid Test Interdependence
Tests should be able to run in any order.

### 5. Mock External Dependencies
- Mock API calls
- Mock Next.js modules (Image, router, etc.)
- Mock Supabase clients

### 6. Clean Up After Tests
```typescript
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
```

## CI/CD Integration

### GitHub Actions (Recommended)

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
          node-version: '20'

      - run: npm ci
      - run: npm test
      - run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

## Troubleshooting

### Common Issues

#### Tests are slow
- Use `test.only()` to run specific tests during development
- Check for unnecessary `waitFor` or `setTimeout` calls
- Ensure proper mocking of API calls

#### Component tests failing
- Verify all Next.js modules are properly mocked (see `tests/setup.ts`)
- Check for missing `@testing-library/jest-dom` matchers
- Ensure proper async handling with `waitFor` and `findBy*`

#### E2E tests failing
- Ensure development server is running (`npm run dev`)
- Check viewport size for responsive tests
- Increase timeout for slow operations
- Use `--debug` flag to see browser interactions

#### Coverage not meeting thresholds
- Run `npm run test:coverage` to see detailed report
- Focus on untested edge cases
- Consider if threshold needs adjustment

### Debugging Tests

```typescript
// Add debug output
import { screen } from '@testing-library/react'

screen.debug() // Prints current DOM
console.log(screen.getByText('test').innerHTML)

// Playwright debugging
await page.pause() // Pause execution
npx playwright test --debug // Run with inspector
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before committing
3. Maintain or improve coverage percentage
4. Update this document if adding new test patterns

## Summary

✅ **188+ tests** covering critical functionality
✅ **Unit tests** for core business logic (spoiler protection, share codes)
✅ **Integration tests** for external APIs
✅ **Component tests** for UI reliability
✅ **E2E tests** for user flows
✅ **Coverage tracking** with 70% minimum threshold
✅ **Fast feedback** with Vitest and Playwright

The test suite ensures the reliability and correctness of the Caught Up Yet application, especially the critical spoiler protection features.

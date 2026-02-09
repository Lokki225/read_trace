# Test Infrastructure

This directory contains the test infrastructure for the read_trace project, including Jest configuration, test utilities, mock factories, and example tests.

## Directory Structure

```
tests/
├── __mocks__/           # Global mock implementations
│   ├── supabase.ts      # Supabase client mocks
│   └── browser-apis.ts  # Browser API mocks (localStorage, fetch, etc.)
├── factories/           # Mock data factories
│   ├── user.factory.ts
│   ├── series.factory.ts
│   └── reading-progress.factory.ts
├── utils/               # Test utilities and helpers
│   └── test-utils.tsx   # Custom render function with providers
├── unit/                # Unit tests
│   └── example.test.ts
├── integration/         # Integration tests
│   └── example.integration.test.ts
└── README.md
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Configuration

### Jest Setup (`jest.setup.js`)
- Imports React Testing Library matchers
- Configures global mocks for Supabase client
- Sets up browser API mocks (localStorage, sessionStorage, fetch)
- Clears mocks before each test

### Jest Configuration (`jest.config.js`)
- Uses jsdom test environment for DOM testing
- Configures module path aliases (`@/*`)
- Sets coverage thresholds:
  - Global: 80% minimum
  - Critical paths (`src/features/**`): 90% minimum
- Includes setup file for global configuration

### Coverage Thresholds

- **Global Coverage**: 80% (branches, functions, lines, statements)
- **Critical Paths** (`src/features/**`, `src/lib/**`): 90%
- **Pass Rate**: 95% required for CI/CD gates

## Mock Factories

Use mock factories to create consistent test data:

```typescript
import { createUser, createUserList } from '@/tests/factories/user.factory'
import { createSeries } from '@/tests/factories/series.factory'
import { createReadingProgress } from '@/tests/factories/reading-progress.factory'

// Create single objects
const user = createUser({ email: 'custom@example.com' })
const series = createSeries({ title: 'Custom Series' })

// Create lists
const users = createUserList(5)
const seriesList = createSeriesList(10)
```

## Test Utilities

Use the custom render function to render components with all necessary providers:

```typescript
import { render, screen } from '@/tests/utils/test-utils'

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

## Naming Conventions

- **Test files**: `*.test.ts` or `*.test.tsx` for unit tests, `*.integration.test.ts` for integration tests
- **Mock files**: `*.mock.ts` or in `__mocks__/` directory
- **Factory files**: `*.factory.ts`
- **Utility files**: `*.utils.ts` or in `utils/` directory

## Best Practices

1. **Co-locate tests**: Keep test files next to the code they test
2. **Use factories**: Create consistent test data with mock factories
3. **Clear naming**: Use descriptive test names that explain what is being tested
4. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
5. **Mock external dependencies**: Use provided mocks for Supabase, browser APIs, etc.
6. **Test behavior, not implementation**: Focus on what the code does, not how it does it

## ESLint & Code Quality

The project includes ESLint configuration with BMAD-specific rules:

- **Naming Conventions**: PascalCase for types, camelCase for functions/variables
- **Component Naming**: Components must follow PascalCase convention
- **Code Quality**: Enforced through ESLint rules and Prettier formatting

Run linting:
```bash
npm run lint
```

## Prettier Configuration

Code is automatically formatted according to `.prettierrc`:
- 2-space indentation
- Single quotes
- 100-character line width
- Trailing commas
- Semicolons required

## Coverage Reporting

Coverage reports are generated in the `coverage/` directory when running:
```bash
npm run test:coverage
```

View the HTML report:
```bash
open coverage/lcov-report/index.html
```

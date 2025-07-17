# 🧪 Testing Guide

This document provides a comprehensive guide to the testing infrastructure in Sparky AI Browser.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

## 🧪 Test Suites

### Unit Tests
Tests individual functions and utilities in isolation.

```bash
# Run only unit tests
npm run test:unit

# Run specific test file
npx jest tests/unit/utils.test.js
```

**Location**: `tests/unit/`
**Coverage**: Utility functions, helpers, and pure functions

### Integration Tests
Tests Chrome extension APIs and component interactions.

```bash
# Run only integration tests
npm run test:integration

# Run specific integration test
npx jest tests/integration/extension.test.js
```

**Location**: `tests/integration/`
**Coverage**: Chrome APIs, message passing, storage operations

### E2E Tests
Tests complete user workflows in a real browser environment.

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode (visible browser)
npx playwright test --headed

# Run specific E2E test
npx playwright test tests/e2e/extension.spec.js
```

**Location**: `tests/e2e/`
**Coverage**: Full extension workflows, user interactions

## 📊 Coverage Reports

### Viewing Coverage
```bash
# Generate and view coverage report
npm run test:coverage

# Open HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage Requirements
- **Minimum**: 70% overall coverage
- **Functions**: 70% coverage
- **Branches**: 70% coverage
- **Lines**: 70% coverage

## 🔧 Writing Tests

### Unit Test Example
```javascript
// tests/unit/myFunction.test.js
import { myFunction } from '../../utils.js';

describe('myFunction', () => {
  it('should return expected output', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Integration Test Example
```javascript
// tests/integration/feature.test.js
describe('Chrome Extension Feature', () => {
  beforeEach(() => {
    testHelpers.mockStorageSuccess();
  });
  
  it('should work with Chrome APIs', async () => {
    await chrome.storage.local.set({ key: 'value' });
    
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      key: 'value'
    });
  });
});
```

### E2E Test Example
```javascript
// tests/e2e/workflow.spec.js
import { test, expect } from '@playwright/test';

test('should complete user workflow', async ({ page, context }) => {
  // Test real browser interactions
  await page.goto('https://example.com');
  await page.click('button');
  await expect(page.locator('.result')).toBeVisible();
});
```

## 🤖 Chrome Extension Testing

### Available Mocks
The test setup provides complete Chrome API mocks:

```javascript
// Storage
chrome.storage.local.get()
chrome.storage.local.set()
chrome.storage.sync.get()

// Tabs
chrome.tabs.query()
chrome.tabs.create()
chrome.tabs.sendMessage()

// Scripting
chrome.scripting.executeScript()

// Identity
chrome.identity.getAuthToken()

// Side Panel
chrome.sidePanel.open()
chrome.sidePanel.setOptions()
```

### Test Helpers
Use the provided test helpers for common operations:

```javascript
// Mock successful storage
testHelpers.mockStorageSuccess({ key: 'value' });

// Mock storage error
testHelpers.mockStorageError(new Error('Storage failed'));

// Mock successful fetch
testHelpers.mockFetchSuccess({ data: 'response' });

// Simulate message passing
testHelpers.simulateMessage({ type: 'TEST_MESSAGE' });
```

## 🎭 Playwright Configuration

### Browser Setup
E2E tests run with the extension loaded:

```javascript
// Extension is automatically loaded with these flags:
'--disable-extensions-except=.',
'--load-extension=.',
'--no-sandbox',
'--disable-setuid-sandbox'
```

### Test Configuration
- **Headless**: Tests run without visible browser in CI
- **Screenshots**: Captured on failure
- **Videos**: Recorded for failed tests
- **Retries**: 2 retries in CI, 0 locally

## 🔍 Debugging Tests

### Debug Unit/Integration Tests
```bash
# Run with verbose output
npx jest --verbose

# Run specific test with debugging
npx jest --testNamePattern="specific test name"

# Run in watch mode for TDD
npm run test:watch
```

### Debug E2E Tests
```bash
# Run with visible browser
npx playwright test --headed

# Run with debugging tools
npx playwright test --debug

# Run specific test with tracing
npx playwright test --trace on tests/e2e/extension.spec.js
```

### Debug in VS Code
Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## 🚨 Common Issues

### Jest Issues
```bash
# Clear Jest cache
npx jest --clearCache

# Update snapshots
npx jest --updateSnapshot

# Run with no cache
npx jest --no-cache
```

### Playwright Issues
```bash
# Install browsers
npx playwright install

# Update Playwright
npm update @playwright/test

# Clear test artifacts
rm -rf test-results/
```

### Chrome Extension Issues
```bash
# Validate manifest
node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'))"

# Check file permissions
ls -la *.js *.html *.css

# Validate extension structure
web-ext lint
```

## 📈 Performance Testing

### Monitoring File Sizes
Tests automatically check for:
- Individual files over 100KB
- Total extension size over 1MB
- Performance regression alerts

### Load Time Testing
E2E tests measure:
- Extension initialization time
- Page navigation speed
- API response times

## 🛡️ Security Testing

### Automatic Checks
- Hardcoded secrets detection
- Dangerous API usage (`eval`, `innerHTML`)
- Dynamic script creation
- NPM vulnerability scanning

### Manual Security Testing
```bash
# Run security audit
npm audit

# Check for specific vulnerabilities
npm audit --audit-level=moderate

# Update vulnerable packages
npm audit fix
```

## 📝 Test Maintenance

### Regular Tasks
1. **Update Dependencies**: Keep testing libraries current
2. **Review Coverage**: Ensure coverage stays above 70%
3. **Fix Flaky Tests**: Address intermittent failures
4. **Add New Tests**: Cover new features
5. **Performance Review**: Monitor test execution time

### Best Practices
1. **Descriptive Names**: Use clear, specific test names
2. **Single Responsibility**: One assertion per test
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock External Dependencies**: Use mocks for APIs
5. **Clean Up**: Reset state between tests

## 🚀 CI/CD Integration

### GitHub Actions
Tests run automatically on:
- Pull request creation/updates
- Pushes to main/develop branches
- Manual workflow dispatch

### Required Status Checks
Configure branch protection to require:
- Unit Tests passing
- Integration Tests passing
- E2E Tests passing
- Extension Validation passing
- Security Scan passing

### Artifacts
Test runs generate:
- Coverage reports (HTML/JSON)
- E2E test videos/screenshots
- Extension packages
- Test result summaries

## 🎯 Tips for Success

### Development Workflow
1. **Write tests first** (TDD approach)
2. **Run tests locally** before pushing
3. **Use watch mode** during development
4. **Check coverage** regularly
5. **Fix failing tests** immediately

### Test Quality
1. **Test behavior, not implementation**
2. **Use realistic test data**
3. **Cover edge cases and error scenarios**
4. **Keep tests simple and focused**
5. **Document complex test logic**

---

## 🆘 Getting Help

### Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Chrome Extension Testing](https://developer.chrome.com/docs/extensions/mv3/tut_debugging/)

### Common Commands Quick Reference
```bash
# Essential commands
npm test                    # Run all tests
npm run test:coverage      # Run with coverage
npm run test:watch         # Watch mode
npm run test:e2e          # E2E tests only

# Debugging
npx jest --verbose         # Detailed output
npx playwright test --headed  # Visible browser
npx jest --clearCache      # Clear cache

# Coverage
open coverage/lcov-report/index.html  # View coverage
npm run test:coverage -- --watchAll   # Coverage in watch mode
```

**Happy Testing! 🧪🐕**
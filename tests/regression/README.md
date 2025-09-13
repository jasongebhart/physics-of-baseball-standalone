# Regression Test Suite - Physics of Baseball Course

Comprehensive Playwright test suite for the Physics of Baseball interactive course application.

## Test Coverage

### 🏠 Homepage Navigation (`homepage-navigation.spec.js`)
- Course structure display (all 13 weeks)
- Progressive disclosure of week content
- Week-to-week navigation
- Course overview functionality
- Progress tracking display
- Responsive layout across devices
- Performance and loading tests

### 📚 Weekly Content Navigation (`weekly-content-navigation.spec.js`)
- Week page structure (5 daily sections)
- Daily navigation within weeks
- Breadcrumb navigation to homepage
- Adjacent week navigation (previous/next)
- Consistent navigation UI across all weeks
- Mobile-optimized navigation

### 🧮 Interactive Elements (`interactive-elements.spec.js`)
- Physics calculators (velocity, motion, etc.)
- Baseball diamond simulations
- Motion graphs and interactive charts
- Practice problems and quizzes
- Form validation and error handling
- Dropdown and select interactions
- Keyboard accessibility
- Cross-device compatibility

### 📊 Progress Tracking (`progress-tracking.spec.js`)
- localStorage persistence
- Week completion tracking
- Progress bar updates
- Week unlocking logic
- Error handling for corrupted data
- State management across page reloads
- Accessibility for progress indicators

### ♿ Accessibility Compliance (`accessibility-compliance.spec.js`)
- WCAG 2.1 AA compliance testing
- Heading hierarchy validation
- ARIA landmarks and roles
- Skip link functionality
- Keyboard navigation support
- Color contrast verification
- Screen reader compatibility
- Focus management

### 📱 Responsive Design (`responsive-design.spec.js`)
- Mobile, tablet, desktop layouts
- Touch-friendly interactions
- Viewport adaptation
- Performance across screen sizes
- High-DPI display support
- Text scaling and zoom levels

## Running Tests

### Local Development (with browser visible)
```bash
# Run all regression tests with browser visible (cross-platform)
npm run test:headed

# Windows-specific (if cross-env not available)
npm run test:headed:win

# Run specific test file with browser visible
set HEADED=true && npx playwright test tests/regression/homepage-navigation.spec.js

# Run with debug mode (slower, with tracing)
npx playwright test --project=debug

# Run specific browser
npx playwright test --project=regression-chromium
```

### CI/CD (headless mode)
```bash
# Run all regression tests (headless, cross-platform)
npm run test:ci

# Windows-specific (if cross-env not available)
npm run test:ci:win

# Direct command with environment variable
set CI=true && npx playwright test tests/regression/
```

### Quick Testing Commands
```bash
# Run only homepage tests
npx playwright test homepage-navigation

# Run only mobile tests
npx playwright test --project=regression-mobile-chrome

# Run with live HTML reporter
npx playwright test --reporter=html --headed

# Run failed tests only
npx playwright test --last-failed
```

## Test Configuration

The test suite is configured via `playwright.config.js` with the following projects:

- **regression-chromium**: Desktop Chrome regression tests
- **regression-firefox**: Desktop Firefox regression tests
- **regression-webkit**: Desktop Safari regression tests
- **regression-mobile-chrome**: Mobile Chrome tests
- **regression-mobile-safari**: Mobile Safari tests
- **user-flows**: Original user flow tests
- **debug**: Debug mode with slow motion and full tracing

## Environment Variables

- `CI=true`: Enables headless mode, retries, and CI-specific reporting
- `HEADED=true`: Forces browser to be visible (overrides CI setting)
- `PWTEST_HTML_REPORT_OPEN=never`: Prevents auto-opening HTML report

## Test Data and Fixtures

Tests use realistic data and scenarios:
- Week completion simulation via localStorage
- Form validation with invalid/valid inputs
- Touch interactions on mobile devices
- Progress tracking across multiple weeks
- Error state handling

## Debugging Failed Tests

1. **View HTML Report**: `npx playwright show-report`
2. **Run with Debug Mode**: `npx playwright test --project=debug failing-test.spec.js`
3. **View Screenshots**: Check `test-results/` directory
4. **Trace Viewer**: `npx playwright show-trace trace.zip`

## Adding New Tests

1. Create test file in `tests/regression/`
2. Follow naming convention: `feature-name.spec.js`
3. Include accessibility and responsive tests
4. Add cross-browser compatibility checks
5. Document new test coverage in this README

## CI/CD Integration

Tests are designed to run in GitHub Actions, Jenkins, or similar CI/CD platforms:

```yaml
# Example GitHub Actions workflow
- name: Run Regression Tests
  run: |
    npx playwright install
    CI=true npx playwright test tests/regression/

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Test Maintenance

- Tests are designed to be resilient to minor UI changes
- Uses semantic selectors (roles, labels) over brittle CSS selectors
- Includes fallback strategies for optional elements
- Self-healing with graceful degradation for missing features

## Performance Benchmarks

- Homepage load: < 3 seconds
- Week navigation: < 2 seconds
- Interactive element response: < 500ms
- Mobile performance within 2x of desktop

## Browser Support Matrix

| Browser | Desktop | Mobile | Status |
|---------|---------|---------|---------|
| Chrome | ✅ | ✅ | Full support |
| Firefox | ✅ | ⚠️ | Basic support |
| Safari | ✅ | ✅ | Full support |
| Edge | ✅ | ⚠️ | Inherits Chrome |

## Accessibility Standards

Tests validate compliance with:
- WCAG 2.1 Level AA
- Section 508
- ARIA 1.1 specifications
- Keyboard navigation standards
- Screen reader compatibility
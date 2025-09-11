# Testing Guide - Physics of Baseball

This document describes the comprehensive testing strategy implemented for the Physics of Baseball educational web application.

## 🏗️ Testing Architecture

### Testing Pyramid
```
    ┌─────────────────┐
    │   E2E Tests     │ ← 20% (Critical user workflows)
    │   (Playwright)  │
    ├─────────────────┤
    │  Integration    │ ← 30% (Component interactions)
    │  (Vitest+JSDOM) │
    ├─────────────────┤
    │   Unit Tests    │ ← 50% (Physics calculations)
    │   (Vitest)      │
    └─────────────────┘
```

## 📊 Test Coverage

- **45 Unit Tests** - Physics equations, constants, utilities
- **Integration Tests** - Calculator component interactions
- **E2E Tests** - Complete user workflows
- **Accessibility Tests** - WCAG 2.1 AA compliance
- **Performance Tests** - Lighthouse CI metrics

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run tests with UI
npm run test:ui
```

## 🧪 Test Categories

### 1. Unit Tests (`tests/unit/`)

**Physics Constants** (`physics-constants.test.js`)
- Validates all physics constants used in calculations
- Ensures values match real-world physics standards
- Tests relationships between constants

**Projectile Motion** (`projectile-motion.test.js`)
- Tests trajectory calculations with/without air resistance
- Validates edge cases (zero velocity, 90° angle, negative height)
- Checks energy conservation principles
- Tests floating point precision handling

**Energy Calculator** (`energy-calculator.test.js`)
- Kinetic energy calculations (KE = ½mv²)
- Potential energy calculations (PE = mgh)
- Work calculations (W = F⋅d)
- Total energy summation
- Baseball-specific scenarios

**Calculator Utilities** (`calculator-utilities.test.js`)
- Number rounding and precision handling
- Floating point arithmetic edge cases
- DOM utility functions

### 2. Integration Tests (`tests/integration/`)

**Projectile Calculator** (`projectile-calculator.test.js`)
- DOM element creation and manipulation
- Slider interaction and value updates
- Canvas visualization rendering
- Real-time calculation updates
- Error handling for invalid inputs

### 3. E2E Tests (`tests/e2e/`)

**Calculator Workflows** (`calculator-workflows.spec.js`)
- Week 1 velocity calculator workflow
- Week 2 projectile motion calculator workflow
- Assessment system interaction
- Navigation between pages
- Responsive design validation

**Accessibility** (`accessibility.spec.js`)
- WCAG 2.1 AA compliance testing
- Keyboard navigation support
- Screen reader compatibility
- Color contrast validation
- Focus indicator visibility

## 🔬 Physics Testing Patterns

### Testing Physics Equations

```javascript
describe('Projectile Motion', () => {
  test('45-degree angle produces maximum range', () => {
    const angles = [30, 35, 40, 45, 50, 55, 60];
    const ranges = angles.map(angle => 
      calculateProjectileMotion(30, angle, 0).range
    );
    
    const maxRange = Math.max(...ranges);
    const maxRangeAngle = angles[ranges.indexOf(maxRange)];
    
    expect(maxRangeAngle).toBe(45);
  });
});
```

### Testing Edge Cases

```javascript
describe('Edge Cases', () => {
  test('zero initial velocity', () => {
    const result = calculateProjectileMotion(0, 45, 2);
    expect(result.range).toBe(0);
    expect(result.timeOfFlight).toBeCloseTo(Math.sqrt(2 * 2 / 9.81), 2);
  });
  
  test('negative height (below ground level)', () => {
    const result = calculateProjectileMotion(30, 45, -2);
    const reference = calculateProjectileMotion(30, 45, 0);
    
    expect(result.timeOfFlight).toBeLessThan(reference.timeOfFlight);
    expect(result.range).toBeLessThan(reference.range);
  });
});
```

### Testing Floating Point Precision

```javascript
test('handles floating point arithmetic issues', () => {
  const result = 0.1 + 0.2; // 0.30000000000000004
  expect(roundToDecimal(result, 1)).toBe(0.3);
});
```

## 🎯 Performance Testing

### Lighthouse CI Configuration

Performance thresholds defined in `lighthouserc.js`:
- **Performance**: ≥80 score
- **Accessibility**: ≥90 score  
- **Best Practices**: ≥90 score
- **SEO**: ≥80 score

### Animation Performance

```javascript
test('maintains 60fps during trajectory animation', async () => {
  const startTime = performance.now();
  let frameCount = 0;
  
  // Monitor animation frames
  const observer = new PerformanceObserver((list) => {
    frameCount += list.getEntries().length;
  });
  
  await animateProjectile();
  
  const fps = (frameCount / duration) * 1000;
  expect(fps).toBeGreaterThan(55);
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/test-and-deploy.yml`)

**Test Job:**
1. Install dependencies
2. Run unit tests with coverage
3. Install Playwright browsers
4. Start development server
5. Run E2E tests
6. Upload test artifacts

**Accessibility Job:**
- Run accessibility-specific tests
- Generate accessibility reports

**Performance Job:**
- Run Lighthouse CI
- Validate performance metrics

**Deploy Job:**
- Deploy to GitHub Pages on main branch
- Only runs after all tests pass

### Running Locally

```bash
# Simulate CI environment
npm ci                    # Clean install
npm run test:coverage     # Unit tests with coverage
npm run serve &          # Start server
npx wait-on http://localhost:8080  # Wait for server
npm run test:e2e         # E2E tests
```

## 🎨 Cross-Browser Testing

Playwright tests run on:
- **Chromium** (Chrome, Edge)
- **Firefox**
- **WebKit** (Safari)
- **Mobile** (iPhone, Android)

```javascript
// playwright.config.js
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
]
```

## 🛠️ Test Development Guidelines

### Writing Unit Tests

1. **Test one thing at a time**
2. **Use descriptive test names**
3. **Include edge cases**
4. **Test both success and failure paths**
5. **Use realistic test data**

### Writing Integration Tests

1. **Mock external dependencies**
2. **Test user interactions**
3. **Validate DOM updates**
4. **Check error handling**

### Writing E2E Tests

1. **Test complete user workflows**
2. **Use data attributes for selectors**
3. **Include accessibility checks**
4. **Test responsive behavior**
5. **Keep tests independent**

## 📈 Test Metrics

### Coverage Goals
- **Unit Tests**: >90% line coverage
- **Integration Tests**: >80% component coverage
- **E2E Tests**: 100% critical path coverage

### Performance Goals
- **First Contentful Paint**: <2s
- **Largest Contentful Paint**: <3s
- **Total Blocking Time**: <500ms
- **Cumulative Layout Shift**: <0.1

## 🚨 Common Issues & Solutions

### Test Flakiness
```javascript
// Use proper waits
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible({ timeout: 5000 });

// Avoid hardcoded delays
await page.waitForTimeout(100); // ❌ Bad
await page.waitForSelector('.result'); // ✅ Good
```

### Physics Precision
```javascript
// Use appropriate precision for physics calculations
expect(result.range).toBeCloseTo(91.8, 1); // ✅ Good
expect(result.range).toBe(91.8); // ❌ May fail due to floating point
```

### Animation Testing
```javascript
// Test animation state, not frame-by-frame animation
expect(canvas).toBeVisible();
expect(context.clearRect).toHaveBeenCalled();
expect(context.stroke).toHaveBeenCalled();
```

## 🔍 Debugging Tests

### Vitest
```bash
# Run specific test file
npx vitest projectile-motion.test.js

# Debug mode
npx vitest --inspect-brk

# UI mode
npm run test:ui
```

### Playwright
```bash
# Debug mode
npx playwright test --debug

# Headed mode
npx playwright test --headed

# Specific browser
npx playwright test --browser=firefox
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Performance](https://web.dev/lighthouse-performance/)

---

*This testing strategy ensures the Physics of Baseball application delivers accurate, accessible, and performant educational content across all browsers and devices.*
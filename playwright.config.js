import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Physics of Baseball Course
 * Supports both CI/CD (headless) and local debugging (headed) modes
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Multiple reporters for different environments
  reporter: process.env.CI
    ? [['html'], ['github'], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['html'], ['list']],

  // Output directory for test results
  outputDir: 'test-results/',

  // Global test timeout
  timeout: 30000,

  // Global expect timeout
  expect: {
    timeout: 5000,
  },

  use: {
    baseURL: 'http://localhost:8080',

    // Headless mode: true for CI, false for local debugging
    headless: process.env.CI ? true : false,

    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Tracing and screenshots
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: process.env.CI ? 'only-on-failure' : 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'retain-on-failure',

    // Action timeouts
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    // Regression tests - run on all browsers
    {
      name: 'regression-chromium',
      testDir: './tests/regression',
      use: {
        ...devices['Desktop Chrome'],
        // Force headless in CI, allow headed locally
        headless: process.env.CI ? true : process.env.HEADED !== 'true',
      },
    },
    {
      name: 'regression-firefox',
      testDir: './tests/regression',
      use: {
        ...devices['Desktop Firefox'],
        headless: process.env.CI ? true : process.env.HEADED !== 'true',
      },
    },
    {
      name: 'regression-webkit',
      testDir: './tests/regression',
      use: {
        ...devices['Desktop Safari'],
        headless: process.env.CI ? true : process.env.HEADED !== 'true',
      },
    },

    // Mobile regression tests
    {
      name: 'regression-mobile-chrome',
      testDir: './tests/regression',
      use: {
        ...devices['Pixel 5'],
        headless: process.env.CI ? true : process.env.HEADED !== 'true',
      },
    },
    {
      name: 'regression-mobile-safari',
      testDir: './tests/regression',
      use: {
        ...devices['iPhone 12'],
        headless: process.env.CI ? true : process.env.HEADED !== 'true',
      },
    },

    // User flow tests - primary browser only for faster feedback
    {
      name: 'user-flows',
      testDir: './tests',
      testMatch: '**/user-flow.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.CI ? true : process.env.HEADED !== 'true',
      },
    },

    // Debug project - always headed, single browser
    {
      name: 'debug',
      testDir: './tests',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        slowMo: 1000, // Slow down actions for easier debugging
        video: 'on',
        trace: 'on',
      },
    },
  ],

  webServer: {
    command: 'python -m http.server 8080',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },
});
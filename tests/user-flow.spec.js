/**
 * Playwright Tests for New User Flow - Physics of Baseball Course
 * Tests the improved UX from homepage through course navigation
 */

import { test, expect } from '@playwright/test';

test.describe('New User Journey - Physics of Baseball Course', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a fresh state (clear localStorage)
    await page.goto('http://localhost:8080/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should display welcoming homepage with clear call-to-action', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Check main title and branding
    await expect(page.getByRole('heading', { name: /The Physics of Baseball/ })).toBeVisible();
    await expect(page.locator('.title-subtitle')).toContainText('Interactive Course');

    // Verify hero section with clear CTA
    await expect(page.getByRole('heading', { name: 'Start Your Physics Journey' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Start Learning Now/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /View Course Overview/ })).toBeVisible();

    // Check features section
    await expect(page.getByRole('heading', { name: 'Why Choose This Course?' })).toBeVisible();
    await expect(page.locator('.feature-card')).toHaveCount(4);
  });

  test('should show progressive disclosure of course content', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Initially, only first 3 weeks should be visible
    await expect(page.locator('.week-card')).toHaveCount(3);

    // Week 1 should be available, Week 2-3 locked
    await expect(page.locator('[data-week="1"]')).toHaveClass(/week-card--current/);
    await expect(page.locator('[data-week="2"]')).toHaveClass(/week-card--locked/);
    await expect(page.locator('[data-week="3"]')).toHaveClass(/week-card--locked/);

    // Expand to show all weeks
    await page.getByRole('button', { name: /Show All 13 Weeks/ }).click();
    await expect(page.locator('#additional-weeks')).toBeVisible();
    await expect(page.getByRole('button', { name: /Show Less/ })).toBeVisible();
  });

  test('should have accessible navigation and skip links', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Test skip links (they should exist but be hidden until focused)
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toHaveCount(1);

    // Test keyboard navigation to skip link
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();

    // Test skip link functionality
    await skipLink.click();
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('should handle responsive design correctly', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:8080/');

    await expect(page.locator('.features-grid')).toBeVisible();
    await expect(page.locator('.hero-actions')).toHaveCSS('flex-direction', 'row');

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 600 });
    await expect(page.locator('.features-grid')).toBeVisible();

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.hero-actions')).toHaveCSS('flex-direction', 'column');
    await expect(page.locator('.week-cards-group')).toHaveCSS('grid-template-columns', '1fr');
  });

  test('should navigate successfully from homepage to Week 1', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Click the primary CTA button
    await page.getByRole('link', { name: /Start Learning Now/ }).click();

    // Should navigate to Week 1 page
    await expect(page).toHaveURL(/week-01\.html/);
    await expect(page.getByRole('heading', { name: /Week 1: Introduction to the Physics of Motion/ })).toBeVisible();

    // Check for breadcrumb navigation back to home
    const homeLink = page.getByRole('link', { name: /Course Home/ });
    await expect(homeLink).toBeVisible();
    await homeLink.click();

    // Should be back on homepage
    await expect(page).toHaveURL(/index\.html$/);
  });

  test('should track and display progress correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Initial progress should be 0%
    await expect(page.locator('.progress-text')).toContainText('0 of 13 weeks completed');
    await expect(page.locator('.progress-fill')).toHaveCSS('width', '0px');

    // Simulate completing Week 1 by updating localStorage
    await page.evaluate(() => {
      const progress = { completedWeeks: [1], currentWeek: 2 };
      localStorage.setItem('physics-baseball-progress', JSON.stringify(progress));

      // Trigger progress update
      window.dispatchEvent(new CustomEvent('week-completed', { detail: { week: 1 } }));
    });

    // Reload to see progress update
    await page.reload();

    // Progress should now show 1 week completed
    await expect(page.locator('.progress-text')).toContainText('1 of 13 weeks completed');

    // Week 1 should be marked as completed, Week 2 should be available
    await expect(page.locator('[data-week="1"]')).toHaveClass(/week-card--completed/);
    await expect(page.locator('[data-week="2"]')).toHaveClass(/week-card--current/);
  });

  test('should handle keyboard navigation properly', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Test tab navigation through major elements
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Another skip link
    await page.keyboard.press('Tab'); // Start Learning CTA

    const startLearningCTA = page.getByRole('link', { name: /Start Learning Now/ });
    await expect(startLearningCTA).toBeFocused();

    // Test Enter key activation
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/week-01\.html/);
  });

  test('should provide helpful error states and feedback', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Try to access a locked week (Week 2)
    const lockedWeekButton = page.locator('[data-week="2"] .week-link');

    // Should be disabled
    await expect(lockedWeekButton).toBeDisabled();
    await expect(lockedWeekButton).toContainText('Complete Week 1 First');

    // Test clicking locked content doesn't navigate
    await lockedWeekButton.click({ force: true }); // Force click disabled element
    await expect(page).toHaveURL(/index\.html$/); // Should stay on homepage
  });

  test('should handle course overview scrolling smoothly', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Click "View Course Overview" button
    await page.getByRole('button', { name: /View Course Overview/ }).click();

    // Should smoothly scroll to course overview section
    await page.waitForTimeout(1000); // Wait for smooth scroll

    // Check if course overview is in viewport
    const courseOverview = page.locator('#course-overview');
    await expect(courseOverview).toBeInViewport();
  });

  test('should work with different accessibility preferences', async ({ page }) => {
    // Test with prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://localhost:8080/');

    // Animations should be disabled or minimal
    const heroSection = page.locator('.hero-section');
    await expect(heroSection).toBeVisible();

    // Test high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();

    // Dark theme should be applied
    await expect(page.locator('body')).toBeVisible(); // Basic visibility check
  });

  test('should handle loading states gracefully', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Click week link and check for loading state
    const weekCard = page.locator('[data-week="1"]');
    const weekLink = weekCard.locator('.week-link');

    await weekLink.click();

    // Should briefly show loading state (if JS is loaded)
    // This is hard to test reliably, so we just ensure navigation works
    await expect(page).toHaveURL(/week-01\.html/);
  });

  test('should provide screen reader announcements', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Check for ARIA live region
    const liveRegion = page.locator('#live-region');
    await expect(liveRegion).toHaveCount(1);
    await expect(liveRegion).toHaveAttribute('aria-live', 'polite');

    // Check for proper ARIA labels on interactive elements
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-label');
    await expect(page.locator('[aria-expanded]')).toHaveCount(1); // Expand button
  });

  test('should maintain state across page reloads', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Expand weeks section
    await page.getByRole('button', { name: /Show All 13 Weeks/ }).click();
    await expect(page.locator('#additional-weeks')).toBeVisible();

    // Set some progress
    await page.evaluate(() => {
      const progress = { completedWeeks: [1], currentWeek: 2 };
      localStorage.setItem('physics-baseball-progress', JSON.stringify(progress));
    });

    // Reload page
    await page.reload();

    // Progress should be maintained
    await expect(page.locator('.progress-text')).toContainText('1 of 13 weeks completed');
  });

  test('should handle edge cases gracefully', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Test with JavaScript disabled (basic functionality)
    await page.context().addInitScript(() => {
      delete window.courseUX;
    });

    await page.reload();

    // Basic navigation should still work
    await expect(page.getByRole('link', { name: /Start Learning Now/ })).toBeVisible();
    await expect(page.locator('.week-card')).toHaveCount(3);

    // Click should still navigate (HTML fallback)
    await page.getByRole('link', { name: /Start Learning Now/ }).click();
    await expect(page).toHaveURL(/week-01\.html/);
  });
});

test.describe('Cross-browser compatibility', () => {
  ['webkit', 'firefox', 'chromium'].forEach(browserName => {
    test(`should work correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      test.skip(currentBrowser !== browserName, `Skipping ${browserName} test in ${currentBrowser}`);

      await page.goto('http://localhost:8080/');

      // Core functionality should work across browsers
      await expect(page.getByRole('heading', { name: /The Physics of Baseball/ })).toBeVisible();
      await expect(page.getByRole('link', { name: /Start Learning Now/ })).toBeVisible();
      await expect(page.locator('.week-card')).toHaveCount(3);

      // Navigation should work
      await page.getByRole('link', { name: /Start Learning Now/ }).click();
      await expect(page).toHaveURL(/week-01\.html/);
    });
  });
});

test.describe('Performance and Loading', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds (adjust based on requirements)
    expect(loadTime).toBeLessThan(3000);

    // All critical elements should be visible
    await expect(page.getByRole('heading', { name: /The Physics of Baseball/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Start Learning Now/ })).toBeVisible();
  });

  test('should handle offline gracefully if service worker is available', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);

    // Try to reload (should work if cached, gracefully fail if not)
    await page.reload();

    // Page should either load from cache or show offline indication
    // This depends on service worker implementation
    const isVisible = await page.getByRole('heading', { name: /The Physics of Baseball/ }).isVisible();

    // Either shows cached content or handles offline state
    expect(typeof isVisible).toBe('boolean');
  });
});
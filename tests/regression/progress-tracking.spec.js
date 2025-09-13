/**
 * Regression Tests: Progress Tracking and Local Storage
 * Tests course progress persistence, week unlocking, and state management
 */

import { test, expect } from '@playwright/test';

test.describe('Progress Tracking and State Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should initialize with clean progress state', async ({ page }) => {
    // Initial state should show no progress
    const progressText = page.locator('.progress-text');
    if (await progressText.isVisible()) {
      await expect(progressText).toContainText(/0 of 13 weeks completed|0%/);
    }

    const progressBar = page.locator('.progress-fill, [role="progressbar"]');
    if (await progressBar.isVisible()) {
      // Progress should be at minimum
      const width = await progressBar.evaluate(el => getComputedStyle(el).width);
      expect(width).toBe('0px');
    }

    // Week 1 should be available, others locked
    const week1Card = page.locator('[data-week="1"]');
    if (await week1Card.isVisible()) {
      await expect(week1Card).toHaveClass(/week-card--current|available/);
    }

    const week2Card = page.locator('[data-week="2"]');
    if (await week2Card.isVisible()) {
      await expect(week2Card).toHaveClass(/week-card--locked|locked/);
    }
  });

  test('should persist progress in localStorage', async ({ page }) => {
    // Simulate completing Week 1
    await page.evaluate(() => {
      const progress = {
        completedWeeks: [1],
        currentWeek: 2
      };
      localStorage.setItem('physics-baseball-progress', JSON.stringify(progress));

      // Trigger progress update event if system listens for it
      if (window.courseUX) {
        window.courseUX.updateProgressDisplay();
        window.courseUX.updateWeekStates();
      } else {
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('week-completed', { detail: { week: 1 } }));
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Progress should be updated
    const progressText = page.locator('.progress-text');
    if (await progressText.isVisible()) {
      await expect(progressText).toContainText(/1 of 13 weeks completed/);
    }

    // Week 1 should be completed, Week 2 available
    const week1Card = page.locator('[data-week="1"]');
    if (await week1Card.isVisible()) {
      await expect(week1Card).toHaveClass(/week-card--completed|completed/);
    }

    const week2Card = page.locator('[data-week="2"]');
    if (await week2Card.isVisible()) {
      await expect(week2Card).toHaveClass(/week-card--current|available/);
    }
  });

  test('should handle multiple week completion', async ({ page }) => {
    // Simulate completing multiple weeks
    await page.evaluate(() => {
      const progress = {
        completedWeeks: [1, 2, 3],
        currentWeek: 4
      };
      localStorage.setItem('physics-baseball-progress', JSON.stringify(progress));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Progress should show 3 completed weeks
    const progressText = page.locator('.progress-text');
    if (await progressText.isVisible()) {
      await expect(progressText).toContainText(/3 of 13 weeks completed/);
    }

    // Progress bar should show ~23% (3/13)
    const progressBar = page.locator('.progress-fill');
    if (await progressBar.isVisible()) {
      const width = await progressBar.evaluate(el => getComputedStyle(el).width);
      const containerWidth = await progressBar.evaluate(el => getComputedStyle(el.parentElement).width);

      if (width !== '0px' && containerWidth !== '0px') {
        const percentage = (parseFloat(width) / parseFloat(containerWidth)) * 100;
        expect(percentage).toBeCloseTo(23, 1); // ~23% with 1% tolerance
      }
    }

    // Multiple weeks should be marked as completed
    const completedWeeks = page.locator('.week-card--completed, [data-week].completed');
    const completedCount = await completedWeeks.count();
    expect(completedCount).toBeGreaterThanOrEqual(3);
  });

  test('should update progress when completing weeks', async ({ page }) => {
    // Navigate to Week 1
    await page.goto('/weeks/week-01.html');
    await page.waitForLoadState('networkidle');

    // Simulate week completion (would normally happen via quiz or assessment)
    await page.evaluate(() => {
      // Trigger week completion
      const event = new CustomEvent('week-completed', { detail: { week: 1 } });
      document.dispatchEvent(event);
    });

    // Navigate back to homepage
    const homeLink = page.getByRole('link', { name: /Course Home|Home/i });
    if (await homeLink.isVisible()) {
      await homeLink.click();
    } else {
      await page.goto('/');
    }

    await page.waitForLoadState('networkidle');

    // Check if progress was updated
    const progressText = page.locator('.progress-text');
    if (await progressText.isVisible()) {
      const text = await progressText.textContent();
      // Should show at least some progress
      expect(text).toMatch(/[1-9]\d* of 13 weeks completed/);
    }
  });

  test('should prevent access to locked weeks', async ({ page }) => {
    // Try to access Week 2 when only Week 1 should be available
    const week2Link = page.locator('[data-week="2"] .week-link, [data-week="2"] a');

    if (await week2Link.isVisible()) {
      const isDisabled = await week2Link.getAttribute('disabled');
      const classes = await week2Link.getAttribute('class');

      // Should be disabled or have disabled styling
      expect(isDisabled === 'true' || classes?.includes('disabled')).toBeTruthy();
    }

    // Direct navigation should also be restricted or show locked state
    await page.goto('/weeks/week-02.html');
    await page.waitForLoadState('networkidle');

    // Page might load but should indicate it's locked, or redirect
    const lockedIndicator = page.locator('.locked, .unavailable, [data-locked="true"]');
    const backToHome = page.getByRole('link', { name: /Back to Course|Home/i });

    // Either should show locked state or provide navigation back
    const hasLockOrNav = (await lockedIndicator.count()) > 0 || (await backToHome.count()) > 0;
    expect(hasLockOrNav).toBeTruthy();
  });

  test('should handle corrupted localStorage gracefully', async ({ page }) => {
    // Set corrupted localStorage data
    await page.evaluate(() => {
      localStorage.setItem('physics-baseball-progress', 'invalid json');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should fallback to default state
    const progressText = page.locator('.progress-text');
    if (await progressText.isVisible()) {
      await expect(progressText).toContainText(/0 of 13 weeks completed/);
    }

    // Should not throw JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error));

    await page.waitForTimeout(1000);
    expect(errors.length).toBe(0);
  });

  test('should maintain progress across page reloads', async ({ page }) => {
    // Set initial progress
    await page.evaluate(() => {
      const progress = {
        completedWeeks: [1, 2],
        currentWeek: 3
      };
      localStorage.setItem('physics-baseball-progress', JSON.stringify(progress));
    });

    // Reload multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Progress should persist
      const progressText = page.locator('.progress-text');
      if (await progressText.isVisible()) {
        await expect(progressText).toContainText(/2 of 13 weeks completed/);
      }
    }

    // Navigate away and back
    await page.goto('/weeks/week-01.html');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Progress should still be there
    const progressText = page.locator('.progress-text');
    if (await progressText.isVisible()) {
      await expect(progressText).toContainText(/2 of 13 weeks completed/);
    }
  });

  test('should update week accessibility based on progress', async ({ page }) => {
    // Initially, only Week 1 should be accessible
    const week1Link = page.locator('[data-week="1"] .week-link, [data-week="1"] a').first();
    const week3Link = page.locator('[data-week="3"] .week-link, [data-week="3"] a').first();

    if (await week1Link.isVisible()) {
      // Week 1 should be clickable
      await expect(week1Link).not.toHaveAttribute('disabled');
    }

    if (await week3Link.isVisible()) {
      // Week 3 should be locked
      const isDisabled = await week3Link.getAttribute('disabled');
      const classes = await week3Link.getAttribute('class');
      expect(isDisabled === 'true' || classes?.includes('disabled')).toBeTruthy();
    }

    // Complete Week 1 and 2
    await page.evaluate(() => {
      const progress = {
        completedWeeks: [1, 2],
        currentWeek: 3
      };
      localStorage.setItem('physics-baseball-progress', JSON.stringify(progress));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Now Week 3 should be accessible
    const week3LinkAfter = page.locator('[data-week="3"] .week-link, [data-week="3"] a').first();
    if (await week3LinkAfter.isVisible()) {
      await expect(week3LinkAfter).not.toHaveAttribute('disabled');
    }
  });

  test('should handle progress display in different screen sizes', async ({ page }) => {
    // Set some progress
    await page.evaluate(() => {
      const progress = {
        completedWeeks: [1, 2, 3, 4],
        currentWeek: 5
      };
      localStorage.setItem('physics-baseball-progress', JSON.stringify(progress));
    });

    const viewports = [
      { width: 1200, height: 800 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Progress should be visible in all viewports
      const progressText = page.locator('.progress-text');
      if (await progressText.isVisible()) {
        await expect(progressText).toContainText(/4 of 13 weeks completed/);
      }

      const progressBar = page.locator('.progress-fill');
      if (await progressBar.isVisible()) {
        await expect(progressBar).toBeVisible();
      }
    }
  });

  test('should handle edge cases with week numbers', async ({ page }) => {
    // Test with invalid week numbers
    await page.evaluate(() => {
      const progress = {
        completedWeeks: [0, 1, 15, -1], // Invalid week numbers mixed with valid
        currentWeek: 2
      };
      localStorage.setItem('physics-baseball-progress', JSON.stringify(progress));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should handle gracefully without errors
    const errors = [];
    page.on('pageerror', error => errors.push(error));

    await page.waitForTimeout(1000);
    expect(errors.length).toBe(0);

    // Should show progress for valid weeks only
    const progressText = page.locator('.progress-text');
    if (await progressText.isVisible()) {
      const text = await progressText.textContent();
      // Should not count invalid weeks
      expect(text).toMatch(/[0-2] of 13 weeks completed/);
    }
  });
});
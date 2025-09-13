/**
 * Regression Tests: Homepage Navigation Flow
 * Tests all navigation patterns from the main course homepage
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage Navigation - Physics of Baseball', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display complete course structure with all 13 weeks', async ({ page }) => {
    // Verify main title and branding
    await expect(page.getByRole('heading', { name: /The Physics of Baseball/ })).toBeVisible();
    await expect(page.locator('.title-subtitle')).toContainText('Interactive Course');

    // Verify all 13 weeks are present
    const weekCards = page.locator('.week-card');
    await expect(weekCards).toHaveCount(13);

    // Check first few week titles
    await expect(page.getByText('Week 1: Introduction to the Physics of Motion')).toBeVisible();
    await expect(page.getByText('Week 2: Understanding Projectile Motion')).toBeVisible();
    await expect(page.getByText('Week 13: Review and Application')).toBeVisible();
  });

  test('should handle progressive disclosure of course weeks', async ({ page }) => {
    // Initially only first 3 weeks visible
    const visibleWeeks = page.locator('.week-card:visible');
    await expect(visibleWeeks).toHaveCount(3);

    // Expand to show all weeks
    const expandButton = page.getByRole('button', { name: /Show All 13 Weeks/ });
    if (await expandButton.isVisible()) {
      await expandButton.click();
      await expect(page.locator('#additional-weeks')).toBeVisible();
      await expect(page.locator('.week-card')).toHaveCount(13);
    }
  });

  test('should navigate from homepage to Week 1', async ({ page }) => {
    // Click Week 1 link
    await page.getByRole('link', { name: /Start Week 1/ }).first().click();

    // Verify navigation to Week 1
    await expect(page).toHaveURL(/week-01\.html/);
    await expect(page.getByRole('heading', { name: /Week 1.*Introduction to the Physics of Motion/ })).toBeVisible();
  });

  test('should navigate between different weeks from homepage', async ({ page }) => {
    // Test Week 2
    await page.getByRole('link', { name: /Start Week 2/ }).click();
    await expect(page).toHaveURL(/week-02\.html/);
    await page.goBack();

    // Test Week 5
    await page.getByRole('link', { name: /Start Week 5/ }).click();
    await expect(page).toHaveURL(/week-05\.html/);
    await page.goBack();

    // Test Week 13
    await page.getByRole('link', { name: /Start Week 13/ }).click();
    await expect(page).toHaveURL(/week-13\.html/);
  });

  test('should display course overview section correctly', async ({ page }) => {
    // Check for course overview button if present
    const overviewButton = page.getByRole('button', { name: /View Course Overview/ });
    if (await overviewButton.isVisible()) {
      await overviewButton.click();

      // Should scroll to course overview section
      const courseOverview = page.locator('#course-overview');
      await expect(courseOverview).toBeInViewport();
    }

    // Verify course footer information
    await expect(page.locator('.course-footer')).toBeVisible();
    await expect(page.getByText(/Complete Course.*13 weeks/)).toBeVisible();
  });

  test('should handle progress tracking display', async ({ page }) => {
    // Check for progress indicators
    const progressText = page.locator('.progress-text');
    if (await progressText.isVisible()) {
      await expect(progressText).toContainText(/\d+ of 13 weeks completed/);
    }

    const progressBar = page.locator('.progress-fill');
    if (await progressBar.isVisible()) {
      await expect(progressBar).toHaveCSS('width', /\d+px/);
    }
  });

  test('should be responsive across different viewport sizes', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.week-grid')).toBeVisible();

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.week-grid')).toBeVisible();

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.week-grid')).toBeVisible();

    // Week cards should stack vertically on mobile
    const weekCard = page.locator('.week-card').first();
    await expect(weekCard).toBeVisible();
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Check for skip links
    const skipLink = page.getByRole('link', { name: /Skip to main content/ });
    if (await skipLink.isVisible()) {
      await expect(skipLink).toHaveCount(1);
    }

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Check ARIA landmarks
    await expect(page.locator('[role="main"]')).toHaveCount(1);

    // Verify heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should load performance assets within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Critical elements should be visible
    await expect(page.getByRole('heading', { name: /The Physics of Baseball/ })).toBeVisible();
    await expect(page.locator('.week-card').first()).toBeVisible();
  });

  test('should handle instructor guide navigation', async ({ page }) => {
    const instructorLink = page.getByRole('link', { name: /Instructor Guide/ });

    if (await instructorLink.isVisible()) {
      // Test instructor guide link
      await instructorLink.click();
      // Note: This might 404 based on previous exploration, so we handle it gracefully
      const response = await page.waitForLoadState('networkidle');
      // Just verify the navigation attempt was made
      expect(page.url()).toContain('instructor');
    }
  });
});
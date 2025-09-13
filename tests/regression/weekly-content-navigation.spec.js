/**
 * Regression Tests: Weekly Content Navigation
 * Tests navigation within individual week pages and daily content structure
 */

import { test, expect } from '@playwright/test';

test.describe('Weekly Content Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/weeks/week-01.html');
    await page.waitForLoadState('networkidle');
  });

  test('should display week structure with 5 daily sections', async ({ page }) => {
    // Verify week title
    await expect(page.getByRole('heading', { name: /Week 1.*Introduction to the Physics of Motion/ })).toBeVisible();

    // Check for daily navigation
    const dayLinks = page.locator('.daily-nav a, .day-link, [href*="day-"]');
    const dayCount = await dayLinks.count();
    expect(dayCount).toBeGreaterThanOrEqual(5); // Should have 5 days

    // Verify day structure
    await expect(page.getByText(/Day 1/i)).toBeVisible();
    await expect(page.getByText(/Day 5/i)).toBeVisible();
  });

  test('should navigate between days within a week', async ({ page }) => {
    // Click Day 2 if available
    const day2Link = page.getByRole('link', { name: /Day 2/i }).first();
    if (await day2Link.isVisible()) {
      await day2Link.click();
      await page.waitForLoadState('networkidle');

      // Should show Day 2 content
      await expect(page.getByText(/Day 2/i)).toBeVisible();
    }

    // Try Day 3
    const day3Link = page.getByRole('link', { name: /Day 3/i }).first();
    if (await day3Link.isVisible()) {
      await day3Link.click();
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/Day 3/i)).toBeVisible();
    }
  });

  test('should have breadcrumb navigation back to homepage', async ({ page }) => {
    // Look for breadcrumb or home link
    const homeLink = page.getByRole('link', { name: /Course Home|Home|Back to Course/i });

    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL(/index\.html$|\/$/);
      await expect(page.getByRole('heading', { name: /The Physics of Baseball/ })).toBeVisible();
    }
  });

  test('should display week content sections correctly', async ({ page }) => {
    // Check for main content sections
    await expect(page.locator('main, [role="main"], .content')).toBeVisible();

    // Look for common week content patterns
    const learningObjectives = page.getByText(/Learning Objectives|Objectives/i);
    const weekOverview = page.getByText(/Week Overview|Overview/i);

    // At least one content section should be visible
    const contentSections = page.locator('section, article, .day-content');
    const sectionCount = await contentSections.count();
    expect(sectionCount).toBeGreaterThan(0);
  });

  test('should navigate to adjacent weeks', async ({ page }) => {
    // Look for next week link
    const nextWeekLink = page.getByRole('link', { name: /Week 2|Next Week/i });
    if (await nextWeekLink.isVisible()) {
      await nextWeekLink.click();
      await expect(page).toHaveURL(/week-02\.html/);
      await expect(page.getByRole('heading', { name: /Week 2/i })).toBeVisible();
      await page.goBack();
    }

    // Look for previous week link (should not exist for Week 1)
    const prevWeekLink = page.getByRole('link', { name: /Previous Week/i });
    if (await prevWeekLink.isVisible()) {
      // Week 1 shouldn't have previous week, but other weeks should
      await prevWeekLink.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should handle week navigation from different starting weeks', async ({ page }) => {
    // Test from Week 5
    await page.goto('/weeks/week-05.html');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Week 5/i })).toBeVisible();

    // Navigate to Week 6
    const nextWeek = page.getByRole('link', { name: /Week 6|Next Week/i });
    if (await nextWeek.isVisible()) {
      await nextWeek.click();
      await expect(page).toHaveURL(/week-06\.html/);
    }

    // Test Week 13 (final week)
    await page.goto('/weeks/week-13.html');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Week 13/i })).toBeVisible();

    // Should not have next week link
    const nextFromFinal = page.getByRole('link', { name: /Week 14|Next Week/i });
    await expect(nextFromFinal).toHaveCount(0);
  });

  test('should maintain consistent navigation UI across weeks', async ({ page }) => {
    const weeks = ['01', '03', '07', '10', '13'];

    for (const week of weeks) {
      await page.goto(`/weeks/week-${week}.html`);
      await page.waitForLoadState('networkidle');

      // Each week should have consistent navigation elements
      await expect(page.locator('nav, .navigation, .week-nav')).toBeVisible();

      // Should have heading structure
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);

      // Should have main content area
      await expect(page.locator('main, [role="main"], .content')).toBeVisible();
    }
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Test tab navigation through page elements
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through several elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test Enter key activation on focused links
    const firstLink = page.getByRole('link').first();
    await firstLink.focus();
    // Don't actually press Enter to avoid navigation, just verify focus
    await expect(firstLink).toBeFocused();
  });

  test('should display properly on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Content should be visible and readable
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(page.locator('main, [role="main"], .content')).toBeVisible();

    // Navigation should be accessible
    const navElements = page.locator('nav a, .nav-link');
    if (await navElements.first().isVisible()) {
      await expect(navElements.first()).toBeVisible();
    }

    // Text should not overflow container
    const mainContent = page.locator('main, .content');
    if (await mainContent.isVisible()) {
      const box = await mainContent.boundingBox();
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });

  test('should handle loading states gracefully', async ({ page }) => {
    // Test rapid navigation between days
    const dayLinks = page.locator('[href*="day-"], .day-link');
    const linkCount = await dayLinks.count();

    if (linkCount > 1) {
      await dayLinks.first().click();
      await page.waitForLoadState('domcontentloaded');

      await dayLinks.last().click();
      await page.waitForLoadState('domcontentloaded');

      // Should successfully load content
      await expect(page.locator('main, .content')).toBeVisible();
    }
  });
});
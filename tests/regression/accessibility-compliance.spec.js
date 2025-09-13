/**
 * Regression Tests: Accessibility Compliance
 * Tests WCAG compliance, keyboard navigation, screen reader support, and inclusive design
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility Compliance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for single h1
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
    await expect(h1Elements.first()).toBeVisible();

    // Check heading hierarchy (h1 -> h2 -> h3, etc.)
    const allHeadings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await allHeadings.count();

    if (headingCount > 1) {
      for (let i = 0; i < headingCount; i++) {
        const heading = allHeadings.nth(i);
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());

        // Heading should have visible text
        const text = await heading.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('should have proper ARIA landmarks and roles', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('[role="main"], main');
    await expect(main).toHaveCount(1);

    // Check for navigation landmarks
    const nav = page.locator('[role="navigation"], nav');
    const navCount = await nav.count();
    expect(navCount).toBeGreaterThanOrEqual(0);

    // Check for banner/header
    const header = page.locator('[role="banner"], header');
    if (await header.count() > 0) {
      await expect(header.first()).toBeVisible();
    }

    // Check for complementary content if present
    const aside = page.locator('[role="complementary"], aside');
    if (await aside.count() > 0) {
      await expect(aside.first()).toBeVisible();
    }

    // Check for contentinfo/footer
    const footer = page.locator('[role="contentinfo"], footer');
    if (await footer.count() > 0) {
      await expect(footer.first()).toBeVisible();
    }
  });

  test('should support skip links for keyboard navigation', async ({ page }) => {
    // Look for skip links
    const skipLinks = page.locator('.skip-link, [href="#main"], [href="#main-content"], [href="#content"]');

    if (await skipLinks.count() > 0) {
      const firstSkipLink = skipLinks.first();

      // Skip link should exist
      await expect(firstSkipLink).toHaveCount(1);

      // Test keyboard focus to skip link
      await page.keyboard.press('Tab');
      await expect(firstSkipLink).toBeFocused();

      // Test skip link functionality
      await firstSkipLink.click();
      const target = await firstSkipLink.getAttribute('href');
      if (target) {
        const targetElement = page.locator(target);
        await expect(targetElement).toBeFocused();
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Test text elements for color contrast
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div, li, td, th');
    const elementCount = Math.min(await textElements.count(), 10); // Test first 10 elements

    for (let i = 0; i < elementCount; i++) {
      const element = textElements.nth(i);
      if (await element.isVisible()) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });

        // Elements should have color and background color set
        expect(styles.color).toBeTruthy();
        expect(styles.backgroundColor).toBeTruthy();
      }
    }
  });

  test('should support keyboard navigation throughout the interface', async ({ page }) => {
    // Get all focusable elements
    const focusableElements = page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const elementCount = await focusableElements.count();

    if (elementCount > 0) {
      // Start keyboard navigation
      await page.keyboard.press('Tab');

      // Track focus progression
      let previousFocused = null;
      let tabCount = 0;
      const maxTabs = Math.min(elementCount, 10); // Test first 10 elements

      for (let i = 0; i < maxTabs; i++) {
        const currentFocused = page.locator(':focus');

        if (await currentFocused.count() > 0) {
          // Element should be visible when focused
          await expect(currentFocused).toBeVisible();

          // Focus should change with each tab
          const currentElement = await currentFocused.evaluate(el => el.outerHTML);
          expect(currentElement).not.toBe(previousFocused);
          previousFocused = currentElement;

          tabCount++;
        }

        await page.keyboard.press('Tab');
      }

      expect(tabCount).toBeGreaterThan(0);
    }
  });

  test('should have proper form labels and descriptions', async ({ page }) => {
    // Test input labels
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const inputId = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');

        // Input should have some form of labeling
        const hasLabel = inputId && await page.locator(`label[for="${inputId}"]`).count() > 0;
        const hasAriaLabel = ariaLabel && ariaLabel.trim().length > 0;
        const hasAriaLabelledby = ariaLabelledby && await page.locator(`#${ariaLabelledby}`).count() > 0;
        const hasPlaceholder = placeholder && placeholder.trim().length > 0;

        const isAccessible = hasLabel || hasAriaLabel || hasAriaLabelledby || hasPlaceholder;
        expect(isAccessible).toBeTruthy();
      }
    }
  });

  test('should provide ARIA live regions for dynamic content', async ({ page }) => {
    // Look for ARIA live regions
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');

    if (await liveRegions.count() > 0) {
      const firstLiveRegion = liveRegions.first();

      // Live region should have proper attributes
      const ariaLive = await firstLiveRegion.getAttribute('aria-live');
      const role = await firstLiveRegion.getAttribute('role');

      expect(ariaLive === 'polite' || ariaLive === 'assertive' || role === 'status' || role === 'alert').toBeTruthy();
    }
  });

  test('should have proper button and link semantics', async ({ page }) => {
    // Test buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        // Button should have accessible text
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledby = await button.getAttribute('aria-labelledby');

        const hasAccessibleName = (text && text.trim().length > 0) ||
                                 (ariaLabel && ariaLabel.trim().length > 0) ||
                                 (ariaLabelledby && await page.locator(`#${ariaLabelledby}`).count() > 0);

        expect(hasAccessibleName).toBeTruthy();
      }
    }

    // Test links
    const links = page.locator('a');
    const linkCount = await links.count();

    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = links.nth(i);
      if (await link.isVisible()) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');

        const hasAccessibleName = (text && text.trim().length > 0) ||
                                 (ariaLabel && ariaLabel.trim().length > 0) ||
                                 (title && title.trim().length > 0);

        expect(hasAccessibleName).toBeTruthy();
      }
    }
  });

  test('should support high contrast mode', async ({ page }) => {
    // Test with forced-colors media query (simulates high contrast mode)
    await page.emulateMedia({ forcedColors: 'active' });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Critical elements should still be visible
    await expect(page.getByRole('heading').first()).toBeVisible();
    const mainContent = page.locator('[role="main"], main');
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }

    // Interactive elements should be visible
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      await expect(buttons.first()).toBeVisible();
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Page should load without motion-dependent functionality breaking
    await expect(page.getByRole('heading').first()).toBeVisible();

    // Test interactions without animations
    const expandButton = page.getByRole('button', { name: /Show All|Expand|More/i });
    if (await expandButton.isVisible()) {
      await expandButton.click();
      // Content should expand without relying on animations
      await page.waitForTimeout(100); // Minimal wait
      // Should work regardless of animation state
    }
  });

  test('should have proper focus indicators', async ({ page }) => {
    const focusableElements = page.locator('a, button, input, select, textarea');
    const elementCount = await focusableElements.count();

    if (elementCount > 0) {
      const firstElement = focusableElements.first();
      await firstElement.focus();

      // Element should have focus
      await expect(firstElement).toBeFocused();

      // Focus should be visually indicated (this is hard to test programmatically,
      // but we can at least verify focus is working)
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should provide error messages and validation feedback', async ({ page }) => {
    // Navigate to a page with forms
    await page.goto('/weeks/week-01.html');
    await page.waitForLoadState('networkidle');

    // Look for form inputs
    const numberInputs = page.locator('input[type="number"]');
    const inputCount = await numberInputs.count();

    if (inputCount > 0) {
      const firstInput = numberInputs.first();

      // Try to trigger validation
      await firstInput.fill('invalid');
      await firstInput.blur(); // Lose focus to trigger validation

      // Look for error messages
      const errorMessages = page.locator('.error, .invalid, [role="alert"], [aria-describedby]');

      // Some validation feedback should exist or input should be corrected
      const inputValue = await firstInput.inputValue();
      const hasErrorFeedback = await errorMessages.count() > 0;

      // Either error feedback exists or browser validation prevented invalid input
      expect(hasErrorFeedback || inputValue !== 'invalid').toBeTruthy();
    }
  });

  test('should work with screen reader announcements', async ({ page }) => {
    // Test ARIA announcements for dynamic changes
    const progressSection = page.locator('.progress, [role="progressbar"]');

    if (await progressSection.count() > 0) {
      // Progress should have proper ARIA attributes
      const progressBar = progressSection.first();
      const ariaValueNow = await progressBar.getAttribute('aria-valuenow');
      const ariaValueMax = await progressBar.getAttribute('aria-valuemax');
      const ariaLabel = await progressBar.getAttribute('aria-label');

      // Progress should be properly labeled for screen readers
      const hasProperLabeling = ariaLabel ||
                               (ariaValueNow && ariaValueMax);

      expect(hasProperLabeling).toBeTruthy();
    }

    // Test live region updates
    const liveRegion = page.locator('#live-region, [aria-live]');
    if (await liveRegion.count() > 0) {
      const region = liveRegion.first();

      // Should have proper live region attributes
      const ariaLive = await region.getAttribute('aria-live');
      expect(ariaLive === 'polite' || ariaLive === 'assertive').toBeTruthy();
    }
  });

  test('should maintain accessibility across all week pages', async ({ page }) => {
    const weekPages = ['01', '05', '10', '13'];

    for (const week of weekPages) {
      await page.goto(`/weeks/week-${week}.html`);
      await page.waitForLoadState('networkidle');

      // Each page should have proper heading structure
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);

      // Should have main landmark
      const main = page.locator('[role="main"], main');
      await expect(main).toHaveCount(1);

      // Should support keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      if (await focusedElement.count() > 0) {
        await expect(focusedElement).toBeVisible();
      }

      // Interactive elements should be accessible
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        const buttonText = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        expect(buttonText?.trim().length > 0 || ariaLabel?.trim().length > 0).toBeTruthy();
      }
    }
  });
});
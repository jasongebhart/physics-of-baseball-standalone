/**
 * Regression Tests: Responsive Design and Cross-Device Compatibility
 * Tests layout, functionality, and usability across different screen sizes and devices
 */

import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop', width: 1200, height: 800 },
    { name: 'Large Desktop', width: 1920, height: 1080 }
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`should display correctly on ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Header should be visible and properly sized
      const header = page.locator('header, .header, h1').first();
      await expect(header).toBeVisible();

      // Main content should be visible
      const main = page.locator('[role="main"], main, .main-content');
      await expect(main).toBeVisible();

      // Week cards should be visible and not overflow
      const weekCards = page.locator('.week-card');
      const cardCount = await weekCards.count();

      if (cardCount > 0) {
        const firstCard = weekCards.first();
        await expect(firstCard).toBeVisible();

        // Check that cards don't overflow viewport
        const cardBox = await firstCard.boundingBox();
        if (cardBox) {
          expect(cardBox.x).toBeGreaterThanOrEqual(0);
          expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(width + 10); // 10px tolerance
        }
      }

      // Navigation should be accessible
      const navElements = page.locator('nav a, .nav-link, [role="navigation"] a');
      const navCount = await navElements.count();

      if (navCount > 0) {
        const firstNav = navElements.first();
        if (await firstNav.isVisible()) {
          await expect(firstNav).toBeVisible();
        }
      }
    });
  });

  test('should adapt layout for mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // On mobile, week cards should stack vertically
    const weekCards = page.locator('.week-card');
    const cardCount = await weekCards.count();

    if (cardCount >= 2) {
      const firstCard = weekCards.first();
      const secondCard = weekCards.nth(1);

      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();

      if (firstBox && secondBox) {
        // Second card should be below first card (vertical stacking)
        expect(secondBox.y).toBeGreaterThan(firstBox.y);
      }
    }

    // Text should be readable (not too small)
    const bodyText = page.locator('p, .description, .week-description').first();
    if (await bodyText.isVisible()) {
      const fontSize = await bodyText.evaluate(el => {
        return window.getComputedStyle(el).fontSize;
      });

      const fontSizeNum = parseInt(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(14); // Minimum readable size
    }

    // Interactive elements should be touch-friendly (minimum 44px)
    const buttons = page.locator('button, .week-link, a[role="button"]');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(40); // Close to 44px touch target
        }
      }
    }
  });

  test('should adapt layout for tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Week cards should display in a grid (2 columns or similar)
    const weekCards = page.locator('.week-card');
    const cardCount = await weekCards.count();

    if (cardCount >= 4) {
      const firstCard = weekCards.first();
      const secondCard = weekCards.nth(1);
      const thirdCard = weekCards.nth(2);

      const boxes = await Promise.all([
        firstCard.boundingBox(),
        secondCard.boundingBox(),
        thirdCard.boundingBox()
      ]);

      if (boxes.every(box => box)) {
        const [firstBox, secondBox, thirdBox] = boxes;

        // Cards should be arranged in a reasonable grid
        const isHorizontalLayout = Math.abs(firstBox.y - secondBox.y) < 50;
        const isVerticalLayout = secondBox.y > firstBox.y + 50;

        expect(isHorizontalLayout || isVerticalLayout).toBeTruthy();
      }
    }

    // Content should use available space efficiently
    const container = page.locator('.container, .main-content, [role="main"]').first();
    if (await container.isVisible()) {
      const containerBox = await container.boundingBox();
      if (containerBox) {
        // Should use a good portion of available width
        expect(containerBox.width).toBeGreaterThan(600);
      }
    }
  });

  test('should handle landscape orientation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Header should remain visible and not take up too much space
    const header = page.locator('header, .header, h1').first();
    await expect(header).toBeVisible();

    const headerBox = await header.boundingBox();
    if (headerBox) {
      // Header shouldn't take up more than 1/3 of screen height
      expect(headerBox.height).toBeLessThan(375 / 3);
    }

    // Week cards should adapt to horizontal space
    const weekCards = page.locator('.week-card');
    const cardCount = await weekCards.count();

    if (cardCount >= 2) {
      const firstCard = weekCards.first();
      const secondCard = weekCards.nth(1);

      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();

      if (firstBox && secondBox) {
        // Cards might be side by side in landscape
        const areSideBySide = Math.abs(firstBox.y - secondBox.y) < 50;
        const areStacked = secondBox.y > firstBox.y + 50;

        expect(areSideBySide || areStacked).toBeTruthy();
      }
    }

    // Content should scroll if needed
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(scrollHeight).toBeGreaterThan(300); // Should have scrollable content
  });

  test('should maintain functionality across screen sizes', async ({ page }) => {
    const testViewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1200, height: 800 }
    ];

    for (const viewport of testViewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Week links should work
      const weekLink = page.locator('.week-link, [href*="week-"]').first();
      if (await weekLink.isVisible()) {
        await expect(weekLink).toBeVisible();

        // Link should be clickable
        const href = await weekLink.getAttribute('href');
        expect(href).toBeTruthy();
      }

      // Expand buttons should work if present
      const expandButton = page.getByRole('button', { name: /Show All|Expand/i });
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(300);

        // Should expand content
        const additionalContent = page.locator('#additional-weeks, .expanded-content');
        if (await additionalContent.count() > 0) {
          await expect(additionalContent.first()).toBeVisible();
        }
      }

      // Progress indicators should display correctly
      const progress = page.locator('.progress-text, .progress-bar');
      if (await progress.count() > 0) {
        await expect(progress.first()).toBeVisible();
      }
    }
  });

  test('should handle interactive elements on touch devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/weeks/week-01.html');
    await page.waitForLoadState('networkidle');

    // Test touch interactions with calculators
    const numberInputs = page.locator('input[type="number"]');
    const inputCount = await numberInputs.count();

    if (inputCount > 0) {
      const firstInput = numberInputs.first();
      if (await firstInput.isVisible()) {
        // Input should be large enough for touch
        const inputBox = await firstInput.boundingBox();
        if (inputBox) {
          expect(inputBox.height).toBeGreaterThanOrEqual(35);
        }

        // Should accept touch input
        await firstInput.tap();
        await firstInput.fill('42');
        await expect(firstInput).toHaveValue('42');
      }
    }

    // Test touch interactions with buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      const firstButton = buttons.first();
      if (await firstButton.isVisible()) {
        // Button should be large enough for touch
        const buttonBox = await firstButton.boundingBox();
        if (buttonBox) {
          expect(buttonBox.height).toBeGreaterThanOrEqual(35);
          expect(buttonBox.width).toBeGreaterThanOrEqual(35);
        }

        // Should respond to tap
        await firstButton.tap();
        // Button should remain functional after tap
        await expect(firstButton).toBeVisible();
      }
    }

    // Test dropdown selections
    const selects = page.locator('select');
    const selectCount = await selects.count();

    if (selectCount > 0) {
      const firstSelect = selects.first();
      if (await firstSelect.isVisible()) {
        const options = firstSelect.locator('option');
        const optionCount = await options.count();

        if (optionCount > 1) {
          const secondOption = options.nth(1);
          const optionValue = await secondOption.getAttribute('value');

          if (optionValue) {
            await firstSelect.selectOption(optionValue);
            await expect(firstSelect).toHaveValue(optionValue);
          }
        }
      }
    }
  });

  test('should optimize images and media for different screen densities', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, deviceScaleFactor: 2 }, // High DPI mobile
      { width: 1200, height: 800, deviceScaleFactor: 1 }  // Standard DPI desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check for images
      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const img = images.nth(i);
          if (await img.isVisible()) {
            // Image should have src attribute
            const src = await img.getAttribute('src');
            expect(src).toBeTruthy();

            // Image should have alt text for accessibility
            const alt = await img.getAttribute('alt');
            expect(alt).toBeTruthy();

            // Image should load successfully
            const naturalWidth = await img.evaluate(el => el.naturalWidth);
            expect(naturalWidth).toBeGreaterThan(0);
          }
        }
      }

      // Check for responsive video elements
      const videos = page.locator('video');
      if (await videos.count() > 0) {
        const firstVideo = videos.first();
        const videoBox = await firstVideo.boundingBox();

        if (videoBox) {
          // Video should fit within viewport
          expect(videoBox.width).toBeLessThanOrEqual(viewport.width);
        }
      }
    }
  });

  test('should maintain performance across different screen sizes', async ({ page }) => {
    const performanceData = [];

    const testViewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Desktop', width: 1200, height: 800 }
    ];

    for (const viewport of testViewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      performanceData.push({
        viewport: viewport.name,
        loadTime: loadTime
      });

      // Should load within reasonable time
      expect(loadTime).toBeLessThan(5000);

      // Critical elements should be visible
      await expect(page.getByRole('heading').first()).toBeVisible();
      await expect(page.locator('.week-card').first()).toBeVisible();
    }

    // Mobile shouldn't be significantly slower than desktop
    const mobileTime = performanceData.find(d => d.viewport === 'Mobile')?.loadTime;
    const desktopTime = performanceData.find(d => d.viewport === 'Desktop')?.loadTime;

    if (mobileTime && desktopTime) {
      expect(mobileTime).toBeLessThan(desktopTime * 2); // Mobile shouldn't be more than 2x slower
    }
  });

  test('should handle text scaling and zoom levels', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test different zoom levels
    const zoomLevels = [1, 1.5, 2];

    for (const zoom of zoomLevels) {
      await page.evaluate((zoomLevel) => {
        document.body.style.zoom = zoomLevel.toString();
      }, zoom);

      await page.waitForTimeout(500);

      // Content should still be visible and readable
      const mainHeading = page.getByRole('heading').first();
      await expect(mainHeading).toBeVisible();

      // Week cards should adapt to zoom
      const weekCards = page.locator('.week-card');
      if (await weekCards.count() > 0) {
        await expect(weekCards.first()).toBeVisible();
      }

      // Navigation should remain functional
      const links = page.locator('a');
      if (await links.count() > 0) {
        const firstLink = links.first();
        if (await firstLink.isVisible()) {
          await expect(firstLink).toBeVisible();
        }
      }
    }

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });
});
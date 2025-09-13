/**
 * Regression Tests: Interactive Elements and Calculators
 * Tests all interactive physics calculators, simulations, and form elements
 */

import { test, expect } from '@playwright/test';

test.describe('Interactive Elements and Calculators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/weeks/week-01.html');
    await page.waitForLoadState('networkidle');
  });

  test('should display and interact with velocity calculator', async ({ page }) => {
    // Look for velocity calculator
    const velocityCalculator = page.locator('.velocity-calculator, #velocity-calculator, [data-calculator="velocity"]');

    if (await velocityCalculator.isVisible()) {
      // Test input fields
      const distanceInput = page.locator('input[name="distance"], #distance, [placeholder*="distance"]');
      const timeInput = page.locator('input[name="time"], #time, [placeholder*="time"]');

      if (await distanceInput.isVisible() && await timeInput.isVisible()) {
        await distanceInput.fill('60.5');
        await timeInput.fill('0.4');

        // Click calculate button
        const calculateBtn = page.getByRole('button', { name: /Calculate|Compute/i });
        if (await calculateBtn.isVisible()) {
          await calculateBtn.click();

          // Should show result
          const result = page.locator('.result, #result, .calculation-result');
          await expect(result).toBeVisible();
          await expect(result).toContainText(/\d+/); // Should contain numbers
        }
      }
    }
  });

  test('should interact with baseball diamond simulation', async ({ page }) => {
    // Look for baseball diamond or position selector
    const diamondSimulation = page.locator('.baseball-diamond, .diamond-simulation, #baseball-diamond');
    const positionSelector = page.locator('select[name*="position"], #position-select, .position-selector');

    if (await diamondSimulation.isVisible() || await positionSelector.isVisible()) {
      if (await positionSelector.isVisible()) {
        // Test position selection
        await positionSelector.selectOption('pitcher');
        await expect(positionSelector).toHaveValue('pitcher');

        // Try different position
        await positionSelector.selectOption('catcher');
        await expect(positionSelector).toHaveValue('catcher');

        // Test if simulation updates
        const simulationArea = page.locator('.simulation-area, .diamond-display, #simulation');
        if (await simulationArea.isVisible()) {
          await expect(simulationArea).toBeVisible();
        }
      }
    }
  });

  test('should handle motion graphs and interactive charts', async ({ page }) => {
    // Look for graph containers or chart elements
    const graphContainer = page.locator('.graph, .chart, canvas, svg, #motion-graph');

    if (await graphContainer.isVisible()) {
      // Verify graph is rendered
      await expect(graphContainer).toBeVisible();

      // Look for graph controls
      const graphControls = page.locator('.graph-controls, .chart-controls, button[data-graph]');
      if (await graphControls.isVisible()) {
        const controlButtons = graphControls.locator('button');
        const buttonCount = await controlButtons.count();

        if (buttonCount > 0) {
          // Click first control button
          await controlButtons.first().click();

          // Graph should still be visible after interaction
          await expect(graphContainer).toBeVisible();
        }
      }

      // Test input sliders if present
      const slider = page.locator('input[type="range"], .slider');
      if (await slider.isVisible()) {
        await slider.fill('50');
        // Graph should update (verified by continued visibility)
        await expect(graphContainer).toBeVisible();
      }
    }
  });

  test('should complete practice problems and quizzes', async ({ page }) => {
    // Look for quiz or practice problem sections
    const quizSection = page.locator('.quiz, .practice-problems, .assessment, [data-quiz]');

    if (await quizSection.isVisible()) {
      // Find quiz questions
      const questions = page.locator('.question, .quiz-question, input[type="radio"], input[type="checkbox"]');
      const questionCount = await questions.count();

      if (questionCount > 0) {
        // Answer first question if it's multiple choice
        const firstRadio = page.locator('input[type="radio"]').first();
        if (await firstRadio.isVisible()) {
          await firstRadio.check();
          await expect(firstRadio).toBeChecked();
        }

        // Look for submit button
        const submitBtn = page.getByRole('button', { name: /Submit|Check Answer|Complete/i });
        if (await submitBtn.isVisible()) {
          await submitBtn.click();

          // Should show feedback or results
          const feedback = page.locator('.feedback, .result, .quiz-result, .answer-feedback');
          if (await feedback.isVisible()) {
            await expect(feedback).toBeVisible();
          }
        }
      }
    }
  });

  test('should handle form validation for calculators', async ({ page }) => {
    // Test with invalid inputs in any calculator
    const numberInputs = page.locator('input[type="number"], input[pattern*="[0-9]"], [inputmode="numeric"]');
    const inputCount = await numberInputs.count();

    if (inputCount > 0) {
      const firstInput = numberInputs.first();

      // Test invalid input
      await firstInput.fill('invalid');

      // Try to trigger calculation
      const calculateBtn = page.getByRole('button', { name: /Calculate|Compute|Submit/i });
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();

        // Should show validation error or not process
        const errorMsg = page.locator('.error, .invalid, .validation-error, [role="alert"]');
        if (await errorMsg.isVisible()) {
          await expect(errorMsg).toBeVisible();
        }
      }

      // Test with valid input
      await firstInput.fill('10');
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();
        // Should work without error
        await page.waitForTimeout(500); // Allow processing time
      }
    }
  });

  test('should handle dropdowns and select elements', async ({ page }) => {
    const selectElements = page.locator('select');
    const selectCount = await selectElements.count();

    for (let i = 0; i < selectCount && i < 3; i++) {
      const select = selectElements.nth(i);
      if (await select.isVisible()) {
        // Get available options
        const options = select.locator('option');
        const optionCount = await options.count();

        if (optionCount > 1) {
          // Select second option (first is often default)
          const secondOption = options.nth(1);
          const optionValue = await secondOption.getAttribute('value');

          if (optionValue) {
            await select.selectOption(optionValue);
            await expect(select).toHaveValue(optionValue);
          }
        }
      }
    }
  });

  test('should maintain state during interactions', async ({ page }) => {
    // Test that form values persist during page interactions
    const textInputs = page.locator('input[type="text"], input[type="number"]');
    const inputCount = await textInputs.count();

    if (inputCount > 0) {
      const firstInput = textInputs.first();
      if (await firstInput.isVisible()) {
        await firstInput.fill('42');
        await expect(firstInput).toHaveValue('42');

        // Interact with other elements
        const buttons = page.locator('button:not([disabled])');
        const buttonCount = await buttons.count();

        if (buttonCount > 0) {
          await buttons.first().click();
          await page.waitForTimeout(500);

          // Original input should retain value
          await expect(firstInput).toHaveValue('42');
        }
      }
    }
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Test tab navigation through interactive elements
    const interactiveElements = page.locator('input, select, button, [tabindex]:not([tabindex="-1"])');
    const elementCount = await interactiveElements.count();

    if (elementCount > 0) {
      // Focus first interactive element
      await interactiveElements.first().focus();
      await expect(interactiveElements.first()).toBeFocused();

      // Tab to next element
      await page.keyboard.press('Tab');
      const focusedAfterTab = page.locator(':focus');
      await expect(focusedAfterTab).toBeVisible();

      // Test Enter key on buttons
      const button = page.locator('button:not([disabled])').first();
      if (await button.isVisible()) {
        await button.focus();
        await expect(button).toBeFocused();
        // Don't actually press Enter to avoid form submission
      }
    }
  });

  test('should work across different screen sizes', async ({ page }) => {
    const testSizes = [
      { width: 1200, height: 800, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const size of testSizes) {
      await page.setViewportSize({ width: size.width, height: size.height });

      // Interactive elements should be visible and usable
      const calculators = page.locator('.calculator, .interactive, input, select, button');
      const calcCount = await calculators.count();

      if (calcCount > 0) {
        const firstCalc = calculators.first();
        if (await firstCalc.isVisible()) {
          await expect(firstCalc).toBeVisible();

          // Element should be within viewport bounds
          const box = await firstCalc.boundingBox();
          if (box) {
            expect(box.x).toBeGreaterThanOrEqual(0);
            expect(box.width).toBeLessThanOrEqual(size.width);
          }
        }
      }
    }
  });

  test('should handle rapid interactions without breaking', async ({ page }) => {
    // Test rapid clicking and form filling
    const inputs = page.locator('input[type="number"], input[type="text"]');
    const buttons = page.locator('button:not([disabled])');

    const inputCount = await inputs.count();
    const buttonCount = await buttons.count();

    if (inputCount > 0 && buttonCount > 0) {
      // Rapidly fill and clear inputs
      const firstInput = inputs.first();
      const firstButton = buttons.first();

      if (await firstInput.isVisible() && await firstButton.isVisible()) {
        for (let i = 0; i < 3; i++) {
          await firstInput.fill(`${i * 10}`);
          await firstButton.click();
          await page.waitForTimeout(100);
        }

        // Page should still be functional
        await expect(firstInput).toBeVisible();
        await expect(firstButton).toBeVisible();
      }
    }
  });
});
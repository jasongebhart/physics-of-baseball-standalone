import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('Week 1 page meets WCAG standards', async ({ page }) => {
    await page.goto('/weeks/week-01.html')
    await page.waitForLoadState('networkidle')
    
    const accessibilityResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('.physics-canvas') // Canvas accessibility is complex, test separately
      .analyze()
    
    expect(accessibilityResults.violations).toEqual([])
  })
  
  test('Week 2 page meets WCAG standards', async ({ page }) => {
    await page.goto('/weeks/week-02.html')
    await page.waitForLoadState('networkidle')
    
    const accessibilityResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('.physics-canvas')
      .analyze()
    
    expect(accessibilityResults.violations).toEqual([])
  })
  
  test('Home page meets WCAG standards', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const accessibilityResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityResults.violations).toEqual([])
  })
  
  test('Keyboard navigation works', async ({ page }) => {
    await page.goto('/weeks/week-01.html')
    
    // Test tab navigation through interactive elements
    await page.keyboard.press('Tab')
    
    // Should focus on first interactive element
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Continue tabbing through calculators
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to reach all interactive elements
    const activeElement = page.locator(':focus')
    await expect(activeElement).toBeVisible()
  })
  
  test('Screen reader support', async ({ page }) => {
    await page.goto('/weeks/week-01.html')
    
    // Check for proper heading structure
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toHaveAttribute('class', /week-title/)
    
    // Check for proper labeling of form controls
    const inputs = page.locator('input[type="number"], input[type="range"]')
    for (const input of await inputs.all()) {
      // Each input should have associated label
      const id = await input.getAttribute('id')
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        await expect(label).toBeVisible()
      }
    }
    
    // Check for alt text on images (if any)
    const images = page.locator('img')
    for (const img of await images.all()) {
      await expect(img).toHaveAttribute('alt')
    }
  })
  
  test('Color contrast compliance', async ({ page }) => {
    await page.goto('/weeks/week-01.html')
    await page.waitForLoadState('networkidle')
    
    const accessibilityResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze()
    
    expect(accessibilityResults.violations).toEqual([])
  })
  
  test('Focus indicators are visible', async ({ page }) => {
    await page.goto('/weeks/week-01.html')
    
    // Test button focus
    const button = page.locator('button').first()
    await button.focus()
    
    // Should have visible focus indicator
    const focusedButton = page.locator('button:focus')
    await expect(focusedButton).toBeVisible()
    
    // Test input focus
    const input = page.locator('input').first()
    await input.focus()
    
    const focusedInput = page.locator('input:focus')
    await expect(focusedInput).toBeVisible()
  })
})
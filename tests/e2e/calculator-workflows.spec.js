import { test, expect } from '@playwright/test'

test.describe('Calculator Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('/')
    await expect(page).toHaveTitle(/Physics of Baseball/)
  })

  test('Week 1 velocity calculator workflow', async ({ page }) => {
    // Navigate to Week 1
    await page.click('a[href*="week-01"]')
    await expect(page).toHaveTitle(/Week 1.*Motion/)
    
    // Find the velocity calculator
    const calculatorSection = page.locator('.physics-calculators')
    await expect(calculatorSection).toBeVisible()
    
    // Test distance input
    const distanceInput = page.locator('#distance')
    await expect(distanceInput).toBeVisible()
    await distanceInput.fill('100')
    
    // Test time input
    const timeInput = page.locator('#time')
    await expect(timeInput).toBeVisible()
    await timeInput.fill('2.5')
    
    // Check that velocity is calculated automatically
    const velocityResult = page.locator('#velocity-result')
    await expect(velocityResult).toBeVisible()
    
    // Should calculate 100/2.5 = 40 m/s
    await expect(velocityResult).toHaveText('40')
    
    // Test the calculate button
    const calculateButton = page.locator('#calculate-velocity')
    await expect(calculateButton).toBeVisible()
    await calculateButton.click()
    
    // Result should still be 40
    await expect(velocityResult).toHaveText('40')
  })

  test('Week 2 projectile motion calculator workflow', async ({ page }) => {
    // Navigate to Week 2
    await page.click('a[href*="week-02"]')
    await expect(page).toHaveTitle(/Week 2.*Projectile Motion/)
    
    // Wait for calculator to load
    await page.waitForSelector('#projectile-calculator', { timeout: 5000 })
    
    const calculator = page.locator('#projectile-calculator')
    await expect(calculator).toBeVisible()
    
    // Test velocity slider
    const velocitySlider = calculator.locator('#velocity')
    await expect(velocitySlider).toBeVisible()
    await velocitySlider.fill('35')
    
    // Test angle slider  
    const angleSlider = calculator.locator('#angle')
    await expect(angleSlider).toBeVisible()
    await angleSlider.fill('40')
    
    // Test height slider
    const heightSlider = calculator.locator('#height')
    await expect(heightSlider).toBeVisible()
    await heightSlider.fill('2.0')
    
    // Check that results are displayed
    const results = calculator.locator('.calculation-results')
    await expect(results).toBeVisible()
    
    // Verify result fields exist and have content
    const timeResult = results.locator('text=Time of Flight')
    const heightResult = results.locator('text=Maximum Height')
    const rangeResult = results.locator('text=Horizontal Range')
    const velocityResult = results.locator('text=Impact Velocity')
    
    await expect(timeResult).toBeVisible()
    await expect(heightResult).toBeVisible()
    await expect(rangeResult).toBeVisible()
    await expect(velocityResult).toBeVisible()
    
    // Test air resistance toggle
    const airResistanceToggle = calculator.locator('#air-resistance')
    await expect(airResistanceToggle).toBeVisible()
    
    // Get results without air resistance
    const initialResults = await results.textContent()
    
    // Enable air resistance
    await airResistanceToggle.check()
    
    // Wait for recalculation
    await page.waitForTimeout(100)
    
    // Results should be different
    const newResults = await results.textContent()
    expect(newResults).not.toBe(initialResults)
    
    // Verify canvas visualization exists
    const canvas = calculator.locator('canvas')
    await expect(canvas).toBeVisible()
    expect(await canvas.getAttribute('width')).toBe('500')
    expect(await canvas.getAttribute('height')).toBe('350')
  })

  test('Assessment system workflow', async ({ page }) => {
    // Go to Week 1 assessment
    await page.goto('/weeks/week-01.html')
    
    // Find assessment section
    const assessmentSection = page.locator('.assessment-section')
    await expect(assessmentSection).toBeVisible()
    
    // Test tab functionality
    const quizTab = page.locator('[data-tab="quiz"]')
    const practiceTab = page.locator('[data-tab="practice"]')
    const labTab = page.locator('[data-tab="lab"]')
    
    await expect(quizTab).toBeVisible()
    await expect(practiceTab).toBeVisible()
    await expect(labTab).toBeVisible()
    
    // Click on practice tab
    await practiceTab.click()
    const practiceContent = page.locator('#practice-problems')
    await expect(practiceContent).toBeVisible()
    
    // Click on lab tab
    await labTab.click()
    const labContent = page.locator('#lab-report')
    await expect(labContent).toBeVisible()
    
    // Return to quiz tab
    await quizTab.click()
    const quizContent = page.locator('#quiz-content')
    await expect(quizContent).toBeVisible()
  })

  test('Navigation workflow', async ({ page }) => {
    // Start from Week 1
    await page.goto('/weeks/week-01.html')
    
    // Verify navigation sidebar exists
    const navigation = page.locator('.nav-sidebar')
    await expect(navigation).toBeVisible()
    
    // Test home link
    const homeLink = navigation.locator('.home-link')
    await expect(homeLink).toBeVisible()
    
    // Test week navigation
    const week2Link = navigation.locator('a[href="week-02.html"]')
    await expect(week2Link).toBeVisible()
    await week2Link.click()
    
    // Should navigate to week 2
    await expect(page).toHaveURL(/week-02\.html/)
    await expect(page).toHaveTitle(/Week 2/)
    
    // Test daily navigation within week
    const dailyNav = page.locator('.daily-nav')
    await expect(dailyNav).toBeVisible()
    
    const day1Link = dailyNav.locator('a[href="#day-1"]')
    await expect(day1Link).toBeVisible()
  })

  test('Responsive design workflow', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/weeks/week-01.html')
    
    // Navigation should still be accessible
    const navigation = page.locator('.nav-sidebar')
    await expect(navigation).toBeVisible()
    
    // Calculator should adapt to smaller screen
    const calculator = page.locator('.physics-calculators')
    await expect(calculator).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    
    // Elements should still be functional
    await expect(navigation).toBeVisible()
    await expect(calculator).toBeVisible()
    
    // Return to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()
    
    await expect(navigation).toBeVisible()
    await expect(calculator).toBeVisible()
  })
})
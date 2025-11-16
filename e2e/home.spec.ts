import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/')

    // Check for hero title
    await expect(page.getByRole('heading', { name: /caught up yet/i })).toBeVisible()

    // Check for description/tagline
    await expect(page.getByText(/watch sports/i)).toBeVisible()
  })

  test('should have navigation links', async ({ page }) => {
    await page.goto('/')

    // Check for main navigation
    await expect(page.getByRole('link', { name: /games/i })).toBeVisible()
  })

  test('should navigate to games page', async ({ page }) => {
    await page.goto('/')

    // Click on games link
    await page.getByRole('link', { name: /games/i }).first().click()

    // Should navigate to games page
    await expect(page).toHaveURL(/\/games/)
  })

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /caught up yet/i })).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByRole('heading', { name: /caught up yet/i })).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByRole('heading', { name: /caught up yet/i })).toBeVisible()
  })
})

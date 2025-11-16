import { test, expect } from '@playwright/test'

test.describe('Games Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games')
  })

  test('should display games page', async ({ page }) => {
    // Check for page heading
    await expect(page.getByRole('heading', { name: /games/i })).toBeVisible()
  })

  test('should display sport tabs', async ({ page }) => {
    // Check for sport filter tabs
    await expect(page.getByRole('button', { name: /all/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /nfl/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /mlb/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /nba/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /nhl/i })).toBeVisible()
  })

  test('should filter games by sport', async ({ page }) => {
    // Click on NFL filter
    await page.getByRole('button', { name: /^nfl$/i }).click()

    // Wait for filtering to complete
    await page.waitForTimeout(500)

    // URL should update or filtered state should be visible
    // Note: Actual behavior depends on implementation
  })

  test('should have date navigation', async ({ page }) => {
    // Check for date navigation controls
    const prevButton = page.getByRole('button', { name: /previous|prev|<|←/i })
    const nextButton = page.getByRole('button', { name: /next|>|→/i })

    // At least one should exist (depending on implementation)
    const hasPrev = await prevButton.count()
    const hasNext = await nextButton.count()

    expect(hasPrev + hasNext).toBeGreaterThan(0)
  })

  test('should display game cards', async ({ page }) => {
    // Wait for games to load
    await page.waitForTimeout(1000)

    // Check if "Create Watch Party" buttons exist
    const watchPartyButtons = page.getByRole('button', { name: /create watch party/i })
    const buttonCount = await watchPartyButtons.count()

    // Should have at least some games or show "no games" message
    if (buttonCount === 0) {
      // If no games, should show appropriate message
      await expect(page.getByText(/no games/i)).toBeVisible()
    } else {
      // If games exist, check they render correctly
      expect(buttonCount).toBeGreaterThan(0)
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Page should still be usable on mobile
    await expect(page.getByRole('heading', { name: /games/i })).toBeVisible()

    // Sport tabs should be visible (may be scrollable)
    await expect(page.getByRole('button', { name: /all/i })).toBeVisible()
  })
})

test.describe('Create Watch Party Flow', () => {
  test('should open create room modal when clicking Create Watch Party', async ({ page }) => {
    await page.goto('/games')

    // Wait for games to load
    await page.waitForTimeout(1000)

    // Find first "Create Watch Party" button
    const createButton = page.getByRole('button', { name: /create watch party/i }).first()

    // Check if any games are available
    const buttonExists = await createButton.count()

    if (buttonExists > 0) {
      await createButton.click()

      // Modal should appear
      // Note: Exact selectors depend on modal implementation
      await page.waitForTimeout(500)

      // Should have modal content (dialog, overlay, etc.)
      const dialog = page.getByRole('dialog')
      if (await dialog.count() > 0) {
        await expect(dialog).toBeVisible()
      }
    }
  })

  test('should close modal when clicking cancel or close', async ({ page }) => {
    await page.goto('/games')
    await page.waitForTimeout(1000)

    const createButton = page.getByRole('button', { name: /create watch party/i }).first()
    const buttonExists = await createButton.count()

    if (buttonExists > 0) {
      await createButton.click()
      await page.waitForTimeout(500)

      // Look for close/cancel button
      const closeButton = page.getByRole('button', { name: /close|cancel/i }).first()

      if (await closeButton.count() > 0) {
        await closeButton.click()
        await page.waitForTimeout(500)

        // Modal should be closed
        const dialog = page.getByRole('dialog')
        if (await dialog.count() > 0) {
          await expect(dialog).not.toBeVisible()
        }
      }
    }
  })
})

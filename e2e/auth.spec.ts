import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')

    // Should have login/sign in elements
    await expect(page.getByRole('heading', { name: /sign in|login/i })).toBeVisible()
  })

  test('should have authentication options', async ({ page }) => {
    await page.goto('/login')

    // Check for OAuth buttons or login form
    // Note: Exact implementation depends on Supabase setup
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()

    expect(buttonCount).toBeGreaterThan(0)
  })

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/dashboard')

    // Should redirect to login or show auth required
    await page.waitForTimeout(1000)

    const url = page.url()
    // Should be on login page or showing auth requirement
    expect(url).toMatch(/login|auth/)
  })

  test('should access public pages without auth', async ({ page }) => {
    // These pages should be accessible without auth
    const publicPages = ['/', '/games', '/about']

    for (const pagePath of publicPages) {
      await page.goto(pagePath)
      await page.waitForTimeout(500)

      // Should not redirect to login
      const url = page.url()
      expect(url).not.toContain('/login')
    }
  })
})

test.describe('Navigation', () => {
  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Check header navigation
    const nav = page.locator('nav, header').first()
    await expect(nav).toBeVisible()

    // Should have key navigation links
    const gamesLink = page.getByRole('link', { name: /games/i })
    await expect(gamesLink.first()).toBeVisible()
  })

  test('should show different nav for authenticated vs unauthenticated users', async ({ page }) => {
    await page.goto('/')

    // Unauthenticated should see login/sign in
    const loginLink = page.getByRole('link', { name: /sign in|login/i })
    const loginButton = page.getByRole('button', { name: /sign in|login/i })

    const hasLoginLink = await loginLink.count()
    const hasLoginButton = await loginButton.count()

    // Should have some form of login/auth option
    expect(hasLoginLink + hasLoginButton).toBeGreaterThan(0)
  })
})

test.describe('Footer', () => {
  test('should have footer on all pages', async ({ page }) => {
    const pages = ['/', '/games', '/about']

    for (const pagePath of pages) {
      await page.goto(pagePath)

      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
    }
  })

  test('should have working footer links', async ({ page }) => {
    await page.goto('/')

    const footer = page.locator('footer')

    // Should have some links in footer
    const links = footer.getByRole('link')
    const linkCount = await links.count()

    expect(linkCount).toBeGreaterThan(0)
  })
})

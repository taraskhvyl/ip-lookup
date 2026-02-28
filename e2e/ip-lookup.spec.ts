import { test, expect } from '@playwright/test'

test.describe('IP Lookup', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/geo*', async (route) => {
      const url = new URL(route.request().url())
      const ip = url.searchParams.get('ip') ?? ''
      if (ip === '8.8.8.8') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            country: 'United States',
            countryCode: 'US',
            timezone: 'America/New_York',
          }),
        })
      } else if (ip === '1.1.1.1') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            country: 'Australia',
            countryCode: 'AU',
            timezone: 'Australia/Sydney',
          }),
        })
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Could not resolve this IP address' }),
        })
      }
    })
  })

  test('shows header and Add button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: 'IP Lookup' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible()
    await expect(page.getByText('Enter one or more IP addresses')).toBeVisible()
  })

  test('adds rows when clicking Add', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByLabel(/Row 1/)).toBeVisible()
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(page.getByLabel(/Row 2/)).toBeVisible()
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(page.getByLabel(/Row 3/)).toBeVisible()
  })

  test('looks up IP on blur and shows result', async ({ page }) => {
    await page.goto('/')
    const input = page.getByPlaceholder(/127\.0\.0\.1/).first()
    await input.fill('8.8.8.8')
    await input.blur()
    await expect(page.getByText('Searching')).toBeVisible()
    await expect(page.getByAltText('United States')).toBeVisible()
    await expect(page.getByText(/\d{2}:\d{2}:\d{2}/)).toBeVisible()
  })

  test('shows validation error for invalid IP', async ({ page }) => {
    await page.goto('/')
    const input = page.getByPlaceholder(/127\.0\.0\.1/).first()
    await input.fill('invalid-ip')
    await input.blur()
    await expect(page.getByText(/valid IPv4 or IPv6/i)).toBeVisible()
  })

  test('shows validation error for empty IP', async ({ page }) => {
    await page.goto('/')
    const input = page.getByPlaceholder(/127\.0\.0\.1/).first()
    await input.focus()
    await input.blur()
    await expect(page.getByText(/required/i)).toBeVisible()
  })

  test('supports simultaneous lookups in multiple rows', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Add' }).click()
    const inputs = page.getByPlaceholder(/127\.0\.0\.1/)
    await inputs.nth(0).fill('8.8.8.8')
    await inputs.nth(1).fill('1.1.1.1')
    await inputs.nth(0).blur()
    await inputs.nth(1).blur()
    await expect(page.getByAltText('United States')).toBeVisible()
    await expect(page.getByAltText('Australia')).toBeVisible()
  })

  test('clock updates in real time', async ({ page }) => {
    await page.goto('/')
    const input = page.getByPlaceholder(/127\.0\.0\.1/).first()
    await input.fill('8.8.8.8')
    await input.blur()
    await expect(page.getByText(/\d{2}:\d{2}:\d{2}/)).toBeVisible()
    const firstTime = await page.getByText(/\d{2}:\d{2}:\d{2}/).first().textContent()
    await page.waitForTimeout(1100)
    const secondTime = await page.getByText(/\d{2}:\d{2}:\d{2}/).first().textContent()
    expect(firstTime).not.toBe(secondTime)
  })

  test('Add button is disabled when last row is empty', async ({ page }) => {
    await page.goto('/')
    const addButton = page.getByRole('button', { name: 'Add' })
    await expect(addButton).toBeDisabled()
  })

  test('Add button is enabled when last row has IP', async ({ page }) => {
    await page.goto('/')
    const input = page.getByPlaceholder(/127\.0\.0\.1/).first()
    await input.fill('8.8.8.8')
    const addButton = page.getByRole('button', { name: 'Add' })
    await expect(addButton).toBeEnabled()
  })

  test('caching: same IP lookup returns instantly', async ({ page }) => {
    await page.goto('/')
    const input = page.getByPlaceholder(/127\.0\.0\.1/).first()
    
    await input.fill('8.8.8.8')
    await input.blur()
    await expect(page.getByText('Searching')).toBeVisible()
    await expect(page.getByAltText('United States flag')).toBeVisible({ timeout: 5000 })
    
    await input.clear()
    await input.fill('1.1.1.1')
    await input.blur()
    await expect(page.getByAltText('Australia flag')).toBeVisible({ timeout: 5000 })
    
    await input.clear()
    await input.fill('8.8.8.8')
    await input.blur()
    
    await expect(page.getByAltText('United States flag')).toBeVisible({ timeout: 1000 })
  })

  test('input shows red border on error', async ({ page }) => {
    await page.goto('/')
    const input = page.getByPlaceholder(/127\.0\.0\.1/).first()
    await input.fill('invalid-ip')
    await input.blur()
    
    await expect(input).toHaveClass(/border-red-500/)
  })

  test('error message does not cause layout shift', async ({ page }) => {
    await page.goto('/')
    const input = page.getByPlaceholder(/127\.0\.0\.1/).first()
    
    const initialHeight = await page.evaluate(() => document.body.scrollHeight)
    
    await input.fill('invalid-ip')
    await input.blur()
    await expect(page.getByText(/valid IPv4 or IPv6/i)).toBeVisible()
    
    const heightAfterError = await page.evaluate(() => document.body.scrollHeight)
    
    expect(heightAfterError).toBeLessThanOrEqual(initialHeight + 30)
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/')
    
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBe('INPUT')
    
    await page.keyboard.press('Tab')
    const addButton = page.getByRole('button', { name: 'Add' })
    await expect(addButton).toBeFocused()
  })

  test('new row gets focus after adding', async ({ page }) => {
    await page.goto('/')
    const firstInput = page.getByPlaceholder(/127\.0\.0\.1/).first()
    await firstInput.fill('8.8.8.8')
    
    const addButton = page.getByRole('button', { name: 'Add' })
    await addButton.click()
    
    const inputs = page.getByPlaceholder(/127\.0\.0\.1/)
    await expect(inputs.nth(1)).toBeFocused()
  })
})

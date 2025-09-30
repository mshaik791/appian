import { test, expect } from '@playwright/test'

test('homepage has title and button', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/SOWK-SIM/)

  const button = page.getByRole('button', { name: /click me/i })
  await expect(button).toBeVisible()
})

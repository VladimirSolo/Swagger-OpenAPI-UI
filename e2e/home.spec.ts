import { expect, test } from '@playwright/test';

test('home page loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');

  await expect(page).toHaveTitle(/.+/);
  expect(errors).toEqual([]);
});

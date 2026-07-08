import { expect, test } from '@playwright/test';

test.describe('Header', () => {
  test('shows Sign In / Sign Up for anonymous users and lets language be switched', async ({
    page,
  }) => {
    await page.goto('/en');

    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();

    await page.getByRole('combobox').click();
    await page.getByText('RU', { exact: true }).click();
    await expect(page).toHaveURL(/\/ru/);
    await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible();
  });

  test('redirects unauthenticated users away from the private history route', async ({ page }) => {
    await page.goto('/en/history');
    await expect(page).toHaveURL(/\/en$/);
  });
});

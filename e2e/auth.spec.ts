import { expect, test } from '@playwright/test';

test.describe('Sign In / Sign Up', () => {
  test('shows client-side validation errors before submit', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(String(err)));

    await page.goto('/en/sign-in');

    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password').fill('weak');
    await page.getByRole('main').getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Enter a valid email address')).toBeVisible();
    await expect(page.getByText('Password must be at least 8 characters long')).toBeVisible();

    expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);
  });

  test('shows a friendly toast when Firebase rejects sign-in credentials', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(String(err)));

    await page.goto('/en/sign-in');

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('Password1!');
    await page.getByRole('main').getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('.ant-message')).toBeVisible({ timeout: 10000 });

    expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);
  });

  test('sign-up form validates password strength', async ({ page }) => {
    await page.goto('/en/sign-up');

    await page.getByLabel('Email').fill('valid@example.com');
    await page.getByLabel('Password').fill('nodigitshere!');
    await page.getByRole('main').getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText('Password must contain at least one digit')).toBeVisible();
  });

  test('successful sign-up establishes a session and unlocks the protected history route', async ({
    page,
  }) => {
    test.skip(
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      'Requires a configured Firebase project (.env.local)',
    );

    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(String(err)));

    const uniqueEmail = `e2e-${Date.now()}@example.com`;

    await page.goto('/en/sign-up');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('Password1!');
    await page.getByRole('main').getByRole('button', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL(/\/en$/, { timeout: 15000 });
    await expect(page.getByRole('link', { name: 'History' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();

    // Full page navigation exercises the server-side session cookie via proxy.ts.
    await page.goto('/en/history');
    await expect(page).toHaveURL(/\/en\/history$/);

    expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);
  });
});

import { expect, test } from '@playwright/test';

test.describe('About page', () => {
  test('is publicly accessible without authentication and shows header/footer', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(String(err)));

    await page.goto('/en/about');
    await expect(page).toHaveURL(/\/en\/about$/);

    // Consistent with the rest of the app: header and footer are present.
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByText(/All rights reserved/)).toBeVisible();

    expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);
  });

  test('contains RS School course info, project description, technologies and team details', async ({
    page,
  }) => {
    await page.goto('/en/about');

    await expect(page.getByRole('heading', { name: 'RS School Course' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'rs.school' })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'About the Project' })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Technologies Used' })).toBeVisible();
    await expect(page.getByText('Next.js', { exact: true })).toBeVisible();
    await expect(page.getByText('Firebase', { exact: true })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
    await expect(page.getByText('Vladimir Solodkov')).toBeVisible();
    await expect(page.getByText('Full-stack developer (solo)')).toBeVisible();
    await expect(page.getByRole('link', { name: /github\.com\/VladimirSolo/ })).toBeVisible();
  });

  test('is reachable via header and footer links', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: 'About' }).first().click();
    await expect(page).toHaveURL(/\/en\/about$/);
  });
});

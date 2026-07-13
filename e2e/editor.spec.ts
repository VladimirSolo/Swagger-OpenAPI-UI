import { expect, test } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const validSpecJson = JSON.stringify(
  {
    openapi: '3.0.0',
    info: { title: 'Pet Store', version: '1.0.0' },
    paths: {
      '/pets': {
        get: { responses: { '200': { description: 'ok' } } },
        post: { responses: { '201': { description: 'created' } } },
      },
    },
  },
  null,
  2,
);

async function pasteIntoEditor(page: import('@playwright/test').Page, text: string) {
  await expect(page.locator('.monaco-editor textarea')).toBeAttached({ timeout: 30000 });
  await page.locator('.monaco-editor').click();
  await page.evaluate(async (value) => {
    await navigator.clipboard.writeText(value);
  }, text);
  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? 'Meta+A' : 'Control+A');
  await page.keyboard.press(isMac ? 'Meta+V' : 'Control+V');
}

test.describe('Swagger Editor', () => {
  // Monaco loads from a CDN; running these in parallel across workers can
  // strain that concurrent network loading and flake with a load timeout.
  test.describe.configure({ mode: 'serial' });

  test('validates a pasted schema and the Viewer lists its endpoints', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(String(err)));

    await page.goto('/en');
    await pasteIntoEditor(page, validSpecJson);

    await expect(page.getByText('Schema is valid')).toBeVisible({ timeout: 5000 });
    const viewer = page.locator('.swagger-viewer');
    await expect(viewer.getByRole('button', { name: /GET\s*\/pets/ })).toBeVisible({
      timeout: 10000,
    });
    await expect(viewer.getByRole('button', { name: /POST\s*\/pets/ })).toBeVisible();

    expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);
  });

  test('shows a friendly error for an incomplete schema', async ({ page }) => {
    await page.goto('/en');
    await pasteIntoEditor(page, '{"openapi": "3.0.0"}');

    await expect(page.getByText('Missing required OpenAPI/Swagger fields')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText('see its endpoints here', { exact: false })).toBeVisible();
  });

  test('toggles between JSON and YAML without losing data', async ({ page }) => {
    await page.goto('/en');
    await pasteIntoEditor(page, validSpecJson);
    await expect(page.getByText('Schema is valid')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Switch to YAML' }).click();
    await expect(page.getByRole('button', { name: 'Switch to JSON' })).toBeVisible();
    await expect(page.locator('.monaco-editor').getByText('openapi: 3.0.0')).toBeVisible();
    await expect(page.getByText('Schema is valid')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Switch to JSON' }).click();
    await expect(page.getByRole('button', { name: 'Switch to YAML' })).toBeVisible();
    await expect(page.getByText('Schema is valid')).toBeVisible({ timeout: 5000 });

    const viewer = page.locator('.swagger-viewer');
    await expect(viewer.getByRole('button', { name: /GET\s*\/pets/ })).toBeVisible({
      timeout: 10000,
    });
    await expect(viewer.getByRole('button', { name: /POST\s*\/pets/ })).toBeVisible();
  });

  test('split view orientation adapts to viewport aspect ratio', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto('/en');

    const layout = page.locator('[data-testid="split-layout"]');
    await expect(layout).toHaveAttribute('data-orientation', 'horizontal');

    await page.setViewportSize({ width: 500, height: 1000 });
    await expect(layout).toHaveAttribute('data-orientation', 'vertical');
  });

  test('authenticated user can save a schema and it is restored after reload', async ({ page }) => {
    test.skip(
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      'Requires a configured Firebase project (.env.local)',
    );

    const uniqueEmail = `save-restore-${Date.now()}@example.com`;

    await page.goto('/en/sign-up');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('Password1!');
    await page.getByRole('main').getByRole('button', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL(/\/en$/, { timeout: 15000 });

    await pasteIntoEditor(page, validSpecJson);
    await expect(page.getByText('Schema is valid')).toBeVisible({ timeout: 5000 });

    const saveButton = page.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await expect(page.locator('.ant-message')).toBeVisible({ timeout: 10000 });

    await page.reload();
    await expect(page.getByText('Schema is valid')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.monaco-editor').getByText('Pet Store')).toBeVisible();
  });

  test('the schema API requires authentication', async ({ request }) => {
    const getResponse = await request.get('/api/schema');
    expect(getResponse.status()).toBe(401);

    const postResponse = await request.post('/api/schema', {
      data: { content: '{}', format: 'json' },
    });
    expect(postResponse.status()).toBe(401);
  });
});

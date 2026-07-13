import { expect, test } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const spec = JSON.stringify(
  {
    openapi: '3.0.0',
    info: { title: 'JSONPlaceholder-like', version: '1.0.0' },
    servers: [{ url: 'https://jsonplaceholder.typicode.com' }],
    paths: {
      '/todos/{id}': {
        get: {
          summary: 'Get a todo',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': {
              description: 'ok',
              content: { 'application/json': { schema: { type: 'object' } } },
            },
          },
        },
      },
    },
  },
  null,
  2,
);

test.describe('Swagger Viewer', () => {
  // Monaco loads from a CDN; keep these serial for the same reason as editor.spec.ts.
  test.describe.configure({ mode: 'serial' });

  test('renders the endpoint list and details, and Try-It-Out executes through the proxy', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(String(err)));

    await page.goto('/en');

    await expect(page.locator('.monaco-editor textarea')).toBeAttached({ timeout: 30000 });
    await page.locator('.monaco-editor').click();
    await page.evaluate(async (text) => {
      await navigator.clipboard.writeText(text);
    }, spec);
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+A' : 'Control+A');
    await page.keyboard.press(isMac ? 'Meta+V' : 'Control+V');
    await expect(page.getByText('Schema is valid')).toBeVisible({ timeout: 5000 });

    const viewer = page.locator('.swagger-viewer');
    const opButton = viewer.getByRole('button', { name: 'GET /todos/{id} Get a todo' });
    await expect(opButton).toBeVisible({ timeout: 10000 });

    await opButton.click();
    await expect(viewer.getByText('Try it out')).toBeVisible();
    await expect(viewer.getByText('Parameters')).toBeVisible();

    await viewer.getByRole('button', { name: 'Try it out' }).click();
    // The path parameter's input is rendered (proves parameter details show up).
    await expect(viewer.locator('input[placeholder="id"]')).toBeVisible();
    await viewer.locator('input[placeholder="id"]').fill('1');
    await viewer.getByRole('button', { name: 'Execute' }).click();

    await expect(viewer.getByText('Server response')).toBeVisible({ timeout: 10000 });
    await expect(viewer.getByText('"userId"', { exact: false })).toBeVisible({ timeout: 10000 });
    // The request went through our proxy, not directly to the target.
    await expect(viewer.getByText('/api/proxy?target=').first()).toBeVisible();

    expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);
  });

  test('Generate cURL snippet can be copied to the clipboard', async ({ page }) => {
    await page.goto('/en');

    await expect(page.locator('.monaco-editor textarea')).toBeAttached({ timeout: 30000 });
    await page.locator('.monaco-editor').click();
    await page.evaluate(async (text) => {
      await navigator.clipboard.writeText(text);
    }, spec);
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+A' : 'Control+A');
    await page.keyboard.press(isMac ? 'Meta+V' : 'Control+V');
    await expect(page.getByText('Schema is valid')).toBeVisible({ timeout: 5000 });

    const viewer = page.locator('.swagger-viewer');
    await viewer.getByRole('button', { name: 'GET /todos/{id} Get a todo' }).click();
    await viewer.getByRole('button', { name: 'Try it out' }).click();
    await viewer.locator('input[placeholder="id"]').fill('1');
    await viewer.getByRole('button', { name: 'Execute' }).click();
    await expect(viewer.getByText('Server response')).toBeVisible({ timeout: 10000 });

    await expect(viewer.getByText('cURL (bash)')).toBeVisible();
    const curlBlock = viewer.locator('code', { hasText: '/api/proxy?target=' });
    await expect(curlBlock).toContainText('curl -X');

    await viewer.locator('.curl-command .copy-to-clipboard').click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('curl -X');
    expect(clipboardText).toContain('/api/proxy?target=');
  });
});

test.describe('Proxy API', () => {
  test('blocks requests targeting private/local addresses', async ({ request }) => {
    const response = await request.get('/api/proxy?target=http://127.0.0.1/x');
    expect(response.status()).toBe(400);
  });

  test('rejects a missing or invalid target', async ({ request }) => {
    expect((await request.get('/api/proxy')).status()).toBe(400);
    expect((await request.get('/api/proxy?target=not-a-url')).status()).toBe(400);
  });

  test('forwards a request to a real public API and returns its status/body', async ({
    request,
  }) => {
    const response = await request.get(
      `/api/proxy?target=${encodeURIComponent('https://jsonplaceholder.typicode.com/todos/1')}`,
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('userId');
  });
});

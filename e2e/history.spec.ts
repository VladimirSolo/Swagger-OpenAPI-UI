import { expect, test } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const spec = JSON.stringify(
  {
    openapi: '3.0.0',
    info: { title: 'History Flow Check', version: '1.0.0' },
    servers: [{ url: 'https://jsonplaceholder.typicode.com' }],
    paths: {
      '/todos/{id}': {
        get: {
          summary: 'Get a todo',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'ok' } },
        },
      },
    },
  },
  null,
  2,
);

async function executeTryItOut(page: import('@playwright/test').Page) {
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

  await page.waitForTimeout(1500); // let the fire-and-forget Firestore write land
}

test('full history flow: empty -> execute request -> list -> detail', async ({ page }) => {
  test.skip(
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'Requires a configured Firebase project (.env.local)',
  );

  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  const uniqueEmail = `history-flow-${Date.now()}@example.com`;

  await page.goto('/en/sign-up');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('Password1!');
  await page.getByRole('main').getByRole('button', { name: 'Sign Up' }).click();
  await expect(page).toHaveURL(/\/en$/, { timeout: 15000 });

  // 1. Empty history state.
  await page.goto('/en/history');
  await expect(page.getByText("You haven't executed any requests yet")).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to the Editor & Viewer' })).toBeVisible();

  // 2. Execute a request via Try-It-Out.
  await page.goto('/en');
  await executeTryItOut(page);

  // 3. History list should now show the entry, sorted most-recent-first.
  await page.goto('/en/history');
  await expect(page.getByText('/todos/1', { exact: false })).toBeVisible();
  await expect(page.getByText('GET')).toBeVisible();
  await expect(page.getByText('200')).toBeVisible();

  // 4. Click into detail.
  await page.getByText('/todos/1', { exact: false }).click();
  await expect(page).toHaveURL(/\/en\/history\/.+/);
  await expect(page.getByText('Request details')).toBeVisible();
  await expect(
    page.getByText('jsonplaceholder.typicode.com/todos/1', { exact: false }),
  ).toBeVisible();
  await expect(page.getByText('200')).toBeVisible();
  await expect(page.getByText(/\d+ ms/)).toBeVisible();
  await expect(page.getByText(/\d+ B/).first()).toBeVisible();

  expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);
});

test('unauthenticated users are redirected away from /history and /history/[id]', async ({
  page,
}) => {
  await page.goto('/en/history');
  await expect(page).toHaveURL(/\/en$/);

  await page.goto('/en/history/does-not-exist');
  await expect(page).toHaveURL(/\/en$/);
});

test('history data is present in the raw server-rendered HTML (before any client JS)', async ({
  page,
}) => {
  test.skip(
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'Requires a configured Firebase project (.env.local)',
  );

  const uniqueEmail = `ssr-check-${Date.now()}@example.com`;

  await page.goto('/en/sign-up');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('Password1!');
  await page.getByRole('main').getByRole('button', { name: 'Sign Up' }).click();
  await expect(page).toHaveURL(/\/en$/, { timeout: 15000 });

  await executeTryItOut(page);

  // Fetch the raw HTML directly (no JS execution at all — this is what the
  // server actually sent, proving the data was rendered server-side).
  // Use page.context().request (not the standalone `request` fixture) so the
  // session cookie from the browser context is shared with this call.
  const response = await page.context().request.get('/en/history');
  const html = await response.text();

  expect(html).toContain('jsonplaceholder.typicode.com');
  expect(html).toContain('/todos/1');
});

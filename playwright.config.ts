import { existsSync } from 'fs';
import path from 'path';
import { defineConfig, devices } from '@playwright/test';

const envLocalPath = path.resolve(__dirname, '.env.local');
if (existsSync(envLocalPath)) {
  process.loadEnvFile(envLocalPath);
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn build && yarn start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

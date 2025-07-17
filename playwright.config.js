// playwright.config.js - Playwright configuration for E2E testing
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: 'https://example.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium-extension',
      use: {
        ...devices['Desktop Chrome'],
        // Extension-specific configuration
        launchOptions: {
          args: [
            '--disable-extensions-except=.',
            '--load-extension=.',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--allow-running-insecure-content'
          ]
        }
      },
    },
  ],

  webServer: process.env.CI ? undefined : {
    command: 'python -m http.server 8080',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  }
});
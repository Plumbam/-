import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  // Сайт небольшой — не нагружаем его параллельными прогонами
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://www.ckbib.ru',
    viewport: { width: 1366, height: 768 },
    screenshot: 'only-on-failure',
  },
});

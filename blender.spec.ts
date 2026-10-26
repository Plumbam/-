import { test, expect, Page } from '@playwright/test';
import { BlenderExtensionsPage } from './blenderExtensions.page';

test.describe('Blender Extensions — 10 элементов (одно окно браузера)', () => {
  let page: Page;
  let po: BlenderExtensionsPage;

  // Браузер/страница создаются ОДИН раз
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    po = new BlenderExtensionsPage(page);
    await po.goto();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. Главный заголовок "Blender Extensions"', async () => {
    await expect(po.mainHeading).toBeVisible();
  });

  test('2. Поле поиска с подсказкой "Search..."', async () => {
    await expect(po.searchInput).toBeVisible();
    await expect(po.searchInput).toBeEditable();
    await expect(po.searchInput).toHaveAttribute('placeholder', 'Search...');
  });

});
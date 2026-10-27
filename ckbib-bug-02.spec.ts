import { test, expect, Page } from '@playwright/test';
import { CkbibPage } from './ckbib.page';

test.describe('ЦКБ БИБКОМ — Проверка бага BUG-02 (Ссылка в подвале)', () => {
  let page: Page;
  let po: CkbibPage;

  // Браузер/страница создаются ОДИН раз для экономии времени
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    po = new CkbibPage(page);
    await po.goto();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Ссылка «БИБКОМ» в подвале должна вести на корректный https://www.ckbib.ru', async () => {
    // 1. Проверяем, что ссылка вообще есть на странице
    await expect(po.footerBibkomLink).toBeVisible();

    // 2. Проверяем атрибут href. Ожидаем корректный адрес, а не "http://http://..."
    const href = await po.footerBibkomLink.getAttribute('href');
    
    // Явная проверка на отсутствие известной ошибки
    expect(href).not.toContain('http://http://');
    
    // Проверка на соответствие ожидаемому корректному значению
    expect(href).toBe('https://www.ckbib.ru/');
  });
});

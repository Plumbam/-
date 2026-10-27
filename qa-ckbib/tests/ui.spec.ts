import { test, expect } from '@playwright/test';
import { CkbibPage } from './ckbib.page';

test.describe('Главная и навигация', () => {
  test('UI-MAIN-01. Главная страница открывается', async ({ page }) => {
    const po = new CkbibPage(page);
    await po.goto();

    await expect(page).toHaveTitle('Центральный коллектор библиотек - Главная');
    await expect(po.logo).toBeVisible();
    await expect(po.contactsBlock).toBeVisible();
  });

  test('UI-NAV-01. Пункты главного меню открывают рабочие страницы', async ({ page, request }) => {
    const po = new CkbibPage(page);
    await po.goto();

    for (const name of ['Главная', 'О нас', 'Библиотекам', 'Издательствам', 'Экспедирование', 'Обратная связь']) {
      const href = await po.menuLink(name).getAttribute('href');
      expect(href, `у пункта «${name}» есть адрес`).toBeTruthy();
      const response = await request.get(href!);
      expect(response.status(), `«${name}» → ${href}`).toBe(200);
    }
  });

  test('UI-NAV-02. Подменю «О нас» → «Контакты» открывает страницу контактов', async ({ page }) => {
    const po = new CkbibPage(page);
    await po.goto();

    await po.menuLink('О нас').hover();
    await po.menuLink('Контакты').click();

    await expect(page).toHaveURL(/\/about-us\/contacts$/);
    await expect(page).toHaveTitle(/Контакты/);
  });

  test('UI-NAV-03. Логотип ведёт на главную', async ({ page }) => {
    const po = new CkbibPage(page);
    await po.goto('/about-us');

    await po.logo.click();

    await expect(page).toHaveURL(/ckbib\.ru\/$/);
    await expect(page).toHaveTitle(/Главная/);
  });

  test('UI-CNT-01. На странице контактов есть рабочая ссылка на e-mail', async ({ page }) => {
    const po = new CkbibPage(page);
    await po.goto('/about-us/contacts');

    await expect(page.locator('a[href="mailto:ckbib@ckbib.ru"]').first()).toBeVisible();
  });

  test('UI-CNT-02. Номер факса на странице «Обратная связь» один и тот же', async ({ page }) => {
    const po = new CkbibPage(page);
    await po.goto('/spravochnik');

    // На странице факс указан дважды: в реквизитах и в подвале
    const text = await page.locator('body').innerText();
    const faxes = new Set([...text.matchAll(/Факс:\s*(\(\d{3}\)\s*[\d-]+)/g)].map(m => m[1].replace(/\s/g, '')));
    expect([...faxes]).toHaveLength(1);
  });

  test('UI-ERR-01. Несуществующая страница отдаёт 404 с понятным текстом', async ({ page }) => {
    const response = await page.goto('/takoy-stranicy-net-123');

    expect(response?.status()).toBe(404);
    await expect(page.getByText('Такой страницы не существует.')).toBeVisible();
  });
});

test.describe('Ссылки и контент', () => {
  test('UI-LNK-01. Ссылка «БИБКОМ» в подвале ведёт на адрес сайта', async ({ page }) => {
    const po = new CkbibPage(page);
    await po.goto();

    const href = await po.bibkomFooterLink.getAttribute('href');
    // Адрес должен быть корректным URL сайта, без задвоенного протокола
    expect(href).toMatch(/^https?:\/\/(www\.)?ckbib\.ru\/?$/);
  });

  test('UI-LNK-02. Интернет-каталог открывается по защищённому HTTPS', async ({ page }) => {
    const po = new CkbibPage(page);
    await po.goto();

    const href = await po.catalogButton.getAttribute('href');
    // На странице каталога форма входа с паролем — она должна работать только по HTTPS
    expect(href).toMatch(/^https:\/\//);
  });

  test('UI-IMG-01. Все картинки на странице «Библиотечная техника» загружаются', async ({ page, request }) => {
    const po = new CkbibPage(page);
    await po.goto('/bibliotekam/bibtekhnika');

    const sources = await page.locator('img').evaluateAll(imgs => imgs.map(i => (i as HTMLImageElement).src));
    // Проверяем HEAD-запросами: тело картинки не нужно, достаточно статуса
    const statuses = await Promise.all(
      [...new Set(sources)].map(async src => `${(await request.head(src)).status()} ${src}`),
    );
    expect(statuses.filter(s => !s.startsWith('200 ')), 'битые картинки').toEqual([]);
  });

  test('UI-TXT-01. На странице «Обратная связь» нет опечаток в названии отдела', async ({ page }) => {
    const po = new CkbibPage(page);
    await po.goto('/spravochnik');

    await expect(page.getByText(/Центр комплектования/)).toBeVisible();
  });

  test('UI-FNT-01. Все подключённые шрифты Google Fonts загружаются', async ({ page, request }) => {
    const po = new CkbibPage(page);
    await po.goto();

    const hrefs = await page.locator('link[href*="fonts.googleapis.com"]').evaluateAll(
      links => links.map(l => (l as HTMLLinkElement).href),
    );
    const broken: string[] = [];
    for (const href of new Set(hrefs)) {
      const response = await request.get(href);
      if (response.status() !== 200) broken.push(`${response.status()} ${href}`);
    }
    expect(broken, 'битые ссылки на шрифты').toEqual([]);
  });
});

test.describe('Адаптив, доступность и SEO', () => {
  test('UI-MOB-01. Таблица «Библиотечная техника» помещается на экране телефона', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const po = new CkbibPage(page);
    await po.goto('/bibliotekam/bibtekhnika');

    const tableWidth = await page.locator('table').first().evaluate(t => t.getBoundingClientRect().width);
    expect(tableWidth).toBeLessThanOrEqual(375);
  });

  test('UI-A11Y-01. Картинки-плитки разделов на главной имеют alt', async ({ page }) => {
    const po = new CkbibPage(page);
    await po.goto();

    await expect(po.sectionTiles).toHaveCount(4);
    for (const tile of await po.sectionTiles.all()) {
      await expect(tile, await tile.getAttribute('src') ?? '').not.toHaveAttribute('alt', '');
    }
  });

  test('UI-A11Y-02. На телефоне разрешено масштабирование страницы', async ({ page }) => {
    const po = new CkbibPage(page);
    await po.goto();

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).not.toMatch(/maximum-scale=1(\.0)?\b|user-scalable=no/);
  });

  test('UI-SEO-01. У главной есть meta description', async ({ page }) => {
    const po = new CkbibPage(page);
    await po.goto();

    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S{10,}/);
  });
});

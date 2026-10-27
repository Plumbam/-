import { Page, Locator } from '@playwright/test';

export class CkbibPage {
  private readonly page: Page;

  readonly logo: Locator;
  readonly mainMenu: Locator;
  readonly contactsBlock: Locator;
  readonly catalogButton: Locator;
  readonly bibkomFooterLink: Locator;
  readonly sectionTiles: Locator;

  constructor(page: Page) {
    this.page = page;

    // На странице два логотипа (обычная и «липкая» шапка) — берём первый видимый
    this.logo = page.locator('a.media-logo:visible').first();
    this.mainMenu = page.locator('nav, .navbar').first();
    this.contactsBlock = page.getByRole('heading', { name: 'Контактная информация:' });
    this.catalogButton = page.getByRole('link', { name: 'ПЕРЕЙТИ В ИНТЕРНЕТ-КАТАЛОГ БИБКОМ' });
    this.bibkomFooterLink = page.getByRole('link', { name: 'БИБКОМ', exact: true }).last();
    this.sectionTiles = page.locator('img[src*="/images/razdel/"]');
  }

  // Действие: открыть страницу (использует baseURL из конфига)
  // Ждём DOM, а не всех картинок: на тяжёлых страницах событие load приходит очень долго
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  // Ссылка пункта главного меню по названию.
  // У пунктов с подменю в имя попадает иконка-стрелка, поэтому сравниваем по началу имени
  menuLink(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(`^${name}`) }).locator('visible=true').first();
  }
}

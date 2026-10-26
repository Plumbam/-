import { Page, Locator } from '@playwright/test';

export class BlenderExtensionsPage {
  private readonly page: Page;


  readonly mainHeading: Locator;
  readonly searchInput: Locator;
  readonly footer: Locator;
  readonly aboutFooterHeading: Locator;
  readonly privacyPolicyFooterLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.mainHeading = page.getByRole('heading', { name: 'Blender Extensions' });
    this.searchInput = page.getByRole('textbox', { name: 'Search' });


    this.footer = page.locator('footer');
    this.aboutFooterHeading = this.footer.getByRole('heading', { name: 'About' });
    this.privacyPolicyFooterLink = this.footer.getByRole('link', { name: 'Privacy Policy' });
  }

  // Действие: открыть страницу (использует baseURL из конфига)
  async goto(): Promise<void> {
    await this.page.goto('/');
  }
}
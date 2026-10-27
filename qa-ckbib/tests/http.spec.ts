import { test, expect } from '@playwright/test';

// Проверки HTTP-уровня: редиректы и заголовки ответа, без браузера
test.describe('HTTP: редиректы и безопасность', () => {
  test('API-RED-01. HTTP перенаправляет на HTTPS', async ({ request }) => {
    const response = await request.get('http://www.ckbib.ru/', { maxRedirects: 0 });

    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe('https://www.ckbib.ru/');
  });

  test('API-RED-02. Адрес без www перенаправляет на основной адрес', async ({ request }) => {
    const response = await request.get('https://ckbib.ru/', { maxRedirects: 0 });

    // Иначе один и тот же сайт доступен по двум адресам (дубли для поисковиков)
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toMatch(/^https:\/\/www\.ckbib\.ru\/?$/);
  });

  test('API-SEC-01. Ответ содержит базовые заголовки безопасности', async ({ request }) => {
    const headers = (await request.get('/')).headers();

    expect.soft(headers, 'HSTS').toHaveProperty('strict-transport-security');
    expect.soft(headers, 'X-Frame-Options').toHaveProperty('x-frame-options');
    expect.soft(headers['x-content-type-options'], 'nosniff').toBe('nosniff');
  });

  test('API-SEC-02. Сервер не раскрывает версию PHP', async ({ request }) => {
    const headers = (await request.get('/')).headers();

    expect(headers['x-powered-by']).toBeUndefined();
  });
});

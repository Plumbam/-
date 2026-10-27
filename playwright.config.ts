import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  // У проекта ckbib свой конфиг и свой сайт — запускается из папки qa-ckbib
  testIgnore: ['qa-ckbib/**'],
  use: {
    baseURL: 'https://extensions.blender.org',
  },
});

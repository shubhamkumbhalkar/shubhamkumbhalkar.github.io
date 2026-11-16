import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://shubhamkumbhalkar.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  server: {
    host: '127.0.0.1',
  },
  devToolbar: {
    enabled: false,
  },
});

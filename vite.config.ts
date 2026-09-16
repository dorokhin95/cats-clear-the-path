import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  // @ts-ignore vitest config
  test: {
    environment: 'happy-dom',
    globals: true
  }
});

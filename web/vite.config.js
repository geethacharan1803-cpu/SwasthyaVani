import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    port: 3000,
    open: false,
  },
  test: {
    environment: 'node',
    globals: true,
  },
});

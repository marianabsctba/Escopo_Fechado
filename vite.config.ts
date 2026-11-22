import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Escopo_Fechado/',
  build: { outDir: 'dist', assetsInlineLimit: 0, chunkSizeWarningLimit: 2000 },
  optimizeDeps: { exclude: ['v86'] },
});

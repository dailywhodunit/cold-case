import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
    // Proxy /cases and /api to production during local dev
    // Remove this if you want to use local case files in public/cases/
    proxy: {
      '/api': 'https://thedailywhodunit.com',
    },
  },
});

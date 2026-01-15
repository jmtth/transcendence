import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const { appenv } = await import('./config/env.js');

const GATEWAY_URL = 'https://localhost:4430';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: GATEWAY_URL,
        secure: false,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
});

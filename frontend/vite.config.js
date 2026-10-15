import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Konfigurasi Vite: plugin React + port dev server 5173
export default defineConfig({
  // Lokal: '/'. Di GitHub Pages workflow mengisi VITE_BASE = '/nama-repo/'
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
});

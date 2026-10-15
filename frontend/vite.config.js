import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Konfigurasi Vite: plugin React + port dev server 5173
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});

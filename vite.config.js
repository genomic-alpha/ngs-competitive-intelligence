import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ngs-competitive-intelligence/',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});

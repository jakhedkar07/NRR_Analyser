import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    proxy: {
      '/predictNRR': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/teams': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true
  }
});

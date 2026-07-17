import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://gana-front.vercel.app',
        changeOrigin: true,
        // Solución temporal para desarrollo local
        // TODO: resolver CORS en el servidor de producción
      },
    },
  },
});

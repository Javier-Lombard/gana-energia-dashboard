import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Evita CORS en desarrollo reenviando /api a la API externa
      // server-to-server. En producción cumple la misma función el
      // rewrite equivalente definido en vercel.json.
      '/api': {
        target: 'https://gana-front.vercel.app',
        changeOrigin: true,
      },
    },
  },
});

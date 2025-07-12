import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy WebSocket connections to backend
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true
      },
      // Proxy API calls to backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  define: {
    // Environment variables for client
    __WEBSOCKET_URL__: JSON.stringify(process.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws'),
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:8000')
  }
});
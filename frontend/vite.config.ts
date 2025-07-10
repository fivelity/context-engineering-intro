import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname || '.', './src'),
      '@components': resolve(import.meta.dirname || '.', './src/components'),
      '@hooks': resolve(import.meta.dirname || '.', './src/hooks'),
      '@stores': resolve(import.meta.dirname || '.', './src/stores'),
      '@services': resolve(import.meta.dirname || '.', './src/services'),
      '@utils': resolve(import.meta.dirname || '.', './src/utils'),
      '@types': resolve(import.meta.dirname || '.', './src/types'),
      '@styles': resolve(import.meta.dirname || '.', './src/styles'),
      '@router': resolve(import.meta.dirname || '.', './src/router'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
      '@tanstack/react-virtual',
      'zustand',
      'framer-motion',
      'react-hook-form',
      'zod',
      'chart.js',
      'react-chartjs-2'
    ],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'tanstack': ['@tanstack/react-router', '@tanstack/react-query', '@tanstack/react-virtual'],
          'ui-vendor': ['framer-motion', 'react-hook-form', 'zod'],
          'chart-vendor': ['chart.js', 'react-chartjs-2']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true
  },
  define: {
    __DEV__: JSON.stringify(!import.meta.env?.PROD)
  }
})
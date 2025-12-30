import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
     
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 5173,
      // Solo usar proxy en desarrollo local
      ...(isDevelopment && {
        proxy: {
          '/api': {
            target: 'http://localhost:4000',
            changeOrigin: true,
            secure: false,
          },
          '/uploads': {
            target: 'http://localhost:4000',
            changeOrigin: true,
            secure: false,
          },
        },
      }),
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
})
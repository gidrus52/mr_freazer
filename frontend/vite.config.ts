import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dotenv from 'dotenv'

// Load environment variables from .env files if present
dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
    }),
  ],
  // Настройка для статических файлов
  publicDir: 'public',
  build: {
    // Настройки для сборки
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Сохраняем структуру для изображений
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          // Если это изображение из assets/img, сохраняем путь
          if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) {
            // Сохраняем оригинальное имя и путь
            return 'assets/img/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        // Подключение к вашему Nest.js серверу
        target: process.env.VITE_API_TARGET || 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

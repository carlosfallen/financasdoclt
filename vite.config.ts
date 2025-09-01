import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'CLT Financeiro',
        short_name: 'CLT Fin',
        description: 'Seu assistente financeiro pessoal para o regime CLT.',
        theme_color: '#4f46e5',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  base: './',
    build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        bkp: path.resolve(__dirname, 'bkpclt/index.html')
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})
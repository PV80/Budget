import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Budget/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-180.png', 'icon-32.png'],
      manifest: {
        name: 'BudgetApp – Personal Finance',
        short_name: 'BudgetApp',
        description: 'Track income, expenses and budget goals',
        theme_color: '#1e1b4b',
        background_color: '#f0f4ff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/Budget/',
        scope: '/Budget/',
        icons: [
          { src: 'icon-32.png',  sizes: '32x32',   type: 'image/png' },
          { src: 'icon-180.png', sizes: '180x180',  type: 'image/png' },
          { src: 'icon-192.png', sizes: '192x192',  type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512',  type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' },
          },
        ],
      },
    }),
  ],
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Cache exercise photos too, so the app works with no signal at the gym.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      manifest: {
        name: 'Gym',
        short_name: 'Gym',
        description: 'Tells you exactly what to do at the gym, step by step.',
        theme_color: '#12161d',
        background_color: '#12161d',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: { host: true },
  preview: { host: true },
})

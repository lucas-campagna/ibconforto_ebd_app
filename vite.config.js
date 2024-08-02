import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/apps/ibcebd/',
  plugins: [
    react(),
    VitePWA({
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/apps/ibcebd/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ibcebd',
            },
          },
        ],
      },
    }),
  ],

})

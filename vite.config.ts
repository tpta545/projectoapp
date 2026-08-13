import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Cuando se construye para GitHub Pages, la app vive en /projectoapp/ en vez de en la raíz.
const base = process.env.GH_PAGES ? '/projectoapp/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'TRADE Lector de Placas',
        short_name: 'TRADE Placas',
        description:
          'Lector de placas de características para motores, reductores, variadores y componentes neumáticos.',
        theme_color: '#B91C1C',
        background_color: '#0A0A0A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
          {
            src: `${base}icons/icon-maskable-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // El historial y la app deben abrir sin conexión.
        // Las llamadas a la API de visión no se cachean: requieren red real.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: `${base}index.html`,
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'image' &&
              !request.url.includes('anthropic'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'imagenes-app',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
})

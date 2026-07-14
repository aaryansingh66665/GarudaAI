import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        maximumFileSizeToCacheInBytes: 20000000
      },
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'GarudaAI',
        short_name: 'GarudaAI',
        description: 'Offline AI-Powered Phishing Detection System',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone'
      }
    })
  ]
});

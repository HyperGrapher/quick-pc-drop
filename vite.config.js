import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      // Use a custom service worker (injectManifest strategy)
      registerType: 'autoUpdate',
      injectRegister: 'script', // or 'inline' or 'script-defer' as you prefer
      strategies: 'injectManifest',
      srcDir: 'src',      // Place your custom SW in the public folder
      filename: 'sw-custom.js',    // This file will be used as the service worker

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: 'QuickPCDrop',
        short_name: 'QuickDrop',
        description: 'Local network file sharing PWA',
        theme_color: '#fbbf24',
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    })],
})
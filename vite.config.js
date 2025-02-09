// vite.config.js
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,

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
        runtimeCaching: [
          {
            // This regular expression matches any URL starting with "http://192.168."
            // followed by one or more digits and a dot, ending with a port number.
            urlPattern: /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
            handler: 'NetworkOnly', // Always use the network (do not cache)
            options: {
              cacheName: 'local-network-uploads',
            },
          },
        ],
      },

      devOptions: {
        enabled: false,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    }),
  ],
});

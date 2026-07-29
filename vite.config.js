import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync, existsSync } from 'node:fs';

// Chrome only allows Service Worker registration / "Add to Home Screen"
// installs on localhost or a trusted HTTPS origin — a plain http://<lan-ip>
// address doesn't qualify. `npm run make-cert` generates certs/ once.
const httpsConfig = existsSync('certs/cert.pem')
  ? { key: readFileSync('certs/key.pem'), cert: readFileSync('certs/cert.pem') }
  : undefined;

// Serves certs/rootCA.pem at /rootCA.pem so the phone can download and
// install it as a trusted CA — needed once, before HTTPS is trusted.
function serveRootCA() {
  const handler = (req, res, next) => {
    if (req.url === '/rootCA.pem' && existsSync('certs/rootCA.pem')) {
      res.setHeader('Content-Type', 'application/x-x509-ca-cert');
      res.end(readFileSync('certs/rootCA.pem'));
      return;
    }
    next();
  };
  return {
    name: 'serve-root-ca',
    configureServer: (server) => {
      server.middlewares.use(handler);
    },
    configurePreviewServer: (server) => {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project from /music-streamer/, not the domain
  // root, so production asset URLs need that prefix. Local dev/preview stay
  // at root since that's how they're served from this machine.
  base: command === 'build' ? '/music-streamer/' : '/',
  // Bind to 0.0.0.0 so the phone can reach this over the local WiFi network.
  server: { host: true, https: httpsConfig },
  preview: { host: true, https: httpsConfig },
  plugins: [
    serveRootCA(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      // Precache the app shell so it loads with zero connectivity after first visit.
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: 'Music Streamer',
        short_name: 'Music',
        description: 'Offline local music player',
        start_url: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#12111a',
        theme_color: '#6c5ce7',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
}));

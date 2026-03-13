// Miraitu Service Worker v2.0
const CACHE_NAME = 'miraitu-v2';
const OFFLINE_URL = '/offline.html';

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/miraitu-logo.png',
];

// Install event - pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Chrome extension requests and non-http(s)
  if (!url.protocol.startsWith('http')) return;

  // Skip API routes and auth callbacks
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

  // Next.js framework assets (_next/) — always use network-first to avoid stale bundles
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response('', { status: 408, statusText: 'Offline' });
          });
        })
    );
    return;
  }

  // For navigation requests (HTML pages) - Network first, fallback to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the page for offline use
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // For static assets (JS, CSS, images, fonts) - Cache first, fallback to network
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|avif|ico|woff2?)$/) ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        }).catch(() => {
          // Return nothing for failed static asset requests
          return new Response('', { status: 408, statusText: 'Offline' });
        });
      })
    );
    return;
  }

  // For external images (Pexels, Unsplash, Google) - Cache first with network fallback
  if (
    url.hostname === 'images.pexels.com' ||
    url.hostname === 'images.unsplash.com' ||
    url.hostname.endsWith('.googleusercontent.com')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        }).catch(() => {
          return new Response('', { status: 408, statusText: 'Offline' });
        });
      })
    );
    return;
  }

  // Default: Network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

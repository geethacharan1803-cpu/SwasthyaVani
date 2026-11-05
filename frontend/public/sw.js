/**
 * SwasthyaVani Service Worker (v5.0.0)
 * Pre-caches complete application shell, icons, and clinical data JSON assets for 100% offline capability.
 * Employs cache-first strategy for static assets and fallback navigation to /index.html.
 */

const CACHE_NAME = 'swasthyavani-v5';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/data/sections.json',
  '/data/index.json',
  '/data/lexicon.json',
  '/data/register_visits.json',
  '/data/register_enriched.json',
  '/data/seasonal_health_pack.json',
  '/data/topology_reference.json',
  '/data/sample_queries.json',
  '/data/symptoms_reference.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => {
            if (k !== CACHE_NAME) return caches.delete(k);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS GET requests
  if (!event.request.url.startsWith('http') || event.request.method !== 'GET') return;

  // 1. Navigation requests (Page loads & reloads): Cache-first with index.html fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches
        .match(event.request)
        .then((cached) => {
          if (cached) return cached;
          return caches.match('/index.html').then((indexCached) => {
            if (indexCached) return indexCached;
            return caches.match('/');
          });
        })
        .then((res) => res || fetch(event.request))
        .catch(() => caches.match('/index.html').then((fallback) => fallback || caches.match('/')))
    );
    return;
  }

  // 2. Static Assets (JS, CSS, JSON, SVG, webmanifest): Cache-first with dynamic caching
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          // If offline and request is for data JSON or assets, attempt fallback match
          console.warn('[SW] Offline cache fetch:', event.request.url);
          return caches.match(event.request);
        });
    })
  );
});



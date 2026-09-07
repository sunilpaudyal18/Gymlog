/**
 * GYM PWA - Production Offline Service Worker
 * Version: gym-kinetic-cache-v3
 *
 * Guaranteed offline support for PWA installation:
 * - Pre-caches core application shell & static resources
 * - Intercepts all SPA navigation requests and falls back to cached index.html
 * - Cache-first strategy for static assets (JS, CSS, images, icons, fonts)
 * - Keeps user workout/routine data strictly in local device storage (IndexedDB + localStorage)
 */

const CACHE_NAME = 'gym-kinetic-cache-v3';

// Core static assets required for cold offline startup
const CORE_APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/kinetic-mark-master.png',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/og-image.png',
];

// Install Event: Pre-cache Core Application Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching core application shell...');
        return cache.addAll(CORE_APP_SHELL);
      })
      .catch((err) => {
        console.warn('[SW] Non-critical asset pre-caching warning:', err);
      })
  );
  // Activate immediately without waiting
  self.skipWaiting();
});

// Activate Event: Purge Obsolete Caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name.startsWith('gym-kinetic-cache-'))
          .map((name) => {
            console.info(`[SW] Purging obsolete static cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Offline-first navigation & static asset handling
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and non-HTTP/HTTPS schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. SPA Navigation Requests (e.g. /, /workouts, /exercises, /history, /progress, /profile)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/index.html', copy);
            });
            return networkResponse;
          }
          // Server returned 404 on deep link navigation: fallback to cached index.html
          if (networkResponse && networkResponse.status === 404) {
            return caches.match('/index.html').then((cached) => cached || networkResponse);
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: Return cached index.html so React Router renders the page offline
          const cached = await caches.match('/index.html');
          if (cached) return cached;

          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;

          return new Response(
            '<!doctype html><html><head><meta charset="utf-8"><title>Gym Log</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 2. Static Assets (JS bundles, CSS files, Images, SVGs, Fonts)
  // Cache-First for assets with background revalidation when online
  event.respondWith(
    caches.match(request, { ignoreSearch: false }).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset immediately for 0-latency offline speed
        // Revalidate in background if online
        if (navigator.onLine) {
          fetch(request)
            .then((networkResponse) => {
              if (
                networkResponse &&
                networkResponse.status === 200 &&
                (networkResponse.type === 'basic' || networkResponse.type === 'cors')
              ) {
                const copy = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
              }
            })
            .catch(() => {});
        }
        return cachedResponse;
      }

      // If not in cache, fetch from network and store in cache
      return fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Graceful fallback if offline and not in cache
          return new Response('', { status: 503, statusText: 'Offline Asset Unavailable' });
        });
    })
  );
});

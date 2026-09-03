/**
 * GYM PWA - Production Offline Service Worker
 * Version: gym-kinetic-cache-v2
 *
 * Pre-caches application shell (HTML, JavaScript bundles, CSS, SVGs, fonts, icons).
 * Provides offline navigation fallback to cached SPA shell.
 * NEVER stores or touches dynamic workout/user data (handled strictly by IndexedDB).
 */

const CACHE_NAME = 'gym-kinetic-cache-v2';

// Core static assets required for cold startup offline
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
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_APP_SHELL).catch((err) => {
        console.warn('[SW] Some non-critical assets failed to pre-cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Purge Obsolete Caches (Never touches IndexedDB or user databases)
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

// Fetch Event: Network-First with Cache-Fallback for Navigation, Stale-While-Revalidate for Assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests, chrome-extension schemes, and non-HTTP requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation Requests (SPA Routes: /, /workouts, /progress, /exercises, etc.)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Guaranteed offline fallback to cached SPA application shell
          const cached = await caches.match('/index.html');
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response('Offline - App Shell loading...', {
            headers: { 'Content-Type': 'text/html' },
          });
        })
    );
    return;
  }

  // 2. Static Assets (JS bundles, CSS, Fonts, Images, SVGs)
  // Stale-While-Revalidate: Return cache immediately, update in background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
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
          // If network failed and we have no cached response, fallback gracefully
          return cachedResponse || new Response('', { status: 503, statusText: 'Offline' });
        });

      return cachedResponse || fetchPromise;
    })
  );
});

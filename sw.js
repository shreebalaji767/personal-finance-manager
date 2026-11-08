const CACHE = 'ledger-static-v23';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './logo.svg',
  './three-scene.js',
  './form-accessibility.js',
  './workflow-demo.js',
  './vendor/three.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('ledger-static-') && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        if (!response || !response.ok) return response;
        const copy = response.clone();
        const shellUrl = new URL('./index.html', self.registration.scope).href;
        return caches.open(CACHE)
          .then(cache => cache.put(shellUrl, copy).catch(() => {}))
          .then(() => response);
      }).catch(() => caches.match(new URL('./index.html', self.registration.scope).href))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || !response.ok) return response;
        const copy = response.clone();
        return caches.open(CACHE)
          .then(cache => cache.put(request, copy).catch(() => {}))
          .then(() => response);
      });
    })
  );
});

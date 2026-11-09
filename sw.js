const CACHE = 'ledger-static-v31';
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

const OFFLINE_HTML = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ledger offline</title><body style="font:16px system-ui;padding:2rem;max-width:40rem;margin:auto"><h1>Ledger is offline</h1><p>The app shell is not available in this cache yet. Reconnect once, reload Ledger, and try again.</p><button onclick="location.reload()">Retry</button></body></html>';

function offlineResponse(request) {
  if (request && request.mode === 'navigate') {
    return new Response(OFFLINE_HTML, {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }
  return new Response('This resource is unavailable offline. Reconnect and retry.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

function cacheKey(request) {
  const url = new URL(request.url);
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_[a-z0-9_]+|gclid|fbclid|mc_cid|mc_eid)$/i.test(key)) url.searchParams.delete(key);
  }
  return new Request(url.href, { method: 'GET', credentials: request.credentials, mode: 'same-origin' });
}

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

  const shellUrl = new URL('./index.html', self.registration.scope).href;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const copy = response.clone();
          try {
            const cache = await caches.open(CACHE);
            await cache.put(shellUrl, copy);
          } catch (cacheError) {
            // A quota or cache write failure must not block a successful page load.
          }
        }
        if (response && response.status >= 500) {
          const fallback = await caches.match(shellUrl);
          if (fallback) return fallback;
        }
        return response || offlineResponse(request);
      } catch (networkError) {
        try {
          const cached = await caches.match(shellUrl);
          return cached || offlineResponse(request);
        } catch (cacheError) {
          return offlineResponse(request);
        }
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const key = cacheKey(request);
    try {
      const cached = await caches.match(key);
      if (cached) return cached;
    } catch (cacheError) {
      // Continue to the network if Cache Storage is unavailable.
    }

    try {
      const response = await fetch(request);
      if (!response || !response.ok) {
        if (response) return response;
        return offlineResponse(request);
      }
      try {
        const copy = response.clone();
        const cache = await caches.open(CACHE);
        await cache.put(key, copy);
      } catch (cacheError) {
        // Cache failures must not turn a successful network response into an error.
      }
      return response;
    } catch (networkError) {
      try {
        const cached = await caches.match(key);
        return cached || offlineResponse(request);
      } catch (cacheError) {
        return offlineResponse(request);
      }
    }
  })());
});

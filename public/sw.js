self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('legallyai-')).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

// Let the browser handle requests normally. Never cache authenticated API data
// or substitute HTML for failed API requests. Offline page caching is disabled.

const CACHE_NAME = 'quarter-time-v2';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/images/logo-192.png',
  '/images/logo-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (name) { return name !== CACHE_NAME; })
             .map(function (name) { return caches.delete(name); })
      );
    }).then(function () { return clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    fetch(event.request).then(function (response) {
      return response;
    }).catch(function () {
      return caches.match(event.request);
    })
  );
});

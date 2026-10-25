const CACHE_VERSION = '20261025-home';
const CACHE_NAME = `suika-game-v${CACHE_VERSION}`;

const VERSIONED_FILES = [
  '/styles.css',
  '/home.css',
  '/js/config.js',
  '/js/skins.js',
  '/js/sprite-metrics.js',
  '/js/progress.js',
  '/js/fruits.js',
  '/js/particles.js',
  '/js/physics.js',
  '/js/ui.js',
  '/js/game.js'
];

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  ...VERSIONED_FILES.map(path => `${path}?v=${CACHE_VERSION}`),
  '/assets/images/apple_emoji.png',
  '/assets/images/cherries_emoji.png',
  '/assets/images/grapes_emoji.png',
  '/assets/images/orange_emoji.png',
  '/assets/images/pear_emoji.png',
  '/assets/images/strawberry_emoji.png',
  '/assets/images/watermelon_emoji.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});

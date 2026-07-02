const CACHE_NAME = 'suika-game-v20260702-fullscreen-toggle';
const APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/js/config.js?v=20260702-fullscreen-toggle',
  '/js/skins.js?v=20260702-fullscreen-toggle',
  '/js/progress.js?v=20260702-fullscreen-toggle',
  '/js/fruits.js?v=20260702-fullscreen-toggle',
  '/js/particles.js?v=20260702-fullscreen-toggle',
  '/js/physics.js?v=20260702-fullscreen-toggle',
  '/js/ui.js?v=20260702-fullscreen-toggle',
  '/js/game.js?v=20260702-fullscreen-toggle',
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
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

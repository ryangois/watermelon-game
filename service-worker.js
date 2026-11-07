const CACHE_VERSION = '20261107-visual';
const CACHE_NAME = `suika-game-v${CACHE_VERSION}`;

const VERSIONED_FILES = [
  './styles.css',
  './home.css',
  './js/config.js',
  './js/skins.js',
  './js/sprite-metrics.js',
  './js/progress.js',
  './js/fruits.js',
  './js/particles.js',
  './js/physics.js',
  './js/ui.js',
  './js/game.js'
];

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './js/vendor/matter-0.19.0.min.js',
  './assets/images/jackfruit_emoji.png',
  './assets/images/melon_emoji.png',
  './assets/images/peach_emoji.png',
  './assets/images/pineapple_emoji.png',
  ...VERSIONED_FILES.map(path => `${path}?v=${CACHE_VERSION}`),
  './assets/images/apple_emoji.png',
  './assets/images/cherries_emoji.png',
  './assets/images/grapes_emoji.png',
  './assets/images/orange_emoji.png',
  './assets/images/pear_emoji.png',
  './assets/images/strawberry_emoji.png',
  './assets/images/watermelon_emoji.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache => cache.addAll(APP_SHELL))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('suika-game-v') && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope) || request.headers.has('range')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) event.waitUntil(cache.put(request, response.clone()).catch(() => {}));
      return response;
    } catch (error) {
      if (request.mode === 'navigate') return await cache.match('./index.html') || Response.error();
      const filename = new URL(request.url).pathname.split('/').pop();
      if (filename.endsWith('_emoji.png')) return await cache.match('./assets/images/' + filename) || Response.error();
      throw error;
    }
  })());
});

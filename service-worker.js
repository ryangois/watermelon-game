const CACHE_VERSION = '20261108-hall-29';
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
  ...VERSIONED_FILES.map(path => path + '?v=' + CACHE_VERSION),
  ...['apple', 'cherries', 'grapes', 'jackfruit', 'melon', 'orange', 'peach', 'pear', 'pineapple', 'strawberry', 'watermelon']
    .flatMap(name => ['./assets/images/', './assets/previews/'].map(folder => folder + name + '_emoji.webp'))
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
      if (/_emoji\.(webp|png)$/.test(filename)) {
        const folder = new URL(request.url).pathname.includes('/previews/') ? './assets/previews/' : './assets/images/';
        return await cache.match(folder + filename.replace('.png', '.webp')) || Response.error();
      }
      throw error;
    }
  })());
});

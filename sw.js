// Service worker template; vite.config.ts fills ea818b77 / ["index.html","manifest.webmanifest","icons/icon.svg","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","models/base-female.glb","models/base-female-cups.bin","models/augment-atlas.bin","models/augment-variants.bin","assets/index-3b94ELAK.js","assets/viewer-CurlPErf.js","assets/index-DS82JbpF.css"] at build and emits dist/sw.js.
// index.html: network-first (fresh deploys win), cached copy offline. Everything else (hashed assets,
// icons, manifest): cache-first. A new build = new cache name; old caches are deleted on activate.
// No skipWaiting: the new worker takes over once all tabs of the old version are closed, so an open
// page never loses the lazy viewer chunk it was built against.
const CACHE = 'implant-sim-ea818b77';
const PRECACHE = ["index.html","manifest.webmanifest","icons/icon.svg","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","models/base-female.glb","models/base-female-cups.bin","models/augment-atlas.bin","models/augment-variants.bin","assets/index-3b94ELAK.js","assets/viewer-CurlPErf.js","assets/index-DS82JbpF.css"];
const INDEX = new URL('index.html', self.registration.scope).href;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.registration.scope)) return;
  const store = (key, res) => { // clone before anything reads the body
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)); }
    return res;
  };
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => store(INDEX, res)).catch(() => caches.match(INDEX)));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => store(req, res))));
});

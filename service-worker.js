/* The Garage service worker: offline app shell.
   Bump CACHE whenever any app file changes so phones pick up the update.

   GitHub Pages sends Cache-Control: max-age=600, so the browser's HTTP cache will happily hand back
   a 10-minute-old copy. Every app-file request here therefore revalidates with the server
   (cache: 'no-cache' → a tiny 304 when nothing changed) and the install precache bypasses the
   HTTP cache entirely (cache: 'reload'). Offline, the last good copy is served. */
const CACHE = 'garage-v12';
const ASSETS = ['./', './index.html', './styles.css', './core.js', './ui.js', './manifest.json',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS.map(u => new Request(u, {cache: 'reload'}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
/* Never touch GitHub API traffic (sync must be live). App files: network-first, revalidated,
   with the cached copy as the offline fallback. Fonts: cache-first. */
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.hostname === 'api.github.com') return;
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  const key = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(fetch(url.href, {cache: 'no-cache', credentials: 'same-origin'}).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
    return res;
  }).catch(() => caches.match(key).then(hit => hit || caches.match('./index.html'))));
});

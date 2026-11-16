/* Cadence service worker. Built by build/build.js: __BUILD__ is a hash of every cached file, __FILES__ the list.
   - The whole app is cached at install, so it opens with no network.
   - A new version installs in the background and WAITS. The page shows "Update ready" only when nothing is running,
     and switches over (skipWaiting, then one reload) when the pill is tapped. The worker never takes over on its own.
   - Every notification is shown from here (registration.showNotification), which is the only way Chrome on Android allows,
     and the only way to have action buttons. A tap on a button is passed to the open timer, or opens it. */
const BUILD = "3a5bd0b15846", CACHE = 'ixora-' + BUILD, FILES = ["./","manifest.webmanifest","fonts/red-hat-display.woff2","fonts/red-hat-mono.woff2","fonts/red-hat-text.woff2","icons/apple-touch-icon.png","icons/badge-96.png","icons/icon-192.png","icons/icon-512.png","icons/icon.svg","icons/maskable-512.png"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache:'reload'}))))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys()
  .then(ks => Promise.all(ks.filter(k => k.startsWith('ixora-') && k !== CACHE).map(k => caches.delete(k))))
  .then(() => self.clients.claim())); });
self.addEventListener('fetch', e => { const r = e.request; if (r.method !== 'GET') return; const u = new URL(r.url); if (u.origin !== location.origin) return;
  e.respondWith((async () => { const c = await caches.open(CACHE);
    if (r.mode === 'navigate') return (await c.match('./')) || (await c.match('index.html')) || fetch(r);
    return (await c.match(r, {ignoreSearch:true})) || fetch(r); })()); });
self.addEventListener('message', e => { const d = e.data || {};
  if (d.ix === 'skipWaiting') self.skipWaiting();
  else if (d.ix === 'build' && e.ports[0]) e.ports[0].postMessage({build:BUILD}); });
self.addEventListener('notificationclick', e => { const n = e.notification, act = e.action || '', data = n.data || {}; n.close();
  e.waitUntil((async () => { const all = await self.clients.matchAll({type:'window', includeUncontrolled:true}), c = all.find(x => x.url.startsWith(self.registration.scope));
    if (c){ try{ await c.focus(); }catch(_){} c.postMessage({ix:'act', act, key:data.key || ''}); }
    else if (self.clients.openWindow) await self.clients.openWindow('./' + (act ? '?act=' + encodeURIComponent(act) : '')); })()); });

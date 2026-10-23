// Painel do Jorge · service worker: abre rápido e funciona sem sinal com a última versão baixada.
// Tudo o que fica em cache já está cifrado (data.bin e m/*.bin); sem a chave não dá para ler.
const C = 'pj-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.includes('/m/')) {           // mídia: nome muda quando o arquivo muda -> cache primeiro
    e.respondWith(caches.open(C).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const r = await fetch(e.request);
      if (r.ok) c.put(e.request, r.clone());
      return r;
    }));
    return;
  }
  const key = new Request(u.origin + u.pathname);  // ignora ?timestamp
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) caches.open(C).then(c => c.put(key, r.clone()));
    return r;
  }).catch(() => caches.match(key)));
});
